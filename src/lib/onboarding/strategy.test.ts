import { describe, expect, it } from 'vitest';
import { serviceStrategyForAnswers } from './strategy';

describe('onboarding service strategy', () => {
	it.each([
		['law', 'nitelikli ön görüşme talebi'],
		['psych', 'nitelikli ilk görüşme veya seans talebi'],
		['real_estate', 'portföy görüşmesi veya mülk talebi'],
		['unknown', 'ziyaretçinin doğru iletişim aksiyonunu tamamlaması']
	])('maps %s to a primary service outcome', (niche, outcome) => {
		expect(serviceStrategyForAnswers({ niche }).primaryOutcome).toBe(outcome);
	});
});
