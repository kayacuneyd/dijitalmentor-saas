# Release doğrulama

Yerel veya staging release kapısı:

```bash
bash scripts/verify-release.sh
```

Bu komut `check`, unit test, production build ve diff whitespace kontrolünü çalıştırır.
`VERIFY_RELEASE_SMOKE=1` ile browser smoke da eklenir.

Production deploy için mevcut atomic akış kullanılmalıdır:

```bash
npm run deploy:production
```

Deploy sonrası smoke başarısız olursa yeni release’in `current` symlink’i önceki release’e
döndürülmeli, ardından PM2 yeniden başlatılmalıdır. Deploy script’i son beş release’i korur.
