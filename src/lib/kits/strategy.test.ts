import { describe, expect, it } from 'vitest';
import { controlledKits } from './index';

describe('profession kit strategy contract', () => {
	it.each(controlledKits)('$slug exposes a conversion and trust strategy', (kit) => {
		expect(kit.strategy.primaryOutcome).toBe(kit.outcome);
		expect(kit.strategy.primaryCta.tr.trim()).not.toBe('');
		expect(['contact_submitted', 'cta_clicked']).toContain(kit.strategy.conversionEvent);
		expect(['general', 'health', 'legal', 'property']).toContain(kit.strategy.riskProfile);
	});

	it('classifies lawyer kits as legal risk', () => {
		const lawyer = controlledKits.find((kit) => kit.profession.includes('Avukat'));
		expect(lawyer?.strategy.riskProfile).toBe('legal');
	});
});
