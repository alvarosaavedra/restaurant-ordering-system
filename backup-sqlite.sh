#!/bin/bash

BACKUP_DIR="/mnt/sqlite-data/backups"
DB_PATH="/mnt/sqlite-data/database.db"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/db_backup_${TIMESTAMP}.db"
RETENTION_DAYS=7

mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"
cp "$DB_PATH" "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✓ Backup created: $BACKUP_FILE"

  FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
  echo "  File size: $FILE_SIZE"
else
  echo "✗ Backup failed!"
  exit 1
fi

echo "Cleaning up backups older than $RETENTION_DAYS days..."
DELETED=$(find "$BACKUP_DIR" -name "db_backup_*.db" -mtime +$RETENTION_DAYS -delete -print | wc -l)
echo "  Deleted $DELETED old backup(s)"

echo ""
echo "=== Backup Summary ==="
echo "  Timestamp: $(date)"
echo "  Backup file: $BACKUP_FILE"
echo "  Total backups: $(ls -1 "$BACKUP_DIR"/db_backup_*.db 2>/dev/null | wc -l)"
echo "====================="
