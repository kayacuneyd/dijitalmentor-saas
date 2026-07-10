import { describe, expect, it } from 'vitest';
import { load } from './+page.server';

const cookies = { get: () => undefined };

describe('GET /new (load)', () => {
	it('returns selected kit metadata for a valid kit query parameter', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?kit=couples-therapy')
		} as never) as { selectedKit: { slug: string; label: string; outcome: string } | null };
		expect(result.selectedKit?.slug).toBe('couples-therapy');
		expect(result.selectedKit?.label).toBe('Çift Terapisi');
		expect(result.selectedKit?.outcome).toContain('Tarafsızlık');
	});

	it('ignores an unknown kit query parameter', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?kit=unknown')
		} as never) as { selectedKit: unknown };
		expect(result.selectedKit).toBeNull();
	});
});
