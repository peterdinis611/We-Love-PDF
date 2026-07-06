import type { Locale } from './locale';

export type ToolTranslation = { name: string; description: string };

export type Messages = {
	nav: {
		allTools: string;
		view: string;
		merge: string;
		backToTools: string;
		whatsNew: string;
	};
	hero: {
		badge: string;
		title: string;
		subtitle: string;
		ctaMerge: string;
		ctaView: string;
		ctaCompress: string;
	};
	home: {
		favorites: string;
		recent: string;
		searchPlaceholder: string;
		clearSearch: string;
		toolsCount: string;
		toolsCountOne: string;
		noResults: string;
		noResultsHint: string;
		resetFilters: string;
		all: string;
		whyTitle: string;
		featurePrivateTitle: string;
		featurePrivateDesc: string;
		featureFastTitle: string;
		featureFastDesc: string;
		featureDarkTitle: string;
		featureDarkDesc: string;
	};
	footer: {
		tagline: string;
	};
	tool: {
		copyShareLink: string;
		linkCopied: string;
		shareHint: string;
		howItWorks: string;
		new: string;
	};
	landing: {
		aboutTitle: string;
		benefitsTitle: string;
		faqTitle: string;
	};
	categories: Record<string, string>;
	tools: Record<string, ToolTranslation>;
};

const en: Messages = {
	nav: {
		allTools: 'All Tools',
		view: 'View',
		merge: 'Merge',
		backToTools: '← Tools',
		whatsNew: "What's new"
	},
	hero: {
		badge: 'free tools · 100% in-browser',
		title: 'Every PDF tool you need',
		subtitle:
			'Merge, split, compress, sign, watermark, encrypt — fast, private, and completely free. Your files never leave your device.',
		ctaMerge: 'Merge PDF',
		ctaView: 'View PDF',
		ctaCompress: 'Compress'
	},
	home: {
		favorites: 'Favorites',
		recent: 'Recently used',
		searchPlaceholder: 'Search tools…',
		clearSearch: 'Clear search',
		toolsCount: 'tools',
		toolsCountOne: 'tool',
		noResults: 'No tools match your search',
		noResultsHint: 'Try a different keyword or category',
		resetFilters: 'Reset filters',
		all: 'All',
		whyTitle: 'Why WeLovePDF?',
		featurePrivateTitle: '100% Private',
		featurePrivateDesc: 'All processing happens locally. No uploads, no servers.',
		featureFastTitle: 'Lightning Fast',
		featureFastDesc: 'Instant results powered by modern browser PDF engines.',
		featureDarkTitle: 'Dark Mode',
		featureDarkDesc: 'Comfortable viewing day or night with theme switching.'
	},
	footer: {
		tagline: 'free tools · 100% in-browser · no uploads'
	},
	tool: {
		copyShareLink: 'Copy share link',
		linkCopied: 'Link copied',
		shareHint: 'Includes tool options from the URL when available',
		howItWorks: 'How it works',
		new: 'New'
	},
	landing: {
		aboutTitle: 'About this tool',
		benefitsTitle: 'Why use WeLovePDF?',
		faqTitle: 'Frequently asked questions'
	},
	categories: {
		organize: 'Organize PDF',
		optimize: 'Optimize PDF',
		convert: 'Convert PDF',
		edit: 'Edit PDF',
		security: 'PDF Security'
	},
	tools: {}
};

const sk: Messages = {
	nav: {
		allTools: 'Všetky nástroje',
		view: 'Zobraziť',
		merge: 'Spojiť',
		backToTools: '← Nástroje',
		whatsNew: 'Čo je nové'
	},
	hero: {
		badge: 'nástrojov zadarmo · 100 % v prehliadači',
		title: 'Všetky PDF nástroje, ktoré potrebujete',
		subtitle:
			'Spájanie, rozdeľovanie, kompresia, podpis, vodoznak, šifrovanie — rýchlo, súkromne a úplne zadarmo. Súbory nikdy neopustia vaše zariadenie.',
		ctaMerge: 'Spojiť PDF',
		ctaView: 'Zobraziť PDF',
		ctaCompress: 'Komprimovať'
	},
	home: {
		favorites: 'Obľúbené',
		recent: 'Nedávno použité',
		searchPlaceholder: 'Hľadať nástroje…',
		clearSearch: 'Vymazať hľadanie',
		toolsCount: 'nástrojov',
		toolsCountOne: 'nástroj',
		noResults: 'Žiadne nástroje nezodpovedajú hľadaniu',
		noResultsHint: 'Skúste iné kľúčové slovo alebo kategóriu',
		resetFilters: 'Resetovať filtre',
		all: 'Všetko',
		whyTitle: 'Prečo WeLovePDF?',
		featurePrivateTitle: '100 % súkromné',
		featurePrivateDesc: 'Všetko sa spracováva lokálne. Žiadne nahrávanie, žiadny server.',
		featureFastTitle: 'Bleskovo rýchle',
		featureFastDesc: 'Okamžité výsledky vďaka moderným PDF enginom v prehliadači.',
		featureDarkTitle: 'Tmavý režim',
		featureDarkDesc: 'Pohodlné používanie cez deň aj v noci.'
	},
	footer: {
		tagline: 'nástrojov zadarmo · 100 % v prehliadači · bez nahrávania'
	},
	tool: {
		copyShareLink: 'Kopírovať odkaz',
		linkCopied: 'Odkaz skopírovaný',
		shareHint: 'URL obsahuje nastavenia nástroja, ak sú k dispozícii',
		howItWorks: 'Ako to funguje',
		new: 'Nové'
	},
	landing: {
		aboutTitle: 'O tomto nástroji',
		benefitsTitle: 'Prečo použiť WeLovePDF?',
		faqTitle: 'Často kladené otázky'
	},
	categories: {
		organize: 'Organizovať PDF',
		optimize: 'Optimalizovať PDF',
		convert: 'Konvertovať PDF',
		edit: 'Upraviť PDF',
		security: 'Bezpečnosť PDF'
	},
	tools: {
		'merge-pdf': { name: 'Spojiť PDF', description: 'Spojte PDF súbory v ľubovoľnom poradí.' },
		'split-pdf': { name: 'Rozdeliť PDF', description: 'Rozdeľte PDF na samostatné súbory.' },
		'extract-pages': { name: 'Extrahovať strany', description: 'Vyberte a extrahujte konkrétne strany.' },
		'delete-pages': { name: 'Zmazať strany', description: 'Odstráňte nechcené strany z PDF.' },
		'organize-pdf': { name: 'Organizovať PDF', description: 'Zoraďte, presuňte alebo odstráňte strany.' },
		'compare-pdf': { name: 'Porovnať PDF', description: 'Porovnajte dva PDF a zvýraznite rozdiely v texte.' },
		'view-pdf': { name: 'Zobraziť PDF', description: 'Rýchly prehliadač PDF v prehliadači.' },
		'duplicate-pages': { name: 'Duplikovať strany', description: 'Skopírujte vybrané strany na koniec dokumentu.' },
		'batch-pdf': { name: 'Hromadné PDF', description: 'Spracujte viac PDF naraz a stiahnite ako ZIP.' },
		'compress-pdf': { name: 'Komprimovať PDF', description: 'Zmenšite veľkosť PDF súboru.' },
		'pdf-info': { name: 'Info o PDF', description: 'Zobrazte metadáta a vlastnosti dokumentu.' },
		'edit-metadata': { name: 'Upraviť metadáta', description: 'Zmeňte názov, autora a ďalšie vlastnosti.' },
		'remove-metadata': { name: 'Odstrániť metadáta', description: 'Vymažte metadáta pre súkromie.' },
		'images-to-pdf': { name: 'Obrázky do PDF', description: 'Konvertujte JPG a PNG do jedného PDF.' },
		'pdf-to-jpg': { name: 'PDF do JPG', description: 'Konvertujte strany PDF na obrázky JPG/PNG.' },
		'pdf-to-png': { name: 'PDF do PNG', description: 'Konvertujte strany PDF na PNG v ZIP archíve.' },
		'csv-to-pdf': { name: 'CSV do PDF', description: 'Tabuľku z CSV preveďte do PDF.' },
		'json-to-pdf': { name: 'JSON do PDF', description: 'JSON dáta ako PDF tabuľka.' },
		'xml-to-pdf': { name: 'XML do PDF', description: 'Štruktúrované XML ako PDF tabuľka.' },
		'excel-to-pdf': { name: 'Excel do PDF', description: 'Prvý hárok Excelu ako PDF tabuľka.' },
		'word-to-pdf': { name: 'Word do PDF', description: 'Konvertujte .docx dokument do PDF.' },
		'powerpoint-to-pdf': { name: 'PowerPoint do PDF', description: 'Text snímok z .pptx do PDF.' },
		'pdf-to-docx': { name: 'PDF do Word', description: 'Extrahujte text z PDF do .docx.' },
		'pdf-to-text': { name: 'PDF do textu', description: 'Extrahujte čitateľný text z PDF.' },
		'pdf-to-html': { name: 'PDF do HTML', description: 'Konvertujte text PDF do HTML.' },
		'txt-to-pdf': { name: 'Text do PDF', description: 'Obyčajný text ako formátované PDF.' },
		'html-to-pdf': { name: 'HTML do PDF', description: 'HTML stránku preveďte do PDF.' },
		'markdown-to-pdf': { name: 'Markdown do PDF', description: 'Markdown súbor ako štýlované PDF.' },
		'rotate-pdf': { name: 'Otočiť PDF', description: 'Otočte strany PDF podľa potreby.' },
		'watermark-pdf': { name: 'Vodoznak PDF', description: 'Pridajte textový vodoznak na každú stranu.' },
		'page-numbers': { name: 'Čísla strán', description: 'Pridajte číslovanie strán.' },
		'sign-pdf': { name: 'Podpísať PDF', description: 'Viditeľný textový podpis (nie certifikát).' },
		'flatten-pdf': { name: 'Zploštiť PDF', description: 'Zplošťte formuláre a anotácie.' },
		'crop-pdf': { name: 'Orezať PDF', description: 'Upravte orezové okraje strán.' },
		'redact-pdf': { name: 'Redigovať PDF', description: 'Natrvalo odstráňte citlivý text.' },
		'fill-pdf-form': { name: 'Vyplniť formulár', description: 'Vyplňte interaktívne polia PDF formulára.' },
		'protect-pdf': { name: 'Chrániť PDF', description: 'Zašifrujte PDF heslom.' },
		'unlock-pdf': { name: 'Odomknúť PDF', description: 'Odstráňte ochranu heslom.' },
		'change-pdf-password': { name: 'Zmeniť heslo PDF', description: 'Nahraďte heslo a oprávnenia.' },
		'pdf-security-check': { name: 'Kontrola bezpečnosti', description: 'Skontrolujte šifrovanie a oprávnenia.' },
		'pdf-signature-check': { name: 'Kontrola podpisu', description: 'Zistite, či je PDF digitálne podpísané.' },
		'digital-sign-pdf': { name: 'Digitálny podpis', description: 'PKCS#7 podpis certifikátom .p12 / .pfx.' }
	}
};

const catalogs: Record<Locale, Messages> = { en, sk };

export function getMessages(locale: Locale): Messages {
	return catalogs[locale];
}

export function categoryLabel(category: string, locale: Locale): string {
	return catalogs[locale].categories[category] ?? category;
}

export function toolTranslation(slug: string, locale: Locale): ToolTranslation | undefined {
	return catalogs[locale].tools[slug];
}
