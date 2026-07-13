import type { Site } from '$lib/schema/site';

export const RESERVED_PUBLIC_HANDLES = new Set([
	'admin',
	'api',
	'app',
	'beta',
	'billing',
	'blog',
	'cdn',
	'contact',
	'dashboard',
	'help',
	'login',
	'logout',
	'mail',
	'preview',
	'pricing',
	'root',
	'saaskaya',
	'support',
	'www'
]);

export function normalizePublicHandle(input: string): string {
	return input
		.trim()
		.toLowerCase()
		.replaceAll('ı', 'i')
		.replaceAll('ğ', 'g')
		.replaceAll('ü', 'u')
		.replaceAll('ş', 's')
		.replaceAll('ö', 'o')
		.replaceAll('ç', 'c')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.replace(/-{2,}/g, '-');
}

export function publicHandleFromSite(site: Site): string {
	return normalizePublicHandle(site.id) || site.id;
}

export function validatePublicHandle(
	handle: string
): { ok: true; handle: string } | { ok: false; message: string } {
	const normalized = normalizePublicHandle(handle);
	if (normalized.length < 3) {
		return { ok: false, message: 'Subdomain en az 3 karakter olmalı.' };
	}
	if (normalized.length > 48) {
		return { ok: false, message: 'Subdomain en fazla 48 karakter olabilir.' };
	}
	if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(normalized)) {
		return { ok: false, message: 'Subdomain sadece küçük harf, rakam ve tire içerebilir.' };
	}
	if (RESERVED_PUBLIC_HANDLES.has(normalized)) {
		return { ok: false, message: 'Bu subdomain sistem tarafından ayrılmış.' };
	}
	return { ok: true, handle: normalized };
}

export function needsCustomPublicHandle(input: {
	siteId: string;
	publicHandle: string | null | undefined;
	publishedVersion?: number | null;
}): boolean {
	const handle = validatePublicHandle(input.publicHandle ?? '');
	return !handle.ok || (!input.publishedVersion && handle.handle === input.siteId);
}
