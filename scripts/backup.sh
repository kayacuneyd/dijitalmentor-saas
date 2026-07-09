#!/usr/bin/env bash
# Nightly backup + daily maintenance for saaskaya (M6, docs/POLICY.md).
# - consistent online SQLite backup (sqlite3 .backup — safe while the app runs)
# - .env snapshot (0600), gzip, keep the newest 14 of each
# - optional off-site copy: BACKUP_REMOTE setting = rclone remote (remote:path) or scp target
# - triggers the in-app daily sweep via CRON_TOKEN when configured
set -euo pipefail

APP_DIR="/var/www/saaskaya"
ENV_FILE="$APP_DIR/.env"
DIR="/var/backups/saaskaya"
TS="$(date +%F-%H%M)"

env_value() {
	local key="$1"
	sed -n "s/^${key}=//p" "$ENV_FILE" 2>/dev/null | tail -n 1
}

DB="$(env_value DATABASE_URL_PRODUCTION)"
DB="${DB:-data/production.db}"
if [[ "$DB" != /* ]]; then DB="$APP_DIR/$DB"; fi

mkdir -p "$DIR"
chmod 700 "$DIR"

if [ ! -f "$DB" ]; then
	echo "production database not found: $DB" >&2
	exit 1
fi

setting() { sqlite3 "$DB" "SELECT value FROM app_settings WHERE key='$1'" 2>/dev/null || true; }

# 1. consistent DB backup
sqlite3 "$DB" ".backup '$DIR/db-$TS.sqlite'"
gzip -f "$DIR/db-$TS.sqlite"

# 2. config snapshot (contains credentials → tight perms)
if [ -f "$APP_DIR/.env" ]; then
	install -m 600 "$APP_DIR/.env" "$DIR/env-$TS"
	gzip -f "$DIR/env-$TS"
fi

# 3. rotate: keep the newest 14 of each series
for prefix in db env; do
	ls -1t "$DIR/$prefix-"*.gz 2>/dev/null | tail -n +15 | xargs -r rm -f
done

# 4. off-site copy (operator-configured at /admin/settings)
REMOTE="$(setting BACKUP_REMOTE)"
if [ -n "$REMOTE" ]; then
	if [[ "$REMOTE" == *"@"* ]]; then
		scp -q "$DIR/db-$TS.sqlite.gz" "$REMOTE/" && echo "off-site (scp): db-$TS"
	elif command -v rclone >/dev/null; then
		rclone copy "$DIR/db-$TS.sqlite.gz" "$REMOTE" && echo "off-site (rclone): db-$TS"
	else
		echo "BACKUP_REMOTE set but neither scp target nor rclone usable" >&2
	fi
fi

# 5. daily policy sweep (grace-expired custom domains)
TOKEN="$(setting CRON_TOKEN)"
if [ -n "$TOKEN" ]; then
	curl -s -m 30 -X POST -H "x-cron-token: $TOKEN" http://127.0.0.1:3021/api/admin/tasks/daily || true
	echo
fi

echo "backup done: $TS ($(ls -1 "$DIR"/db-*.gz | wc -l) kept)"
