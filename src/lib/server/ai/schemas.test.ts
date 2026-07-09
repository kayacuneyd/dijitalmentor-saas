import { describe, expect, it } from 'vitest';
import {
	generatedSiteSchema,
	chatPatchSchema,
	toInputSchema,
	translationSchemaFor
} from '$lib/server/ai/schemas';

describe('tool input schemas', () => {
	it('derive to JSON Schema objects Claude can consume', () => {
		for (const s of [generatedSiteSchema, chatPatchSchema, translationSchemaFor(['en', 'de'])]) {
			const json = toInputSchema(s);
			expect(json.type).toBe('object');
			expect(JSON.stringify(json).length).toBeLessThan(60000);
		}
	});
});
