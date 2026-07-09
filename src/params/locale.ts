import type { ParamMatcher } from '@sveltejs/kit';
import { LOCALES } from '$lib/schema/site';

export const match: ParamMatcher = (param) => (LOCALES as readonly string[]).includes(param);
