#!/usr/bin/env bash
set -euo pipefail

# Backs up the backend data volume (SQLite DB + site files) into ./backups.
# Usage: ./backup.sh
# Optional: BACKUP_DIR=/path/to/backups ./backup.sh
#           PROJECT_NAME=deploy ./backup.sh  (defaults to the compose project)

cd "$(dirname "$0")"

PROJECT_NAME="${PROJECT_NAME:-deploy}"
VOLUME="${PROJECT_NAME}_data"
BACKUP_DIR="${BACKUP_DIR:-$(pwd)/backups}"
KEEP="${KEEP:-7}"

mkdir -p "$BACKUP_DIR"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUT="$BACKUP_DIR/nohonu-data-$STAMP.tar.gz"

docker run --rm \
  -v "${VOLUME}:/data" \
  -v "${BACKUP_DIR}:/backup" \
  alpine tar czf "/backup/$(basename "$OUT")" -C /data .

echo "Backup written to $OUT"

# Prune old backups, keeping the most recent $KEEP.
ls -1t "$BACKUP_DIR"/nohonu-data-*.tar.gz 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
