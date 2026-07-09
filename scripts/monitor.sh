#!/usr/bin/env bash
# 5-minute health watchdog for saaskaya (M6, docs/POLICY.md).
# Probes /api/health; on two consecutive failures: optional pm2 restart
# (MONITOR_AUTORESTART=1) + alert email via Resend (ALERT_EMAIL), flood-guarded.
set -uo pipefail

APP_DIR="/var/www/saaskaya"
ENV_FILE="$APP_DIR/.env"
URL="http://127.0.0.1:3021/api/health"
STATE="/run/saaskaya-monitor-last-alert"

env_value() {
	local key="$1"
	sed -n "s/^${key}=//p" "$ENV_FILE" 2>/dev/null | tail -n 1
}

DB="$(env_value DATABASE_URL_PRODUCTION)"
DB="${DB:-data/production.db}"
if [[ "$DB" != /* ]]; then DB="$APP_DIR/$DB"; fi

setting() { sqlite3 "$DB" "SELECT value FROM app_settings WHERE key='$1'" 2>/dev/null || true; }

# curl prints 000 itself on connection failure; `|| true` avoids double-printing under set -e-ish callers
probe() { curl -s -m 10 -o /dev/null -w "%{http_code}" "$URL" 2>/dev/null || true; }

CODE="$(probe)"
if [ "$CODE" = "200" ]; then exit 0; fi
sleep 20
CODE="$(probe)"
if [ "$CODE" = "200" ]; then exit 0; fi

echo "$(date -Is) health check failed twice (last code: $CODE)"

if [ "$(setting MONITOR_AUTORESTART)" = "1" ]; then
	pm2 startOrRestart "$APP_DIR/ecosystem.config.cjs" --only saaskaya --update-env >/dev/null 2>&1 &&
		echo "$(date -Is) pm2 startOrRestart issued"
fi

# alert at most once per 30 minutes
NOW="$(date +%s)"
LAST="$(cat "$STATE" 2>/dev/null || echo 0)"
if [ $((NOW - LAST)) -lt 1800 ]; then exit 0; fi

ALERT_TO="$(setting ALERT_EMAIL)"
RESEND_KEY="$(setting RESEND_API_KEY)"
if [ -n "$ALERT_TO" ] && [ -n "$RESEND_KEY" ]; then
	curl -s -m 15 https://api.resend.com/emails \
		-H "Authorization: Bearer $RESEND_KEY" \
		-H "Content-Type: application/json" \
		-d "{\"from\":\"saaskaya <onboarding@resend.dev>\",\"to\":[\"$ALERT_TO\"],\"subject\":\"saaskaya health check failing\",\"text\":\"$(date -Is): $URL failed twice (HTTP $CODE). Autorestart=$(setting MONITOR_AUTORESTART).\"}" \
		>/dev/null && echo "$NOW" > "$STATE" && echo "$(date -Is) alert emailed to $ALERT_TO"
fi
