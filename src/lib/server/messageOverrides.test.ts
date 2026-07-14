import { describe, expect, it } from 'vitest';
import { and, eq } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { messageOverrides } from '$lib/server/db/schema';
import {
	getMessageOverrides,
	listMessageOverrideEntries,
	resetMessageOverride,
	saveMessageOverride
} from '$lib/server/messageOverrides';

describe('message overrides', () => {
	it('saves, reads and resets a key-locale override', () => {
		db.delete(messageOverrides)
			.where(and(eq(messageOverrides.key, 'common.save'), eq(messageOverrides.locale, 'tr')))
			.run();

		const saved = saveMessageOverride('common.save', 'tr', 'Kaydet ve devam et');
		expect(saved.ok).toBe(true);
		expect(getMessageOverrides('tr')['common.save']).toBe('Kaydet ve devam et');

		const entries = listMessageOverrideEntries();
		const entry = entries.find((row) => row.key === 'common.save');
		expect(entry?.overrideByLocale.tr).toBe('Kaydet ve devam et');
		expect(entry?.overrideByLocale.en).toBeUndefined();

		const reset = resetMessageOverride('common.save', 'tr');
		expect(reset.ok).toBe(true);
		expect(getMessageOverrides('tr')['common.save']).toBeUndefined();
	});

	it('treats a blank saved value as a reset', () => {
		saveMessageOverride('common.cancel', 'de', 'Test');
		expect(getMessageOverrides('de')['common.cancel']).toBe('Test');

		saveMessageOverride('common.cancel', 'de', '   ');
		expect(getMessageOverrides('de')['common.cancel']).toBeUndefined();
	});

	it('rejects unknown keys and locales', () => {
		expect(saveMessageOverride('not.a.real.key', 'tr', 'x').ok).toBe(false);
		expect(saveMessageOverride('common.save', 'fr', 'x').ok).toBe(false);
		expect(resetMessageOverride('not.a.real.key', 'tr').ok).toBe(false);
	});
});
