import { describe, expect, it } from 'vitest';
import { composeDescription } from './compose';

const MINIMAL_REQUIRED = {
	niche: 'psych',
	businessName: 'Ada Terapi',
	city: 'Kadıköy',
	audience: 'Genç yetişkinler',
	differentiator: 'Online ve yüz yüze seçenek',
	tone: 'warm',
	languages: ['tr'],
	contactMethod: 'email',
	contactEmail: 'ada@example.com',
	booking: 'online_booking',
	services: ['Bireysel terapi'],
	media: 'use_placeholders'
};

describe('composeDescription', () => {
	it('produces at least the /api/sites 30-char floor from required fields alone', () => {
		const description = composeDescription(MINIMAL_REQUIRED);
		expect(description.trim().length).toBeGreaterThanOrEqual(30);
	});

	it('includes the business name, city, and niche label', () => {
		const description = composeDescription(MINIMAL_REQUIRED);
		expect(description).toContain('Ada Terapi');
		expect(description).toContain('Kadıköy');
		expect(description).toContain('Psikolog / Terapist'.toLowerCase());
	});

	it('omits every optional-field sentence when left unanswered', () => {
		const description = composeDescription(MINIMAL_REQUIRED);
		expect(description).not.toContain('Unvan/sertifika');
		expect(description).not.toContain('undefined');
	});

	it('includes credentials, domainPreference-independent extras, and anythingElse when present', () => {
		const description = composeDescription({
			...MINIMAL_REQUIRED,
			credentials: 'Klinik Psikolog, EMDR sertifikalı',
			anythingElse: 'Cumartesi seansları da mevcut.'
		});
		expect(description).toContain('EMDR sertifikalı');
		expect(description).toContain('Cumartesi seansları da mevcut.');
	});

	it('describes both contact channels when contactMethod is "both"', () => {
		const description = composeDescription({
			...MINIMAL_REQUIRED,
			contactMethod: 'both',
			contactPhone: '+90 555 123 45 67'
		});
		expect(description).toContain('ada@example.com');
		expect(description).toContain('555 123 45 67');
	});

	it('mentions the visitor will use their own media when media=has_media', () => {
		const description = composeDescription({ ...MINIMAL_REQUIRED, media: 'has_media' });
		expect(description).toContain('görsellerini kullanacak');
	});

	it('adds a primary-language steering sentence when Turkish is not selected', () => {
		const description = composeDescription({ ...MINIMAL_REQUIRED, languages: ['en'] });
		expect(description).toContain('öncelikli olarak İngilizce');
	});

	it('lists all languages when more than one is selected', () => {
		const description = composeDescription({ ...MINIMAL_REQUIRED, languages: ['tr', 'en', 'de'] });
		expect(description).toContain('Türkçe, İngilizce, Almanca');
	});

	it('adds no language-steering sentence for a single Turkish-only selection', () => {
		const description = composeDescription({ ...MINIMAL_REQUIRED, languages: ['tr'] });
		expect(description).not.toContain('öncelikli olarak');
		expect(description).not.toContain('yayınlanmalı');
	});

	it('uses the raw escape-hatch description verbatim when present, ignoring structured answers', () => {
		const description = composeDescription({
			...MINIMAL_REQUIRED,
			rawDescription: 'Ben Av. Zeynep Demir, İstanbul’da 12 yıldır aile hukuku yapıyorum.'
		});
		expect(description).toBe('Ben Av. Zeynep Demir, İstanbul’da 12 yıldır aile hukuku yapıyorum.');
	});
});
