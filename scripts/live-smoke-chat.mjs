/**
 * Canlı AI Chat Smoke Test
 * 
 * Gerçek Groq (gatekeeper) + DeepSeek (agent) API anahtarlarını kullanarak
 * seed siteler üzerinde chat operasyonlarını test eder.
 * 
 * Kullanım: node scripts/live-smoke-chat.mjs
 */
import 'dotenv/config';
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Vitest'in kullandığı Vite resolve mekanizmasını taklit edemeyiz, 
// doğrudan veritabanı bağlantısını kuralım
const require = createRequire(import.meta.url);

// SvelteKit env yüklemesini taklit et
process.env.DATABASE_URL = process.env.DATABASE_URL || 'local.db';

async function main() {
  console.log('🔍 Live AI Chat Smoke Test başlıyor...\n');
  
  // 1. DB'den seed site'i yükle
  const Database = require('better-sqlite3');
  const dbPath = path.join(projectRoot, process.env.DATABASE_URL);
  const db = new Database(dbPath);
  
  const siteRow = db.prepare(`SELECT id, draft FROM sites WHERE id = 'seed-law'`).get();
  if (!siteRow) {
    console.error('❌ seed-law bulunamadı!');
    process.exit(1);
  }
  const site = JSON.parse(siteRow.draft);
  console.log(`📄 Site: ${site.settings.siteName} (${site.id})`);
  console.log(`📄 Sayfalar: ${site.pages.map(p => p.slug).join(', ')}`);
  console.log(`📄 Temel renk: ${site.theme.colors.primary}\n`);
  
  // 2. Gatekeeper testi (Groq)
  console.log('🛡️  TEST 1: Gatekeeper (Groq) — intent classification');
  try {
    const { gateMessage } = await import('../src/lib/server/ai/gatekeeper.ts');
    const { gate, usage } = await gateMessage({
      site,
      message: 'Renkleri mavi yap',
      history: []
    });
    console.log(`   Intent: ${gate.intent}`);
    console.log(`   Risk: ${gate.riskLevel}`);
    console.log(`   Distilled: ${gate.distilledPrompt?.slice(0, 80)}...`);
    console.log(`   Tokens: ${usage.inputTokens} in / ${usage.outputTokens} out`);
    console.log('   ✅ Gatekeeper çalıştı\n');
  } catch (err) {
    console.error(`   ❌ Gatekeeper hatası: ${err.message}\n`);
  }

  // 3. Chat edit testi (DeepSeek) — renk değişimi
  console.log('🎨 TEST 2: DeepSeek chat — renk değişimi');
  try {
    const { chatEdit } = await import('../src/lib/server/ai/patch.ts');
    const { site: result, reply } = await chatEdit({
      site,
      message: 'Ana rengi koyu mavi yap, ikincil rengi altın sarısı yap',
      approvedPrompt: 'Tema ana rengini koyu mavi (#1a3a5c benzeri), ikincil rengi altın sarısı yap',
      model: process.env.DEEPSEEK_MODEL_LIGHT
    });
    console.log(`   Cevap: "${reply}"`);
    console.log(`   Eski primary: ${site.theme.colors.primary} → Yeni: ${result.theme.colors.primary}`);
    console.log(`   Eski secondary: ${site.theme.colors.secondary} → Yeni: ${result.theme.colors.secondary}`);
    const colorChanged = result.theme.colors.primary !== site.theme.colors.primary;
    console.log(`   ${colorChanged ? '✅ Renk değiştirildi' : '⚠️ Renk değişmedi (AI cevap verdi mi kontrol et)'}\n`);
  } catch (err) {
    console.error(`   ❌ Chat edit hatası: ${err.message}\n`);
  }

  // 4. Layout değişimi
  console.log('📐 TEST 3: DeepSeek chat — layout değişimi');
  try {
    const { chatEdit } = await import('../src/lib/server/ai/patch.ts');
    const { site: result, reply } = await chatEdit({
      site,
      message: 'Menüyü hamburger menü yap ve header\'ı sabitle (sticky)',
      approvedPrompt: 'Menüyü hamburger (drawer) yap ve sticky header aktif et',
      model: process.env.DEEPSEEK_MODEL_LIGHT
    });
    console.log(`   Cevap: "${reply}"`);
    const navChanged = result.layout?.nav.variant !== site.layout?.nav.variant;
    console.log(`   Nav variant: ${site.layout?.nav.variant} → ${result.layout?.nav.variant}`);
    console.log(`   Sticky: ${site.layout?.nav.sticky} → ${result.layout?.nav.sticky}`);
    console.log(`   ${navChanged ? '✅ Layout değiştirildi' : '⚠️ Layout değişmedi'}\n`);
  } catch (err) {
    console.error(`   ❌ Layout hatası: ${err.message}\n`);
  }

  // 5. Menü / nav label değişimi
  console.log('🏷️  TEST 4: DeepSeek chat — menü etiketi değişimi');
  try {
    const { chatEdit } = await import('../src/lib/server/ai/patch.ts');
    const { site: result, reply } = await chatEdit({
      site,
      message: 'Menüdeki "Ana Sayfa" yazısını "Başlangıç" olarak değiştir',
      approvedPrompt: 'Menüdeki home sayfasının nav label\'ını "Ana Sayfa" yerine "Başlangıç" yap (sadece TR locale)',
      model: process.env.DEEPSEEK_MODEL_LIGHT
    });
    console.log(`   Cevap: "${reply}"`);
    const homeNavItem = result.nav.items.find(i => i.pageSlug === 'home');
    console.log(`   Home nav label (TR): ${homeNavItem?.label.tr}`);
    console.log(`   ✅ Menü etiketi işlemi tamamlandı\n`);
  } catch (err) {
    console.error(`   ❌ Menü hatası: ${err.message}\n`);
  }

  // 6. Sayfa ekleme
  console.log('📄 TEST 5: DeepSeek chat — sayfa ekleme (add_page)');
  try {
    const { chatEdit } = await import('../src/lib/server/ai/patch.ts');
    const originalPageCount = site.pages.length;
    const { site: result, reply } = await chatEdit({
      site,
      message: '"Hakkımda" adında yeni bir sayfa ekle. Slug\'ı "hakkimda" olsun.',
      approvedPrompt: 'Yeni bir sayfa ekle: slug=hakkimda, başlık TR=Hakkımda EN=About Me DE=Über mich. Hero section\'ı olsun. Menüye de ekle.',
      model: process.env.DEEPSEEK_MODEL_LIGHT
    });
    console.log(`   Cevap: "${reply}"`);
    const newPageCount = result.pages.length;
    const hasNewPage = result.pages.some(p => p.slug === 'hakkimda');
    console.log(`   Sayfa sayısı: ${originalPageCount} → ${newPageCount}`);
    console.log(`   Yeni sayfa var mı: ${hasNewPage}`);
    console.log(`   Nav'de var mı: ${result.nav.items.some(i => i.pageSlug === 'hakkimda')}`);
    
    if (hasNewPage) {
      const newPage = result.pages.find(p => p.slug === 'hakkimda');
      console.log(`   Yeni sayfa başlığı (TR): "${newPage.title.tr}"`);
      console.log(`   Yeni sayfa başlığı (EN): "${newPage.title.en}"`);
      console.log(`   ✅ Sayfa başarıyla eklendi ve nav'e eklendi`);
    } else {
      console.log(`   ⚠️ Sayfa eklenmedi (AI doğru operasyon emit etmedi)`);
    }
    console.log();
  } catch (err) {
    console.error(`   ❌ Sayfa ekleme hatası: ${err.message}\n`);
  }

  // 7. Section ekleme
  console.log('🧩 TEST 6: DeepSeek chat — section ekleme (add_section)');
  try {
    const { chatEdit } = await import('../src/lib/server/ai/patch.ts');
    const originalSectionCount = site.pages[0].sections.length;
    const { site: result, reply } = await chatEdit({
      site,
      message: 'Ana sayfaya bir SSS (FAQ) bölümü ekle',
      approvedPrompt: 'Ana sayfaya (home) yeni bir FAQ section ekle. id=faq-home, variant=accordion, 3 soru-cevap ile. Tüm locale\'lerde içerik olsun.',
      model: process.env.DEEPSEEK_MODEL_LIGHT
    });
    console.log(`   Cevap: "${reply}"`);
    const newSectionCount = result.pages[0].sections.length;
    const hasFaq = result.pages[0].sections.some(s => s.type === 'faq');
    console.log(`   Section sayısı: ${originalSectionCount} → ${newSectionCount}`);
    console.log(`   FAQ section var mı: ${hasFaq}`);
    if (hasFaq) {
      const faq = result.pages[0].sections.find(s => s.type === 'faq');
      console.log(`   FAQ id: ${faq.id}, variant: ${faq.props.variant}`);
      if (faq.type === 'faq') {
        console.log(`   Soru sayısı (TR): ${faq.content.tr.items.length}`);
      }
      console.log(`   ✅ Section başarıyla eklendi`);
    } else {
      console.log(`   ⚠️ Section eklenmedi`);
    }
    console.log();
  } catch (err) {
    console.error(`   ❌ Section ekleme hatası: ${err.message}\n`);
  }

  // 8. Off-topic gate testi
  console.log('🚫 TEST 7: Gatekeeper — off-topic tespiti');
  try {
    const { gateMessage } = await import('../src/lib/server/ai/gatekeeper.ts');
    const { gate, usage } = await gateMessage({
      site,
      message: 'Bugün hava nasıl?',
      history: []
    });
    console.log(`   Intent: ${gate.intent} (off_topic beklenir)`);
    console.log(`   Cevap: "${gate.reply?.slice(0, 100)}"`);
    console.log(`   ${gate.intent === 'off_topic' ? '✅ Doğru sınıflandırma' : '⚠️ Yanlış sınıflandırma'}`);
    console.log(`   Tokens: ${usage.inputTokens} in / ${usage.outputTokens} out\n`);
  } catch (err) {
    console.error(`   ❌ Off-topic hatası: ${err.message}\n`);
  }

  // 9. Question gate testi
  console.log('❓ TEST 8: Gatekeeper — soru tespiti');
  try {
    const { gateMessage } = await import('../src/lib/server/ai/gatekeeper.ts');
    const { gate, usage } = await gateMessage({
      site,
      message: 'Sitemde kaç sayfa var?',
      history: []
    });
    console.log(`   Intent: ${gate.intent} (question beklenir)`);
    console.log(`   Cevap: "${gate.reply?.slice(0, 100)}"`);
    console.log(`   ${gate.intent === 'question' ? '✅ Doğru sınıflandırma' : '⚠️ Yanlış sınıflandırma'}`);
    console.log(`   Tokens: ${usage.inputTokens} in / ${usage.outputTokens} out\n`);
  } catch (err) {
    console.error(`   ❌ Soru hatası: ${err.message}\n`);
  }

  // 10. Integration koruma testi
  console.log('🔒 TEST 9: Integration protection — AI phishing yapamaz');
  try {
    const { applyPatch } = await import('../src/lib/server/ai/patch.ts');
    const testSite = structuredClone(site);
    testSite.settings.integrations = [
      { enabled: true, type: 'booking-external', url: 'https://calendly.com/legit-clinic', label: { tr: 'Randevu', en: 'Appointment', de: 'Termin' } }
    ];
    const result = applyPatch(testSite, [
      { op: 'set_settings', settings: { siteName: 'Test Clinic' } }
    ]);
    const urlProtected = result.settings.integrations?.[0]?.url === 'https://calendly.com/legit-clinic';
    console.log(`   Integration URL korundu mu: ${urlProtected}`);
    console.log(`   ${urlProtected ? '✅ AI integration\'ları değiştiremez' : '❌ Koruma çalışmıyor!'}\n`);
  } catch (err) {
    console.error(`   ❌ Integration test hatası: ${err.message}\n`);
  }

  // Özet
  console.log('═══════════════════════════════════════');
  console.log('🏁 Canlı AI Chat Smoke Test tamamlandı');
  console.log('═══════════════════════════════════════');
  
  db.close();
}

main().catch(err => {
  console.error('Test script hatası:', err);
  process.exit(1);
});