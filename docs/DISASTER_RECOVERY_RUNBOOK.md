# Saaskaya disaster recovery runbook

Bu runbook Faz 7 için operasyonel minimumdur. Üretim veritabanı `DATABASE_URL_PRODUCTION` ile
ayrıdır; geliştirme veritabanı üretim restore hedefi olarak kullanılmaz.

## Önce güvenliği koru

1. Olayı ve UTC zamanını kaydet; ödeme/domain işlemlerini geçici olarak durdurmak gerekiyorsa
   `/admin/settings` üzerinden ilgili provider ayarını kapat.
2. Uygulama ve backup erişimini yalnızca operatör hesabıyla sınırla. Ham `.env`, token, IP veya
   ziyaretçi içeriğini ticket/log içine kopyalama.
3. `GET /api/health` ve disk kullanımını kontrol et. Sorun sürüyorsa PM2 release’i durdur ve mevcut
   snapshot’ı koru.

## DB bozulması veya VPS kaybı

1. En yeni `db-*.sqlite.gz` snapshot’ını ve ona ait `env-*.gz` dosyasını seç; 14 günlük retention
   içindeki önceki snapshot’la da karşılaştır.
2. Yeni hostta boş bir SQLite dosyasına aç ve `PRAGMA integrity_check;` çalıştır.
3. Uygulamayı durdurulmuş halde restore edilen dosyaya bağla; migration runner eksik sürümleri
   idempotent biçimde uygular.
4. `npm run check`, `npm test`, `npm run build`, ardından `/api/health` ve signed-out route smoke
   çalıştır. Auth, publish, export ve tenant host izolasyonunu kontrol et.
5. DNS/proxy değişikliğini ancak bu kontroller geçtikten sonra yap. Eski snapshot’ı silme.

## R2 erişim kesintisi

Media upload 503 döner ve site JSON’ındaki mevcut URL’ler değiştirilmez. R2 erişimi düzeldikten sonra
tek bir test upload’ı, yetkisiz site erişimi ve publish smoke çalıştır. Başarısız yükleme yarım media
row bırakmamalıdır.

## Provider kesintisi

Creem webhook imza doğrulamasını geçmeyen event’i reddeder; aynı event tekrar gelse de fulfillment
idempotent state machine tarafından ikinci abonelik/domain kaydı oluşturulmaz. Domain reservation
`failed` durumundaysa yalnızca aynı reservation id üzerinden retry edilir.

## Kanıt kaydı

Her tatbikat için tarih, snapshot adı, restore sonucu, `integrity_check`, test komutları ve kullanıcıya
etkisini `docs/PROGRESS.md` içine yaz. Gerçek domain kaydı veya gerçek ödeme olmadan “live verified”
ifadesi kullanma.
