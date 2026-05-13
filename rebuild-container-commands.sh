#!/usr/bin/env bash
set -euo pipefail

cd /var/www/projetos/matos-ui
docker compose -f docker-compose.prod.yml up -d --build --force-recreate
docker compose -f docker-compose.prod.yml ps
