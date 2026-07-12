import { describe, expect, it } from 'vitest';
import { classifyLead } from './leadTriage';

describe('classifyLead', () => {
	it('marks urgent target-profession domain requests as hot leads', () => {
		const result = classifyLead({
			name: 'Ada Yilmaz',
			category: 'beta_access',
			message:
				'Psikolog olarak bu hafta canlıya çıkacak bir web sitesi ve .com domain istiyorum. Pro yıllık olabilir.',
			domainNeeded: true,
			launchWindow: 'this week'
		});

		expect(result.category).toBe('hot_lead');
		expect(result.slaHours).toBe(2);
		expect(result.score).toBeGreaterThanOrEqual(70);
		expect(result.draftReply).toContain('yıllık Pro');
	});

	it('keeps regulated advertising claims for manual compliance review', () => {
		const result = classifyLead({
			name: 'Av. Kaya',
			category: 'other',
			message:
				'Avukat sitemde en iyi avukat ve dava kazan garantisi gibi ifadeler kullanabilir miyim?'
		});

		expect(result.category).toBe('compliance_sensitive');
		expect(result.requiresHumanReview).toBe(true);
		expect(result.draftReply).toContain('manuel kontrol');
	});

	it('routes login and payment issues to existing support', () => {
		const result = classifyLead({
			name: 'Musteri',
			category: 'support',
			message: 'Giriş yapamıyorum, ödeme yaptıktan sonra domain ekranında hata aldım.'
		});

		expect(result.category).toBe('support_existing');
		expect(result.requiresHumanReview).toBe(true);
	});

	it('keeps target-profession curiosity without budget as beta candidate', () => {
		const result = classifyLead({
			name: 'Dr. Deniz',
			category: 'beta_access',
			message: 'Diyetisyenim, beslenme yaklaşımımı anlatan sade bir site taslağı görmek isterim.'
		});

		expect(result.category).toBe('beta_candidate');
		expect(result.requiresHumanReview).toBe(false);
	});

	it('marks agency and student requests as low fit', () => {
		const result = classifyLead({
			name: 'Agency User',
			category: 'partnership',
			message: 'Ajans olarak müşterilerimiz için e-ticaret marketplace siteleri üretmek istiyoruz.'
		});

		expect(result.category).toBe('low_fit');
		expect(result.score).toBeLessThan(45);
	});
});
