#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# NexTrial — Daily PostgreSQL backup to Backblaze B2
# Runs via cron at 2am. Keeps 30 days of backups.
# ─────────────────────────────────────────────────────────────────────────────

set -e

# Load env
source /opt/nextrial/.env

DATE=$(date +%Y-%m-%d)
FILENAME="nextrial-db-${DATE}.sql.gz"
TMPFILE="/tmp/${FILENAME}"

echo "[$(date)] Starting backup..."

# ── 1. Dump PostgreSQL ────────────────────────────────────────────────────────
docker exec nextrial-postgres-1 pg_dump \
  -U "${POSTGRES_USER}" \
  -d "${POSTGRES_DB}" \
  | gzip > "$TMPFILE"

echo "[$(date)] Dump complete: $(du -sh $TMPFILE | cut -f1)"

# ── 2. Upload to Backblaze B2 ─────────────────────────────────────────────────
# Install b2 CLI once: pip install b2
if command -v b2 &>/dev/null; then
  b2 authorize-account "${B2_KEY_ID}" "${B2_APPLICATION_KEY}" 2>/dev/null
  b2 upload-file "${B2_BUCKET_NAME}" "$TMPFILE" "backups/${FILENAME}"
  echo "[$(date)] Uploaded to B2: backups/${FILENAME}"

  # Delete backups older than 30 days
  b2 ls "${B2_BUCKET_NAME}" backups/ 2>/dev/null | \
    awk '{print $NF}' | \
    while read -r f; do
      fdate=$(echo "$f" | grep -oP '\d{4}-\d{2}-\d{2}')
      if [ -n "$fdate" ] && [ "$(date -d "$fdate" +%s 2>/dev/null || echo 0)" -lt "$(date -d '30 days ago' +%s)" ]; then
        b2 delete-file-version "${B2_BUCKET_NAME}" "$f" && echo "[$(date)] Deleted old backup: $f"
      fi
    done
else
  echo "[$(date)] WARNING: b2 CLI not installed. Install with: pip install b2"
  echo "[$(date)] Backup saved locally only: $TMPFILE"
fi

# ── 3. Cleanup ────────────────────────────────────────────────────────────────
rm -f "$TMPFILE"
echo "[$(date)] Backup complete."
