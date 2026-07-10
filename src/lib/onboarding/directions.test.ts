import { describe, expect, it } from 'vitest';
import {
	VISUAL_DIRECTIONS,
	VISUAL_DIRECTION_OPTIONS,
	visualDirectionById,
	visualDirectionSchema
} from './directions';

describe('onboarding visual directions', () => {
	it('defines exactly 3 ordered curated directions for Phase 2', () => {
		expect(VISUAL_DIRECTIONS.map((direction) => direction.id)).toEqual([
			'warm_trust',
			'modern_clinic',
			'calm_minimal'
		]);
	});

	it('exposes matching choice options for the question script', () => {
		expect(VISUAL_DIRECTION_OPTIONS).toEqual(
			VISUAL_DIRECTIONS.map((direction) => ({ value: direction.id, label: direction.label }))
		);
	});

	it('validates only the controlled direction ids', () => {
		expect(visualDirectionSchema.safeParse('warm_trust').success).toBe(true);
		expect(visualDirectionSchema.safeParse('freeform_layout').success).toBe(false);
	});

	it('looks up a direction by id without guessing', () => {
		expect(visualDirectionById('modern_clinic')?.label).toBe('Modern klinik');
		expect(visualDirectionById('unknown')).toBeUndefined();
	});

	it('binds each visual direction to one controlled launch psych kit', () => {
		expect(visualDirectionById('warm_trust')?.kit?.slug).toBe('calm-intake');
		expect(visualDirectionById('warm_trust')?.kit?.label).toBe('Sakin İlk Görüşme');
		expect(visualDirectionById('modern_clinic')?.kit?.slug).toBe('modern-clinic');
		expect(visualDirectionById('modern_clinic')?.kit?.label).toBe('Modern Klinik');
		expect(visualDirectionById('calm_minimal')?.kit?.slug).toBe('online-therapy');
		expect(visualDirectionById('calm_minimal')?.kit?.label).toBe('Online Terapi');
	});
});
