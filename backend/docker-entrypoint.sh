#!/bin/sh
set -eu

read_secret() {
  var_name="$1"
  file_var_name="${var_name}_FILE"
  eval file_path="\${$file_var_name:-}"
  if [ -n "$file_path" ] && [ -f "$file_path" ]; then
    export "$var_name=$(cat "$file_path")"
  fi
}

read_secret DATABASE_URL
read_secret JWT_ACCESS_SECRET
read_secret JWT_REFRESH_SECRET
read_secret REDIS_URL

cd /app/backend
npx prisma migrate deploy --schema /app/database/prisma/schema.prisma
exec node dist/server.js
