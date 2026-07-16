import { DEFAULT_SECTION_STYLE, type SectionStyle } from '$lib/schema/site';

/** Normalize legacy/partial section styles at the renderer boundary. */
export function normalizedSectionStyle(style?: Partial<SectionStyle>): SectionStyle {
	return { ...DEFAULT_SECTION_STYLE, ...style };
}

/** Stable classes keep renderer behavior independent of serialized style strings. */
export function sectionStyleClasses(style?: Partial<SectionStyle>): string {
	const normalized = normalizedSectionStyle(style);
	return [
		`section-layout-${normalized.layout}`,
		`section-padding-${normalized.paddingY}`,
		`section-margin-${normalized.marginY}`,
		`section-height-${normalized.minHeight}`,
		`section-content-${normalized.contentWidth}`
	].join(' ');
}
