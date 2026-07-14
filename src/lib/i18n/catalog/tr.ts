import type { CatalogShape } from './en';

export const tr = {
	common: {
		save: 'Kaydet',
		cancel: 'Vazgeç',
		delete: 'Sil',
		edit: 'Düzenle',
		back: 'Geri',
		loading: 'Yükleniyor…',
		error: 'Bir şeyler ters gitti.'
	},
	dashboard: {
		title: 'Sitelerin',
		nav: {
			newSite: 'Yeni site',
			account: 'Hesap',
			admin: 'Admin',
			signOut: 'Çıkış yap'
		},
		plan: {
			label: 'Plan',
			name: 'Pro site bazlıdır',
			priceSuffix: '{price}€/ay / yayınlanan site',
			description:
				'Her web sitesi kendi Pro durumuna sahiptir. Kendi domaini ve tam export sadece ilgili Pro site için açılır.',
			billingNote: 'Ödeme ilgili site kartından başlatılır.'
		},
		alerts: {
			published: '{name} yayında — tebrikler!',
			unpublished: '{name} yayından kaldırıldı.',
			domainConnectedSuffix: 'bağlandı.',
			domainCheckedSuffix: 'kontrol edildi.',
			domainDetached: 'Domain siteden kaldırıldı.',
			transferReported: 'Havale bildirimin alındı — operatör onayladıktan sonra domainin kurulur.',
			reservationCancelled: 'Rezervasyon iptal edildi.',
			deleted: '{name} kalıcı olarak silindi.'
		},
		empty: {
			message: 'Henüz siten yok. Kendini birkaç cümleyle anlat, ilk siteni AI hazırlasın.',
			cta: 'İlk siteni oluştur'
		},
		card: {
			fallbackName: 'Siten',
			editorAria: '{name} — düzenleyicide aç',
			lastUpdated: 'Son güncelleme: {date}',
			statusPublished: 'Yayında',
			statusDraft: 'Taslak',
			planActive: 'Pro site',
			planGrace: 'Pro ek süre',
			planFree: 'Free site'
		},
		identity: {
			siteName: 'Site adı',
			subdomain: 'Subdomain',
			contactEmail: 'İletişim e-postası',
			save: 'Kaydet'
		},
		meta: {
			publicUrl: 'Public URL: {handle}.saaskaya.com',
			languages: 'Diller: {list}',
			defaultLocale: 'Varsayılan: {locale}'
		},
		billing: {
			proActiveLine: 'Bu site Pro aktif.',
			proGraceLine: 'Bu site Pro ek sürede.',
			proFreeLine: 'Bu site Free.',
			priceLine:
				"Pro: {monthly}€/ay veya {yearly}€/yıl. Yıllık Pro'ya standart .com alan adı, SSL ve teknik kurulum dahildir.",
			monthlyButton: 'Aylık Pro + domain seç',
			yearlyButton: 'Yıllık Pro (.com dahil)',
			comingSoon: 'Pro ödemesi hazır olduğunda burada açılacak.'
		},
		actionsRow: {
			edit: 'Düzenle',
			preview: 'Önizle',
			openLive: 'Canlı siteyi aç',
			unpublish: 'Yayından kaldır',
			prepareForLaunch: 'Yayına hazırla',
			moreActionsAria: 'Diğer işlemler',
			inbox: 'Gelen mesajlar'
		},
		overflow: {
			publishNowTitle: 'Kaydedilmiş son taslak yeni canlı sürüm olarak yayınlanır.',
			publishNowLabel: 'Son değişiklikleri yayına al',
			fullExport: 'Tam site export',
			fullExportProOnly: 'Tam export Pro site ile',
			deleteSite: 'Siteyi sil'
		},
		deleteConfirm: {
			title: 'Bu site kalıcı olarak silinecek',
			body: 'Site yayından kalkar, bağlı domain ayrılır ve tüm sürümler/medya dosyaları silinir. Bu işlem geri alınamaz. Tam export sadece Pro site veya operatör desteğiyle alınabilir. Onaylamak için site adını ({name}) aşağıya yaz.',
			confirmButton: 'Kalıcı olarak sil',
			cancel: 'Vazgeç'
		},
		domain: {
			label: 'Domain:',
			active: 'Aktif',
			remove: 'Kaldır',
			forwardTo: '{local}@{domain} → {dest}',
			forwardPendingVerification: ' · e-posta doğrulaması bekleniyor'
		},
		reservation: {
			label: 'Domain rezervasyonu:',
			statusPending: 'ödeme bekleniyor',
			statusManualReview: 'manuel inceleme',
			statusPaid: 'alan adı hazırlanıyor',
			statusRegistering: 'alan adı hazırlanıyor',
			statusFailed: 'kurulum inceleniyor',
			eligibleTitle: 'Domain uygun. Önce bu siteyi Pro yap.',
			eligibleBody: 'Domain tescili ödeme ve iç uygunluk onayından sonra yürütülür.',
			bankLabel: 'Banka havalesi ile öde:',
			ibanPending: 'IBAN operatör tarafından eklenecek.',
			descriptionLabel: 'Açıklama:',
			reportTransfer: '✓ Havale yaptım, bildir',
			cancel: 'İptal et',
			cardContinue: 'Kartla devam et',
			failedNote:
				'Kurulum sırasında bir sorun oldu; operatör inceliyor. Bir işlem yapman gerekmiyor.',
			manualReviewNote:
				'Bu domain manuel incelemede. Uygunluk netleşince seninle iletişime geçeceğiz.',
			preparingDomain: 'Alan adı hazırlanıyor.',
			preparingSsl: 'SSL hazırlanıyor.',
			emailPreparing: 'E-posta yönlendirme hazırlanıyor.',
			emailForwardPendingVerification: ' · e-posta yönlendirme doğrulaması bekleniyor'
		},
		attach: {
			placeholder: 'kendisiteniz.com',
			domainPlaceholder: 'istedigindomain.com',
			button: 'Domainimi bağla',
			note: 'Kendi domainin varsa yukarıdan bağla (domainin bize yönlenmiş olmalı).',
			purchaseClosed: 'Yeni domain satın alma kapalı beta sonrasında açılacak.',
			creditReadyTitle: 'Yıllık Pro alan adı hakkın hazır.',
			creditReadyBody:
				'Bir standart .com alan adı, SSL güvenliği, DNS kurulumu ve hosting bağlantısı pakete dahil.',
			includedButton: 'Dahil .com alan adımı seç',
			nextStepTitle: 'Sıradaki adım: .com alan adını seç.',
			nextStepBody:
				"Aylık Pro siten yayında kalır; kendi .com adresin için yıllık alan adı hizmeti 15€'dur. SSL, DNS kurulumu ve siteye bağlama tarafımızdan yönetilir.",
			yearlyButton: '.com alan adımı seç',
			checkAvailability: 'Domain uygunluğunu kontrol et',
			bankOption: '🏦 Banka havalesi',
			cardOption: '💳 Kredi kartı'
		},
		messages: {
			title: 'Mesajlar',
			description: '{name} için iletişim formu mesajları',
			empty: 'Henüz mesaj yok.'
		},
		actions: {
			firstPublishOnlyFromEditor:
				'İlk yayın yalnızca editörden yapılır. Böylece son taslak kaydedilip aynı gövdeyle yayınlanır.',
			completeIdentityFirst: 'Yayına almadan önce site adı ve public subdomain adımını tamamla.',
			siteNotFound: 'Site bulunamadı.',
			qualityBlockers: 'Yayın için kalite engelleri var.',
			siteBelongsToAnotherAccount: 'Bu site başka bir hesaba ait.',
			domainNeedsProSubscription: 'Özel domain için bu sitede aktif bir Pro abonelik gerekiyor.',
			identitySaved: '{name} için subdomain kaydedildi: {handle}.saaskaya.com',
			domainPurchaseClosed: 'Yeni domain satın alma kapalı beta süresince kullanılamıyor.',
			invalidDomain: 'Bu geçerli bir domain adresine benzemiyor — örn. kendisiteniz.com',
			domainUnavailable: 'Bu domain uygun değil. Başka bir ad dene.',
			domainAlreadyReserved: 'Bu domain zaten rezerve edilmiş.',
			domainReserveFailed: 'Domain rezerve edilemedi — adı kontrol edip tekrar dene.',
			domainCreditFailed: 'Domain hakkı kullanılamadı. Sayfayı yenileyip tekrar dene.',
			manualReviewMessage: 'Bu domain manuel inceleme gerektiriyor. Sizinle iletişime geçeceğiz.',
			domainCreditUsedMessage: 'Domain hakkın kullanıldı. Alan adın kurulum kuyruğuna alındı.',
			domainAvailableMessage: 'Bu domain uygun. Bu site için Pro adımına devam edebilirsin.',
			reservationNotFound: 'Rezervasyon bulunamadı.',
			deleteNameMismatch: 'Site adı eşleşmedi — silme iptal edildi.',
			deleteReservationInProgress:
				'Bu sitede devam eden bir domain rezervasyonu/kaydı var — önce onu çöz.',
			dnsNotPointed:
				'Domainin henüz bize yönlenmemiş. Domain sağlayıcının panelinden A kaydını sunucu IP adresimize yönlendirip tekrar dene.',
			domainAlreadyAttached: 'Bu domain zaten başka bir siteye bağlı.',
			attachSslReady:
				'Güvenlik sertifikası hazırlandı — siten birkaç dakika içinde bu adreste açılır.',
			attachPendingReview:
				'Domain kaydedildi ancak kurulum tamamlanamadı — ekibimiz durumu inceliyor, bir işlem yapman gerekmiyor.',
			attachQueued: 'Domain kaydedildi — kurulum ekibimiz tarafından tamamlanacak.',
			registerManualReview:
				'Domain kontrolü sırasında manuel inceleme gerektiren bir durum oluştu. Sizinle iletişime geçeceğiz.',
			registerSslReady:
				'Domain tescil edildi ve siten bağlandı — birkaç dakika içinde bu adreste açılır.',
			registerPendingReview:
				'Domain tescil edildi ancak kurulum tamamlanamadı — ekibimiz durumu inceliyor, bir işlem yapman gerekmiyor.',
			registerQueued: 'Domain tescil edildi — kurulum ekibimiz tarafından tamamlanacak.'
		}
	}
} satisfies CatalogShape;
