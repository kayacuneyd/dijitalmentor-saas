// PM2 process definition for the saaskaya production preview.
// Reads secrets from .env at load time — no secret values live in this file,
// so it is safe to keep in the repo (unlike .env, which is gitignored).
const fs = require('fs');
const path = require('path');

function loadEnvFile(file) {
	const out = {};
	if (!fs.existsSync(file)) return out;
	for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
		const trimmed = line.trim();
		if (!trimmed || trimmed.startsWith('#')) continue;
		const eq = trimmed.indexOf('=');
		if (eq === -1) continue;
		out[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim();
	}
	return out;
}

const fileEnv = loadEnvFile(path.join(__dirname, '.env'));
const productionDatabase =
	fileEnv.DATABASE_URL_PRODUCTION || path.join(__dirname, 'data', 'production.db');

module.exports = {
	apps: [
		{
			name: 'saaskaya',
			script: path.join(__dirname, 'current', 'build', 'index.js'),
			cwd: __dirname,
			env: {
				NODE_ENV: 'production',
				PORT: '3021',
				HOST: '127.0.0.1',
				// NOT a fixed ORIGIN: tenant sites arrive on arbitrary Hosts (M4 Host routing),
				// so adapter-node must derive the origin per request from the proxy headers.
				// Safe because :3021 is loopback-only behind nginx.
				PROTOCOL_HEADER: 'x-forwarded-proto',
				HOST_HEADER: 'host',
				PUBLIC_APP_HOST: fileEnv.PUBLIC_APP_HOST || 'saaskaya.com',
				// Production must never share the DATABASE_URL used by local Vite/dev tooling.
				DATABASE_URL: productionDatabase,
				ANTHROPIC_API_KEY: fileEnv.ANTHROPIC_API_KEY || '',
				AI_MODEL: fileEnv.AI_MODEL || '',
				AI_MONTHLY_TOKEN_LIMIT: fileEnv.AI_MONTHLY_TOKEN_LIMIT || '',
				// Development-only magic-link echo; must stay empty in production.
				AUTH_DEV_ECHO_LINK: fileEnv.AUTH_DEV_ECHO_LINK || '',
				// super admins come from env on purpose: the gate must not live in the DB it protects
				ADMIN_EMAILS: fileEnv.ADMIN_EMAILS || '',
				// private owner login; secret values stay in .env, never in the repo
				OWNER_LOGIN_PATH: fileEnv.OWNER_LOGIN_PATH || '',
				OWNER_EMAIL: fileEnv.OWNER_EMAIL || '',
				OWNER_PASSWORD_HASH: fileEnv.OWNER_PASSWORD_HASH || ''
			}
		}
	]
};
