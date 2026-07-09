import type { Site, Theme } from '$lib/schema/site';
import { lawSite } from './law';
import { psychSite } from './psych';
import { dentalSite } from './dental';

/** One hand-authored demo Site per niche preset — develop against these until the AI exists (M3). */
export const seedSites: Record<Theme['preset'], Site> = {
	law: lawSite,
	psych: psychSite,
	dental: dentalSite
};
