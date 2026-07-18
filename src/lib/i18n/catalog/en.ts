import type { DeepStringRecord, Widen } from './types';

/** Reference catalog. Every other locale file is checked against this file's
 *  key shape via `satisfies CatalogShape` — adding a key here without a matching
 *  `tr`/`de` entry is a compile error, not a silent runtime fallback. */
export const en = {
	common: {
		save: 'Save',
		cancel: 'Cancel',
		delete: 'Delete',
		edit: 'Edit',
		back: 'Back',
		loading: 'Loading…',
		error: 'Something went wrong.'
	},
	email: {
		magicLink: {
			subject: 'Your saaskaya sign-in link',
			body: 'Sign in to saaskaya:\n\n{link}\n\nThe link is valid for 15 minutes and can be used once.'
		},
		betaInvitation: {
			subject: "You're invited to the saaskaya beta",
			body: "You've been invited to the saaskaya closed beta.\n\nOpen your invitation:\n{loginUrl}\n\nUse this email address to request your secure, one-time sign-in link."
		},
		contactNotification: {
			subject: 'New message via {siteName}',
			body: 'From: {name} <{email}>\n\n{message}\n\n— sent from your {siteName} contact form (saaskaya)'
		}
	},
	account: {
		supportLink: 'Support',
		signOut: 'Sign out',
		stats: {
			sites: 'Sites',
			published: 'Published',
			messages: 'Messages'
		},
		plan: {
			title: 'Plan',
			description: 'Custom domains require Pro. Published subdomains stay available on Free.',
			pro: 'Pro',
			proGrace: 'Pro · grace',
			free: 'Free',
			graceUntil: 'Paid features remain active until {date}.',
			upgrade: 'Upgrade to Pro',
			manageSites: 'Manage sites'
		},
		usage: {
			title: 'AI usage this month',
			description:
				'Direct text/color edits in the editor are always free — these limits are only for AI-generated changes.',
			edits: 'Edits',
			generations: 'Site generations'
		},
		profile: {
			title: 'Profile',
			description: 'Your account uses magic-link sign-in. No password is stored.',
			email: 'Email',
			role: 'Role',
			roleAdmin: 'Super admin',
			roleCustomer: 'Customer'
		},
		exports: {
			title: 'Site exports',
			description: 'Full site export is available for Pro sites and operator support cases.',
			empty: 'No sites to export yet.',
			export: 'Export',
			proRequired: 'Pro site required'
		},
		deletion: {
			title: 'Deletion requests',
			description:
				'Account deletion is handled by the operator for now. It removes your account, sites, published versions and messages from the database; backups age out under the retention policy.',
			request: 'Request deletion'
		},
		support: {
			title: 'Support',
			description: 'Send us a message — a real person replies here.',
			newRequest: 'New request',
			categoryLabel: 'Category',
			categoryGeneral: 'General',
			categoryBilling: 'Billing',
			categoryTechnical: 'Technical',
			categoryHumanReview: 'Human review (Premium)',
			subjectLabel: 'Subject',
			subjectPlaceholder: "What's this about?",
			messageLabel: 'Message',
			messagePlaceholder: "Tell us what's going on.",
			send: 'Send',
			ticketCount: '{count} ticket(s)',
			empty: 'No tickets yet.',
			updated: 'updated {date}',
			statusOpen: 'open',
			statusPending: 'pending',
			statusResolved: 'resolved',
			statusClosed: 'closed',
			tooManyTickets: 'Too many tickets — please wait before opening another.',
			subjectBodyRequired: 'Subject and message are both required.',
			detail: {
				openedOn: 'opened {date}',
				you: 'You',
				team: 'saaskaya support',
				replyPlaceholder: 'Write a reply…',
				reply: 'Reply',
				closedNotice: 'This ticket is closed.',
				tooManyReplies: 'Too many replies — please wait before sending another.',
				emptyMessage: 'Message cannot be empty.',
				unknownTicket: 'Unknown ticket.'
			}
		}
	},
	editor: {
		blocks: {
			hero: 'Hero',
			about: 'About',
			services: 'Services',
			gallery: 'Gallery',
			contact: 'Contact',
			cta: 'CTA',
			faq: 'FAQ',
			testimonials: 'Testimonials',
			pricing: 'Pricing',
			process: 'Process',
			booking: 'Booking',
			credentials: 'Credentials',
			team: 'Team',
			footer: 'Footer',
			stats: 'Stats',
			clients: 'Client logos',
			video: 'Video',
			collection: 'Collection'
		},
		settings: {
			siteNameLabel: 'Site name',
			publicSubdomainLabel: 'Public subdomain',
			publicSubdomainHelp:
				'Choose a readable address instead of the site id before your first publish.',
			publicSubdomainRenameNotice:
				'After publishing, you can change this address once. Your previous address remains as an alias.',
			publicSubdomainRenameUsed: 'The one-time published subdomain rename has already been used.',
			contactEmailLabel: 'Contact email',
			saveIdentity: 'Save publish info',
			flushFailed: 'Could not save the latest draft first. Check your connection and try again.',
			identitySaveFailed: 'Could not save the publish address.',
			identitySaved: 'Publish address saved.',
			identitySaveNetworkError:
				'Could not save the publish address. Check your connection and try again.',
			poweredByBadgeLabel: '"Powered by saaskaya" badge',
			domainLabel: 'Domain',
			domainNone: 'No domain connected yet.',
			integrationsLabel: 'Integrations',
			integrationsHelp:
				'These links appear in the matching blocks on your site. Only you can change them — the AI never touches this section.',
			phoneLabel: 'Phone (E.164, e.g. {example})',
			phoneExample: '+15551234567',
			linkLabel: 'Link',
			buttonLabelLabel: 'Button label (default: {default})',
			aiMemoryLabel: 'AI Memory',
			aiMemoryHelp:
				'The AI reads these notes before every chat message. A short note is added here after every change you make, so the AI remembers earlier decisions in the next session. Auto-summarized after 10 lines.',
			aiMemoryPlaceholder:
				'No memory notes yet. Your first AI edit will add one here automatically.',
			aiMemorySave: 'Save',
			aiMemorySaved: 'Memory saved.',
			aiMemorySaveFailed: 'Could not save.',
			aiMemoryNetworkError: 'Connection error.'
		},
		pages: {
			title: 'Pages',
			sectionsBadge: '{count} section(s)',
			inMenu: 'In menu',
			notInMenu: 'Not in menu',
			hasContact: 'Has contact',
			deleteAria: 'Delete "{name}"',
			deleteTitle: 'Delete page',
			confirmDeleteQuestion: 'Delete "{name}"?',
			confirmDeleteHomeWarning:
				'This is the home page — deleting it makes the next page in the list the new home page.',
			confirmYes: 'Yes, delete',
			confirmCancel: 'Cancel',
			addNew: '+ New page',
			slugLabel: 'Slug',
			titleLabel: 'Title ({locale})',
			addButton: 'Add page',
			addHelp: 'New pages start with a hero section and are added to the menu.',
			addFailed: 'Could not add the page.'
		},
		pageOps: {
			slugInvalid: 'Slug must be kebab-case (a-z, 0-9, dashes).',
			slugTaken: 'A page with slug "{slug}" already exists.',
			pageLimitReached: 'Page limit reached ({max}).',
			titleRequiredAllLocales: 'A title is required for every locale.',
			atLeastOnePage: 'At least one page must remain.',
			pageNotFound: 'Page not found: "{slug}".'
		},
		chat: {
			assistantLabel: 'Assistant',
			greeting:
				"Hi! Let's talk about your site — what would you like to change? Color, text, sections, pages… just tell me.",
			riskLow: 'A small text change.',
			riskMedium: 'This change will affect how your site looks.',
			riskHigh: 'This is a big change — make sure to check the preview after it applies.',
			forceSendPrompt: 'If you think this is about your site, send it anyway',
			undo: 'Undo',
			undoApplied: 'Change undone.',
			understoodLabel: 'Here is what I understood:',
			previewNote:
				'This applies to your draft — you can check it in the preview before publishing.',
			apply: 'Apply',
			cancelProposal: 'Cancel',
			cancelledNotice: 'Cancelled — nothing changed.',
			inputPlaceholder: 'e.g. Add an FAQ section for pricing…',
			send: 'Send',
			freeEditsNote:
				'Questions and off-topic messages never spend your budget — only applied edits count against your monthly AI edit limit. Text/color edits in the Content and Theme tabs are always free.',
			genericError: 'Something went wrong.',
			networkError: 'Network error — please try again.',
			viewPreviewHint: 'Switch to the "Preview" tab above to see the change.',
			changeSummaryPrefix: 'Change summary:',
			pagesAdded: '{count} page(s) added: {names}',
			pagesRemoved: '{count} page(s) removed.',
			titlesUpdated: '{count} page title(s) updated.',
			navUpdated: 'Menu updated.',
			themeUpdated: 'Theme updated.',
			pagesReordered: 'Pages reordered.',
			sectionStyleUpdated: 'Section style updated.',
			sectionsAdded: '{count} section(s) added.',
			sectionsRemoved: '{count} section(s) removed.',
			sectionsMoved: '{count} section(s) moved.'
		},
		theme: {
			nichePreset: 'Niche preset',
			brandColors: 'Brand colors',
			fonts: 'Fonts',
			cornerRadius: 'Corner radius'
		},
		imageUpload: {
			uploading: 'Uploading…',
			replaceImage: 'Replace image',
			uploadImage: 'Upload image',
			uploadFailed: 'Upload failed.',
			urlAria: '{label} URL'
		},
		languages: {
			editingLocaleLegend: 'Editing locale',
			editingLocaleHelp: 'The Content tab and the preview follow this locale.',
			defaultLocaleLabel: 'Default locale',
			enabledLocalesLabel: 'Enabled locales',
			enabledLocalesHelp:
				'All sites currently ship with TR/EN/DE content; per-site language toggles are on the roadmap.'
		},
		content: {
			pageLabel: 'Page',
			editingNote:
				'Editing {locale} copy — switch the locale in the toolbar. Edits go straight to the draft (no AI).',
			sectionImageLabel: 'section image'
		}
	},
	legal: {
		aiDisclaimer: {
			title: 'AI-translated draft',
			body: 'This page was translated by AI from the Turkish original and has not been reviewed by a lawyer. The Turkish version is the authoritative text.'
		}
	},
	admin: {
		nav: {
			overview: 'Overview',
			gtm: 'GTM',
			customers: 'Customers',
			inbox: 'Inbox',
			blog: 'Blog',
			copy: 'Copy',
			messages: 'Messages',
			share: 'Share',
			support: 'Support',
			invites: 'Beta invites',
			settings: 'Settings',
			backToApp: 'Back to app'
		},
		chrome: { console: 'Admin Console', ariaLabel: 'Admin', eyebrow: 'Admin' },
		list: {
			customersTitle: 'Customers',
			customersDescription: "Every account, their plan, and this month's AI usage.",
			customerCount: '{count} customer(s)',
			noCustomers: 'No customers yet.',
			proSites: '{count} Pro site(s)',
			view: 'View',
			inboxTitle: 'Inbox',
			inboxDescription:
				'Public contact-form and message-bubble inquiries, most recently active first.',
			inquiryCount: '{count} inquiry(s)',
			noInquiries: 'No public inquiries.',
			supportTitle: 'Support',
			supportDescription: 'Every customer request, most recently active first.',
			ticketCount: '{count} ticket(s)',
			noTickets: 'No tickets.',
			open: 'Open',
			updated: 'updated {date}',
			new: 'new'
		},
		invites: {
			title: 'Beta invites',
			description: 'Invite customers by email and control access to the closed beta.',
			access: 'Closed beta access',
			enabled: 'Only active invitees can sign in.',
			disabled: 'Sign-in is currently open to everyone.',
			enable: 'Enable closed beta',
			disable: 'Disable closed beta',
			email: 'Email',
			profession: 'Profession',
			language: 'Language',
			send: 'Send invite',
			empty: 'No invites yet.',
			reactivate: 'Reactivate',
			revoke: 'Revoke',
			validEmail: 'A valid email is required.',
			missingEmail: 'Missing email.',
			deliveryFailed: 'Invite saved, but email delivery failed: {error}'
		},
		blog: {
			title: 'Blog',
			description:
				'Manage multilingual platform articles, SEO summaries, cover images, and publication state.',
			newPost: 'New post',
			importJson: 'Import JSON',
			importTitle: 'Import multilingual JSON',
			importHelp:
				'Upload one structured JSON file with complete EN/TR/DE translations. Published imports are blocked if any language is incomplete.',
			jsonFile: 'JSON file',
			updateExisting: 'Update existing post when slug matches',
			posts: '{count} post(s)',
			publicBlog: 'View public blog',
			empty: 'No posts yet.',
			edit: 'Edit',
			open: 'Open',
			back: 'Back to blog',
			openPublic: 'Open public',
			saved: 'Blog post saved.',
			editDescription: 'Edit the public blog article in Turkish, English, and German.',
			slug: 'Slug',
			status: 'Status',
			publishDate: 'Publish date',
			coverUrl: 'Cover / SEO image URL',
			coverAlt: 'Cover alt text',
			readingMinutes: 'Reading minutes',
			author: 'Author',
			fieldTitle: 'Title',
			category: 'Category',
			summary: 'Summary',
			seoTitle: 'SEO title',
			seoDescription: 'SEO description',
			body: 'Body',
			writeArticle: 'Write the {locale} article...',
			save: 'Save blog post',
			chooseFile: 'Choose a JSON file to import.',
			fileTooLarge: 'JSON import file must be smaller than 512 KB.',
			notFound: 'Blog post not found.'
		},
		share: {
			title: 'Story share assets',
			description: 'Curate the 1080x1920 images and MP4 videos offered on the public /share page.',
			page: 'Public share page',
			live: '/share is live — visitors can post the assets below to their story.',
			disabled: '/share currently returns 404. Enable it when at least one asset is active.',
			enable: 'Enable /share',
			disable: 'Disable /share',
			uploadTitle: 'Upload a new asset',
			upload: 'Upload',
			uploading: 'Uploading…',
			empty: 'No share assets yet.',
			active: 'Active',
			hidden: 'Hidden',
			activate: 'Activate',
			hide: 'Hide',
			saveCaptions: 'Save captions',
			delete: 'Delete',
			moveUp: 'Move up',
			moveDown: 'Move down',
			confirmDelete: 'Delete this asset? The file is removed from storage too.',
			uploaded: 'Uploaded {name}.',
			assetDeleted: 'Asset deleted.',
			captionSaved: 'Caption saved.',
			pageEnabled: '/share enabled.',
			pageDisabled: '/share disabled.',
			chooseFile: 'Choose an image or MP4 video to upload.',
			fileTooLarge: 'File must be 60 MB or smaller.',
			missingAsset: 'Missing asset id.',
			uploadFailed: 'Upload failed.',
			storageError: 'Storage error: {error}'
		},
		settings: {
			title: 'Settings',
			description: 'Credentials, runtime settings and diagnostics. Saved values override .env.',
			valueRequired: 'A value is required.',
			unknownSetting: 'Unknown setting.',
			errorNotFound: 'Error record not found.',
			reservationNotFound: 'Reservation not found.'
		},
		copyPanel: {
			title: 'Public copy',
			description:
				'Edit marketing-page text without touching code. Empty fields fall back to the built-in defaults.',
			saved: 'Saved {value}.',
			reset: 'Reset {value} to code defaults.',
			open: 'Open',
			editableFields: '{count} editable fields',
			overrideHelp: 'Only filled fields override the default copy.',
			custom: 'custom',
			default: 'default',
			save: 'Save copy',
			resetLanguage: 'Reset this language'
		},
		messagePanel: {
			title: 'Messages',
			description:
				'Edit any product text without touching code. Empty fields fall back to built-in defaults.',
			search: 'Search',
			searchPlaceholder: 'Search by key, label, or text…',
			open: 'Open',
			saved: 'Saved {value}.',
			reset: 'Reset {value} to the code default.'
		},
		gtm: {
			description: 'Campaign links, onboarding funnel, and lead-triage view.',
			starts: 'Q&A start',
			completed: 'Q&A complete',
			preview: 'Preview generated',
			editor: 'Editor opened',
			last7Days: 'last 7 days',
			sources: 'Campaign sources',
			sourceCount: '{count} sources',
			noSources: 'No campaign-sourced events yet.',
			source: 'Source',
			start: 'Start',
			complete: 'Complete',
			leadTriage: 'Lead triage',
			triageHelp: 'Hot leads, beta candidates, and compliance messages.',
			hot: 'Hot',
			beta: 'Beta',
			review: 'Review',
			noLeads: 'No leads to triage yet.'
		},
		customer: {
			unknown: 'Unknown customer.',
			invalidPlan: 'Invalid target plan state.',
			reasonRequired: 'A reason is required.',
			positiveAmount: 'Enter at least one positive amount to grant.',
			noDomain: 'No domain to detach on that site.',
			missingSite: 'Missing siteId.',
			siteNotFound: 'Site not found.',
			publishBlocked: 'Publish blocked by quality checks: {reason}',
			reservationInProgress:
				'This site has a domain reservation or registration in progress; resolve it first.'
		},
		detail: {
			backInbox: 'Back to inbox',
			backSupport: 'Back to support',
			setStatus: 'Set status:',
			youAdmin: 'You (admin)',
			youSupport: 'You (support)',
			replyEmail: 'Reply by email…',
			replyCustomer: 'Reply to the customer…',
			reply: 'Reply',
			inquiryClosed: 'This inquiry is closed.',
			ticketClosed: 'This ticket is closed.',
			replyStored: 'Reply stored and email delivery attempted.'
		}
	},
	auth: {
		tooManyAttempts: 'Too many attempts — wait a minute and try again.',
		invalidEmail: 'Please enter a valid email address.',
		betaDenied: 'saaskaya is currently in closed beta. Contact the operator for an invite.',
		betaLinkNotActive: 'This beta link is not active.'
	},
	dashboard: {
		title: 'Your sites',
		nav: {
			newSite: 'New site',
			account: 'Account',
			admin: 'Admin',
			signOut: 'Sign out'
		},
		plan: {
			label: 'Plan',
			name: 'Pro is per site',
			priceSuffix: '{price}€/mo / published site',
			description:
				'Each website has its own Pro status. A custom domain and full export only unlock for that site.',
			billingNote: 'Billing starts from the relevant site card.'
		},
		alerts: {
			published: '{name} is live — congratulations!',
			unpublished: '{name} was unpublished.',
			domainConnectedSuffix: 'connected.',
			domainCheckedSuffix: 'checked.',
			domainDetached: 'Domain removed from the site.',
			transferReported:
				"We've received your transfer notice — the domain will be set up once the operator confirms it.",
			reservationCancelled: 'Reservation cancelled.',
			deleted: '{name} was permanently deleted.'
		},
		empty: {
			message:
				"You don't have a site yet. Describe yourself in a few sentences and let AI build the first one.",
			cta: 'Create your first site'
		},
		card: {
			fallbackName: 'Your site',
			editorAria: 'Open {name} in the editor',
			lastUpdated: 'Last updated: {date}',
			statusPublished: 'Live',
			statusDraft: 'Draft',
			planActive: 'Pro site',
			planGrace: 'Pro grace period',
			planFree: 'Free site'
		},
		identity: {
			siteName: 'Site name',
			subdomain: 'Subdomain',
			contactEmail: 'Contact email',
			save: 'Save'
		},
		meta: {
			publicUrl: 'Public URL: {handle}.saaskaya.com',
			languages: 'Languages: {list}',
			defaultLocale: 'Default: {locale}'
		},
		billing: {
			proActiveLine: 'This site is Pro (active).',
			proGraceLine: 'This site is in its Pro grace period.',
			proFreeLine: 'This site is Free.',
			priceLine:
				'Pro: {monthly}€/mo or {yearly}€/yr. Yearly Pro includes a standard .com domain, SSL, and technical setup.',
			monthlyButton: 'Choose monthly Pro + domain',
			yearlyButton: 'Yearly Pro (.com included)',
			comingSoon: 'Pro billing will appear here once it is ready.'
		},
		actionsRow: {
			edit: 'Edit',
			preview: 'Preview',
			openLive: 'Open live site',
			unpublish: 'Unpublish',
			prepareForLaunch: 'Prepare for launch',
			moreActionsAria: 'More actions',
			inbox: 'Inbox'
		},
		overflow: {
			publishNowTitle: 'Publishes the last saved draft as the new live version.',
			publishNowLabel: 'Publish latest changes',
			fullExport: 'Full site export',
			fullExportProOnly: 'Full export with Pro',
			deleteSite: 'Delete site'
		},
		deleteConfirm: {
			title: 'This site will be permanently deleted',
			body: 'The site goes offline, any attached domain is released, and all versions/media files are deleted. This cannot be undone. A full export is only available with a Pro site or operator support. Type the site name ({name}) below to confirm.',
			confirmButton: 'Delete permanently',
			cancel: 'Cancel'
		},
		domain: {
			label: 'Domain:',
			active: 'Active',
			remove: 'Remove',
			forwardTo: '{local}@{domain} → {dest}',
			forwardPendingVerification: ' · email verification pending'
		},
		reservation: {
			label: 'Domain reservation:',
			statusPending: 'payment pending',
			statusManualReview: 'manual review',
			statusPaid: 'domain being prepared',
			statusRegistering: 'domain being prepared',
			statusFailed: 'setup under review',
			eligibleTitle: 'Domain is available. Make this site Pro first.',
			eligibleBody: 'Domain registration proceeds after payment and an internal eligibility check.',
			bankLabel: 'Pay by bank transfer:',
			ibanPending: 'The operator will add an IBAN soon.',
			descriptionLabel: 'Reference:',
			reportTransfer: "✓ I've made the transfer, notify",
			cancel: 'Cancel',
			cardContinue: 'Continue with card',
			failedNote:
				'Something went wrong during setup; the operator is reviewing it. No action needed from you.',
			manualReviewNote:
				"This domain is under manual review. We'll reach out once eligibility is confirmed.",
			preparingDomain: 'Domain is being prepared.',
			preparingSsl: 'SSL is being prepared.',
			emailPreparing: 'Email forwarding is being prepared.',
			emailForwardPendingVerification: ' · email forwarding verification pending'
		},
		attach: {
			placeholder: 'yourdomain.com',
			domainPlaceholder: 'yourdomain.com',
			button: 'Connect my domain',
			note: 'If you already own a domain, connect it above (it must point to us).',
			purchaseClosed: 'Buying a new domain will open after the closed beta.',
			creditReadyTitle: 'Your yearly Pro domain credit is ready.',
			creditReadyBody:
				'A standard .com domain, SSL, DNS setup, and hosting connection are included in the plan.',
			includedButton: 'Choose my included .com domain',
			nextStepTitle: 'Next step: choose your .com domain.',
			nextStepBody:
				'Your monthly Pro site stays live; a yearly domain service for your own .com address is 15€. SSL, DNS setup, and connecting it are handled for you.',
			yearlyButton: 'Choose my .com domain',
			checkAvailability: 'Check domain availability',
			bankOption: '🏦 Bank transfer',
			cardOption: '💳 Credit card'
		},
		messages: {
			title: 'Messages',
			description: 'Contact-form submissions for {name}',
			empty: 'No messages yet.'
		},
		actions: {
			firstPublishOnlyFromEditor:
				'The first publish can only happen from the editor — that way the latest draft is saved and published with the same content.',
			completeIdentityFirst: 'Finish the site name and public subdomain step before publishing.',
			siteNotFound: 'Site not found.',
			qualityBlockers: 'There are quality blockers before publishing.',
			siteBelongsToAnotherAccount: 'This site belongs to another account.',
			domainNeedsProSubscription: 'Custom domains need an active Pro subscription for this site.',
			identitySaved: 'Subdomain saved for {name}: {handle}.saaskaya.com',
			domainPurchaseClosed: 'Buying a new domain is unavailable during the closed beta.',
			invalidDomain: "That doesn't look like a valid domain — e.g. yourdomain.com",
			domainUnavailable: 'This domain is not available. Try another name.',
			domainAlreadyReserved: 'This domain is already reserved.',
			domainReserveFailed: 'Could not reserve the domain — check the name and try again.',
			domainCreditFailed: 'The domain credit could not be used. Refresh the page and try again.',
			manualReviewMessage: "This domain needs manual review. We'll be in touch.",
			domainCreditUsedMessage: 'Your domain credit was used. Your domain is queued for setup.',
			domainAvailableMessage:
				'This domain is available. You can continue to the Pro step for this site.',
			reservationNotFound: 'Reservation not found.',
			deleteNameMismatch: "Site name didn't match — deletion cancelled.",
			deleteReservationInProgress:
				'This site has an in-progress domain reservation/registration — resolve that first.',
			dnsNotPointed:
				"Your domain isn't pointed to us yet. In your domain provider's panel, point the A record to our server IP and try again.",
			domainAlreadyAttached: 'This domain is already attached to another site.',
			attachSslReady:
				'The security certificate is ready — your site will be live at this address within a few minutes.',
			attachPendingReview:
				'The domain was saved but setup did not finish — our team is looking into it, no action needed from you.',
			attachQueued: 'The domain was saved — our setup team will finish the rest.',
			registerManualReview:
				'Something came up during the domain check that needs manual review. We will be in touch.',
			registerSslReady:
				'The domain was registered and your site is connected — it will be live at this address within a few minutes.',
			registerPendingReview:
				'The domain was saved but setup did not finish — our team is looking into it, no action needed from you.',
			registerQueued: 'The domain was registered — our setup team will finish the rest.'
		}
	}
} satisfies DeepStringRecord;

export type CatalogShape = Widen<typeof en>;
