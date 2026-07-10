import { siteSchema, type Locale, type Section, type Site } from '$lib/schema/site';

export type QualitySeverity = 'blocker' | 'warning';

export type SiteQualityIssue = {
	code: string;
	severity: QualitySeverity;
	path: string;
	message: string;
};

export type SiteQualityReport = {
	validSchema: boolean;
	canPublish: boolean;
	issues: SiteQualityIssue[];
	blockers: SiteQualityIssue[];
	warnings: SiteQualityIssue[];
};

const PLACEHOLDER_RE =
	/\b(lorem ipsum|todo|tbd|placeholder|replace me|coming soon|yakında|örnek metin)\b/i;

const PROFESSIONAL_CLAIM_RE =
	/(kesin sonuç|garanti|%100|en iyi|mutlaka iyileştir|tedavi garantisi|sonuç garantisi)/i;

const PSYCH_PRESCRIPTION_CLAIM_RE = /(ilaç yazar|reçete yazar|antidepresan yazar|tanı koyar)/i;

const addIssue = (
	issues: SiteQualityIssue[],
	severity: QualitySeverity,
	code: string,
	path: string,
	message: string
) => issues.push({ severity, code, path, message });

function stringsIn(value: unknown, path: string, out: { path: string; value: string }[]): void {
	if (typeof value === 'string') {
		out.push({ path, value });
		return;
	}
	if (Array.isArray(value)) {
		value.forEach((item, index) => stringsIn(item, `${path}[${index}]`, out));
		return;
	}
	if (value && typeof value === 'object') {
		for (const [key, nested] of Object.entries(value)) {
			stringsIn(nested, path ? `${path}.${key}` : key, out);
		}
	}
}

function imageRefsInSection(section: Section, locale: Locale): string[] {
	const refs: string[] = [];
	if ('imageUrl' in section.props && section.props.imageUrl) refs.push(section.props.imageUrl);
	if (section.type === 'gallery') {
		refs.push(...section.content[locale].images.map((image) => image.url));
	}
	if (section.type === 'team') {
		refs.push(
			...section.content[locale].members
				.map((member) => member.photoUrl)
				.filter((url): url is string => Boolean(url))
		);
	}
	return refs;
}

function hexToRgb(hex: string): [number, number, number] | null {
	const normalized = hex.length === 4 ? `#${[...hex.slice(1)].map((c) => c + c).join('')}` : hex;
	const match = normalized.match(/^#([0-9a-f]{6})$/i);
	if (!match) return null;
	const int = Number.parseInt(match[1], 16);
	return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
}

function luminance([r, g, b]: [number, number, number]): number {
	const channel = (value: number) => {
		const scaled = value / 255;
		return scaled <= 0.03928 ? scaled / 12.92 : ((scaled + 0.055) / 1.055) ** 2.4;
	};
	return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: string, b: string): number | null {
	const rgbA = hexToRgb(a);
	const rgbB = hexToRgb(b);
	if (!rgbA || !rgbB) return null;
	const [lighter, darker] = [luminance(rgbA), luminance(rgbB)].sort((x, y) => y - x);
	return (lighter + 0.05) / (darker + 0.05);
}

export function siteQualityCheck(input: unknown): SiteQualityReport {
	const issues: SiteQualityIssue[] = [];
	const parsed = siteSchema.safeParse(input);
	if (!parsed.success) {
		for (const issue of parsed.error.issues) {
			addIssue(
				issues,
				'blocker',
				'schema_invalid',
				issue.path.length ? issue.path.join('.') : '$',
				issue.message
			);
		}
		return finish(false, issues);
	}

	const site: Site = parsed.data;
	const sectionIds = new Map<string, string>();
	let hasContactPath = Boolean(site.settings.contactEmail);
	let hasCtaPath = false;
	let hasSeedMedia = false;
	let hasFaq = false;
	let serviceItemCount = 0;
	const allCopy: string[] = [];

	if (!site.settings.seo?.description) {
		addIssue(
			issues,
			'warning',
			'seo_missing_description',
			'settings.seo.description',
			'Site has no SEO description.'
		);
	}

	const baseColor = site.theme.colors.base ?? '#ffffff';
	const primaryContrast = contrastRatio(site.theme.colors.primary, baseColor);
	if (primaryContrast !== null && primaryContrast < 3) {
		addIssue(
			issues,
			'warning',
			'contrast_low_primary',
			'theme.colors.primary',
			'Primary color has low contrast against the base color.'
		);
	}

	for (const [pageIndex, page] of site.pages.entries()) {
		for (const locale of site.locales) {
			if (!page.title[locale]?.trim()) {
				addIssue(
					issues,
					'blocker',
					'locale_missing_page_title',
					`pages[${pageIndex}].title.${locale}`,
					`Page title is missing for ${locale}.`
				);
			}
			const seoDescription = site.settings.seo?.description?.[locale];
			if (site.settings.seo && !seoDescription?.trim()) {
				addIssue(
					issues,
					'warning',
					'locale_missing_seo_description',
					`settings.seo.description.${locale}`,
					`SEO description is missing for ${locale}.`
				);
			}
		}

		for (const [sectionIndex, section] of page.sections.entries()) {
			const sectionPath = `pages[${pageIndex}].sections[${sectionIndex}]`;
			const previousPath = sectionIds.get(section.id);
			if (previousPath) {
				addIssue(
					issues,
					'blocker',
					'duplicate_section_id',
					`${sectionPath}.id`,
					`Section id "${section.id}" is already used at ${previousPath}.`
				);
			} else {
				sectionIds.set(section.id, `${sectionPath}.id`);
			}

			if (section.type === 'contact') hasContactPath = true;
			if (section.type === 'faq') hasFaq = true;
			if (section.type === 'services') {
				serviceItemCount += section.content[site.defaultLocale].items.length;
			}
			if (section.type === 'cta' || (section.type === 'hero' && section.props.ctaHref)) {
				hasCtaPath = true;
			}

			for (const locale of site.locales) {
				const strings: { path: string; value: string }[] = [];
				stringsIn(section.content[locale], `${sectionPath}.content.${locale}`, strings);
				for (const item of strings) {
					const trimmed = item.value.trim();
					if (trimmed) allCopy.push(trimmed);
					if (!trimmed) {
						addIssue(
							issues,
							'warning',
							'empty_optional_text',
							item.path,
							'Optional text is empty.'
						);
					}
					if (PLACEHOLDER_RE.test(trimmed)) {
						addIssue(
							issues,
							'warning',
							'placeholder_text',
							item.path,
							'Placeholder text should be replaced before launch.'
						);
					}
					if (PROFESSIONAL_CLAIM_RE.test(trimmed)) {
						addIssue(
							issues,
							'blocker',
							'unsafe_professional_claim',
							item.path,
							'Professional copy contains an absolute/guaranteed outcome claim.'
						);
					}
					if (site.theme.preset === 'psych' && PSYCH_PRESCRIPTION_CLAIM_RE.test(trimmed)) {
						addIssue(
							issues,
							'blocker',
							'psych_scope_claim',
							item.path,
							'Psychologist site copy claims prescription/diagnosis authority that needs operator review.'
						);
					}
				}

				for (const ref of imageRefsInSection(section, locale)) {
					if (ref.startsWith('/seed/')) hasSeedMedia = true;
					if (ref.startsWith('/') && !ref.startsWith('/seed/') && !ref.startsWith('/media/')) {
						addIssue(
							issues,
							'warning',
							'unknown_local_media_ref',
							sectionPath,
							`Local media reference "${ref}" is outside the approved seed/media paths.`
						);
					}
				}
			}
		}
	}

	if (!hasContactPath) {
		addIssue(
			issues,
			'blocker',
			'contact_path_missing',
			'pages',
			'Site needs a contact email or contact section before publishing.'
		);
	}
	if (!hasCtaPath) {
		addIssue(
			issues,
			'warning',
			'cta_path_missing',
			'pages',
			'Site has no clear call-to-action path.'
		);
	}
	if (hasSeedMedia) {
		addIssue(
			issues,
			'warning',
			'seed_media_in_use',
			'pages',
			'Seed/placeholder media is still in use; customer media should be reviewed.'
		);
	}
	if (site.theme.preset === 'psych') {
		const joinedCopy = allCopy.join(' ');
		if (!hasFaq) {
			addIssue(
				issues,
				'warning',
				'psych_faq_missing',
				'pages',
				'Psychologist sites should answer common questions about sessions, privacy, and booking.'
			);
		}
		if (serviceItemCount < 2) {
			addIssue(
				issues,
				'warning',
				'psych_services_too_few',
				'pages',
				'Psychologist sites should list at least two clear areas of work or service types.'
			);
		}
		if (!/(gizli|gizlilik|etik|confidential|privacy|schweigepflicht)/i.test(joinedCopy)) {
			addIssue(
				issues,
				'warning',
				'psych_confidentiality_missing',
				'pages',
				'Psychologist sites should mention confidentiality or professional ethics.'
			);
		}
		if (!/(randevu|appointment|termin|seans|session)/i.test(joinedCopy)) {
			addIssue(
				issues,
				'warning',
				'psych_booking_copy_missing',
				'pages',
				'Psychologist sites should make the appointment/session path explicit.'
			);
		}
	}

	return finish(true, issues);
}

function finish(validSchema: boolean, issues: SiteQualityIssue[]): SiteQualityReport {
	const blockers = issues.filter((issue) => issue.severity === 'blocker');
	const warnings = issues.filter((issue) => issue.severity === 'warning');
	return {
		validSchema,
		canPublish: blockers.length === 0,
		issues,
		blockers,
		warnings
	};
}
