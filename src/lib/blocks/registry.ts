import type { Component } from 'svelte';
import type { Locale, Section, SectionContent, SectionProps, SectionType } from '$lib/schema/site';
import type { Integration } from '$lib/render/context';
import Hero from './Hero.svelte';
import About from './About.svelte';
import Services from './Services.svelte';
import Gallery from './Gallery.svelte';
import Contact from './Contact.svelte';
import Cta from './Cta.svelte';
import Faq from './Faq.svelte';
import Testimonials from './Testimonials.svelte';
import Pricing from './Pricing.svelte';
import Process from './Process.svelte';
import Booking from './Booking.svelte';
import Credentials from './Credentials.svelte';
import Team from './Team.svelte';
import Footer from './Footer.svelte';

export type BlockProps<T extends SectionType> = {
	sectionId: string;
	locale: Locale;
	props: SectionProps<T>;
	content: SectionContent<T>;
	integrations?: Integration[];
};

export const registry: { [T in SectionType]: Component<BlockProps<T>> } = {
	hero: Hero,
	about: About,
	services: Services,
	gallery: Gallery,
	contact: Contact,
	cta: Cta,
	faq: Faq,
	testimonials: Testimonials,
	pricing: Pricing,
	process: Process,
	booking: Booking,
	credentials: Credentials,
	team: Team,
	footer: Footer
};

export function blockFor(section: Section): Component<BlockProps<SectionType>> {
	return registry[section.type] as Component<BlockProps<SectionType>>;
}