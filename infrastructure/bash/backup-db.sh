#!/usr/bin/env bash
set -Eeuo pipefail
BACKUP_DIR=${BACKUP_DIR:-/opt/routewell/backups}
RETENTION_DAYS=${RETENTION_DAYS:-7}
mkdir -p "$BACKUP_DIR"
file="$BACKUP_DIR/routewell-$(date -u +%Y%m%dT%H%M%SZ).dump"
docker exec routewell-db-postgres-1 pg_dump -U routewell -d routewell -Fc >"$file"
find "$BACKUP_DIR" -type f -name 'routewell-*.dump' -mtime "+$RETENTION_DAYS" -delete
sha256sum "$file" >"$file.sha256"
echo "$file"
