import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProviderRejectedRequestError } from '$lib/server/ai/llm';

function validSite(siteId = 'site-fallback') {
	return {
		id: siteId,
		tenantId: 'tenant-user-1',
		defaultLocale: 'tr',
		locales: ['tr', 'en', 'de'],
		theme: {
			preset: 'law',
			colors: { primary: '#111111', secondary: '#222222', accent: '#333333' },
			fonts: { heading: 'Inter', body: 'Inter' },
			radius: 'sm'
		},
		nav: { items: [{ pageSlug: 'home', label: { tr: 'Ana Sayfa', en: 'Home', de: 'Start' } }] },
		pages: [
			{
				slug: 'home',
				title: { tr: 'Ana Sayfa', en: 'Home', de: 'Start' },
				sections: [
					{
						id: 'hero-1',
						type: 'hero',
						props: { variant: 'centered', background: 'plain', ctaHref: '#contact-1' },
						content: {
							tr: { headline: 'Demir Hukuk ile güvenli destek' },
							en: { headline: 'Trusted support from Demir Law' },
							de: { headline: 'Verlässliche Unterstützung von Demir Law' }
						}
					},
					{
						id: 'contact-1',
						type: 'contact',
						props: { variant: 'form', email: 'info@example.com' },
						content: {
							tr: { title: 'İletişim' },
							en: { title: 'Contact' },
							de: { title: 'Kontakt' }
						}
					}
				]
			}
		],
		settings: {
			siteName: 'Demir Hukuk',
			contactEmail: 'info@example.com',
			poweredByBadge: true,
			seo: {
				description: {
					tr: 'Demir Hukuk iletişim sitesi.',
					en: 'Demir Law contact site.',
					de: 'Kontaktseite von Demir Law.'
				}
			}
		}
	};
}

vi.mock('$lib/server/ai/generate', () => ({
	generateSite: vi.fn()
}));

vi.mock('$lib/server/ai/usage', () => ({
	assertWithinQuota: vi.fn(),
	recordUsage: vi.fn(),
	tenantIdForUser: vi.fn(() => 'tenant-user-1')
}));

vi.mock('$lib/server/db/repo', async () => {
	const actual = await vi.importActual<typeof import('$lib/server/db/repo')>('$lib/server/db/repo');
	return {
		...actual,
		saveDraft: vi.fn(),
		getSiteMeta: vi.fn(() => ({
			id: 'site-fallback',
			tenantId: 'tenant-user-1',
			publicHandle: 'demir-hukuk',
			ownerUserId: 'user-1',
			publishedVersion: null,
			updatedAt: new Date()
		})),
		isPublicHandleAvailable: vi.fn(() => true),
		publishDraft: vi.fn(() => 1),
		setSiteIdentity: vi.fn((input: { siteId: string; publicHandle: string }) => ({
			ok: true,
			site: validSite(input.siteId),
			publicHandle: input.publicHandle
		}))
	};
});

vi.mock('$lib/server/error-log', () => ({
	recordError: vi.fn(() => 'err-test')
}));

vi.mock('$lib/server/onboarding/telemetry', () => ({
	recordOnboardingEvent: vi.fn()
}));

vi.mock('$lib/server/onboarding/session', () => ({
	getPendingById: vi.fn(() => ({
		id: 'pending-1',
		currentStep: 1,
		answers: {
			niche: 'law',
			businessName: 'Demir Hukuk',
			languages: ['tr', 'en', 'de']
		},
		status: 'consumed',
		linkedUserId: 'user-1',
		generatedSiteId: null
	})),
	setGeneratedSiteId: vi.fn()
}));

vi.mock('$lib/server/chatLog', () => ({
	seedChatFromOnboarding: vi.fn()
}));

vi.mock('$lib/server/ai/memory', () => ({
	seedMemoryFromOnboarding: vi.fn()
}));

vi.mock('$lib/server/siteQuota', () => ({
	assertCanCreateFreePreviewSite: vi.fn(),
	assertCanPublishFreeSite: vi.fn(),
	SiteQuotaError: class SiteQuotaError extends Error {}
}));

vi.mock('$lib/server/siteFallback', () => ({
	createFallbackSite: vi.fn(() => validSite('site-fallback'))
}));

const { POST } = await import('./+server');
const { generateSite } = await import('$lib/server/ai/generate');
const { publishDraft, saveDraft, setSiteIdentity } = await import('$lib/server/db/repo');
const { recordError } = await import('$lib/server/error-log');

function request() {
	return POST({
		request: new Request('http://localhost/api/sites', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				description: 'Ben avukatım. İstanbul’da hizmet veriyorum ve güven veren site istiyorum.',
				onboardingPendingId: 'pending-1'
			})
		}),
		locals: { user: { id: 'user-1', email: 'user@example.com', isAdmin: false } }
	} as never) as Promise<Response>;
}

beforeEach(() => {
	vi.clearAllMocks();
});

describe('POST /api/sites', () => {
	it('opens a fallback draft instead of returning 503 for structured provider rejections', async () => {
		vi.mocked(generateSite).mockRejectedValueOnce(
			new AIProviderRejectedRequestError('The AI provider rejected the structured request.')
		);

		const res = await request();
		const data = await res.json();

		expect(res.status).toBe(200);
		expect(data).toMatchObject({
			ok: true,
			fallback: true,
			errorId: 'err-test',
			autoPublished: true,
			publishedVersion: 1,
			publicHandle: 'demir-hukuk'
		});
		expect(saveDraft).toHaveBeenCalled();
		expect(setSiteIdentity).toHaveBeenCalledWith(
			expect.objectContaining({ siteId: 'site-fallback', publicHandle: 'demir-hukuk' })
		);
		expect(publishDraft).toHaveBeenCalledWith('site-fallback');
		expect(recordError).toHaveBeenCalledWith(
			expect.any(AIProviderRejectedRequestError),
			expect.objectContaining({ status: 422, source: 'site-generation' })
		);
	});
});
