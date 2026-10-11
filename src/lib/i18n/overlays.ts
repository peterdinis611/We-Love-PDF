import type { Locale } from './locale';
import type { Messages } from './messages';
import { toolsCs } from './tools-cs';
import { toolsDe } from './tools-de';
import { toolsPl } from './tools-pl';
import { workspaceCs, workspaceDe, workspacePl } from './workspace';

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
			whatsNew: 'Co je nového',
			guides: 'Návody'
		},
		hero: {
			badge: 'nástrojů zdarma, celkem v prohlížeči',
			title: 'WeLovePDF',
			subtitle:
				'Slučování, rozdělování, podpis a komprese bez nahrávání. Přetáhněte PDF na tuto stránku — soubory zůstanou u vás.',
			ctaMerge: 'Sloučit PDF',
			ctaView: 'Zobrazit PDF',
			ctaCompress: 'Komprimovat',
			ctaWhatsNew: 'Co je nového'
		},
		home: {
			searchPlaceholder: 'Hledat nástroje…',
			clearSearch: 'Vymazat hledání',
			toolsCount: 'nástrojů',
			toolsCountOne: 'nástroj',
			noResults: 'Žádné nástroje neodpovídají hledání',
			noResultsHint: 'Zkuste jiné klíčové slovo nebo kategorii',
			resetFilters: 'Resetovat filtry',
			favorites: 'Oblíbené',
			recent: 'Nedávno použité',
			all: 'Vše',
			whyTitle: 'Navrženo pro kartu, kterou už máte otevřenou',
			featurePrivateTitle: 'Zůstane na tomto zařízení',
			featurePrivateDesc: 'Zpracování běží lokálně. Nic se nenahrává na server.',
			featureFastTitle: 'Připravené, když je soubor',
			featureFastDesc: 'Otevřete nástroj, vložte PDF, stáhněte výsledek — bez fronty na účet.',
			featureDarkTitle: 'Funguje i po první návštěvě',
			featureDarkDesc: 'Nainstalujte jako aplikaci a pracujte i bez sítě.',
			addFavorite: 'Přidat do oblíbených',
			removeFavorite: 'Odebrat z oblíbených',
			guides: 'Návody',
			guidesSubtitle: 'Postupné tutoriály pro oblíbené PDF úkoly'
		},
		footer: {
			tagline: 'nástrojů zdarma · 100 % v prohlížeči · bez nahrávání'
		},
		tool: {
			copyShareLink: 'Kopírovat odkaz',
			linkCopied: 'Odkaz zkopírován',
			shareHint: 'URL obsahuje nastavení nástroje, pokud jsou k dispozici',
			howItWorks: 'Jak to funguje',
			new: 'Nové'
		},
		landing: {
			aboutTitle: 'O tomto nástroji',
			benefitsTitle: 'Proč použít WeLovePDF?',
			faqTitle: 'Často kladené otázky'
		},
		changelog: {
			title: 'Co je nového',
			subtitle: 'Nejnovější produktové aktualizace, nástroje a UX vylepšení ve WeLovePDF.',
			updated: 'Aktualizováno červenec 2026',
			statsSuffix: 'nástrojů zdarma · 100 % v prohlížeči · bez nahrávání',
			jumpTo: 'Přeskočit na',
			newToolsTitle: 'Nové nástroje',
			newToolsSubtitle: 'Nedávno přidané — vyzkoušejte jedním kliknutím.',
			newToolsBadge: 'nových nástrojů',
			exploreAll: 'Procházet všechny nástroje',
			openTool: 'Vyzkoušet',
			showAll: 'Zobrazit vše',
			showLess: 'Zobrazit méně'
		},
		categories: {
			organize: 'Organizovat PDF',
			optimize: 'Optimalizovat PDF',
			convert: 'Převést PDF',
			edit: 'Upravit PDF',
			security: 'Zabezpečení PDF'
		},
		tools: toolsCs,
		workspace: workspaceCs,
		commandPalette: {
			title: 'Přejít na nástroj',
			placeholder: 'Hledat nástroje…',
			noResults: 'Žádné výsledky',
			hint: 'Tip: stiskněte ⌘K kdykoli'
		},
		homeDrop: {
			title: 'Přetáhněte PDF sem',
			subtitle: 'Pak vyberte nástroj — nic neopustí tento prohlížeč.',
			dismiss: 'Zavřít',
			ticketLabel: 'Připraveno ke zpracování',
			analyzing: 'Načítám soubor…',
			releaseHint: 'Pusťte a vyberte nástroj',
			browseCta: 'nebo klikněte a vyberte'
		},
		workflow: {
			title: 'Bezpečný PDF workflow',
			subtitle: 'Sloučit → Komprimovat → Chránit v jednom postupu',
			stepMerge: 'Sloučit PDF',
			stepCompress: 'Komprimovat',
			stepProtect: 'Chránit heslem',
			next: 'Pokračovat',
			back: 'Zpět',
			finish: 'Stáhnout chráněné PDF',
			download: 'Stáhnout'
		},
		guides: {
			title: 'Návody a tutoriály',
			subtitle: 'Postup pro oblíbené PDF úkoly',
			readGuide: 'Přečíst návod',
			backToGuides: '← Všechny návody',
			onThisPage: 'Na této stránce',
			previous: 'Předchozí',
			next: 'Další'
		},
		shortcuts: {
			title: 'Klávesové zkratky',
			search: 'Fokus hledání na homepage',
			commandPalette: 'Otevřít command palette',
			help: 'Zobrazit nápovědu',
			goMerge: 'Přejít na Sloučit PDF',
			swUpdate: 'Nová verze — obnovte stránku',
			swRefresh: 'Obnovit',
			close: 'Zavřít'
		},
		theme: {
			light: 'Světlý',
			dark: 'Tmavý',
			switchToLight: 'Přepnout na světlý režim',
			switchToDark: 'Přepnout na tmavý režim'
		}
	},
	de: {
		nav: {
			allTools: 'Alle Tools',
			view: 'Ansehen',
			merge: 'Zusammenfügen',
			backToTools: '← Werkzeuge',
			whatsNew: 'Neuigkeiten',
			guides: 'Anleitungen'
		},
		hero: {
			badge: 'kostenlose Tools, komplett im Browser',
			title: 'WeLovePDF',
			subtitle:
				'Zusammenfügen, Teilen, Signieren und Komprimieren ohne Upload. PDF hierher ziehen — Dateien bleiben bei Ihnen.',
			ctaMerge: 'PDF zusammenfügen',
			ctaView: 'PDF ansehen',
			ctaCompress: 'Komprimieren',
			ctaWhatsNew: 'Neuigkeiten'
		},
		home: {
			searchPlaceholder: 'Tools suchen…',
			clearSearch: 'Suche löschen',
			toolsCount: 'Tools',
			toolsCountOne: 'Tool',
			noResults: 'Keine Tools gefunden',
			noResultsHint: 'Andere Suchbegriffe oder Kategorie versuchen',
			resetFilters: 'Filter zurücksetzen',
			favorites: 'Favoriten',
			recent: 'Zuletzt verwendet',
			all: 'Alle',
			whyTitle: 'Für den Tab, den Sie schon offen haben',
			featurePrivateTitle: 'Bleibt auf diesem Gerät',
			featurePrivateDesc: 'Verarbeitung lokal. Nichts wird auf einen Server hochgeladen.',
			featureFastTitle: 'Bereit, wenn die Datei da ist',
			featureFastDesc: 'Tool öffnen, PDF ablegen, Ergebnis laden — ohne Konto-Warteschlange.',
			featureDarkTitle: 'Funktioniert nach dem ersten Besuch',
			featureDarkDesc: 'Als App installieren und auch ohne Netz weiterarbeiten.',
			addFavorite: 'Zu Favoriten hinzufügen',
			removeFavorite: 'Aus Favoriten entfernen',
			guides: 'Anleitungen',
			guidesSubtitle: 'Schritt-für-Schritt-Tutorials für beliebte PDF-Aufgaben'
		},
		footer: {
			tagline: 'kostenlose Tools · 100 % im Browser · keine Uploads'
		},
		tool: {
			copyShareLink: 'Link kopieren',
			linkCopied: 'Link kopiert',
			shareHint: 'URL enthält Tool-Optionen, falls verfügbar',
			howItWorks: 'So funktioniert es',
			new: 'Neu'
		},
		landing: {
			aboutTitle: 'Über dieses Tool',
			benefitsTitle: 'Warum WeLovePDF?',
			faqTitle: 'Häufig gestellte Fragen'
		},
		changelog: {
			title: 'Neuigkeiten',
			subtitle: 'Aktuelle Produktupdates, Tools und UX-Verbesserungen in WeLovePDF.',
			updated: 'Aktualisiert Juli 2026',
			statsSuffix: 'kostenlose Tools · 100 % im Browser · keine Uploads',
			jumpTo: 'Springen zu',
			newToolsTitle: 'Neue Tools',
			newToolsSubtitle: 'Kürzlich hinzugefügt — mit einem Klick ausprobieren.',
			newToolsBadge: 'neue Tools',
			exploreAll: 'Alle Tools durchsuchen',
			openTool: 'Ausprobieren',
			showAll: 'Alle anzeigen',
			showLess: 'Weniger anzeigen'
		},
		categories: {
			organize: 'PDF organisieren',
			optimize: 'PDF optimieren',
			convert: 'PDF konvertieren',
			edit: 'PDF bearbeiten',
			security: 'PDF-Sicherheit'
		},
		tools: toolsDe,
		workspace: workspaceDe,
		commandPalette: {
			title: 'Tool öffnen',
			placeholder: 'Tools suchen…',
			noResults: 'Keine Ergebnisse',
			hint: 'Tipp: ⌘K jederzeit drücken'
		},
		homeDrop: {
			title: 'PDF hier ablegen',
			subtitle: 'Als Nächstes ein Werkzeug wählen — nichts verlässt diesen Browser.',
			dismiss: 'Schließen',
			ticketLabel: 'Bereit zur Verarbeitung',
			analyzing: 'Datei wird gelesen…',
			releaseHint: 'Loslassen und Werkzeug wählen',
			browseCta: 'oder klicken zum Auswählen'
		},
		workflow: {
			title: 'Sicheres PDF-Workflow',
			subtitle: 'Zusammenfügen → Komprimieren → Schützen in einem Ablauf',
			stepMerge: 'PDFs zusammenfügen',
			stepCompress: 'Komprimieren',
			stepProtect: 'Mit Passwort schützen',
			next: 'Weiter',
			back: 'Zurück',
			finish: 'Geschütztes PDF herunterladen',
			download: 'Herunterladen'
		},
		guides: {
			title: 'Anleitungen & Tutorials',
			subtitle: 'Schritt-für-Schritt-Hilfe für beliebte PDF-Aufgaben',
			readGuide: 'Anleitung lesen',
			backToGuides: '← Alle Anleitungen',
			onThisPage: 'Auf dieser Seite',
			previous: 'Zurück',
			next: 'Weiter'
		},
		shortcuts: {
			title: 'Tastenkürzel',
			search: 'Suche auf der Startseite fokussieren',
			commandPalette: 'Befehlspalette öffnen',
			help: 'Diese Hilfe anzeigen',
			goMerge: 'Zu PDF zusammenfügen',
			swUpdate: 'Neue Version — Seite aktualisieren',
			swRefresh: 'Aktualisieren',
			close: 'Schließen'
		},
		theme: {
			light: 'Hell',
			dark: 'Dunkel',
			switchToLight: 'Zum hellen Modus wechseln',
			switchToDark: 'Zum dunklen Modus wechseln'
		}
	},
	pl: {
		nav: {
			allTools: 'Wszystkie narzędzia',
			view: 'Podgląd',
			merge: 'Połącz',
			backToTools: '← Narzędzia',
			whatsNew: 'Co nowego',
			guides: 'Poradniki'
		},
		hero: {
			badge: 'darmowe narzędzia, w całości w przeglądarce',
			title: 'WeLovePDF',
			subtitle:
				'Łączenie, dzielenie, podpis i kompresja bez wysyłania. Upuść PDF na tej stronie — pliki zostają u Ciebie.',
			ctaMerge: 'Połącz PDF',
			ctaView: 'Podgląd PDF',
			ctaCompress: 'Kompresuj',
			ctaWhatsNew: 'Co nowego'
		},
		home: {
			searchPlaceholder: 'Szukaj narzędzi…',
			clearSearch: 'Wyczyść wyszukiwanie',
			toolsCount: 'narzędzi',
			toolsCountOne: 'narzędzie',
			noResults: 'Brak pasujących narzędzi',
			noResultsHint: 'Spróbuj innego słowa kluczowego lub kategorii',
			resetFilters: 'Resetuj filtry',
			favorites: 'Ulubione',
			recent: 'Ostatnio używane',
			all: 'Wszystkie',
			whyTitle: 'Zbudowane pod kartę, którą już masz otwartą',
			featurePrivateTitle: 'Zostaje na tym urządzeniu',
			featurePrivateDesc: 'Przetwarzanie lokalnie. Nic nie trafia na serwer.',
			featureFastTitle: 'Gotowe, gdy plik jest',
			featureFastDesc: 'Otwórz narzędzie, upuść PDF, pobierz wynik — bez kolejki do konta.',
			featureDarkTitle: 'Działa po pierwszej wizycie',
			featureDarkDesc: 'Zainstaluj jako aplikację i pracuj także bez sieci.',
			addFavorite: 'Dodaj do ulubionych',
			removeFavorite: 'Usuń z ulubionych',
			guides: 'Poradniki',
			guidesSubtitle: 'Samouczki krok po kroku dla popularnych zadań PDF'
		},
		footer: {
			tagline: 'darmowe narzędzia · 100% w przeglądarce · bez uploadów'
		},
		tool: {
			copyShareLink: 'Kopiuj link',
			linkCopied: 'Link skopiowany',
			shareHint: 'URL zawiera ustawienia narzędzia, jeśli są dostępne',
			howItWorks: 'Jak to działa',
			new: 'Nowe'
		},
		landing: {
			aboutTitle: 'O tym narzędziu',
			benefitsTitle: 'Dlaczego WeLovePDF?',
			faqTitle: 'Często zadawane pytania'
		},
		changelog: {
			title: 'Co nowego',
			subtitle: 'Najnowsze aktualizacje produktu, narzędzi i UX w WeLovePDF.',
			updated: 'Zaktualizowano lipiec 2026',
			statsSuffix: 'darmowych narzędzi · 100% w przeglądarce · bez uploadów',
			jumpTo: 'Przejdź do',
			newToolsTitle: 'Nowe narzędzia',
			newToolsSubtitle: 'Niedawno dodane — wypróbuj jednym kliknięciem.',
			newToolsBadge: 'nowych narzędzi',
			exploreAll: 'Przeglądaj wszystkie narzędzia',
			openTool: 'Wypróbuj',
			showAll: 'Pokaż wszystko',
			showLess: 'Pokaż mniej'
		},
		categories: {
			organize: 'Organizuj PDF',
			optimize: 'Optymalizuj PDF',
			convert: 'Konwertuj PDF',
			edit: 'Edytuj PDF',
			security: 'Bezpieczeństwo PDF'
		},
		tools: toolsPl,
		workspace: workspacePl,
		commandPalette: {
			title: 'Przejdź do narzędzia',
			placeholder: 'Szukaj narzędzi…',
			noResults: 'Brak wyników',
			hint: 'Wskazówka: naciśnij ⌘K'
		},
		homeDrop: {
			title: 'Upuść PDF tutaj',
			subtitle: 'Następnie wybierz narzędzie — nic nie opuszcza tej przeglądarki.',
			dismiss: 'Zamknij',
			ticketLabel: 'Gotowe do przetworzenia',
			analyzing: 'Odczytywanie pliku…',
			releaseHint: 'Puść i wybierz narzędzie',
			browseCta: 'lub kliknij, aby wybrać'
		},
		workflow: {
			title: 'Bezpieczny workflow PDF',
			subtitle: 'Połącz → Kompresuj → Chroń w jednym przepływie',
			stepMerge: 'Połącz PDF',
			stepCompress: 'Kompresuj',
			stepProtect: 'Chroń hasłem',
			next: 'Kontynuuj',
			back: 'Wstecz',
			finish: 'Pobierz chroniony PDF',
			download: 'Pobierz'
		},
		guides: {
			title: 'Poradniki i tutoriale',
			subtitle: 'Krok po kroku dla popularnych zadań PDF',
			readGuide: 'Czytaj poradnik',
			backToGuides: '← Wszystkie poradniki',
			onThisPage: 'Na tej stronie',
			previous: 'Poprzedni',
			next: 'Następny'
		},
		shortcuts: {
			title: 'Skróty klawiszowe',
			search: 'Fokus wyszukiwania na stronie głównej',
			commandPalette: 'Otwórz paletę poleceń',
			help: 'Pokaż tę pomoc',
			goMerge: 'Przejdź do Połącz PDF',
			swUpdate: 'Nowa wersja — odśwież stronę',
			swRefresh: 'Odśwież',
			close: 'Zamknij'
		},
		theme: {
			light: 'Jasny',
			dark: 'Ciemny',
			switchToLight: 'Przełącz na jasny tryb',
			switchToDark: 'Przełącz na ciemny tryb'
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
