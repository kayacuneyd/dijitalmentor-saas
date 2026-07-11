#!/usr/bin/env node
import { randomBytes, scryptSync } from 'node:crypto';
import { readFileSync } from 'node:fs';

const password = process.argv[2] ?? readFileSync(0, 'utf8').trim();
if (!password || password.length < 12) {
	console.error('Usage: scripts/generate-owner-password-hash.mjs "<password-12+-chars>"');
	console.error('Or pipe the password on stdin. Use at least 12 characters.');
	process.exit(2);
}

const N = 16384;
const r = 8;
const p = 1;
const salt = randomBytes(16);
const hash = scryptSync(password, salt, 64, { N, r, p, maxmem: 64 * 1024 * 1024 });

console.log(`scrypt:v1:${N}:${r}:${p}:${salt.toString('base64url')}:${hash.toString('base64url')}`);
