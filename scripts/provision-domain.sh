#!/usr/bin/env bash
# Provision nginx + Let's Encrypt TLS for a tenant custom domain (M5).
# Called by the app (src/lib/server/domains.ts) when DOMAIN_PROVISION=1.
# Idempotent: safe to re-run for the same domain.
set -euo pipefail

DOMAIN="${1:?usage: provision-domain.sh <domain>}"

# strict hostname validation — this value reaches shell/nginx config
if ! [[ "$DOMAIN" =~ ^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$ ]]; then
	echo "invalid domain: $DOMAIN" >&2
	exit 1
fi

VHOST="/etc/nginx/sites-available/tenant-$DOMAIN"

if [ ! -f "$VHOST" ]; then
	cat > "$VHOST" <<CONF
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3021;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
CONF
	echo "vhost written: $VHOST"
fi

ln -sf "$VHOST" "/etc/nginx/sites-enabled/tenant-$DOMAIN"
nginx -t
systemctl reload nginx
echo "nginx reloaded for $DOMAIN"

certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --register-unsafely-without-email --redirect
echo "certificate issued for $DOMAIN"
