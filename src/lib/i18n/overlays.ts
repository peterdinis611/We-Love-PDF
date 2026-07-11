import type { Locale } from './locale';
import type { Messages } from './messages';

type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/** Partial locale overlays merged onto English base. */
export const localeOverlays: Partial<Record<Locale, DeepPartial<Messages>>> = {
	cs: {
		nav: {
			allTools: 'Všechny nástroje',
			view: 'Zobrazit',
			merge: 'Sloučit',
			backToTools: '← Nástroje',
			whatsNew: 'Co je nového'
		},
		hero: {
			badge: 'nástrojů zdarma · 100 % v prohlížeči',
			title: 'Všechny PDF nástroje, které potřebujete',
			subtitle:
				'Slučování, rozdělování, komprese, podpis, vodoznak, šifrování — rychle, soukromě a zcela zdarma.',
			ctaMerge: 'Sloučit PDF',
			ctaView: 'Zobrazit PDF',
			ctaCompress: 'Komprimovat',
			ctaWhatsNew: 'Co je nového'
		},
		home: {
			searchPlaceholder: 'Hledat nástroje…',
			clearSearch: 'Vymazat hledání',
			noResults: 'Žádné nástroje neodpovídají hledání',
			favorites: 'Oblíbené',
			recent: 'Nedávno použité',
			all: 'Vše'
		},
		commandPalette: {
			title: 'Přejít na nástroj',
			placeholder: 'Hledat nástroje…',
			noResults: 'Žádné výsledky',
			hint: 'Tip: stiskněte ⌘K kdykoli'
		},
		homeDrop: {
			title: 'Pustit PDF sem',
			subtitle: 'Vyberte, co chcete udělat',
			dismiss: 'Zavřít'
		}
	},
	de: {
		nav: {
			allTools: 'Alle Tools',
			view: 'Ansehen',
			merge: 'Zusammenfügen',
			backToTools: '← Tools',
			whatsNew: 'Neuigkeiten'
		},
		hero: {
			badge: 'kostenlose Tools · 100 % im Browser',
			title: 'Alle PDF-Tools, die Sie brauchen',
			subtitle:
				'Zusammenfügen, Teilen, Komprimieren, Signieren — schnell, privat und komplett kostenlos.',
			ctaMerge: 'PDF zusammenfügen',
			ctaView: 'PDF ansehen',
			ctaCompress: 'Komprimieren',
			ctaWhatsNew: 'Neuigkeiten'
		},
		home: {
			searchPlaceholder: 'Tools suchen…',
			clearSearch: 'Suche löschen',
			noResults: 'Keine Tools gefunden',
			favorites: 'Favoriten',
			recent: 'Zuletzt verwendet',
			all: 'Alle'
		},
		commandPalette: {
			title: 'Tool öffnen',
			placeholder: 'Tools suchen…',
			noResults: 'Keine Ergebnisse',
			hint: 'Tipp: ⌘K jederzeit drücken'
		},
		homeDrop: {
			title: 'PDF hier ablegen',
			subtitle: 'Wählen Sie eine Aktion',
			dismiss: 'Schließen'
		}
	},
	pl: {
		nav: {
			allTools: 'Wszystkie narzędzia',
			view: 'Podgląd',
			merge: 'Połącz',
			backToTools: '← Narzędzia',
			whatsNew: 'Co nowego'
		},
		hero: {
			badge: 'darmowe narzędzia · 100% w przeglądarce',
			title: 'Wszystkie narzędzia PDF, których potrzebujesz',
			subtitle:
				'Łączenie, dzielenie, kompresja, podpis, znak wodny — szybko, prywatnie i za darmo.',
			ctaMerge: 'Połącz PDF',
			ctaView: 'Podgląd PDF',
			ctaCompress: 'Kompresuj',
			ctaWhatsNew: 'Co nowego'
		},
		home: {
			searchPlaceholder: 'Szukaj narzędzi…',
			clearSearch: 'Wyczyść wyszukiwanie',
			noResults: 'Brak pasujących narzędzi',
			favorites: 'Ulubione',
			recent: 'Ostatnio używane',
			all: 'Wszystkie'
		},
		commandPalette: {
			title: 'Przejdź do narzędzia',
			placeholder: 'Szukaj narzędzi…',
			noResults: 'Brak wyników',
			hint: 'Wskazówka: naciśnij ⌘K'
		},
		homeDrop: {
			title: 'Upuść PDF tutaj',
			subtitle: 'Wybierz akcję',
			dismiss: 'Zamknij'
		}
	}
};

export function mergeMessages(base: Messages, patch: DeepPartial<Messages>): Messages {
	const result = structuredClone(base) as Messages;
	for (const key of Object.keys(patch) as (keyof Messages)[]) {
		const value = patch[key];
		if (value && typeof value === 'object' && !Array.isArray(value)) {
			// @ts-expect-error nested merge
			result[key] = { ...result[key], ...value };
		} else if (value !== undefined) {
			// @ts-expect-error assign
			result[key] = value;
		}
	}
	return result;
}
