#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RELEASES_DIR="$ROOT/releases"
CURRENT_LINK="$ROOT/current"
KEEP_RELEASES="${KEEP_RELEASES:-5}"

RUN_CHECK=1
RUN_TESTS=1
RUN_SMOKE=1
RESTART_PM2=1

usage() {
	cat <<'EOF'
Usage: scripts/deploy-production.sh [options]

Builds saaskaya into a timestamped release directory, atomically switches
current -> releases/<timestamp>, then restarts PM2.

Options:
  --skip-check     Do not run npm run check
  --skip-tests     Do not run npm run test
  --skip-smoke     Do not run scripts/smoke-production.mjs after restart
  --no-restart     Build and switch current, but do not restart PM2
  -h, --help       Show this help
EOF
}

while (($#)); do
	case "$1" in
		--skip-check) RUN_CHECK=0 ;;
		--skip-tests) RUN_TESTS=0 ;;
		--skip-smoke) RUN_SMOKE=0 ;;
		--no-restart) RESTART_PM2=0 ;;
		-h | --help)
			usage
			exit 0
			;;
		*)
			echo "Unknown option: $1" >&2
			usage >&2
			exit 2
			;;
	esac
	shift
done

log() {
	printf '[deploy] %s\n' "$*"
}

require_file() {
	if [[ ! -f "$1" ]]; then
		echo "Required file missing: $1" >&2
		exit 1
	fi
}

release_name() {
	date -u +%Y%m%dT%H%M%SZ
}

write_release_metadata() {
	local release_dir="$1"
	{
		printf 'created_at=%s\n' "$(date -u +%FT%TZ)"
		printf 'source_root=%s\n' "$ROOT"
		if git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
			printf 'git_head=%s\n' "$(git -C "$ROOT" rev-parse HEAD 2>/dev/null || true)"
			if [[ -n "$(git -C "$ROOT" status --porcelain)" ]]; then
				printf 'git_dirty=1\n'
			else
				printf 'git_dirty=0\n'
			fi
		fi
	} >"$release_dir/RELEASE"
}

switch_current() {
	local release_dir="$1"
	local next_link="$ROOT/.current.next"
	ln -sfn "$release_dir" "$next_link"
	mv -Tf "$next_link" "$CURRENT_LINK"
}

pm2_script_path() {
	pm2 jlist 2>/dev/null | node -e "
let input = '';
process.stdin.on('data', (chunk) => input += chunk);
process.stdin.on('end', () => {
	try {
		const app = JSON.parse(input).find((item) => item.name === 'saaskaya');
		process.stdout.write(app?.pm2_env?.pm_exec_path || '');
	} catch {
		process.exit(0);
	}
});
" 2>/dev/null || true
}

restart_pm2() {
	if [[ "$RESTART_PM2" -eq 0 ]]; then
		log 'PM2 restart skipped'
		return
	fi
	local desired_script="$CURRENT_LINK/build/index.js"
	local actual_script=''
	actual_script="$(pm2_script_path)"
	if [[ -n "$actual_script" && "$actual_script" != "$desired_script" ]]; then
		log "PM2 script path changed; recreating app ($actual_script -> $desired_script)"
		pm2 delete saaskaya
		pm2 start "$ROOT/ecosystem.config.cjs" --only saaskaya --update-env
	else
		log 'Restarting PM2 app saaskaya'
		pm2 startOrRestart "$ROOT/ecosystem.config.cjs" --only saaskaya --update-env
	fi
	pm2 save
}

ensure_pm2_uses_current() {
	if [[ "$RESTART_PM2" -eq 0 || ! -f "$CURRENT_LINK/build/index.js" ]]; then
		return
	fi
	local desired_script="$CURRENT_LINK/build/index.js"
	local actual_script=''
	actual_script="$(pm2_script_path)"
	if [[ -n "$actual_script" && "$actual_script" != "$desired_script" ]]; then
		log 'PM2 is still using the mutable root build; switching to current before building'
		restart_pm2
	fi
}

bootstrap_current_if_needed() {
	if [[ -f "$CURRENT_LINK/build/index.js" ]]; then
		return
	fi
	require_file "$ROOT/build/index.js"
	mkdir -p "$RELEASES_DIR"
	local release_dir="$RELEASES_DIR/bootstrap-$(release_name)"
	if [[ -e "$release_dir" ]]; then
		release_dir="$release_dir-$$"
	fi
	log "Bootstrapping current release from existing build: $release_dir"
	mkdir -p "$release_dir"
	cp -a "$ROOT/build" "$release_dir/build"
	write_release_metadata "$release_dir"
	switch_current "$release_dir"
	restart_pm2
}

cleanup_old_releases() {
	if [[ "$KEEP_RELEASES" -le 0 || ! -d "$RELEASES_DIR" ]]; then
		return
	fi
	local current_target=''
	current_target="$(readlink -f "$CURRENT_LINK" 2>/dev/null || true)"
	mapfile -t old_releases < <(
		find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' |
			sort -rn |
			awk -v keep="$KEEP_RELEASES" 'NR > keep { $1=""; sub(/^ /, ""); print }'
	)
	local old_release
	for old_release in "${old_releases[@]}"; do
		if [[ "$(readlink -f "$old_release")" == "$current_target" ]]; then
			continue
		fi
		log "Removing old release: $old_release"
		rm -rf "$old_release"
	done
}

cd "$ROOT"
mkdir -p "$RELEASES_DIR"

bootstrap_current_if_needed

ensure_pm2_uses_current

if [[ "$RUN_CHECK" -eq 1 ]]; then
	log 'Running npm run check'
	npm run check
fi

if [[ "$RUN_TESTS" -eq 1 ]]; then
	log 'Running npm run test'
	npm run test
fi

log 'Building production bundle into root build/'
npm run build
require_file "$ROOT/build/index.js"

name="$(release_name)"
release_dir="$RELEASES_DIR/$name"
if [[ -e "$release_dir" ]]; then
	release_dir="$release_dir-$$"
fi

log "Creating release: $release_dir"
mkdir -p "$release_dir"
cp -a "$ROOT/build" "$release_dir/build"
write_release_metadata "$release_dir"

log "Switching current -> $release_dir"
switch_current "$release_dir"
restart_pm2

if [[ "$RUN_SMOKE" -eq 1 ]]; then
	log 'Running production smoke'
	node "$ROOT/scripts/smoke-production.mjs"
fi

cleanup_old_releases

log "Deployed $(basename "$release_dir")"
