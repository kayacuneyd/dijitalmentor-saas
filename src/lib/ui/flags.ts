import type { Locale } from '$lib/i18n';

export const flagSvgs: Record<Locale, string> = {
	en: `<svg aria-hidden="true" viewBox="0 0 16 12" width="16" height="12" class="sk-language-flag"><clipPath id="sk-flag-gb-clip"><path d="M0 0h16v12H0z"/></clipPath><g clip-path="url(#sk-flag-gb-clip)"><path fill="#012169" d="M0 0h16v12H0z"/><path stroke="#fff" stroke-width="2.4" d="m0 0 16 12M16 0 0 12"/><path stroke="#c8102e" stroke-width="1.4" d="m0 0 16 12M16 0 0 12"/><path fill="#fff" d="M6.4 0h3.2v12H6.4zM0 4.4h16v3.2H0z"/><path fill="#c8102e" d="M7.05 0h1.9v12h-1.9zM0 5.05h16v1.9H0z"/></g></svg>`,
	tr: `<svg aria-hidden="true" viewBox="0 0 16 12" width="16" height="12" class="sk-language-flag"><path fill="#e30a17" d="M0 0h16v12H0z"/><circle cx="6.7" cy="6" r="3" fill="#fff"/><circle cx="7.45" cy="6" r="2.35" fill="#e30a17"/><path fill="#fff" d="m10.3 6 2.15-.7-1.33 1.82V4.88l1.33 1.82z"/></svg>`,
	de: `<svg aria-hidden="true" viewBox="0 0 16 12" width="16" height="12" class="sk-language-flag"><path fill="#000" d="M0 0h16v4H0z"/><path fill="#dd0000" d="M0 4h16v4H0z"/><path fill="#ffce00" d="M0 8h16v4H0z"/></svg>`
};
