import type { Locale } from '$lib/i18n';
import type { ChoiceOption, Question } from '$lib/onboarding/questions';
import type { VISUAL_DIRECTIONS } from '$lib/onboarding/directions';

type QuestionCopy = {
	prompt: string;
	helper?: string;
	options?: Record<string, string>;
};

/** Exported for test-only exhaustiveness checks (see `onboarding.test.ts`) — every
 *  `ONBOARDING_QUESTIONS` id must have an `en`/`de` entry here, since `localizeQuestion`
 *  silently falls back to the Turkish base prompt for any id/locale pair missing below. */
export const questionCopy: Record<Locale, Record<string, QuestionCopy>> = {
	en: {
		niche: {
			prompt: 'What kind of practice are you building a site for?',
			options: {
				psych: 'Psychologist / Therapist',
				law: 'Lawyer / Law Office',
				dental: 'Dentist / Clinic',
				dietitian: 'Dietitian',
				real_estate: 'Real estate advisor',
				beauty: 'Beauty salon',
				unsupported: 'Another field'
			}
		},
		otherProfession: {
			prompt: 'What field or profession do you work in?',
			helper: 'Keep it short — e.g. "Tailor", "Photographer", "Car mechanic".'
		},
		businessName: { prompt: 'What is the name of your practice or business?' },
		city: { prompt: 'Which city or district do you serve?' },
		audience: { prompt: 'Who do you help? Briefly describe your audience.' },
		differentiator: {
			prompt: 'What should people understand first when they evaluate your practice?'
		},
		tone: {
			prompt: 'What tone should your site have?',
			options: {
				warm: 'Warm and friendly',
				professional: 'Professional and reassuring',
				modern: 'Modern and dynamic',
				minimal: 'Simple and minimal'
			}
		},
		visualDirection: {
			prompt: 'Choose a visual direction before spending a generation credit.',
			helper:
				'This does not create a free-form design; it steers the first draft inside safe blocks and theme hints.'
		},
		languages: {
			prompt: 'Which languages should the site be published in?',
			helper: 'Choose at least one language.',
			options: { tr: 'Turkish', en: 'English', de: 'German' }
		},
		contactMethod: {
			prompt: 'How should clients contact you?',
			options: { email: 'Email only', phone: 'Phone only', both: 'Both' }
		},
		contactEmail: { prompt: 'What is your contact email?' },
		contactPhone: { prompt: 'What is your contact phone number?' },
		booking: {
			prompt: 'How does booking work?',
			options: {
				online_booking: 'I use an online booking system',
				phone_call: 'I book by phone',
				contact_form: 'A contact form is enough',
				walk_in: 'I accept walk-ins'
			}
		},
		services: {
			prompt: 'What are your main services?',
			helper: 'Add them one by one, at least 1 and at most 8.'
		},
		credentials: {
			prompt: 'Any title, certificate, or membership you want to mention?',
			helper: 'You can skip this.'
		},
		media: {
			prompt: 'Do you have usable images?',
			options: {
				has_media: 'I want to use my own photos',
				use_placeholders: 'Placeholder images are fine for now'
			}
		},
		domainPreference: {
			prompt: 'What web address or domain would you like?',
			helper: 'You can skip this and decide later.'
		},
		anythingElse: {
			prompt: 'Anything else you want to add?',
			helper: 'You can skip this.'
		},
		rawDescription: { prompt: 'Describe your practice in your own words.' }
	},
	tr: {},
	de: {
		niche: {
			prompt: 'Für welche Art von Praxis erstellst du eine Website?',
			options: {
				psych: 'Psychologe / Therapeut',
				law: 'Anwalt / Kanzlei',
				dental: 'Zahnarzt / Klinik',
				dietitian: 'Ernährungsberater',
				real_estate: 'Immobilienberater',
				beauty: 'Beauty-Salon',
				unsupported: 'Anderes Feld'
			}
		},
		otherProfession: {
			prompt: 'In welchem Bereich oder Beruf arbeitest du?',
			helper: 'Kurz halten — z. B. "Schneider", "Fotograf", "Automechaniker".'
		},
		businessName: { prompt: 'Wie heißt deine Praxis oder dein Unternehmen?' },
		city: { prompt: 'In welcher Stadt oder welchem Bezirk bist du tätig?' },
		audience: { prompt: 'Wem hilfst du? Beschreibe deine Zielgruppe kurz.' },
		differentiator: {
			prompt: 'Was sollen Menschen zuerst verstehen, wenn sie deine Praxis prüfen?'
		},
		tone: {
			prompt: 'Welchen Ton soll deine Website haben?',
			options: {
				warm: 'Warm und freundlich',
				professional: 'Professionell und vertrauensbildend',
				modern: 'Modern und dynamisch',
				minimal: 'Schlicht und minimal'
			}
		},
		visualDirection: {
			prompt: 'Wähle eine visuelle Richtung, bevor ein Generierungs-Credit verwendet wird.',
			helper:
				'Das erzeugt kein freies Design; es steuert den ersten Entwurf innerhalb sicherer Blöcke und Theme-Hinweise.'
		},
		languages: {
			prompt: 'In welchen Sprachen soll die Website veröffentlicht werden?',
			helper: 'Wähle mindestens eine Sprache.',
			options: { tr: 'Türkisch', en: 'Englisch', de: 'Deutsch' }
		},
		contactMethod: {
			prompt: 'Wie sollen Klienten dich kontaktieren?',
			options: { email: 'Nur E-Mail', phone: 'Nur Telefon', both: 'Beides' }
		},
		contactEmail: { prompt: 'Wie lautet deine Kontakt-E-Mail?' },
		contactPhone: { prompt: 'Wie lautet deine Telefonnummer?' },
		booking: {
			prompt: 'Wie funktioniert die Terminbuchung?',
			options: {
				online_booking: 'Ich nutze ein Online-Buchungssystem',
				phone_call: 'Termine per Telefon',
				contact_form: 'Ein Kontaktformular reicht',
				walk_in: 'Ich nehme ohne Termin an'
			}
		},
		services: {
			prompt: 'Was sind deine wichtigsten Leistungen?',
			helper: 'Füge sie einzeln hinzu, mindestens 1 und höchstens 8.'
		},
		credentials: {
			prompt: 'Möchtest du Titel, Zertifikate oder Mitgliedschaften nennen?',
			helper: 'Du kannst das überspringen.'
		},
		media: {
			prompt: 'Hast du verwendbare Bilder?',
			options: {
				has_media: 'Ich möchte eigene Fotos verwenden',
				use_placeholders: 'Platzhalter reichen vorerst'
			}
		},
		domainPreference: {
			prompt: 'Welche Webadresse oder Domain möchtest du?',
			helper: 'Du kannst das überspringen und später entscheiden.'
		},
		anythingElse: {
			prompt: 'Möchtest du noch etwas hinzufügen?',
			helper: 'Du kannst das überspringen.'
		},
		rawDescription: { prompt: 'Beschreibe deine Praxis in eigenen Worten.' }
	}
};

export function localizeQuestion(question: Question, locale: Locale): Question {
	const copy = locale === 'tr' ? undefined : questionCopy[locale][question.id];
	if (!copy) return question;
	const options = question.options?.map((option) => ({
		...option,
		label: copy.options?.[option.value] ?? option.label
	}));
	return { ...question, prompt: copy.prompt, helper: copy.helper ?? question.helper, options };
}

export function localizeOption(
	options: ChoiceOption[] | undefined,
	value: unknown,
	locale: Locale
): string {
	const option = options?.find((item) => item.value === value);
	if (!option) return String(value);
	return (
		localizeQuestion(
			{
				id: '',
				kind: 'choice',
				prompt: '',
				required: true,
				guarded: false,
				options,
				schema: {} as Question['schema']
			},
			locale
		).options?.find((item) => item.value === value)?.label ?? option.label
	);
}

const directionCopy: Record<
	Locale,
	Record<string, { label: string; promise: string; preview: string; kitPrefix: string }>
> = {
	en: {
		warm_trust: {
			label: 'Warm and trustworthy',
			promise: 'A soft, human first impression that helps clients feel comfortable.',
			preview: 'Soft colors, clear copy, trust and accessibility emphasis.',
			kitPrefix: 'Kit'
		},
		modern_clinic: {
			label: 'Modern clinic',
			promise: 'A more structured, professional feel with clear services.',
			preview: 'Clean cards, clear CTA, modern clinic/practice feeling.',
			kitPrefix: 'Kit'
		},
		calm_minimal: {
			label: 'Calm and minimal',
			promise: 'Shorter copy, open space, and a calm client experience.',
			preview: 'Airy spacing, short sentences, quiet and safe rhythm.',
			kitPrefix: 'Kit'
		}
	},
	tr: {},
	de: {
		warm_trust: {
			label: 'Warm und vertrauensvoll',
			promise: 'Ein weicher, menschlicher erster Eindruck, der Klienten Sicherheit gibt.',
			preview: 'Sanfte Farben, klare Texte, Vertrauen und Zugänglichkeit.',
			kitPrefix: 'Kit'
		},
		modern_clinic: {
			label: 'Moderne Praxis',
			promise: 'Strukturierter und professioneller Eindruck mit klaren Leistungen.',
			preview: 'Klare Karten, deutlicher CTA, moderne Praxiswirkung.',
			kitPrefix: 'Kit'
		},
		calm_minimal: {
			label: 'Ruhig und minimal',
			promise: 'Kürzere Texte, viel Raum und eine ruhige Klientenerfahrung.',
			preview: 'Luftige Abstände, kurze Sätze, ruhiger und sicherer Rhythmus.',
			kitPrefix: 'Kit'
		}
	}
};

export function localizeDirection(
	direction: (typeof VISUAL_DIRECTIONS)[number],
	locale: Locale
): Omit<(typeof VISUAL_DIRECTIONS)[number], 'label' | 'promise' | 'preview'> & {
	label: string;
	promise: string;
	preview: string;
	kitPrefix: string;
} {
	const copy = locale === 'tr' ? undefined : directionCopy[locale][direction.id];
	return {
		...direction,
		label: copy?.label ?? direction.label,
		promise: copy?.promise ?? direction.promise,
		preview: copy?.preview ?? direction.preview,
		kitPrefix: copy?.kitPrefix ?? 'Kit'
	};
}
