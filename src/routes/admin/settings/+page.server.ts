import { error, fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import {
	clearSetting,
	getSetting,
	maskValue,
	SETTING_DEFS,
	setSetting,
	settingSource
} from '$lib/server/config';
import { gateStats, healthCheck, opsStatus } from '$lib/server/ops';
import { globalMonthlyBudgetMicrousd, globalMonthlySpendMicrousd } from '$lib/server/ai/usage';
import {
	confirmPayment,
	fulfillReservation,
	listPendingReservations,
	rejectPayment
} from '$lib/server/reservations';
import { listRecentErrors, resolveError, unresolvedErrorCount } from '$lib/server/error-log';
import type { Actions, PageServerLoad } from './$types';

function requireAdmin(locals: App.Locals) {
	if (!locals.user) redirect(303, '/login');
	if (!locals.user.isAdmin) error(403, 'Super admin only.');
}

export const load: PageServerLoad = ({ locals }) => {
	requireAdmin(locals);
	return {
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
		pending: listPendingReservations()
	};
};

const saveSchema = z.object({ key: z.string().min(1), value: z.string().min(1) });

export const actions: Actions = {
	save: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const parsed = saveSchema.safeParse({
			key: String(form.get('key') ?? ''),
			value: String(form.get('value') ?? '').trim()
		});
		if (!parsed.success) return fail(400, { message: 'A value is required.' });
		try {
			setSetting(parsed.data.key, parsed.data.value);
		} catch {
			return fail(400, { message: 'Unknown setting.' });
		}
		return { saved: parsed.data.key };
	},
	clear: async ({ request, locals }) => {
		requireAdmin(locals);
		const key = String((await request.formData()).get('key') ?? '');
		try {
			clearSetting(key);
		} catch {
			return fail(400, { message: 'Unknown setting.' });
		}
		return { cleared: key };
	},
	resolveError: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('errorId') ?? '');
		if (!resolveError(id)) return fail(404, { message: 'Error record not found.' });
		return { errorResolved: id };
	},
	// --- domain reservation payments (beta-launch spec) -----------------------
	confirmPayment: async ({ request, locals }) => {
		requireAdmin(locals);
		const id = String((await request.formData()).get('reservationId') ?? '');
		if (!confirmPayment(id)) return fail(404, { message: 'Reservation not found.' });
		return { paymentConfirmed: id };
	},
	rejectPayment: async ({ request, locals }) => {
		requireAdmin(locals);
		const form = await request.formData();
		const id = String(form.get('reservationId') ?? '');
		const reason = String(form.get('reason') ?? '').trim() || undefined;
		if (!rejectPayment(id, reason)) return fail(404, { message: 'Reservation not found.' });
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
