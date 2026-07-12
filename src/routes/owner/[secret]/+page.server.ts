import { error, fail, redirect } from '@sveltejs/kit';
import {
	OWNER_DEVICE_COOKIE,
	ownerDeviceToken,
	ownerLoginConfigured,
	ownerRouteMatches,
	requestFingerprint,
	setOwnerDeviceCookie,
	setOwnerSessionCookie,
	startOwnerPasswordLogin,
	verifyOwnerEmailCode
} from '$lib/server/ownerAuth';
import type { Actions, PageServerLoad } from './$types';

const GENERIC_FAILURE = 'Giriş başarısız.';

function assertOwnerRoute(secret: string | undefined): void {
	if (!ownerRouteMatches(secret) || !ownerLoginConfigured()) error(404, 'Not found');
}

export const load: PageServerLoad = ({ locals, params }) => {
	assertOwnerRoute(params.secret);
	if (locals.user?.isAdmin) redirect(303, '/admin');
	return {};
};

export const actions: Actions = {
	login: async ({ request, params, cookies, getClientAddress }) => {
		assertOwnerRoute(params.secret);
		const form = await request.formData();
		const password = String(form.get('password') ?? '');
		const deviceToken = ownerDeviceToken(cookies);
		const fingerprint = requestFingerprint({ request, getClientAddress });
		const result = await startOwnerPasswordLogin({
			password,
			deviceToken,
			fingerprint,
			rateLimitKey: fingerprint.ipPrefixHash ?? getClientAddress()
		});
		if (!result.ok) {
			return fail(result.reason === 'rate-limited' ? 429 : 400, { message: GENERIC_FAILURE });
		}
		setOwnerDeviceCookie(cookies, result.deviceToken);
		if (result.status === 'code-sent') {
			return {
				needsCode: true,
				deviceToken: result.deviceToken,
				message: 'Onay kodunu e-postana gönderdim.'
			};
		}
		setOwnerSessionCookie(cookies, result.sessionToken);
		redirect(303, '/admin');
	},
	verifyCode: async ({ request, params, cookies, getClientAddress }) => {
		assertOwnerRoute(params.secret);
		const form = await request.formData();
		const code = String(form.get('code') ?? '');
		const formDeviceToken = String(form.get('deviceToken') ?? '');
		const deviceToken = cookies.get(OWNER_DEVICE_COOKIE) ?? formDeviceToken;
		const fingerprint = requestFingerprint({ request, getClientAddress });
		const result = verifyOwnerEmailCode({
			code,
			deviceToken,
			fingerprint,
			rateLimitKey: fingerprint.ipPrefixHash ?? getClientAddress()
		});
		if (!result.ok) {
			return fail(result.reason === 'rate-limited' ? 429 : 400, {
				needsCode: true,
				message: GENERIC_FAILURE
			});
		}
		setOwnerDeviceCookie(cookies, deviceToken);
		setOwnerSessionCookie(cookies, result.sessionToken);
		redirect(303, '/admin');
	}
};
