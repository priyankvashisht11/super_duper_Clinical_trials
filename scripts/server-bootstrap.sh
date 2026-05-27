#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NexTrial — One-time server bootstrap
# Run once on a fresh Hetzner Ubuntu 22.04 server as root.
# Usage: bash server-bootstrap.sh YOUR_DOMAIN YOUR_EMAIL
# Example: bash server-bootstrap.sh nextrial.in admin@nextrial.in
# ─────────────────────────────────────────────────────────────────────────────

set -e

DOMAIN=${1:?"Usage: $0 <domain> <email>"}
EMAIL=${2:?"Usage: $0 <domain> <email>"}

echo "━━━ NexTrial Server Bootstrap ━━━"
echo "Domain: $DOMAIN"
echo "Email:  $EMAIL"
echo ""

# ── 1. System update ──────────────────────────────────────────────────────────
echo "▶ Updating system packages..."
apt-get update -qq && apt-get upgrade -y -qq

# ── 2. Essential tools ────────────────────────────────────────────────────────
echo "▶ Installing essentials..."
apt-get install -y -qq git curl wget ufw fail2ban unzip

# ── 3. Docker ─────────────────────────────────────────────────────────────────
echo "▶ Installing Docker..."
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

# ── 4. Nginx + Certbot ────────────────────────────────────────────────────────
echo "▶ Installing Nginx + Certbot..."
apt-get install -y -qq nginx certbot python3-certbot-nginx
systemctl enable nginx

# ── 5. Firewall ───────────────────────────────────────────────────────────────
echo "▶ Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 6. Clone repo ─────────────────────────────────────────────────────────────
echo "▶ Cloning NexTrial..."
if [ ! -d /opt/nextrial ]; then
  git clone https://github.com/YOUR_GITHUB_USER/nextrial.git /opt/nextrial
else
  echo "  /opt/nextrial already exists, pulling latest..."
  git -C /opt/nextrial pull origin master
fi

# ── 7. Environment file ───────────────────────────────────────────────────────
echo "▶ Setting up environment..."
if [ ! -f /opt/nextrial/.env ]; then
  cp /opt/nextrial/.env.production.example /opt/nextrial/.env
  sed -i "s/yourdomain.com/$DOMAIN/g" /opt/nextrial/.env

  # Auto-generate JWT secrets
  JWT=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)
  JWT_R=$(node -e "console.log(require('crypto').randomBytes(64).toString('hex'))" 2>/dev/null || openssl rand -hex 64)
  sed -i "s/CHANGE_ME_64_char_hex_secret/$JWT/" /opt/nextrial/.env
  sed -i "s/CHANGE_ME_different_64_char_hex_secret/$JWT_R/" /opt/nextrial/.env

  echo ""
  echo "⚠️  Edit /opt/nextrial/.env and fill in:"
  echo "    - POSTGRES_PASSWORD"
  echo "    - REDIS_PASSWORD"
  echo "    - PERPLEXITY_API_KEY"
  echo "    - ANTHROPIC_API_KEY (when purchased)"
  echo "    - N8N_PASSWORD"
fi

# ── 8. Frontend web root ──────────────────────────────────────────────────────
echo "▶ Creating web root..."
mkdir -p /var/www/nextrial
chown -R www-data:www-data /var/www/nextrial

# ── 9. Nginx site config ──────────────────────────────────────────────────────
echo "▶ Configuring Nginx..."
cp /opt/nextrial/nginx/nextrial.conf /etc/nginx/sites-available/nextrial
sed -i "s/YOUR_DOMAIN_HERE/$DOMAIN/g" /etc/nginx/sites-available/nextrial
ln -sf /etc/nginx/sites-available/nextrial /etc/nginx/sites-enabled/nextrial
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 10. SSL certificate ───────────────────────────────────────────────────────
echo "▶ Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect
systemctl reload nginx

# ── 11. Start services ────────────────────────────────────────────────────────
echo "▶ Starting Docker services..."
cd /opt/nextrial
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# ── 12. Setup daily DB backup cron ───────────────────────────────────────────
echo "▶ Setting up backup cron..."
chmod +x /opt/nextrial/scripts/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/nextrial/scripts/backup.sh >> /var/log/nextrial-backup.log 2>&1") | crontab -

# ── 13. Certbot auto-renew ────────────────────────────────────────────────────
systemctl enable certbot.timer

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  Bootstrap complete!"
echo ""
echo "Next steps:"
echo "  1. Visit https://$DOMAIN — app should be loading"
echo "  2. Add GitHub repo secrets (see .github/workflows/deploy.yml)"
echo "  3. Push to master to trigger auto-deploy"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
