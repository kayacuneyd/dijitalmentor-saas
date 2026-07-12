export const LEAD_TRIAGE_CATEGORIES = [
	'hot_lead',
	'beta_candidate',
	'support_existing',
	'compliance_sensitive',
	'low_fit'
] as const;

export type LeadTriageCategory = (typeof LEAD_TRIAGE_CATEGORIES)[number];

export type LeadTriageInput = {
	name?: string | null;
	email?: string | null;
	category?: string | null;
	message: string;
	source?: string | null;
	hasExistingWebsite?: boolean | null;
	domainNeeded?: boolean | null;
	languages?: string[] | null;
	launchWindow?: string | null;
};

export type LeadTriageResult = {
	category: LeadTriageCategory;
	score: number;
	slaHours: number | null;
	requiresHumanReview: boolean;
	reasons: string[];
	draftReply: string;
};

const targetProfession = [
	'psikolog',
	'psikoterapist',
	'terapist',
	'psychologist',
	'psychotherapist',
	'therapeut',
	'therapeutin',
	'avukat',
	'lawyer',
	'anwalt',
	'anwältin',
	'rechtsanwalt',
	'rechtsanwältin',
	'diyetisyen',
	'dietitian',
	'nutritionist',
	'diş',
	'dis hekimi',
	'dentist',
	'zahnarzt',
	'zahnärztin',
	'akademisyen',
	'academic',
	'professor',
	'dozent'
];

const domainIntent = [
	'domain',
	'.com',
	'alan adı',
	'alan adi',
	'web sitesi',
	'website',
	'site',
	'homepage',
	'praxisseite',
	'internet sitesi'
];

const strongDomainIntent = ['domain', '.com', 'alan adı', 'alan adi'];

const budgetIntent = [
	'pro',
	'ücret',
	'ucret',
	'fiyat',
	'ödeme',
	'odeme',
	'abone',
	'subscription',
	'checkout',
	'200',
	'17',
	'bütçe',
	'budget',
	'pay',
	'paid'
];

const urgencyIntent = [
	'hemen',
	'bu hafta',
	'bugün',
	'bugun',
	'acil',
	'soon',
	'this week',
	'asap',
	'launch',
	'canlıya',
	'canliya',
	'yayına',
	'yayina'
];

const supportIntent = [
	'giriş',
	'giris',
	'login',
	'şifre',
	'sifre',
	'password',
	'hata',
	'error',
	'bug',
	'çalışmıyor',
	'calismiyor',
	'payment failed',
	'invoice',
	'fatura',
	'iptal',
	'cancel',
	'subscription',
	'abonelik'
];

const complianceIntent = [
	'kvkk',
	'gdpr',
	'hwg',
	'bora',
	'brao',
	'garanti',
	'guarantee',
	'dava kazan',
	'en iyi avukat',
	'tedavi garantisi',
	'hasta kazan',
	'önce sonra',
	'once sonra',
	'before after',
	'medical claim',
	'regülasyon',
	'regulation',
	'compliance'
];

const lowFitIntent = [
	'ajans',
	'agency',
	'öğrenci',
	'ogrenci',
	'student',
	'ödev',
	'odev',
	'merak ettim',
	'just curious',
	'e-ticaret',
	'ecommerce',
	'marketplace'
];

function normalize(value: string | null | undefined): string {
	return (value ?? '').toLocaleLowerCase('tr-TR');
}

function hasAny(text: string, terms: string[]): boolean {
	return terms.some((term) => text.includes(term));
}

function clampScore(score: number): number {
	return Math.max(0, Math.min(100, score));
}

function supportReply(name: string): string {
	return `Merhaba ${name}, mesajını aldım. Hesabın veya mevcut sitenle ilgili kısmı kontrol edip sana net bir yanıtla döneceğim.`;
}

function complianceReply(name: string): string {
	return `Merhaba ${name}, bu konu sağlık/hukuk iletişimi açısından manuel kontrol gerektiriyor. Detayları inceleyip abartısız ve bilgilendirici bir çerçeveyle döneceğim.`;
}

function hotLeadReply(name: string): string {
	return `Merhaba ${name}, mesleğine uygun site taslağı ve domain ihtiyacın net görünüyor. En kısa sürede sana yıllık Pro ve .com dahil sade kurulum adımlarını göndereceğim.`;
}

function betaReply(name: string): string {
	return `Merhaba ${name}, beta için uygun görünüyorsun. Sana üyelik istemeden taslak oluşturma akışını ve canlıya çıkmadan önce kontrol edeceğimiz kısa kalite listesini göndereceğim.`;
}

function lowFitReply(name: string): string {
	return `Merhaba ${name}, Saaskaya şu anda öncelikle psikolog, avukat ve benzeri hizmet profesyonelleri için kapalı beta ilerliyor. Talebini not aldım.`;
}

export function classifyLead(input: LeadTriageInput): LeadTriageResult {
	const text = normalize(
		[
			input.name,
			input.email,
			input.category,
			input.source,
			input.message,
			input.launchWindow,
			...(input.languages ?? [])
		].join(' ')
	);
	const firstName = (input.name ?? '').trim().split(/\s+/)[0] || 'Merhaba';
	const reasons: string[] = [];
	const category = normalize(input.category);

	if (category === 'support' || category === 'billing' || hasAny(text, supportIntent)) {
		reasons.push('Mevcut kullanıcı veya ödeme/destek sinyali var.');
		return {
			category: 'support_existing',
			score: 80,
			slaHours: 4,
			requiresHumanReview: true,
			reasons,
			draftReply: supportReply(firstName)
		};
	}

	if (hasAny(text, complianceIntent)) {
		reasons.push('Sağlık/hukuk reklamı veya regülasyon hassasiyeti var.');
		return {
			category: 'compliance_sensitive',
			score: 90,
			slaHours: 24,
			requiresHumanReview: true,
			reasons,
			draftReply: complianceReply(firstName)
		};
	}

	const professionFit = hasAny(text, targetProfession);
	const domainFit = Boolean(input.domainNeeded) || hasAny(text, domainIntent);
	const strongDomainFit = Boolean(input.domainNeeded) || hasAny(text, strongDomainIntent);
	const budgetFit = hasAny(text, budgetIntent);
	const urgencyFit = hasAny(text, urgencyIntent);
	const hasWebsiteContext = Boolean(input.hasExistingWebsite) || text.includes('eski sitem');
	const lowFit = hasAny(text, lowFitIntent);

	let score = 20;
	if (professionFit) {
		score += 30;
		reasons.push('Hedef meslek segmentlerinden biriyle uyumlu.');
	}
	if (domainFit) {
		score += 20;
		reasons.push('Website/domain ihtiyacı net.');
	}
	if (budgetFit) {
		score += 20;
		reasons.push('Ödeme, Pro veya bütçe sinyali var.');
	}
	if (urgencyFit) {
		score += 15;
		reasons.push('Yakın zamanda canlıya çıkma niyeti var.');
	}
	if (hasWebsiteContext) {
		score += 5;
		reasons.push('Mevcut site veya geçiş bağlamı var.');
	}
	if (lowFit) {
		score -= 45;
		reasons.push('Mevcut GTM odağı dışında düşük uyum sinyali var.');
	}

	const finalScore = clampScore(score);
	if (finalScore >= 70 && professionFit && (strongDomainFit || budgetFit || urgencyFit)) {
		return {
			category: 'hot_lead',
			score: finalScore,
			slaHours: 2,
			requiresHumanReview: true,
			reasons,
			draftReply: hotLeadReply(firstName)
		};
	}

	if (professionFit && finalScore >= 45) {
		return {
			category: 'beta_candidate',
			score: finalScore,
			slaHours: 24,
			requiresHumanReview: false,
			reasons,
			draftReply: betaReply(firstName)
		};
	}

	return {
		category: 'low_fit',
		score: finalScore,
		slaHours: null,
		requiresHumanReview: false,
		reasons: reasons.length > 0 ? reasons : ['Hedef segment, domain veya ödeme niyeti zayıf.'],
		draftReply: lowFitReply(firstName)
	};
}
