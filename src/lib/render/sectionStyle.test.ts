import { describe, expect, it } from 'vitest';
import { sectionStyleClasses, normalizedSectionStyle } from './sectionStyle';

describe('section style renderer contract', () => {
	it('normalizes partial styles using schema defaults', () => {
		expect(normalizedSectionStyle({ contentWidth: 'narrow' })).toMatchObject({
			layout: 'full',
			paddingY: 'standard',
			marginY: 'none',
			minHeight: 'auto',
			contentWidth: 'narrow'
		});
	});

	it('emits deterministic classes for every visual control', () => {
		expect(
			sectionStyleClasses({
				layout: 'boxed',
				paddingY: 'spacious',
				marginY: 'standard',
				minHeight: 'tall',
				contentWidth: 'narrow'
			})
		).toBe(
			'section-layout-boxed section-padding-spacious section-margin-standard section-height-tall section-content-narrow'
		);
	});
});
