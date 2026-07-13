import { getPublicCopyOverrides } from '$lib/server/publicCopy';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	copyOverrides: getPublicCopyOverrides('home')
});
