import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import {
	addInvite,
	betaModeOn,
	listInvites,
	requireAdmin,
	setInviteStatus
} from '$lib/server/auth';
import { setSetting } from '$lib/server/config';
import { sendBetaInvitation } from '$lib/server/email';
import { DEFAULT_LOCALE, isLocale } from '$lib/i18n';
import { serverTranslator } from '$lib/server/messageOverrides';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return { invites: listInvites(), betaMode: betaModeOn() };
};

const addSchema = z.object({
	email: z.email(),
	profession: z.string().trim().max(40).optional(),
	notes: z.string().trim().max(200).optional()
});

export const actions: Actions = {
	send: async ({ request, locals, url }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const parsed = addSchema.safeParse({
			email: String(form.get('email') ?? '').trim(),
			profession: String(form.get('profession') ?? '').trim() || undefined,
			notes: String(form.get('notes') ?? '').trim() || undefined
		});
		if (!parsed.success) return fail(400, { message: t('admin.invites.validEmail') });
		addInvite(parsed.data.email, parsed.data.profession, parsed.data.notes);
		const loginUrl = `${url.origin}/login?email=${encodeURIComponent(parsed.data.email)}`;
		const localeInput = form.get('locale');
		const locale = isLocale(localeInput) ? localeInput : DEFAULT_LOCALE;
		const result = await sendBetaInvitation(parsed.data.email, loginUrl, locale);
		if (!result.sent) {
			return fail(502, {
				message: t('admin.invites.deliveryFailed', { error: result.error ?? 'unknown error' }),
				saved: parsed.data.email
			});
		}
		return { sent: parsed.data.email };
	},
	toggleBeta: async ({ request, locals }) => {
		requireAdmin(locals);
		const enabled = String((await request.formData()).get('enabled') ?? '') === '1';
		setSetting('BETA_MODE', enabled ? '1' : '0');
		return { betaEnabled: enabled };
	},
	revoke: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const email = String((await request.formData()).get('email') ?? '');
		if (!email) return fail(400, { message: t('admin.invites.missingEmail') });
		setInviteStatus(email, 'revoked');
		return { revoked: email };
	},
	reactivate: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const email = String((await request.formData()).get('email') ?? '');
		if (!email) return fail(400, { message: t('admin.invites.missingEmail') });
		setInviteStatus(email, 'invited');
		return { reactivated: email };
	}
};
