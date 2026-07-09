import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import { runMigrations } from './migrations';
import { env } from '$env/dynamic/private';

if (!env.DATABASE_URL) throw new Error('DATABASE_URL is not set');

const client = new Database(env.DATABASE_URL);

// M6: the real migration runner (versioned, idempotent, resumable) — see ./migrations.ts.
const { applied } = runMigrations(client);
if (applied.length > 0) console.log(`[db] migrations applied: ${applied.join(', ')}`);

export const db = drizzle(client, { schema });
