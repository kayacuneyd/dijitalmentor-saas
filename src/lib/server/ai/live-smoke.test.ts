/**
 * Canlı AI Chat Smoke Test (Vitest)
 *
 * Gerçek Groq + DeepSeek API çağrılarını yapar.
 * Bu test tüm CI ortamlarında çalışmaz — sadece API anahtarları
 * yapılandırıldığında manuel olarak çalıştırılır.
 *
 * Kullanım: AI_LIVE_SMOKE=1 npx vitest run src/lib/server/ai/live-smoke.test.ts
 */
import { describe, expect, it } from 'vitest';
import { gateMessage } from './gatekeeper';
import { applyPatch, chatEdit } from './patch';
import { seedSites } from '$lib/seed';
import type { Site } from '$lib/schema/site';

const RUN_LIVE = process.env.AI_LIVE_SMOKE === '1';

describe.runIf(RUN_LIVE)('🔍 Canlı AI Chat Smoke', () => {
	const site = () => structuredClone(seedSites.law);

	it('🛡️ Gatekeeper — edit intent sınıflandırması (Groq)', async () => {
		const { gate, usage } = await gateMessage({
			site: site(),
			message: 'Renkleri mavi yap, metinleri daha kısa tut',
			history: []
		});
		console.log('  Intent:', gate.intent);
		console.log('  Risk:', gate.riskLevel);
		console.log('  Distilled:', gate.distilledPrompt?.slice(0, 100));
		console.log('  Tokens:', usage.inputTokens, 'in /', usage.outputTokens, 'out');

		expect(gate.intent).toBe('edit');
		expect(gate.riskLevel).toBeDefined();
		expect(gate.distilledPrompt).toBeDefined();
	}, 30000);

	it('🚫 Gatekeeper — off-topic tespiti', async () => {
		const { gate } = await gateMessage({
			site: site(),
			message: 'Bugün hava nasıl, sence yağmur yağar mı?',
			history: []
		});
		console.log('  Intent:', gate.intent);
		console.log('  Reply:', gate.reply?.slice(0, 100));

		expect(gate.intent).toBe('off_topic');
	}, 30000);

	it('❓ Gatekeeper — soru tespiti', async () => {
		const { gate } = await gateMessage({
			site: site(),
			message: 'Sitemde kaç sayfa var ve hangi dillerde yayınlanıyor?',
			history: []
		});
		console.log('  Intent:', gate.intent);
		console.log('  Reply:', gate.reply?.slice(0, 100));

		expect(gate.intent).toBe('question');
	}, 30000);

	it('🎨 DeepSeek — renk değişimi (set_theme)', async () => {
		const s = site();
		const { site: result, reply } = await chatEdit({
			site: s,
			message: 'Ana rengi koyu lacivert, ikincil rengi altın sarısı yap',
			approvedPrompt:
				'Tema renklerini değiştir: primary rengi koyu lacivert (#1a3a5c gibi), secondary rengi altın sarısı (#b08d57 gibi)',
			model: process.env.DEEPSEEK_MODEL_LIGHT
		});
		console.log('  Reply:', reply);
		console.log('  Primary:', s.theme.colors.primary, '→', result.theme.colors.primary);
		console.log('  Secondary:', s.theme.colors.secondary, '→', result.theme.colors.secondary);

		const colorChanged = result.theme.colors.primary !== s.theme.colors.primary;
		expect(colorChanged).toBe(true);
	}, 60000);

	it('📐 DeepSeek — layout değişimi (set_layout)', async () => {
		const s = site();
		const { site: result, reply } = await chatEdit({
			site: s,
			message: 'Menüyü hamburger (drawer) yap ve sabitle (sticky), container genişliğini daralt',
			approvedPrompt:
				'Layout değiştir: nav variant drawer, sticky header aktif, container width narrow, section spacing tight',
			model: process.env.DEEPSEEK_MODEL_LIGHT
		});
		console.log('  Reply:', reply);
		console.log('  Nav variant:', s.layout?.nav.variant, '→', result.layout?.nav.variant);
		console.log('  Sticky:', s.layout?.nav.sticky, '→', result.layout?.nav.sticky);
		console.log('  Container:', s.layout?.container.width, '→', result.layout?.container.width);

		const layoutChanged = result.layout?.nav.variant !== s.layout?.nav.variant;
		expect(layoutChanged).toBe(true);
	}, 60000);

	it('🏷️ DeepSeek — menü etiketi değişimi (set_nav_label)', async () => {
		const s = site();
		const { site: result, reply } = await chatEdit({
			site: s,
			message: 'Menüde "Ana Sayfa" yazısını "Başlangıç" olarak değiştir',
			approvedPrompt: 'set_nav_label: pageSlug=home, locale=tr, value=Başlangıç',
			model: process.env.DEEPSEEK_MODEL_LIGHT
		});
		console.log('  Reply:', reply);
		const homeNav = result.nav.items.find((i) => i.pageSlug === 'home');
		console.log('  Home nav label (TR):', homeNav?.label.tr);

		expect(homeNav?.label.tr).toBe('Başlangıç');
	}, 60000);

	it('📄 DeepSeek — sayfa ekleme (add_page)', async () => {
		const s = site();
		const originalPages = s.pages.length;
		const { site: result, reply } = await chatEdit({
			site: s,
			message: 'Hakkımda adında yeni bir sayfa ekle',
			approvedPrompt:
				'add_page: slug=hakkimda, title TR=Hakkımda EN=About Me DE=Über mich, hero section, addToNav=true',
			model: process.env.DEEPSEEK_MODEL_LIGHT
		});
		console.log('  Reply:', reply);
		console.log('  Pages:', originalPages, '→', result.pages.length);
		const hasNewPage = result.pages.some((p) => p.slug === 'hakkimda');
		console.log('  hakkimda var mı:', hasNewPage);
		console.log(
			"  Nav'de var mı:",
			result.nav.items.some((i) => i.pageSlug === 'hakkimda')
		);

		if (hasNewPage) {
			const p = result.pages.find((pg) => pg.slug === 'hakkimda')!;
			console.log('  Title TR:', p.title.tr, 'EN:', p.title.en, 'DE:', p.title.de);
			console.log('  Sections:', p.sections.length);
		}

		expect(hasNewPage).toBe(true);
		expect(result.nav.items.some((i) => i.pageSlug === 'hakkimda')).toBe(true);
	}, 60000);

	it('🧩 DeepSeek — section ekleme (add_section)', async () => {
		const s = site();
		const originalSections = s.pages[0].sections.length;
		const { site: result, reply } = await chatEdit({
			site: s,
			message: 'Ana sayfaya SSS (FAQ) bölümü ekle',
			approvedPrompt:
				'add_section: pageSlug=home, type=faq, id=faq-home, variant=accordion, 3 soru-cevap tr/en/de',
			model: process.env.DEEPSEEK_MODEL_LIGHT
		});
		console.log('  Reply:', reply);
		console.log('  Sections:', originalSections, '→', result.pages[0].sections.length);
		const hasFaq = result.pages[0].sections.some((s) => s.type === 'faq');
		console.log('  FAQ var mı:', hasFaq);

		if (hasFaq) {
			const faq = result.pages[0].sections.find((s) => s.type === 'faq')!;
			if (faq.type === 'faq') {
				console.log('  FAQ items (TR):', faq.content.tr.items.length);
			}
		}

		expect(hasFaq).toBe(true);
	}, 60000);

	it('🔒 Integration protection — AI phishing yapamaz', () => {
		const s = site();
		s.settings.integrations = [
			{
				enabled: true,
				type: 'booking-external' as const,
				url: 'https://calendly.com/legit-clinic',
				label: { tr: 'Randevu', en: 'Appointment', de: 'Termin' }
			}
		];
		const result = applyPatch(s, [{ op: 'set_settings' as const, settings: { siteName: 'Test' } }]);
		expect(result.settings.integrations![0].url).toBe('https://calendly.com/legit-clinic');
	});

	it('✅ Site Schema validasyon — tüm sonuçlar geçerli', async () => {
		const { siteSchema } = await import('$lib/schema/site');
		// Seed site zaten valid olmalı
		expect(() => siteSchema.parse(site())).not.toThrow();
	});
});
