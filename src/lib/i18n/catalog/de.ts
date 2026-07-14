import type { CatalogShape } from './en';

export const de = {
	common: {
		save: 'Speichern',
		cancel: 'Abbrechen',
		delete: 'Löschen',
		edit: 'Bearbeiten',
		back: 'Zurück',
		loading: 'Wird geladen…',
		error: 'Etwas ist schiefgelaufen.'
	},
	account: {
		supportLink: 'Support',
		signOut: 'Abmelden',
		stats: {
			sites: 'Websites',
			published: 'Veröffentlicht',
			messages: 'Nachrichten'
		},
		plan: {
			title: 'Tarif',
			description:
				'Eigene Domains benötigen Pro. Veröffentlichte Subdomains bleiben auch im Free-Tarif verfügbar.',
			pro: 'Pro',
			proGrace: 'Pro · Kulanz',
			free: 'Free',
			graceUntil: 'Bezahlte Funktionen bleiben bis {date} aktiv.',
			upgrade: 'Auf Pro upgraden',
			manageSites: 'Websites verwalten'
		},
		usage: {
			title: 'KI-Nutzung diesen Monat',
			description:
				'Direkte Text-/Farbänderungen im Editor sind immer kostenlos — diese Limits gelten nur für KI-generierte Änderungen.',
			edits: 'Bearbeitungen',
			generations: 'Website-Generierungen'
		},
		profile: {
			title: 'Profil',
			description:
				'Dein Konto nutzt die Anmeldung per Magic-Link. Es wird kein Passwort gespeichert.',
			email: 'E-Mail',
			role: 'Rolle',
			roleAdmin: 'Super-Admin',
			roleCustomer: 'Kunde'
		},
		exports: {
			title: 'Website-Exporte',
			description:
				'Der vollständige Website-Export ist für Pro-Websites und Betreuer-Support-Fälle verfügbar.',
			empty: 'Noch keine Websites zum Exportieren.',
			export: 'Exportieren',
			proRequired: 'Pro-Website erforderlich'
		},
		deletion: {
			title: 'Löschanfragen',
			description:
				'Die Kontolöschung wird derzeit vom Betreiber durchgeführt. Dabei werden dein Konto, deine Websites, veröffentlichten Versionen und Nachrichten aus der Datenbank entfernt; Backups laufen gemäß der Aufbewahrungsrichtlinie aus.',
			request: 'Löschung beantragen'
		},
		support: {
			title: 'Support',
			description: 'Schick uns eine Nachricht — hier antwortet ein echter Mensch.',
			newRequest: 'Neue Anfrage',
			categoryLabel: 'Kategorie',
			categoryGeneral: 'Allgemein',
			categoryBilling: 'Abrechnung',
			categoryTechnical: 'Technisch',
			categoryHumanReview: 'Persönliche Prüfung (Premium)',
			subjectLabel: 'Betreff',
			subjectPlaceholder: 'Worum geht es?',
			messageLabel: 'Nachricht',
			messagePlaceholder: 'Erzähl uns, was los ist.',
			send: 'Senden',
			ticketCount: '{count} Anfrage(n)',
			empty: 'Noch keine Anfragen.',
			updated: 'aktualisiert {date}',
			statusOpen: 'offen',
			statusPending: 'in Bearbeitung',
			statusResolved: 'gelöst',
			statusClosed: 'geschlossen',
			tooManyTickets: 'Zu viele Anfragen — bitte warte, bevor du eine weitere eröffnest.',
			subjectBodyRequired: 'Betreff und Nachricht sind beide erforderlich.',
			detail: {
				openedOn: 'eröffnet am {date}',
				you: 'Du',
				team: 'saaskaya Support',
				replyPlaceholder: 'Antwort schreiben…',
				reply: 'Antworten',
				closedNotice: 'Diese Anfrage ist geschlossen.',
				tooManyReplies: 'Zu viele Antworten — bitte warte, bevor du eine weitere sendest.',
				emptyMessage: 'Die Nachricht darf nicht leer sein.',
				unknownTicket: 'Anfrage nicht gefunden.'
			}
		}
	},
	dashboard: {
		title: 'Deine Websites',
		nav: {
			newSite: 'Neue Website',
			account: 'Konto',
			admin: 'Admin',
			signOut: 'Abmelden'
		},
		plan: {
			label: 'Tarif',
			name: 'Pro gilt pro Website',
			priceSuffix: '{price}€/Monat / veröffentlichte Website',
			description:
				'Jede Website hat ihren eigenen Pro-Status. Eine eigene Domain und der vollständige Export sind nur für diese Website freigeschaltet.',
			billingNote: 'Die Zahlung wird über die jeweilige Website-Karte gestartet.'
		},
		alerts: {
			published: '{name} ist live — herzlichen Glückwunsch!',
			unpublished: '{name} wurde offline genommen.',
			domainConnectedSuffix: 'verbunden.',
			domainCheckedSuffix: 'geprüft.',
			domainDetached: 'Domain von der Website entfernt.',
			transferReported:
				'Wir haben deine Überweisungsmeldung erhalten — die Domain wird eingerichtet, sobald der Betreiber sie bestätigt hat.',
			reservationCancelled: 'Reservierung storniert.',
			deleted: '{name} wurde endgültig gelöscht.'
		},
		empty: {
			message:
				'Du hast noch keine Website. Beschreibe dich in ein paar Sätzen und lass die KI die erste erstellen.',
			cta: 'Erste Website erstellen'
		},
		card: {
			fallbackName: 'Deine Website',
			editorAria: '{name} im Editor öffnen',
			lastUpdated: 'Zuletzt aktualisiert: {date}',
			statusPublished: 'Live',
			statusDraft: 'Entwurf',
			planActive: 'Pro-Website',
			planGrace: 'Pro-Kulanzfrist',
			planFree: 'Free-Website'
		},
		identity: {
			siteName: 'Website-Name',
			subdomain: 'Subdomain',
			contactEmail: 'Kontakt-E-Mail',
			save: 'Speichern'
		},
		meta: {
			publicUrl: 'Öffentliche URL: {handle}.saaskaya.com',
			languages: 'Sprachen: {list}',
			defaultLocale: 'Standard: {locale}'
		},
		billing: {
			proActiveLine: 'Diese Website ist Pro (aktiv).',
			proGraceLine: 'Diese Website befindet sich in der Pro-Kulanzfrist.',
			proFreeLine: 'Diese Website ist Free.',
			priceLine:
				'Pro: {monthly}€/Monat oder {yearly}€/Jahr. Jährliches Pro enthält eine Standard-.com-Domain, SSL und die technische Einrichtung.',
			monthlyButton: 'Monatliches Pro + Domain wählen',
			yearlyButton: 'Jährliches Pro (.com inklusive)',
			comingSoon: 'Die Pro-Zahlung erscheint hier, sobald sie bereit ist.'
		},
		actionsRow: {
			edit: 'Bearbeiten',
			preview: 'Vorschau',
			openLive: 'Live-Website öffnen',
			unpublish: 'Offline nehmen',
			prepareForLaunch: 'Für den Start vorbereiten',
			moreActionsAria: 'Weitere Aktionen',
			inbox: 'Posteingang'
		},
		overflow: {
			publishNowTitle: 'Veröffentlicht den zuletzt gespeicherten Entwurf als neue Live-Version.',
			publishNowLabel: 'Neueste Änderungen veröffentlichen',
			fullExport: 'Vollständiger Website-Export',
			fullExportProOnly: 'Vollständiger Export mit Pro',
			deleteSite: 'Website löschen'
		},
		deleteConfirm: {
			title: 'Diese Website wird endgültig gelöscht',
			body: 'Die Website geht offline, eine verbundene Domain wird freigegeben, und alle Versionen/Mediendateien werden gelöscht. Das kann nicht rückgängig gemacht werden. Ein vollständiger Export ist nur mit einer Pro-Website oder Betreiber-Support möglich. Gib zur Bestätigung unten den Website-Namen ({name}) ein.',
			confirmButton: 'Endgültig löschen',
			cancel: 'Abbrechen'
		},
		domain: {
			label: 'Domain:',
			active: 'Aktiv',
			remove: 'Entfernen',
			forwardTo: '{local}@{domain} → {dest}',
			forwardPendingVerification: ' · E-Mail-Verifizierung ausstehend'
		},
		reservation: {
			label: 'Domain-Reservierung:',
			statusPending: 'Zahlung ausstehend',
			statusManualReview: 'manuelle Prüfung',
			statusPaid: 'Domain wird vorbereitet',
			statusRegistering: 'Domain wird vorbereitet',
			statusFailed: 'Einrichtung wird geprüft',
			eligibleTitle: 'Domain ist verfügbar. Mach diese Website zuerst zu Pro.',
			eligibleBody:
				'Die Domain-Registrierung erfolgt nach der Zahlung und einer internen Prüfung der Verfügbarkeit.',
			bankLabel: 'Per Überweisung bezahlen:',
			ibanPending: 'Der Betreiber trägt die IBAN in Kürze ein.',
			descriptionLabel: 'Verwendungszweck:',
			reportTransfer: '✓ Ich habe überwiesen, bitte informieren',
			cancel: 'Stornieren',
			cardContinue: 'Mit Karte fortfahren',
			failedNote:
				'Bei der Einrichtung ist etwas schiefgelaufen; der Betreiber prüft das. Du musst nichts tun.',
			manualReviewNote:
				'Diese Domain wird manuell geprüft. Wir melden uns, sobald die Prüfung abgeschlossen ist.',
			preparingDomain: 'Die Domain wird vorbereitet.',
			preparingSsl: 'SSL wird vorbereitet.',
			emailPreparing: 'Die E-Mail-Weiterleitung wird vorbereitet.',
			emailForwardPendingVerification: ' · Verifizierung der E-Mail-Weiterleitung ausstehend'
		},
		attach: {
			placeholder: 'deinedomain.de',
			domainPlaceholder: 'deinewunschdomain.de',
			button: 'Meine Domain verbinden',
			note: 'Wenn du bereits eine Domain besitzt, verbinde sie oben (sie muss auf uns zeigen).',
			purchaseClosed: 'Der Kauf einer neuen Domain öffnet nach der geschlossenen Beta.',
			creditReadyTitle: 'Dein jährliches Pro-Domain-Guthaben ist bereit.',
			creditReadyBody:
				'Eine Standard-.com-Domain, SSL, DNS-Einrichtung und die Hosting-Verbindung sind im Tarif enthalten.',
			includedButton: 'Meine inkludierte .com-Domain wählen',
			nextStepTitle: 'Nächster Schritt: Wähle deine .com-Domain.',
			nextStepBody:
				'Deine monatliche Pro-Website bleibt live; ein jährlicher Domain-Service für deine eigene .com-Adresse kostet 15€. SSL, DNS-Einrichtung und die Verbindung übernehmen wir für dich.',
			yearlyButton: 'Meine .com-Domain wählen',
			checkAvailability: 'Domain-Verfügbarkeit prüfen',
			bankOption: '🏦 Überweisung',
			cardOption: '💳 Kreditkarte'
		},
		messages: {
			title: 'Nachrichten',
			description: 'Kontaktformular-Einsendungen für {name}',
			empty: 'Noch keine Nachrichten.'
		},
		actions: {
			firstPublishOnlyFromEditor:
				'Die erste Veröffentlichung erfolgt nur über den Editor — so wird der neueste Entwurf gespeichert und mit demselben Inhalt veröffentlicht.',
			completeIdentityFirst:
				'Schließe vor der Veröffentlichung den Website-Namen und die öffentliche Subdomain ab.',
			siteNotFound: 'Website nicht gefunden.',
			qualityBlockers: 'Es gibt Qualitätsblocker vor der Veröffentlichung.',
			siteBelongsToAnotherAccount: 'Diese Website gehört zu einem anderen Konto.',
			domainNeedsProSubscription: 'Eigene Domains benötigen ein aktives Pro-Abo für diese Website.',
			identitySaved: 'Subdomain für {name} gespeichert: {handle}.saaskaya.com',
			domainPurchaseClosed:
				'Der Kauf einer neuen Domain ist während der geschlossenen Beta nicht verfügbar.',
			invalidDomain: 'Das sieht nicht wie eine gültige Domain aus — z. B. deinedomain.de',
			domainUnavailable: 'Diese Domain ist nicht verfügbar. Probiere einen anderen Namen.',
			domainAlreadyReserved: 'Diese Domain ist bereits reserviert.',
			domainReserveFailed:
				'Die Domain konnte nicht reserviert werden — prüfe den Namen und versuche es erneut.',
			domainCreditFailed:
				'Das Domain-Guthaben konnte nicht verwendet werden. Lade die Seite neu und versuche es erneut.',
			manualReviewMessage: 'Diese Domain benötigt eine manuelle Prüfung. Wir melden uns bei dir.',
			domainCreditUsedMessage:
				'Dein Domain-Guthaben wurde verwendet. Deine Domain steht in der Einrichtungswarteschlange.',
			domainAvailableMessage:
				'Diese Domain ist verfügbar. Du kannst mit dem Pro-Schritt für diese Website fortfahren.',
			reservationNotFound: 'Reservierung nicht gefunden.',
			deleteNameMismatch: 'Website-Name stimmte nicht überein — Löschung abgebrochen.',
			deleteReservationInProgress:
				'Für diese Website läuft bereits eine Domain-Reservierung/-Registrierung — löse das zuerst.',
			dnsNotPointed:
				'Deine Domain zeigt noch nicht auf uns. Leite im Panel deines Domain-Anbieters den A-Eintrag auf unsere Server-IP und versuche es erneut.',
			domainAlreadyAttached: 'Diese Domain ist bereits mit einer anderen Website verbunden.',
			attachSslReady:
				'Das Sicherheitszertifikat ist bereit — deine Website ist in wenigen Minuten unter dieser Adresse erreichbar.',
			attachPendingReview:
				'Die Domain wurde gespeichert, aber die Einrichtung wurde nicht abgeschlossen — unser Team prüft das, du musst nichts tun.',
			attachQueued: 'Die Domain wurde gespeichert — unser Einrichtungsteam übernimmt den Rest.',
			registerManualReview:
				'Bei der Domain-Prüfung ist etwas aufgetreten, das eine manuelle Prüfung erfordert. Wir melden uns bei dir.',
			registerSslReady:
				'Die Domain wurde registriert und deine Website ist verbunden — sie ist in wenigen Minuten unter dieser Adresse erreichbar.',
			registerPendingReview:
				'Die Domain wurde gespeichert, aber die Einrichtung wurde nicht abgeschlossen — unser Team prüft das, du musst nichts tun.',
			registerQueued: 'Die Domain wurde registriert — unser Einrichtungsteam übernimmt den Rest.'
		}
	}
} satisfies CatalogShape;
