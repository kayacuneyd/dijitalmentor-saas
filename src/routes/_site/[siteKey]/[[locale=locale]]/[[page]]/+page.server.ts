import { error, fail } from '@sveltejs/kit';
import { z } from 'zod';
import { resolvePublishedByKey } from '$lib/server/db/repo';
import { addSubmission } from '$lib/server/db/contact';
import { sendContactNotification } from '$lib/server/email';
import { rateLimit } from '$lib/server/auth';
import { localeSchema, type Locale } from '$lib/schema/site';
import type { Actions, PageServerLoad } from './$types';

/**
 * The public tenant site (PLAN §5): Host routing (src/hooks.ts) rewrites
 * `<key>.<appHost>/…` and custom domains here. Serves the PUBLISHED snapshot
 * only — drafts are never visible on the public surface.
 * Locale routes: `/` = default locale, `/en/…`, `/de/…` (matcher-gated).
 */
export const load: PageServerLoad = ({ params, setHeaders }) => {
	const site = resolvePublishedByKey(params.siteKey);
	if (!site) error(404, 'This site is not published.');

	const locale = (params.locale as Locale | undefined) ?? site.defaultLocale;
	if (!site.locales.includes(locale)) error(404, 'This language is not enabled.');

	const slug = params.page ?? site.pages[0].slug;
	const page = site.pages.find((p) => p.slug === slug);
	if (!page) error(404, `Unknown page "${slug}"`);

	setHeaders({ 'cache-control': 'public, max-age=60' });
	return { site, page, locale };
};

const contactSchema = z.object({
	name: z.string().trim().min(1).max(200),
	email: z.email().max(320),
	message: z.string().trim().min(1).max(5000),
	locale: localeSchema.catch('tr')
});

export const actions: Actions = {
	/** Contact block submissions (PLAN §7): store in the DB, notify by email best-effort. */
	contact: async ({ params, request, getClientAddress }) => {
		const site = resolvePublishedByKey(params.siteKey);
		if (!site) error(404, 'This site is not published.');
		if (!rateLimit(`contact:${getClientAddress()}`, 5, 60_000)) {
			return fail(429, { contact: 'error' as const });
		}

		const form = await request.formData();
		const parsed = contactSchema.safeParse({
			name: form.get('name'),
			email: form.get('email'),
			message: form.get('message'),
			locale: form.get('locale')
		});
		if (!parsed.success) return fail(400, { contact: 'error' as const });

		addSubmission({ siteId: site.id, ...parsed.data });

		if (site.settings.contactEmail) {
			// best-effort: a mail failure must never lose the stored submission
			await sendContactNotification({
				to: site.settings.contactEmail,
				siteName: site.settings.siteName,
				name: parsed.data.name,
				email: parsed.data.email,
				message: parsed.data.message
			});
		}
		return { contact: 'sent' as const };
	}
};
