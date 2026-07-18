# SaasKaya Ürün Arayüzü Yeniden Tasarım Planı

## Özet

SaasKaya’nın tenant sitelerine dokunmadan; marketing, auth, onboarding, dashboard, editor, admin ve chat deneyimini Flowbite-Svelte tabanlı yeni bir ürün kabuğuyla yeniden kuracağız.

Flowbite görsel kimlik olmayacak. Bileşen davranışı, erişilebilirlik ve etkileşim altyapısı olarak kullanılacak; marka dili mevcut logo, Aleo + Inter tercihi ve SaasKaya’nın birlikte belirleyeceğimiz sesinden türetilecek.

Varsayılan kararlar:

- Ana ürün anı: `Describe → live site`
- Görsel ruh: “Arı atölyesi”
- İlk dikey dilim: onboarding + editor
- Tenant renderer: kapsam dışı
- Üretilen sitelerin Zod sözleşmesi, block registry’si ve render mantığı: değişmeyecek

## Uygulama yaklaşımı

- Önce logo merkezli marka/ürün arayüzü brief’i hazırlanacak: renk yaklaşımı, Aleo/Inter kullanımı, marka sesi, yoğunluk, sadelik, ikon dili ve layout prensipleri burada kararlaştırılacak.
- Hazır spacing, radius, shadow veya state token’ları varsayılan olarak dayatılmayacak. Bu kararlar marka brief’inden türetilecek.
- Flowbite-Svelte; Button, Input, Modal, Drawer, Dropdown, Sidebar, Tabs, Tooltip, Badge, Card ve form davranışlarında kullanılacak.
- `PanelShell`, `PanelSidebar`, `AppCanvasShell`, `PageShell`, `ChatBubble`, `SiteAssistantDock` ve editor kabuğu SaasKaya’ya özgü kompozit bileşenler olarak kalacak.
- DaisyUI önce platform UI’dan kademeli olarak çıkarılacak; tenant renderer’daki DaisyUI renk sözleşmesi bu çalışmada korunacak.
- Server action’ları, API endpoint’leri, auth davranışı, iframe/postMessage preview akışı ve autosave mantığı değiştirilmeyecek.

## Dikey dilim sırası

1. Marka brief’i ve Flowbite entegrasyon zemini
2. Ortak primitive bileşenler ve ikon yaklaşımı
3. Onboarding/chat akışı
4. Editor shell, chat balonu, sidebar ve preview frame
5. Dashboard ve site yönetimi
6. Account, support, messages ve paylaşım yüzeyleri
7. Admin paneli
8. Marketing, pricing, templates, login ve legal yüzeyleri
9. DaisyUI platform bağımlılıklarının temizlenmesi

Her dilim mevcut davranışları koruyarak çalışır halde doğrulanacak; toplu görsel değişiklik yapılmayacak.

## Arayüz sözleşmeleri

Yeni veya değişen temel arayüz sözleşmeleri:

- Platform UI için ortak `Button`, `Input`, `Field`, `Modal`, `Drawer`, `Dropdown`, `Sidebar`, `Tabs`, `Status`, `Card` bileşenleri
- Ortak layout sözleşmesi: uygulama kabuğu, panel başlığı, sidebar ve içerik canvas’ı
- Ortak chat sözleşmesi: açılır/kapanır dock, mesaj durumu, loading, hata, onay ve geri dönüş davranışları
- Platform branding sözleşmesi: mevcut logo resolver’ı, marka adı, Aleo display font ve Inter UI fontu
- Tenant `Site` schema’sı ve renderer API’si bu çalışmada değişmeyecek

## Test ve kabul kriterleri

- Onboarding → site üretimi → editor → preview → publish akışı işlevsel olarak aynı kalacak.
- Chat balonu açılır/kapanır davranışı, keyboard erişimi ve mobil drawer davranışı korunacak.
- Dashboard, editor ve admin ekranları mobil/tablet/desktop görünümlerinde doğrulanacak.
- Her ortak bileşen keyboard, focus, loading, error ve disabled durumlarıyla test edilecek.
- `npm run check`, test paketi ve production build her dikey dilim sonrasında çalıştırılacak.
- Route smoke testleri mevcut auth yönlendirmelerini ve server action sonuçlarını doğrulayacak.
- Görsel regression için kritik ekranların üç viewport snapshot’ları oluşturulacak.
- Tenant sitelerinin render çıktısı ve Zod doğrulama testleri değişiklikten etkilenmeyecek.

## Varsayımlar

- Aleo yalnızca ürün markasının display fontu; Inter yoğun UI ve gövde metni için kullanılacak.
- Logo, SaasKaya’nın görsel kimliğinin ana kaynağı olacak.
- “Arı atölyesi” nihai görsel karar değil, ilk tasarım hipotezi olarak kullanılacak ve marka brief’inde doğrulanacak.
- Flowbite-Svelte platform UI için seçilecek; tenant sitelerine doğrudan görsel sistem olarak yayılmayacak.
