/**
 * Quick fix: add_section smoke test with heavy model (DeepSeek V4 Pro)
 * Kullanım: AI_LIVE_SMOKE=1 npx vitest run src/lib/server/ai/live-smoke-section.test.ts
 */
import { describe, expect, it } from 'vitest';
import { chatEdit } from './patch';
import { seedSites } from '$lib/seed';

const RUN_LIVE = process.env.AI_LIVE_SMOKE === '1';

describe.runIf(RUN_LIVE)('🔍 DeepSeek V4 Pro — add_section live smoke', () => {
	const site = () => structuredClone(seedSites.law);

	it('🧩 DeepSeek V4 Pro — section ekleme (add_section) heavy model', async () => {
		const s = site();
		const originalSections = s.pages[0].sections.length;
		const { site: result, reply } = await chatEdit({
			site: s,
			message: 'Ana sayfaya bir SSS (FAQ) bölümü ekle',
			approvedPrompt: 'Ana sayfaya FAQ section ekle. slug=home, section id=faq-home, type=faq, variant=accordion. 3 soru-cevap tr/en/de.',
			model: process.env.DEEPSEEK_MODEL_HEAVY // V4 Pro
		});
		console.log('  Reply:', reply);
		console.log('  Sections:', originalSections, '→', result.pages[0].sections.length);
		const hasFaq = result.pages[0].sections.some(s => s.type === 'faq');
		console.log('  FAQ var mı:', hasFaq);
		
		if (hasFaq) {
			const faq = result.pages[0].sections.find(s => s.type === 'faq')!;
			if (faq.type === 'faq') {
				console.log('  FAQ items (TR):', faq.content.tr.items.length);
			}
		}
		
		expect(hasFaq).toBe(true);
	}, 60000);
});