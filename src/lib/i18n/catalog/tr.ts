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
	email: {
		magicLink: {
			subject: 'saaskaya giriş bağlantın',
			body: "saaskaya'ya giriş yap:\n\n{link}\n\nBağlantı 15 dakika geçerlidir ve bir kez kullanılabilir."
		},
		betaInvitation: {
			subject: 'saaskaya betasına davet edildin',
			body: 'saaskaya kapalı betasına davet edildin.\n\nDavetini aç:\n{loginUrl}\n\nGüvenli, tek kullanımlık giriş bağlantını istemek için bu e-posta adresini kullan.'
		},
		contactNotification: {
			subject: '{siteName} üzerinden yeni mesaj',
			body: 'Gönderen: {name} <{email}>\n\n{message}\n\n— {siteName} iletişim formundan gönderildi (saaskaya)'
		}
	},
	account: {
		supportLink: 'Destek',
		signOut: 'Çıkış yap',
		stats: {
			sites: 'Siteler',
			published: 'Yayınlanan',
			messages: 'Mesajlar'
		},
		plan: {
			title: 'Plan',
			description:
				'Özel domain için Pro gerekir. Yayınlanan subdomainler Free planda da kullanılabilir.',
			pro: 'Pro',
			proGrace: 'Pro · ek süre',
			free: 'Free',
			graceUntil: 'Ücretli özellikler {date} tarihine kadar aktif kalır.',
			upgrade: "Pro'ya geç",
			manageSites: 'Siteleri yönet'
		},
		usage: {
			title: 'Bu ay AI kullanımı',
			description:
				'Editördeki doğrudan metin/renk düzenlemeleri her zaman ücretsizdir — bu limitler yalnızca AI ile üretilen değişiklikler içindir.',
			edits: 'Düzenlemeler',
			generations: 'Site üretimleri'
		},
		profile: {
			title: 'Profil',
			description: 'Hesabın magic-link ile giriş kullanıyor. Şifre saklanmıyor.',
			email: 'E-posta',
			role: 'Rol',
			roleAdmin: 'Süper admin',
			roleCustomer: 'Müşteri'
		},
		exports: {
			title: "Site export'ları",
			description: 'Tam site export Pro siteler ve operatör destek durumları için kullanılabilir.',
			empty: 'Henüz export edilecek site yok.',
			export: 'Export',
			proRequired: 'Pro site gerekli'
		},
		deletion: {
			title: 'Silme talepleri',
			description:
				'Hesap silme şu an operatör tarafından yürütülür. Hesabını, sitelerini, yayınlanan sürümleri ve mesajları veritabanından kaldırır; yedekler saklama politikasına göre zaman içinde silinir.',
			request: 'Silme talep et'
		},
		support: {
			title: 'Destek',
			description: 'Bize mesaj gönder — burada gerçek bir kişi yanıtlar.',
			newRequest: 'Yeni talep',
			categoryLabel: 'Kategori',
			categoryGeneral: 'Genel',
			categoryBilling: 'Faturalama',
			categoryTechnical: 'Teknik',
			categoryHumanReview: 'İnsan incelemesi (Premium)',
			subjectLabel: 'Konu',
			subjectPlaceholder: 'Bu ne hakkında?',
			messageLabel: 'Mesaj',
			messagePlaceholder: 'Ne olduğunu anlat.',
			send: 'Gönder',
			ticketCount: '{count} talep',
			empty: 'Henüz talep yok.',
			updated: '{date} güncellendi',
			statusOpen: 'açık',
			statusPending: 'beklemede',
			statusResolved: 'çözüldü',
			statusClosed: 'kapalı',
			tooManyTickets: 'Çok fazla talep açtın — yeni bir tane açmadan önce biraz bekle.',
			subjectBodyRequired: 'Konu ve mesaj alanlarının ikisi de gerekli.',
			detail: {
				openedOn: '{date} açıldı',
				you: 'Sen',
				team: 'saaskaya destek',
				replyPlaceholder: 'Bir yanıt yaz…',
				reply: 'Yanıtla',
				closedNotice: 'Bu talep kapatıldı.',
				tooManyReplies: 'Çok fazla yanıt gönderdin — yeni bir tane göndermeden önce biraz bekle.',
				emptyMessage: 'Mesaj boş olamaz.',
				unknownTicket: 'Talep bulunamadı.'
			}
		}
	},
	editor: {
		shell: {
			title: 'Editör',
			workbench: 'Canlı önizleme çalışma alanı',
			preview: 'Canlı önizleme',
			assistant: 'Asistan',
			fineTune: 'İnce ayar',
			pages: 'Sayfalar',
			theme: 'Tema',
			languages: 'Diller',
			settings: 'Site ayarları',
			moreTools: 'Diğer araçlar',
			closePanel: 'Editör panelini kapat',
			openPanel: 'Editör panelini aç',
			dashboard: 'Panel',
			editLocale: 'Düzenleme dili',
			publish: 'Siteyi yayınla',
			republish: 'Canlı siteyi güncelle',
			resolvePublish: 'Yayın engelini çöz',
			saveNow: 'Şimdi kaydet',
			savedPreview: 'Kayıtlı önizlemeyi aç',
			publishedVersion: 'Canlı v{version}',
			notPublished: 'Henüz yayında değil',
			savedDraft: 'Taslak kaydedildi',
			savingDraft: 'Taslak kaydediliyor',
			unsavedDraft: 'Kaydedilmemiş değişiklikler',
			saveError: 'Kayıt başarısız',
			checklist: 'Kontrol listesi',
			details: 'Detay',
			hide: 'Gizle',
			open: 'Aç',
			publishReady: 'Yayına hazır',
			publishBlocked: 'Yayın engelli',
			blockerCount: '{count} engel',
			warningCount: '{count} uyarı',
			noBlockers: 'Kritik yayın engeli yok',
			qualityHelp: 'Detaylar için aç. Yalnızca kritik engeller yayını durdurur.',
			mobile: 'Mobil · 375 px',
			tablet: 'Tablet · 768 px',
			desktop: 'Masaüstü · esnek',
			previewTitle: 'Canlı site önizlemesi'
		},
		blocks: {
			hero: 'Hero',
			about: 'Hakkında',
			services: 'Hizmetler',
			gallery: 'Galeri',
			contact: 'İletişim',
			cta: 'CTA',
			faq: 'SSS',
			testimonials: 'Yorumlar',
			pricing: 'Paketler',
			process: 'Süreç',
			booking: 'Randevu',
			credentials: 'Yetkinlikler',
			team: 'Ekip',
			footer: 'Footer',
			stats: 'İstatistikler',
			clients: 'Referans logoları',
			video: 'Video',
			collection: 'Koleksiyon'
		},
		settings: {
			siteNameLabel: 'Site adı',
			publicSubdomainLabel: 'Public subdomain',
			publicSubdomainHelp: 'İlk yayından önce site id yerine okunabilir bir adres seç.',
			publicSubdomainRenameNotice:
				'Yayınlandıktan sonra bu adresi bir kez değiştirebilirsin. Eski adresin alias olarak çalışmaya devam eder.',
			publicSubdomainRenameUsed: 'Yayın sonrası tek seferlik subdomain değişikliği kullanıldı.',
			contactEmailLabel: 'İletişim e-postası',
			saveIdentity: 'Yayın bilgilerini kaydet',
			flushFailed: 'Önce son taslak kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.',
			identitySaveFailed: 'Yayın adresi kaydedilemedi.',
			identitySaved: 'Yayın adresi kaydedildi.',
			identitySaveNetworkError: 'Yayın adresi kaydedilemedi. Bağlantıyı kontrol edip tekrar dene.',
			poweredByBadgeLabel: '"Powered by saaskaya" rozeti',
			domainLabel: 'Domain',
			domainNone: 'Henüz bağlı bir domain yok.',
			integrationsLabel: 'Entegrasyonlar',
			integrationsHelp:
				'Bu bağlantılar sitende ilgili bloklarda görünür. Sadece sen değiştirebilirsin — AI bu alanlara dokunamaz.',
			phoneLabel: 'Telefon (E.164, örn. {example})',
			phoneExample: '+905551234567',
			linkLabel: 'Link',
			buttonLabelLabel: 'Buton etiketi (varsayılan: {default})',
			aiMemoryLabel: 'AI Memory',
			aiMemoryHelp:
				'AI her sohbet mesajından önce bu notları okur. Yaptığın her değişiklik sonrası buraya kısa bir not düşülür — böylece AI bir sonraki oturumda önceki kararlarını hatırlar. 10 satırdan sonra otomatik özetlenir.',
			aiMemoryPlaceholder:
				'Henüz hafıza notu yok. AI ile ilk değişikliği yaptığında buraya otomatik not düşülecek.',
			aiMemorySave: 'Kaydet',
			aiMemorySaved: 'Memory saved.',
			aiMemorySaveFailed: 'Kaydedilemedi.',
			aiMemoryNetworkError: 'Bağlantı hatası.'
		},
		pages: {
			title: 'Sayfalar',
			sectionsBadge: '{count} bölüm',
			inMenu: 'Menüde',
			notInMenu: 'Menü dışı',
			hasContact: 'İletişim var',
			deleteAria: '"{name}" sayfasını sil',
			deleteTitle: 'Sayfayı sil',
			confirmDeleteQuestion: '"{name}" sayfasını sil?',
			confirmDeleteHomeWarning:
				'Bu ana sayfa — silersen listedeki bir sonraki sayfa ana sayfa olur.',
			confirmYes: 'Evet, sil',
			confirmCancel: 'Vazgeç',
			addNew: '+ Yeni sayfa',
			slugLabel: 'Slug',
			titleLabel: 'Başlık ({locale})',
			addButton: 'Sayfa ekle',
			addHelp: 'Yeni sayfalar bir hero bölümüyle başlar ve menüye eklenir.',
			addFailed: 'Sayfa eklenemedi.'
		},
		pageOps: {
			slugInvalid: 'Slug kebab-case olmalı (a-z, 0-9, tire).',
			slugTaken: '"{slug}" slug\'lı bir sayfa zaten var.',
			pageLimitReached: 'Sayfa limitine ulaşıldı ({max}).',
			titleRequiredAllLocales: 'Her dil için bir başlık gerekli.',
			atLeastOnePage: 'En az bir sayfa kalmalı.',
			pageNotFound: 'Sayfa bulunamadı: "{slug}".'
		},
		chat: {
			assistantLabel: 'Assistant',
			contextLabel: '{page} üzerinde çalışıyorsun',
			greeting:
				'Merhaba! Siten hakkında konuşalım — ne değiştirmek istersin? Renk, metin, bölümler, sayfalar… anlat yeter.',
			promptNotes: 'Hazır talimatlar',
			promptNotesHelp: 'Siten için tekrar kullanılabilir fikirler',
			promptNotesOpen: 'Aç',
			promptNotesHide: 'Gizle',
			promptSavePlaceholder: 'Kendi talimatını kaydet…',
			promptSave: 'Kaydet',
			promptCustomTitle: 'Talimatım',
			promptClarityTitle: 'Daha net metin',
			promptClarityText:
				'Sayfa metnini daha açık, sıcak ve kolay taranabilir olacak şekilde yeniden yaz.',
			promptSpacingTitle: 'Daha ferah görünüm',
			promptSpacingText:
				'Ana bölümlere daha fazla nefes alanı ver ve sayfayı daha sakin hissettir.',
			promptTrustTitle: 'Güven oluştur',
			promptTrustText:
				'Yeni ziyaretçiler için iddia uydurmadan sayfanın daha güvenilir hissettirmesini sağla.',
			promptMobileTitle: 'Mobil düzen',
			promptMobileText:
				'Mobil okuma akışını iyileştir ve önemli eylemleri kolay bulunur hale getir.',
			riskLow: 'Küçük bir metin değişikliği.',
			riskMedium: 'Bu değişiklik sitenin görünümünü değiştirecek.',
			riskHigh: 'Bu büyük bir değişiklik — uygulandıktan sonra preview’da mutlaka kontrol et.',
			forceSendPrompt: 'Sitenle ilgili olduğunu düşünüyorsan yine de gönder',
			undo: 'Geri Al',
			undoApplied: 'Değişiklik geri alındı.',
			understoodLabel: 'Anladığım kadarıyla:',
			previewNote:
				'Değişiklik taslağına uygulanır — yayınlamadan önce preview’da kontrol edebilirsin.',
			apply: 'Uygula',
			cancelProposal: 'İptal',
			cancelledNotice: 'İptal edildi — hiçbir şey değişmedi.',
			inputPlaceholder: 'ör. Fiyatlandırma için bir SSS bölümü ekle…',
			send: 'Gönder',
			freeEditsNote:
				'Sorular ve konu dışı mesajlar bütçeni harcamaz; yalnızca uygulanan düzenlemeler aylık AI düzenleme hakkından düşer. Metin/renk düzenlemeleri Content ve Theme sekmelerinde her zaman ücretsizdir.',
			genericError: 'Bir şeyler ters gitti.',
			networkError: 'Ağ hatası — lütfen tekrar dene.',
			viewPreviewHint: 'Değişikliği görmek için üstteki "Önizleme" sekmesine geç.',
			changeSummaryPrefix: 'Değişiklik özeti:',
			pagesAdded: '{count} sayfa eklendi: {names}',
			pagesRemoved: '{count} sayfa kaldırıldı.',
			titlesUpdated: '{count} sayfa başlığı güncellendi.',
			navUpdated: 'Menü güncellendi.',
			themeUpdated: 'Tema güncellendi.',
			pagesReordered: 'Sayfa sıralaması değiştirildi.',
			sectionStyleUpdated: 'Bölüm stili güncellendi.',
			sectionsAdded: '{count} bölüm eklendi.',
			sectionsRemoved: '{count} bölüm kaldırıldı.',
			sectionsMoved: '{count} bölüm taşındı.'
		},
		theme: {
			nichePreset: 'Niş şablonu',
			brandColors: 'Marka renkleri',
			fonts: 'Yazı tipleri',
			cornerRadius: 'Köşe yuvarlaklığı'
		},
		imageUpload: {
			uploading: 'Yükleniyor…',
			replaceImage: 'Görseli değiştir',
			uploadImage: 'Görsel yükle',
			uploadFailed: 'Yükleme başarısız.',
			urlAria: '{label} URL'
		},
		languages: {
			editingLocaleLegend: 'Düzenlenen dil',
			editingLocaleHelp: 'Content sekmesi ve önizleme bu dili takip eder.',
			defaultLocaleLabel: 'Varsayılan dil',
			enabledLocalesLabel: 'Etkin diller',
			enabledLocalesHelp:
				'Tüm siteler şu an TR/EN/DE içerikle yayına giriyor; site bazlı dil açma/kapama yol haritasında.'
		},
		content: {
			pageLabel: 'Sayfa',
			editingNote:
				'{locale} içeriği düzenleniyor — dili araç çubuğundan değiştir. Değişiklikler doğrudan taslağa yazılır (AI kullanılmaz).',
			sectionImageLabel: 'bölüm görseli'
		}
	},
	legal: {
		aiDisclaimer: {
			title: 'AI çevirisi taslağı',
			body: 'Bu sayfa Türkçe orijinalinden AI tarafından çevrilmiştir ve bir avukat tarafından incelenmemiştir. Türkçe sürüm esas metindir.'
		}
	},
	admin: {
		nav: {
			overview: 'Genel bakış',
			gtm: 'GTM',
			customers: 'Müşteriler',
			inbox: 'Gelen kutusu',
			blog: 'Blog',
			copy: 'Metinler',
			messages: 'Mesajlar',
			share: 'Paylaşım',
			support: 'Destek',
			invites: 'Beta davetleri',
			settings: 'Ayarlar',
			backToApp: 'Uygulamaya dön'
		},
		chrome: { console: 'Yönetim konsolu', ariaLabel: 'Yönetim', eyebrow: 'Yönetim' },
		list: {
			customersTitle: 'Müşteriler',
			customersDescription: 'Her hesap, planı ve bu ayki AI kullanımı.',
			customerCount: '{count} müşteri',
			noCustomers: 'Henüz müşteri yok.',
			proSites: '{count} Pro site',
			view: 'Görüntüle',
			inboxTitle: 'Gelen kutusu',
			inboxDescription: 'İletişim formu ve mesaj balonu talepleri; en yeni etkinlik önce.',
			inquiryCount: '{count} talep',
			noInquiries: 'Henüz herkese açık talep yok.',
			supportTitle: 'Destek',
			supportDescription: 'Tüm müşteri talepleri; en yeni etkinlik önce.',
			ticketCount: '{count} destek talebi',
			noTickets: 'Henüz destek talebi yok.',
			open: 'Aç',
			updated: 'güncellendi {date}',
			new: 'yeni'
		},
		invites: {
			title: 'Beta davetleri',
			description: 'Müşterileri e-postayla davet edin ve kapalı beta erişimini yönetin.',
			access: 'Kapalı beta erişimi',
			enabled: 'Yalnızca aktif davetliler giriş yapabilir.',
			disabled: 'Giriş şu anda herkese açıktır.',
			enable: 'Kapalı betayı aç',
			disable: 'Kapalı betayı kapat',
			email: 'E-posta',
			profession: 'Meslek',
			language: 'Dil',
			send: 'Davet gönder',
			empty: 'Henüz davet yok.',
			reactivate: 'Yeniden etkinleştir',
			revoke: 'İptal et',
			validEmail: 'Geçerli bir e-posta gerekli.',
			missingEmail: 'E-posta eksik.',
			deliveryFailed: 'Davet kaydedildi ancak e-posta gönderimi başarısız: {error}'
		},
		blog: {
			title: 'Blog',
			description:
				'Çok dilli platform yazılarını, SEO özetlerini, kapak görsellerini ve yayın durumunu yönetin.',
			newPost: 'Yeni yazı',
			importJson: 'JSON içe aktar',
			importTitle: 'Çok dilli JSON içe aktar',
			importHelp:
				'EN/TR/DE çevirileri eksiksiz olan tek bir yapılandırılmış JSON dosyası yükleyin. Bir dil eksikse yayınlanmış içe aktarımlar engellenir.',
			jsonFile: 'JSON dosyası',
			updateExisting: 'Slug eşleşirse mevcut yazıyı güncelle',
			posts: '{count} yazı',
			publicBlog: 'Herkese açık blogu görüntüle',
			empty: 'Henüz yazı yok.',
			edit: 'Düzenle',
			open: 'Aç',
			back: 'Bloga dön',
			openPublic: 'Herkese açık sayfayı aç',
			saved: 'Blog yazısı kaydedildi.',
			editDescription: 'Herkese açık blog yazısını Türkçe, İngilizce ve Almanca düzenleyin.',
			slug: 'Slug',
			status: 'Durum',
			publishDate: 'Yayın tarihi',
			coverUrl: 'Kapak / SEO görsel URL’si',
			coverAlt: 'Kapak alt metni',
			readingMinutes: 'Okuma süresi',
			author: 'Yazar',
			fieldTitle: 'Başlık',
			category: 'Kategori',
			summary: 'Özet',
			seoTitle: 'SEO başlığı',
			seoDescription: 'SEO açıklaması',
			body: 'Gövde',
			writeArticle: '{locale} yazısını yazın...',
			save: 'Blog yazısını kaydet',
			chooseFile: 'İçe aktarmak için bir JSON dosyası seçin.',
			fileTooLarge: 'JSON içe aktarma dosyası 512 KB’dan küçük olmalıdır.',
			notFound: 'Blog yazısı bulunamadı.'
		},
		share: {
			title: 'Hikaye paylaşım varlıkları',
			description:
				'Herkese açık /share sayfasında sunulan 1080x1920 görselleri ve MP4 videoları yönetin.',
			page: 'Herkese açık paylaşım sayfası',
			live: '/share yayında — ziyaretçiler aşağıdaki varlıkları hikayelerinde paylaşabilir.',
			disabled: '/share şu anda 404 döndürüyor. En az bir varlık aktif olduğunda açın.',
			enable: '/share sayfasını aç',
			disable: '/share sayfasını kapat',
			uploadTitle: 'Yeni varlık yükle',
			upload: 'Yükle',
			uploading: 'Yükleniyor…',
			empty: 'Henüz paylaşım varlığı yok.',
			active: 'Aktif',
			hidden: 'Gizli',
			activate: 'Etkinleştir',
			hide: 'Gizle',
			saveCaptions: 'Açıklamaları kaydet',
			delete: 'Sil',
			moveUp: 'Yukarı taşı',
			moveDown: 'Aşağı taşı',
			confirmDelete: 'Bu varlık silinsin mi? Dosya depodan da kaldırılır.',
			uploaded: '{name} yüklendi.',
			assetDeleted: 'Varlık silindi.',
			captionSaved: 'Açıklama kaydedildi.',
			pageEnabled: '/share açıldı.',
			pageDisabled: '/share kapatıldı.',
			chooseFile: 'Yüklemek için bir görsel veya MP4 video seçin.',
			fileTooLarge: 'Dosya 60 MB veya daha küçük olmalıdır.',
			missingAsset: 'Varlık kimliği eksik.',
			uploadFailed: 'Yükleme başarısız oldu.',
			storageError: 'Depolama hatası: {error}'
		},
		settings: {
			title: 'Ayarlar',
			description:
				'Kimlik bilgileri, çalışma zamanı ayarları ve tanılar. Kaydedilen değerler .env değerlerini geçersiz kılar.',
			valueRequired: 'Bir değer gerekli.',
			unknownSetting: 'Bilinmeyen ayar.',
			errorNotFound: 'Hata kaydı bulunamadı.',
			reservationNotFound: 'Rezervasyon bulunamadı.'
		},
		copyPanel: {
			title: 'Herkese açık metinler',
			description:
				'Pazarlama sayfası metinlerini koda dokunmadan düzenleyin. Boş alanlar yerleşik varsayılanlara döner.',
			saved: '{value} kaydedildi.',
			reset: '{value} kod varsayılanlarına sıfırlandı.',
			open: 'Aç',
			editableFields: '{count} düzenlenebilir alan',
			overrideHelp: 'Yalnızca dolu alanlar varsayılan metni geçersiz kılar.',
			custom: 'özel',
			default: 'varsayılan',
			save: 'Metni kaydet',
			resetLanguage: 'Bu dili sıfırla'
		},
		messagePanel: {
			title: 'Mesajlar',
			description:
				'Kod değiştirmeden tüm ürün metinlerini düzenleyin. Boş alanlar yerleşik varsayılanlara döner.',
			search: 'Ara',
			searchPlaceholder: 'Anahtar, etiket veya metin ara…',
			open: 'Aç',
			saved: '{value} kaydedildi.',
			reset: '{value} kod varsayılanına sıfırlandı.'
		},
		gtm: {
			description: 'Kampanya linkleri, onboarding hunisi ve lead triage görünümü.',
			starts: 'Soru-cevap başlangıcı',
			completed: 'Soru-cevap tamamlandı',
			preview: 'Önizleme üretildi',
			editor: 'Düzenleyici açıldı',
			last7Days: 'son 7 gün',
			sources: 'Kampanya kaynakları',
			sourceCount: '{count} kaynak',
			noSources: 'Henüz kampanya kaynaklı etkinlik yok.',
			source: 'Kaynak',
			start: 'Başlangıç',
			complete: 'Tamamlanma',
			leadTriage: 'Lead triage',
			triageHelp: 'Sıcak adaylar, beta adayları ve uyumluluk mesajları.',
			hot: 'Sıcak',
			beta: 'Beta',
			review: 'İnceleme',
			noLeads: 'Henüz triage edilecek aday yok.'
		},
		customer: {
			unknown: 'Bilinmeyen müşteri.',
			invalidPlan: 'Geçersiz hedef plan durumu.',
			reasonRequired: 'Bir gerekçe gerekli.',
			positiveAmount: 'Tanımlamak için en az bir pozitif tutar girin.',
			noDomain: 'Bu sitede ayrılacak domain yok.',
			missingSite: 'siteId eksik.',
			siteNotFound: 'Site bulunamadı.',
			publishBlocked: 'Yayın kalite kontrolleri nedeniyle engellendi: {reason}',
			reservationInProgress:
				'Bu sitede devam eden domain rezervasyonu veya kaydı var; önce onu çözün.'
		},
		detail: {
			backInbox: 'Gelen kutusuna dön',
			backSupport: 'Desteğe dön',
			setStatus: 'Durumu ayarla:',
			youAdmin: 'Siz (yönetici)',
			youSupport: 'Siz (destek)',
			replyEmail: 'E-postayla yanıtla…',
			replyCustomer: 'Müşteriye yanıtla…',
			reply: 'Yanıtla',
			inquiryClosed: 'Bu talep kapatıldı.',
			ticketClosed: 'Bu destek talebi kapatıldı.',
			replyStored: 'Yanıt kaydedildi ve e-posta teslimi denendi.'
		}
	},
	auth: {
		tooManyAttempts: 'Çok fazla deneme yaptın — bir dakika bekleyip tekrar dene.',
		invalidEmail: 'Lütfen geçerli bir e-posta adresi gir.',
		betaDenied: 'saaskaya şu anda kapalı betadadır. Davetiye için operatörle iletişime geçin.',
		betaLinkNotActive: 'Bu beta bağlantısı aktif değil.'
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
