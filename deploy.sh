#!/usr/bin/env bash
set -euo pipefail

# One-command path from local changes to production for saaskaya.
#
# This checkout *is* the production server (PM2 serves ./current, which
# scripts/deploy-production.sh atomically swaps). "Deploying" here means:
#   1. commit whatever is in the working tree
#   2. push it to GitHub (origin/master) so history isn't only local
#   3. run the existing check/test/build/release/PM2-restart/smoke pipeline
#
# Usage:
#   ./deploy.sh                        # commit with an auto message, push, deploy
#   ./deploy.sh "fix: pricing copy"    # commit with your own message, push, deploy
#   ./deploy.sh -y "message"           # same, but skip the confirmation prompt
#   ./deploy.sh --no-git               # skip commit/push, just run the deploy pipeline
#   ./deploy.sh -- --skip-tests        # pass extra flags through to deploy-production.sh
#
# Anything after a bare "--" is forwarded to scripts/deploy-production.sh
# (e.g. --skip-check, --skip-tests, --skip-smoke, --no-restart).

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

AUTO_YES=0
DO_GIT=1
COMMIT_MSG=""
DEPLOY_ARGS=()

while (($#)); do
	case "$1" in
		-y | --yes)
			AUTO_YES=1
			shift
			;;
		--no-git)
			DO_GIT=0
			shift
			;;
		--)
			shift
			DEPLOY_ARGS=("$@")
			break
			;;
		-h | --help)
			sed -n '4,20p' "$0" | sed 's/^# \{0,1\}//'
			exit 0
			;;
		*)
			if [[ -z "$COMMIT_MSG" ]]; then
				COMMIT_MSG="$1"
				shift
			else
				echo "Unknown argument: $1" >&2
				exit 2
			fi
			;;
	esac
done

log() {
	printf '\n[deploy.sh] %s\n' "$*"
}

confirm() {
	local prompt="$1"
	if [[ "$AUTO_YES" -eq 1 ]]; then
		return 0
	fi
	read -r -p "$prompt [y/N] " reply
	[[ "$reply" =~ ^[Yy]$ ]]
}

if [[ "$DO_GIT" -eq 1 ]]; then
	if ! git -C "$ROOT" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
		echo "Not a git repository: $ROOT" >&2
		exit 1
	fi

	CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
	if [[ "$CURRENT_BRANCH" != "master" ]]; then
		log "On branch '$CURRENT_BRANCH', not 'master'."
		confirm "Continue anyway?" || {
			echo "Aborted." >&2
			exit 1
		}
	fi

	if [[ -n "$(git status --porcelain)" ]]; then
		log 'Working tree changes:'
		git status --short

		[[ -n "$COMMIT_MSG" ]] || COMMIT_MSG="chore: deploy $(date -u +%FT%TZ)"

		log "About to stage everything and commit as: \"$COMMIT_MSG\""
		confirm "Proceed with commit + push?" || {
			echo "Aborted before commit." >&2
			exit 1
		}

		git add -A
		log 'Staged files (double-check nothing sensitive slipped in):'
		git status --short

		git commit -m "$COMMIT_MSG"
	else
		log 'Working tree is clean, nothing to commit.'
	fi

	log 'Pushing to origin...'
	git push origin "$CURRENT_BRANCH"
else
	log 'Skipping git commit/push (--no-git).'
fi

log 'Running production deploy pipeline (check/test/build/release/PM2 restart/smoke)...'
if [[ "${#DEPLOY_ARGS[@]}" -gt 0 ]]; then
	npm run deploy:production -- "${DEPLOY_ARGS[@]}"
else
	npm run deploy:production
fi

log 'Done. saaskaya.com is serving the new release.'
