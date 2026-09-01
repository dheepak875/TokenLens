#!/bin/sh
set -eu

cd "$(dirname "$0")"
git pull
docker compose up -d --build
docker image prune -f
