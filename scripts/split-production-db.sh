#!/usr/bin/env bash
# One-time safe migration from the legacy shared development database to a
# dedicated production database. Refuses to overwrite an existing target.
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/saaskaya}"
SOURCE="${1:-$APP_DIR/local.db}"
TARGET="${2:-$APP_DIR/data/production.db}"

if [ ! -f "$SOURCE" ]; then
	echo "source database not found: $SOURCE" >&2
	exit 1
fi

if [ -e "$TARGET" ]; then
	echo "target already exists; refusing to overwrite: $TARGET" >&2
	exit 1
fi

mkdir -p "$(dirname "$TARGET")"
sqlite3 "$SOURCE" ".backup '$TARGET'"
chmod 600 "$TARGET"

if [ "$(sqlite3 "$TARGET" 'PRAGMA integrity_check;')" != "ok" ]; then
	echo "target database failed integrity_check: $TARGET" >&2
	exit 1
fi

source_count="$(sqlite3 "$SOURCE" 'SELECT count(*) FROM sites;')"
target_count="$(sqlite3 "$TARGET" 'SELECT count(*) FROM sites;')"
if [ "$source_count" != "$target_count" ]; then
	echo "site count mismatch after backup: source=$source_count target=$target_count" >&2
	exit 1
fi

echo "production database created: $TARGET (sites=$target_count, integrity=ok)"
