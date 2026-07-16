import type { OnboardingAnswers } from './questions';

export type OnboardingServiceStrategy = {
	primaryOutcome: string;
	primaryCta: string;
	trustEvidence: string[];
};

const STRATEGIES: Record<string, OnboardingServiceStrategy> = {
	psych: {
		primaryOutcome: 'nitelikli ilk görüşme veya seans talebi',
		primaryCta: 'İlk görüşme talep et',
		trustEvidence: ['uzmanlık alanları', 'gizlilik ve etik çerçeve', 'süreç açıklaması']
	},
	law: {
		primaryOutcome: 'nitelikli ön görüşme talebi',
		primaryCta: 'Ön görüşme talep et',
		trustEvidence: ['çalışma alanları', 'yetkinlikler', 'şeffaf çalışma süreci']
	},
	dental: {
		primaryOutcome: 'uygun randevu talebi',
		primaryCta: 'Randevu talep et',
		trustEvidence: ['klinik yetkinlikleri', 'tedavi süreci', 'hasta bilgilendirmesi']
	},
	dietitian: {
		primaryOutcome: 'uygun danışmanlık görüşmesi',
		primaryCta: 'Danışmanlık görüşmesi planla',
		trustEvidence: ['uzmanlık alanları', 'çalışma yaklaşımı', 'danışmanlık süreci']
	},
	real_estate: {
		primaryOutcome: 'portföy görüşmesi veya mülk talebi',
		primaryCta: 'Portföy görüşmesi yap',
		trustEvidence: ['bölge uzmanlığı', 'portföy', 'müşteri referansları']
	},
	beauty: {
		primaryOutcome: 'randevu veya hizmet seçimi',
		primaryCta: 'Randevu al',
		trustEvidence: ['hizmetler ve fiyatlar', 'çalışma saatleri', 'müşteri yorumları']
	},
	unsupported: {
		primaryOutcome: 'ziyaretçinin doğru iletişim aksiyonunu tamamlaması',
		primaryCta: 'İletişime geç',
		trustEvidence: ['hizmet açıklaması', 'süreç', 'iletişim yolu']
	}
};

export function serviceStrategyForAnswers(answers: OnboardingAnswers): OnboardingServiceStrategy {
	return STRATEGIES[String(answers.niche)] ?? STRATEGIES.unsupported;
}
