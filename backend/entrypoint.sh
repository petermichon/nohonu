#!/bin/sh
set -e

mkdir -p /data

export DATABASE_URL="${DATABASE_URL:-file:/data/nohonu.db}"

npx prisma migrate deploy --schema=prisma/schema.prisma

exec node --import tsx main.ts
