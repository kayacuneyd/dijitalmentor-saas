# SaasKaya ürün arayüzü marka brief’i

## Durum

- Durum: onaylandı
- Kapsam: SaasKaya platform ürünü
- Kapsam dışı: tenant renderer, üretilen web siteleri, `Site` schema’sı ve block registry
- Kaynak: mevcut SaasKaya logosu, mevcut ürün yüzeyleri ve Flowbite-Svelte entegrasyon planı
- Onaylanan ifade: **İşini bilen küçük bir dijital atölye.**

## Marka fikri

SaasKaya, profesyonelin işini anlaşılır biçimde dijitale taşıyan sakin ve güvenilir bir dijital atölyedir. Ürün, kullanıcıyı AI gösterisiyle etkilemeye çalışmaz; kullanıcının işini dinler, ilk taslağı hazırlar ve kontrolü kullanıcıda bırakır.

Ürün hissi:

- sakin teknik zanaat
- güvenilirlik
- açıklık
- insan kontrolü
- küçük ama işini bilen bir ekip/atölye hissi

Kaçınılacak ürün hissi:

- AI sihirbazı
- growth machine
- startup dashboard klişesi
- oyuncak gibi productivity uygulaması
- parlak, gösterişli ve sürekli kutlama yapan SaaS

## Görsel yön

### Renk

- Logo siyah/beyaz kimliğin ana taşıyıcısıdır.
- Ürün zemini kağıt/fildişi karakterini korur.
- Metin ana rengi yoğun mürekkep siyahıdır.
- Yüzeyler beyaz ve kırık beyaz arasında ayrışır.
- Mevcut teal/yeşil operasyon rengi korunur; aksiyon, link ve olumlu durumlarda kontrollü vurgu olarak kullanılır.
- Teal, logonun önüne geçen bir marka rengi veya her yüzeye yayılan dekoratif renk olarak kullanılmaz.
- Yeni renkler ihtiyaç halinde bu mantıktan türetilir; rastgele renk eklenmez.

### Typography

- Display ve marka başlıkları: Aleo.
- UI, gövde metni ve yardımcı metinler: Inter.
- Teknik değerler, ID’ler ve kısa metadata: mevcut mono yazı tipi.
- Başlıklar roman kalır; italic başlık dili kullanılmaz.
- Display yazı tipi karakter taşır, UI yazı tipi okunabilirliği taşır.

### Yoğunluk ve ritim

- Dashboard ve editor: sıkı fakat boğucu olmayan ürün yoğunluğu.
- Marketing, public ve onboarding: daha nefesli, daha belirgin bölüm ritmi.
- Aynı yoğunluk bütün route’lara zorla uygulanmaz.
- Bilgi hiyerarşisi dekoratif kutu sayısından daha önemlidir.

### Geometri ve yüzey

- Orta-köşeli yüzeyler kullanılacaktır.
- Aşırı keskin köşelerden kaçınılır.
- Her öğe pill/kapsül yapılmaz.
- Button radius’ları kart radius’larından daha kontrollü tutulur.
- Border, yüzey sınırını belirlemede shadow’dan önce gelir.
- Shadow yalnızca katman ayrımı gerektiğinde kullanılır.
- Glassmorphism, yoğun gradient ve dekoratif blur kullanılmaz.

## Interaction dili

- Etkileşimler sakin, doğrudan ve açıklanabilirdir.
- Loading durumu işi yapan aksiyonun üzerinde görünür; ayrı bir dekoratif animasyon oluşturulmaz.
- Error mesajı neden ve sonraki adımı açıklar.
- Success durumu sessiz ve nettir; gereksiz kutlama/toast kullanılmaz.
- Disabled durumları düşük kontrastlı ama anlaşılırdır.
- Focus görünürlüğü erişilebilirlik gereğidir; görsel süs değildir.
- Icon-only kontroller yalnızca anlamı açık olduğunda kullanılır; gerektiğinde tooltip ve aria-label sağlanır.
- Animasyon transform/opacity ile sınırlı, kısa ve işlevseldir.

### İlk interaction state matrisi

| Primitive     | Default                    | Hover                      | Focus           | Active                 | Disabled         | Loading                 | Error                 | Success                   |
| ------------- | -------------------------- | -------------------------- | --------------- | ---------------------- | ---------------- | ----------------------- | --------------------- | ------------------------- |
| Button        | rolüne göre ink/card/shell | yüzey veya border değişimi | teal focus ring | 1px tactile press      | opacity + cursor | Flowbite spinner + busy | danger variant        | sessiz tamamlanma         |
| Input         | card yüzeyi + line         | line belirginleşmesi       | teal focus ring | native input davranışı | opacity + cursor | ilgili submit button’da | error border/message  | submit sonrası kısa mesaj |
| Badge         | nötr/status tonu           | statik                     | uygulanmaz      | uygulanmaz             | uygulanmaz       | uygulanmaz              | error tone            | success tone              |
| Modal/Drawer  | görünür overlay            | close/action hover         | focus trap      | action press           | action bazlı     | içerik aksiyonunda      | inline error          | inline success            |
| Dropdown/Tabs | aktif/pasif ayrımı         | yüzey vurgusu              | keyboard ring   | seçim anı              | disabled item    | uygulanmaz              | validation bağlamında | seçili state              |

State’ler her component’te aynı görsel dil ile uygulanır; yeni component kendi başına yeni state rengi icat etmez.

## Icon dili

- Çizgi ikonlar tercih edilir.
- Stroke dili tutarlı tutulur.
- Aynı bağlamda farklı icon family’leri karıştırılmaz.
- İkon, metnin yerine geçmek için değil metni desteklemek için kullanılır.
- Dış bağlantı, geri dönüş, menü, kapatma ve durum ikonları ortak adapter/helper üzerinden ele alınır.

## Marka sesi ve ürün copy’si

Copy şu davranışı izler:

- Sade ve somut konuş.
- Kullanıcıya ne olduğunu ve sıradaki adımı söyle.
- AI yeteneğini abartma.
- Gerçek olmayan metrik, sosyal kanıt veya garanti üretme.
- Kullanıcı kontrolünü görünür kıl.
- Teknik ayrıntıyı gerektiği kadar göster.

Tercih edilen örnekler:

- “İşini anlat, ilk taslağı birlikte netleştirelim.”
- “Taslak hazır; son sözü sen söylersin.”
- “Bu değişiklik henüz yayınlanmadı.”
- “Yayınlamadan önce şu iki noktayı tamamla.”

Kaçınılacak örnekler:

- “AI ile saniyeler içinde inanılmaz sonuçlar.”
- “İşini 10x büyüt.”
- “Sihirli şekilde hazırlandı.”
- Kullanıcıdan saklanan belirsiz hata mesajları.

## Token türetme ilkeleri

Bu brief, nihai sayısal token tablosu değildir. Spacing, radius, elevation, focus ve state token’ları sonraki uygulama adımında mevcut kod yüzeyleri ve gerçek ekran yoğunluğu üzerinden türetilecektir.

Token üretirken:

- Aynı rol için tek bir token kullanılır.
- Görsel değer component içinde rastgele icat edilmez.
- Marka brief’inde tanımlı rol yoksa önce rol tanımlanır, sonra değer verilir.
- Flowbite default görsel kimlik olarak kabul edilmez.
- Flowbite davranış, erişilebilirlik ve kompozisyon altyapısıdır.
- Tenant renderer tokenları bu belgeyle değiştirilmez.

### İlk türetilen ürün rolleri

Uygulama başlangıçta brief’teki geometri ve vurgu kararlarını şu rollere bağlar:

- `--sk-radius-sm`: kompakt controls, field ve küçük disclosure yüzeyleri
- `--sk-radius`: ana card ve panel yüzeyleri
- `--sk-radius-lg`: yalnızca geniş/katmanlı yüzeyler
- `--sk-shadow-lg`: yalnızca overlay/dropdown/drawer ayrımı gereken durumlar
- `--sk-accent`: mevcut teal operasyon vurgusu
- `--sk-focus`: keyboard focus ring için mevcut teal vurgu
- `--sk-error`: mevcut sıcak hata rengi

Bu roller component içinde yeni ham değer üretmek yerine ortak kaynak olarak kullanılmalıdır.

## Uygulama sırası

1. Bu brief’i kaynak karar olarak koru.
2. Mevcut `--sk-*` değerlerini rol bazında envanterle.
3. Çakışan veya isimsiz değerleri yeni rastgele değerler eklemeden grupla.
4. Button, badge, input, field, modal, drawer, dropdown, tabs, tooltip ve card adapter’larını bu brief’e göre hizala.
5. Kritik ekranlarda responsive, focus, loading, error ve success doğrulaması yap.
6. Platform DaisyUI bağımlılığını tenant sözleşmesine zarar vermeden kaldırılabilirlik açısından yeniden değerlendir.

## Hallmark tasarım kontrolü

- Arayüz, generic SaaS şablonu gibi görünmemeli.
- Aynı makro ritim bütün route’lara kopyalanmamalı.
- Dekorasyon bilgi hiyerarşisinin önüne geçmemeli.
- Marka dili yalnızca renk değişimiyle değil, spacing, copy, surface ve interaction kararlarıyla görünür olmalı.
- Her yeni ekran bu brief’e referans vermeli; yeni bir görsel yön ancak açık kararla eklenmeli.
