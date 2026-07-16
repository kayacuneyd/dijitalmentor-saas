import { beforeEach } from 'vitest';
import { sql } from 'drizzle-orm';
import { db } from '$lib/server/db';

/**
 * Every test gets a clean database state. The application uses a singleton
 * SQLite connection, so file-level parallelism cannot provide isolation by
 * itself when multiple specs run in the same worker.
 *
 * Keep this table-driven from sqlite_master so new migrations automatically
 * join the cleanup without duplicating the schema in test code.
 */
beforeEach(() => {
	db.run(sql.raw('PRAGMA foreign_keys = OFF'));
	const tables = db.all<{ name: string }>(
		sql.raw(
			"SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name <> 'schema_migrations'"
		)
	);
	for (const { name } of tables) {
		db.run(sql.raw(`DELETE FROM "${name.replaceAll('"', '""')}"`));
	}
	db.run(sql.raw('PRAGMA foreign_keys = ON'));
});
