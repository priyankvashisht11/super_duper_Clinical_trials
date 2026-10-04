#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NexTrial — One-time server bootstrap
# Tested on DigitalOcean Droplet: Ubuntu 22.04 LTS, Bangalore region
# Run once as root immediately after creating the Droplet.
# Usage: bash server-bootstrap.sh YOUR_DOMAIN YOUR_EMAIL YOUR_GITHUB_USER
# Example: bash server-bootstrap.sh nextrial.in admin@nextrial.in priyankv
# ─────────────────────────────────────────────────────────────────────────────

set -e

DOMAIN=${1:?"Usage: $0 <domain> <email> <github-user>"}
EMAIL=${2:?"Usage: $0 <domain> <email> <github-user>"}
GITHUB_USER=${3:?"Usage: $0 <domain> <email> <github-user>"}
DEPLOY_USER="deploy"

echo "━━━ NexTrial Server Bootstrap (DigitalOcean) ━━━"
echo "Domain:      $DOMAIN"
echo "Email:       $EMAIL"
echo "GitHub user: $GITHUB_USER"
echo "Deploy user: $DEPLOY_USER"
echo ""

# ── 1. System update ──────────────────────────────────────────────────────────
echo "▶ Updating system packages..."
DEBIAN_FRONTEND=noninteractive apt-get update -qq
DEBIAN_FRONTEND=noninteractive apt-get upgrade -y -qq -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

# ── 2. Essential tools ────────────────────────────────────────────────────────
echo "▶ Installing essentials..."
apt-get install -y -qq git curl wget ufw fail2ban unzip python3-pip

# ── 3. Swap (critical for 2GB Droplet — Docker + PG + Redis will OOM without it)
echo "▶ Creating 2GB swap..."
if [ ! -f /swapfile ]; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
  # Reduce swappiness — only use swap as last resort
  echo 'vm.swappiness=10' >> /etc/sysctl.conf
  sysctl vm.swappiness=10
  echo "  Swap: $(free -h | awk '/^Swap:/ {print $2}')"
fi

# ── 4. Deploy user (GitHub Actions SSHes as this user, not root) ──────────────
echo "▶ Creating deploy user..."
if ! id "$DEPLOY_USER" &>/dev/null; then
  useradd -m -s /bin/bash "$DEPLOY_USER"
  usermod -aG sudo "$DEPLOY_USER"
  # Passwordless sudo for deploy ops only
  echo "$DEPLOY_USER ALL=(ALL) NOPASSWD: /usr/bin/docker, /usr/bin/git, /usr/local/bin/docker" \
    > /etc/sudoers.d/deploy
  chmod 440 /etc/sudoers.d/deploy

  # Copy root's authorized_keys so the same SSH key works for deploy user
  mkdir -p /home/$DEPLOY_USER/.ssh
  cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true
  chown -R "$DEPLOY_USER":"$DEPLOY_USER" /home/$DEPLOY_USER/.ssh
  chmod 700 /home/$DEPLOY_USER/.ssh
  chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys 2>/dev/null || true
fi

# ── 5. Docker ─────────────────────────────────────────────────────────────────
echo "▶ Installing Docker..."
if ! command -v docker &>/dev/null; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker
# Add deploy user to docker group (no sudo needed for docker commands)
usermod -aG docker "$DEPLOY_USER"

# ── 6. Nginx + Certbot ────────────────────────────────────────────────────────
echo "▶ Installing Nginx + Certbot..."
apt-get install -y -qq nginx certbot python3-certbot-nginx
systemctl enable nginx

# ── 7. Firewall ───────────────────────────────────────────────────────────────
echo "▶ Configuring firewall..."
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

# ── 8. Clone repo ─────────────────────────────────────────────────────────────
echo "▶ Cloning NexTrial..."
if [ ! -d /opt/nextrial ]; then
  git clone "https://github.com/${GITHUB_USER}/nextrial.git" /opt/nextrial
else
  echo "  /opt/nextrial already exists, pulling latest..."
  git -C /opt/nextrial pull origin master
fi
chown -R "$DEPLOY_USER":"$DEPLOY_USER" /opt/nextrial

# ── 9. Environment file ───────────────────────────────────────────────────────
echo "▶ Setting up environment..."
if [ ! -f /opt/nextrial/.env ]; then
  cp /opt/nextrial/.env.production.example /opt/nextrial/.env
  sed -i "s/yourdomain.com/$DOMAIN/g" /opt/nextrial/.env
  sed -i "s|FRONTEND_URL=https://yourdomain.com|FRONTEND_URL=https://$DOMAIN|g" /opt/nextrial/.env

  # Auto-generate JWT secrets
  JWT=$(openssl rand -hex 64)
  JWT_R=$(openssl rand -hex 64)
  sed -i "s/CHANGE_ME_64_char_hex_secret/$JWT/" /opt/nextrial/.env
  sed -i "s/CHANGE_ME_different_64_char_hex_secret/$JWT_R/" /opt/nextrial/.env

  echo ""
  echo "⚠️  Edit /opt/nextrial/.env and fill in:"
  echo "    - POSTGRES_PASSWORD"
  echo "    - REDIS_PASSWORD"
  echo "    - PERPLEXITY_API_KEY"
  echo "    - ANTHROPIC_API_KEY"
  echo "    - N8N_PASSWORD"
  echo "    - B2_KEY_ID / B2_APPLICATION_KEY (or skip if using DO Spaces)"
fi

# ── 10. Frontend web root ─────────────────────────────────────────────────────
echo "▶ Creating web root..."
mkdir -p /var/www/nextrial
chown -R www-data:www-data /var/www/nextrial
# deploy user needs write access for SCP uploads
chmod g+w /var/www/nextrial
usermod -aG www-data "$DEPLOY_USER"

# ── 11. Nginx site config ─────────────────────────────────────────────────────
echo "▶ Configuring Nginx..."
cp /opt/nextrial/nginx/nextrial.conf /etc/nginx/sites-available/nextrial
sed -i "s/YOUR_DOMAIN_HERE/$DOMAIN/g" /etc/nginx/sites-available/nextrial
ln -sf /etc/nginx/sites-available/nextrial /etc/nginx/sites-enabled/nextrial
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ── 12. SSL certificate ───────────────────────────────────────────────────────
echo "▶ Obtaining SSL certificate..."
certbot --nginx -d "$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect
systemctl reload nginx

# ── 13. Start services ────────────────────────────────────────────────────────
echo "▶ Starting Docker services..."
cd /opt/nextrial
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# ── 14. Setup daily DB backup cron ───────────────────────────────────────────
echo "▶ Setting up backup cron..."
chmod +x /opt/nextrial/scripts/backup.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/nextrial/scripts/backup.sh >> /var/log/nextrial-backup.log 2>&1") | crontab -

# ── 15. Certbot auto-renew ────────────────────────────────────────────────────
systemctl enable certbot.timer

# ── 16. DigitalOcean monitoring agent (optional — enables DO metrics dashboard)
echo "▶ Installing DO monitoring agent..."
curl -sSL https://repos-insights.nyc3.digitaloceanspaces.com/install.sh | bash 2>/dev/null || true

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅  Bootstrap complete!"
echo ""
echo "GitHub Actions secrets to add (repo → Settings → Secrets → Actions):"
echo "  SERVER_HOST  = $(curl -s http://169.254.169.254/metadata/v1/interfaces/public/0/ipv4/address 2>/dev/null || hostname -I | awk '{print $1}')"
echo "  SERVER_USER  = $DEPLOY_USER"
echo "  SERVER_SSH_KEY = <your private SSH key>"
echo "  DOMAIN       = $DOMAIN"
echo ""
echo "Next steps:"
echo "  1. nano /opt/nextrial/.env   — fill in passwords + API keys"
echo "  2. docker compose -f /opt/nextrial/docker-compose.prod.yml restart"
echo "  3. Visit https://$DOMAIN — app should be live"
echo "  4. Push to master → GitHub Actions auto-deploys from here on"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
