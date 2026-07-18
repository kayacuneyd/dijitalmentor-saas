import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import { getEurTryRate, shouldShowTry, tryAmounts } from '$lib/server/exchangeRates';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, request }) => {
	const showTry = shouldShowTry(locals.locale, request.headers);
	const rate = showTry ? await getEurTryRate() : null;
	return {
		copyOverrides: getPublicCopyOverrides('pricing'),
		tryEstimate: tryAmounts(rate)
	};
};
