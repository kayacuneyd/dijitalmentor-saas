import type { LayoutServerLoad } from './$types';

/** Expose the signed-in user to every page (nav state). */
export const load: LayoutServerLoad = ({ locals }) => ({ user: locals.user });
