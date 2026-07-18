import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import {
	clearSetting,
	getSetting,
	maskValue,
	SETTING_DEFS,
	setSetting,
	settingSource
} from '$lib/server/config';
import { requireAdmin } from '$lib/server/auth';
import { gateStats, healthCheck, opsStatus } from '$lib/server/ops';
import { globalMonthlyBudgetMicrousd, globalMonthlySpendMicrousd } from '$lib/server/ai/usage';
import {
	confirmPayment,
	fulfillReservation,
	listPendingReservations,
	rejectPayment
} from '$lib/server/reservations';
import { listRecentErrors, resolveError, unresolvedErrorCount } from '$lib/server/error-log';
import { listRequestProbes } from '$lib/server/requestProbes';
import { serverTranslator } from '$lib/server/messageOverrides';
import {
	getPlatformBranding,
	isBrandAssetTarget,
	resetPlatformBranding,
	saveBrandingPreferences,
	uploadPlatformBranding
} from '$lib/server/branding';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
		branding: getPlatformBranding(),
		settings: SETTING_DEFS.map((def) => ({
			...def,
			display: maskValue(getSetting(def.key), def.secret),
			source: settingSource(def.key)
		})),
		health: healthCheck(),
		ops: opsStatus(),
		gate: gateStats(),
		aiSpend: {
			usedUsd: globalMonthlySpendMicrousd() / 1_000_000,
			budgetUsd: globalMonthlyBudgetMicrousd() / 1_000_000
		},
		errors: listRecentErrors(),
		unresolvedErrors: unresolvedErrorCount(),
		requestProbes: listRequestProbes(),
		pending: listPendingReservations()
	};
};

const saveSchema = z.object({ key: z.string().min(1), value: z.string().min(1) });

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const parsed = saveSchema.safeParse({
			key: String(form.get('key') ?? ''),
			value: String(form.get('value') ?? '').trim()
		});
		if (!parsed.success) return fail(400, { message: t('admin.settings.valueRequired') });
		try {
			setSetting(parsed.data.key, parsed.data.value);
		} catch {
			return fail(400, { message: t('admin.settings.unknownSetting') });
		}
		return { saved: parsed.data.key };
	},
	clear: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const key = String((await request.formData()).get('key') ?? '');
		try {
			clearSetting(key);
		} catch {
			return fail(400, { message: t('admin.settings.unknownSetting') });
		}
		return { cleared: key };
	},
	uploadBranding: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const target = String(form.get('target') ?? '');
		const upload = form.get('file');
		if (!isBrandAssetTarget(target))
			return fail(400, { message: 'Choose a valid branding target.' });
		if (!(upload instanceof File) || upload.size === 0)
			return fail(400, { message: 'Choose a logo file first.' });
		try {
			await uploadPlatformBranding({
				target,
				fileName: upload.name,
				mimeType: upload.type,
				bytes: new Uint8Array(await upload.arrayBuffer())
			});
			return { brandingSaved: target };
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Branding upload failed.'
			});
		}
	},
	resetBranding: async ({ request, locals }) => {
		requireAdmin(locals);
		const target = String((await request.formData()).get('target') ?? '');
		if (!isBrandAssetTarget(target))
			return fail(400, { message: 'Choose a valid branding target.' });
		resetPlatformBranding(target);
		return { brandingReset: target };
	},
	saveBrandingPreferences: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		try {
			saveBrandingPreferences({
				brandName: String(form.get('brandName') ?? ''),
				showWordmark: form.get('showWordmark') === 'on'
			});
			return { brandingPreferencesSaved: true };
		} catch (error) {
			return fail(400, {
				message: error instanceof Error ? error.message : 'Branding preferences failed.'
			});
		}
	},
	resolveError: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const id = String((await request.formData()).get('errorId') ?? '');
		if (!resolveError(id)) return fail(404, { message: t('admin.settings.errorNotFound') });
		return { errorResolved: id };
	},
	// --- domain reservation payments (beta-launch spec) -----------------------
	confirmPayment: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const id = String((await request.formData()).get('reservationId') ?? '');
		if (!confirmPayment(id)) return fail(404, { message: t('admin.settings.reservationNotFound') });
		return { paymentConfirmed: id };
	},
	rejectPayment: async ({ request, locals }) => {
		requireAdmin(locals);
		const t = serverTranslator(locals.locale);
		const form = await request.formData();
		const id = String(form.get('reservationId') ?? '');
		const reason = String(form.get('reason') ?? '').trim() || undefined;
		if (!rejectPayment(id, reason))
			return fail(404, { message: t('admin.settings.reservationNotFound') });
		return { paymentRejected: id };
	},
	fulfillReservation: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('reservationId') ?? '');
		const result = await fulfillReservation(id);
		return {
			fulfilled: id,
			fulfillStatus: result.status,
			fulfillError: result.ok ? null : result.error
		};
	}
};
