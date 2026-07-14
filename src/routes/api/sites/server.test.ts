import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AIProviderRejectedRequestError } from '$lib/server/ai/llm';

vi.mock('$lib/server/ai/generate', () => ({
	generateSite: vi.fn()
}));

vi.mock('$lib/server/ai/usage', () => ({
	assertWithinQuota: vi.fn(),
	recordUsage: vi.fn(),
	tenantIdForUser: vi.fn(() => 'tenant-user-1')
}));

vi.mock('$lib/server/db/repo', () => ({
	saveDraft: vi.fn()
}));

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
	SiteQuotaError: class SiteQuotaError extends Error {}
}));

vi.mock('$lib/server/siteFallback', () => ({
	createFallbackSite: vi.fn(() => ({
		id: 'site-fallback',
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
		pages: [],
		settings: { siteName: 'Fallback', poweredByBadge: true }
	}))
}));

const { POST } = await import('./+server');
const { generateSite } = await import('$lib/server/ai/generate');
const { saveDraft } = await import('$lib/server/db/repo');
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
		expect(data).toMatchObject({ ok: true, fallback: true, errorId: 'err-test' });
		expect(saveDraft).toHaveBeenCalled();
		expect(recordError).toHaveBeenCalledWith(
			expect.any(AIProviderRejectedRequestError),
			expect.objectContaining({ status: 422, source: 'site-generation' })
		);
	});
});
