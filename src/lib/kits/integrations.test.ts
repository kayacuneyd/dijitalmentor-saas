import { describe, expect, it } from 'vitest';
import {
	INTEGRATION_TYPES,
	INTEGRATION_DOMAIN_ALLOWLIST,
	waMeLink,
	coerceFeatureKits,
	validateIntegrationTarget
} from './integrations';

describe('INTEGRATION_TYPES', () => {
	it('has exactly 6 types', () => {
		expect(INTEGRATION_TYPES).toHaveLength(6);
	});

	it('every type has a domain allowlist entry', () => {
		for (const t of INTEGRATION_TYPES) {
			expect(INTEGRATION_DOMAIN_ALLOWLIST[t]).toBeDefined();
		}
	});
});

describe('waMeLink', () => {
	it('produces a bare wa.me link from E.164', () => {
		expect(waMeLink('+905551234567')).toBe('https://wa.me/905551234567');
	});

	it('appends a prefill message', () => {
		const link = waMeLink('+905551234567', 'Merhaba, randevu almak istiyorum.');
		expect(link).toContain('?text=');
		expect(link).toContain('Merhaba');
	});
});

describe('coerceFeatureKits', () => {
	it('maps known legacy strings to IntegrationType', () => {
		expect(coerceFeatureKits(['booking-request', 'whatsapp-cta'])).toEqual([
			'booking-external',
			'whatsapp-order'
		]);
	});

	it('drops unknown strings', () => {
		expect(coerceFeatureKits(['booking-request', 'fantasy-plugin'])).toEqual([
			'booking-external'
		]);
	});

	it('deduplicates', () => {
		expect(coerceFeatureKits(['booking-request', 'booking-request'])).toEqual([
			'booking-external'
		]);
	});

	it('returns empty for empty input', () => {
		expect(coerceFeatureKits([])).toEqual([]);
	});
});

describe('validateIntegrationTarget', () => {
	const ctx = () => {
		const issues: { code: 'custom'; path: (string | number)[]; message: string }[] = [];
		return {
			issues,
			addIssue: (arg: { code: 'custom'; path: (string | number)[]; message: string }) => issues.push(arg)
		};
	};

	it('accepts a valid booking-external with calendly url', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'booking-external', enabled: true, url: 'https://calendly.com/demo/30min' },
			c
		);
		expect(c.issues).toHaveLength(0);
	});

	it('accepts a valid whatsapp-order with phone', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'whatsapp-order', enabled: true, phone: '+905551234567' },
			c
		);
		expect(c.issues).toHaveLength(0);
	});

	it('rejects whatsapp-order missing phone', () => {
		const c = ctx();
		validateIntegrationTarget({ type: 'whatsapp-order', enabled: true }, c);
		expect(c.issues.length).toBeGreaterThanOrEqual(1);
		expect(c.issues[0].path).toContain('phone');
	});

	it('rejects whatsapp-order with url instead of phone', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'whatsapp-order', enabled: true, url: 'https://wa.me/905551234567' },
			c
		);
		const urlIssue = c.issues.find((i) => i.path.includes('url'));
		expect(urlIssue).toBeDefined();
	});

	it('rejects booking-external missing url', () => {
		const c = ctx();
		validateIntegrationTarget({ type: 'booking-external', enabled: true }, c);
		expect(c.issues.length).toBeGreaterThanOrEqual(1);
		expect(c.issues[0].path).toContain('url');
	});

	it('rejects booking-external with phone instead of url', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'booking-external', enabled: true, phone: '+905551234567' },
			c
		);
		const phoneIssue = c.issues.find((i) => i.path.includes('phone'));
		expect(phoneIssue).toBeDefined();
	});

	it('rejects url from disallowed domain', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'booking-external', enabled: true, url: 'https://evil.com/steal' },
			c
		);
		const urlIssue = c.issues.find((i) => i.path.includes('url'));
		expect(urlIssue).toBeDefined();
		expect(urlIssue!.message).toContain('evil.com');
	});

	it('accepts payment-link with iyzico url', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'payment-link', enabled: true, url: 'https://iyzico.com/payment/abc' },
			c
		);
		expect(c.issues).toHaveLength(0);
	});

	it('accepts social-link with instagram url', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'social-link', enabled: true, url: 'https://instagram.com/merthandmade' },
			c
		);
		expect(c.issues).toHaveLength(0);
	});

	it('accepts menu-digital with any domain (open allowlist)', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'menu-digital', enabled: true, url: 'https://myrestaurant.com/menu.pdf' },
			c
		);
		expect(c.issues).toHaveLength(0);
	});

	it('rejects invalid URL format', () => {
		const c = ctx();
		validateIntegrationTarget(
			{ type: 'booking-external', enabled: true, url: 'not-a-url' },
			c
		);
		const urlIssue = c.issues.find((i) => i.path.includes('url'));
		expect(urlIssue).toBeDefined();
	});
});