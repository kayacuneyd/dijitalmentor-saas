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

	it('returns selected kit metadata for a new profession kit query parameter', () => {
		const result = load({
			locals: { user: null },
			cookies,
			url: new URL('http://localhost/new?kit=dietitian-modern')
		} as never) as { selectedKit: { slug: string; profession: string; outcome: string } | null };
		expect(result.selectedKit?.slug).toBe('dietitian-modern');
		expect(result.selectedKit?.profession).toBe('Diyetisyen');
		expect(result.selectedKit?.outcome).toContain('sağlık sitesi');
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
