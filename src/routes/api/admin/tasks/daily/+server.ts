import { json } from '@sveltejs/kit';
import { getSetting } from '$lib/server/config';
import { sweepExpiredCustomDomains } from '$lib/server/ops';
import { sweepExpiredOnboarding } from '$lib/server/onboarding/session';
import { fulfillPendingReservations } from '$lib/server/reservations';
import type { RequestHandler } from './$types';

/**
 * Daily maintenance (M6): called by scripts/backup.sh via cron with the
 * CRON_TOKEN setting, or manually by a signed-in super admin.
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	const token = getSetting('CRON_TOKEN');
	const authorized =
		locals.user?.isAdmin || (token && request.headers.get('x-cron-token') === token);
	if (!authorized) {
		return json(
			{ ok: false, message: token ? 'Bad or missing x-cron-token.' : 'CRON_TOKEN not configured.' },
			{ status: 401 }
		);
	}
	const sweptDomains = await sweepExpiredCustomDomains();
	const fulfilled = await fulfillPendingReservations();
	const sweptOnboarding = sweepExpiredOnboarding();
	console.log(
		`[ops] daily sweep: ${sweptDomains.length} domain(s) detached, ${fulfilled.length} reservation(s) processed, ${sweptOnboarding} pending onboarding record(s) expired`
	);
	return json({ ok: true, sweptDomains, fulfilled, sweptOnboarding });
};
