import type { Component } from 'svelte';
import type { Locale, Section, SectionContent, SectionProps, SectionType } from '$lib/schema/site';
import Hero from './Hero.svelte';
import About from './About.svelte';
import Services from './Services.svelte';
import Gallery from './Gallery.svelte';
import Contact from './Contact.svelte';
import Cta from './Cta.svelte';
import Faq from './Faq.svelte';
import Team from './Team.svelte';
import Footer from './Footer.svelte';

/** What every block component receives: language-neutral props + one locale's content. */
export type BlockProps<T extends SectionType> = {
	sectionId: string;
	locale: Locale;
	props: SectionProps<T>;
	content: SectionContent<T>;
};

/**
 * The fixed component set (constitution §3): section `type` → Svelte block.
 * Adding a block = schema entry + component + a line here (see CONVENTIONS.md).
 */
export const registry: { [T in SectionType]: Component<BlockProps<T>> } = {
	hero: Hero,
	about: About,
	services: Services,
	gallery: Gallery,
	contact: Contact,
	cta: Cta,
	faq: Faq,
	team: Team,
	footer: Footer
};

/**
 * Look up the block for a section. The registry's mapped type guarantees the
 * type→component correlation; this is the single place it is erased so the
 * renderer can pass a union `Section` without per-type narrowing.
 */
export function blockFor(section: Section): Component<BlockProps<SectionType>> {
	return registry[section.type] as Component<BlockProps<SectionType>>;
}
