#!/bin/sh
set -eu

unset DATABASE_URL PGHOST PGPORT PGDATABASE PGUSER PGPASSWORD
if [ -z "${JWT_SECRET:-}" ]; then
  export JWT_SECRET="$(node -e "process.stdout.write(require('crypto').randomBytes(32).toString('hex'))")"
fi

pg_hba_file=$(find /etc/postgresql -name pg_hba.conf -print -quit)
sed -i '1i host all all 127.0.0.1/32 trust' "$pg_hba_file"
service postgresql start

attempt=0
until pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; do
  attempt=$((attempt + 1))
  if [ "$attempt" -ge 30 ]; then
    echo "PostgreSQL did not become ready in time." >&2
    exit 1
  fi
  sleep 1
done

runuser -u postgres -- psql -v ON_ERROR_STOP=1 <<'SQL'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'mensajes_app') THEN
    CREATE ROLE mensajes_app LOGIN PASSWORD 'messages-container-internal';
  ELSE
    ALTER ROLE mensajes_app WITH LOGIN PASSWORD 'messages-container-internal';
  END IF;
END
$$;
SQL

if ! runuser -u postgres -- psql -tAc "SELECT 1 FROM pg_database WHERE datname = 'mensajes'" | grep -q 1; then
  runuser -u postgres -- createdb -O mensajes_app mensajes
fi

export PGHOST=127.0.0.1
export PGPORT=5432
export PGDATABASE=mensajes
export PGUSER=mensajes_app
export PGPASSWORD=messages-container-internal

psql -v ON_ERROR_STOP=1 -f /app/backend/schema.sql
for migration in /app/backend/migrations/*.sql; do
  psql -v ON_ERROR_STOP=1 -f "$migration"
done

node /app/backend/seed-demo.js
exec runuser -u node -- node /app/backend/server.js