#!/usr/bin/env bash
set -euo pipefail

cd /var/www/projetos/matos-ui
docker compose -f docker-compose.prod.yml build --no-cache matos-ui-docs
docker compose -f docker-compose.prod.yml up -d --force-recreate matos-ui-docs
docker compose -f docker-compose.prod.yml ps
