// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			errorId?: string;
		}
		interface Locals {
			user: { id: string; email: string; isAdmin: boolean } | null;
			locale: import('$lib/i18n').Locale;
			unprefixedPath: string;
			/** True when the request's Host is a tenant site (subdomain/custom domain),
			 *  not the SaaS app — PWA manifest/meta/SW must never ship to tenants. */
			isTenantHost: boolean;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
