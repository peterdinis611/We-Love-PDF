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
		ctaWhatsNew: string;
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
	changelog: {
		title: string;
		subtitle: string;
		updated: string;
		statsSuffix: string;
		jumpTo: string;
		newToolsTitle: string;
		newToolsSubtitle: string;
		newToolsBadge: string;
		exploreAll: string;
		openTool: string;
		showAll: string;
		showLess: string;
		sections: Record<string, { title: string; subtitle?: string }>;
		items: Record<string, { title: string; description: string }>;
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
		ctaCompress: 'Compress',
		ctaWhatsNew: "What's new"
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
	changelog: {
		title: "What's new",
		subtitle: 'Recent product updates, tools, and UX improvements in WeLovePDF.',
		updated: 'Updated July 2026',
		statsSuffix: 'free tools · 100% in-browser · no uploads',
		jumpTo: 'Jump to',
		newToolsTitle: 'New tools',
		newToolsSubtitle: 'Recently added — try them in one click.',
		newToolsBadge: 'new tools',
		exploreAll: 'Browse all tools',
		openTool: 'Try it',
		showAll: 'Show all',
		showLess: 'Show less',
		sections: {
			product: {
				title: 'Product & growth',
				subtitle: 'SEO, localization, analytics, and offline support'
			},
			'tools-office': { title: 'Office & signing' },
			'tools-convert': { title: 'Convert & compare' },
			'tools-edit': { title: 'Edit & security' },
			ux: { title: 'UX improvements', subtitle: 'Across all tools' }
		},
		items: {
			i18n: {
				title: 'i18n EN / SK',
				description:
					'English at /, Slovak at /sk — homepage, navigation, tool names, categories, and footer.'
			},
			'seo-landing': {
				title: 'SEO landing per tool',
				description:
					'Intro, benefits, and FAQ under each tool page, plus FAQ JSON-LD schema for search engines.'
			},
			'whats-new-badges': {
				title: "What's new badges",
				description: 'Highlight recently added tools on cards and tool pages.'
			},
			plausible: {
				title: 'Plausible analytics',
				description:
					'Optional page-view tracking via PUBLIC_PLAUSIBLE_DOMAIN — no file or upload tracking.'
			},
			'offline-pwa': {
				title: 'Better offline PWA',
				description:
					'Service worker caches WASM, /_app/ assets, and the app shell for faster repeat visits and limited offline use.'
			},
			'vercel-fixes': {
				title: 'Vercel deployment fixes',
				description:
					'Explicit adapter-vercel and @embedpdf/models as a direct dependency for reliable CI builds.'
			},
			'data-to-pdf': {
				title: 'CSV / JSON / XML / Excel to PDF',
				description: 'Turn structured data and spreadsheets into formatted PDF tables.'
			},
			favorites: {
				title: 'Favorites',
				description: 'Star tools on the homepage grid — stored locally in your browser.'
			},
			'recent-tools': {
				title: 'Recent tools',
				description: 'Quick access to your last six used tools on the homepage.'
			},
			'share-link': {
				title: 'Share link',
				description: 'Copy the current tool URL from any tool page.'
			},
			'how-it-works': {
				title: 'How it works',
				description: 'Step-by-step guides above each tool workspace.'
			},
			'url-params': {
				title: 'URL params in share links',
				description: 'Share tool settings via query string, e.g. ?scale=2&pages=1-3 on PDF to PNG.'
			},
			'progress-bars': {
				title: 'Progress bars',
				description: 'Visual feedback during batch processing and multi-page ZIP exports.'
			},
			'page-thumbnails': {
				title: 'Page thumbnails',
				description: 'Live page previews when merging or organizing PDFs.'
			},
			'view-shortcuts': {
				title: 'View PDF shortcuts',
				description: 'Keyboard shortcuts for page navigation, zoom, fullscreen (F), and help (?).'
			},
			'dark-pwa': {
				title: 'Dark mode & PWA',
				description: 'Theme toggle, installable app manifest, and an enhanced service worker.'
			},
			'zip-export': {
				title: 'ZIP export',
				description: 'Multi-page PDF to JPG/PNG downloads bundled in one archive.'
			}
		}
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
		ctaCompress: 'Komprimovať',
		ctaWhatsNew: 'Čo je nové'
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
	changelog: {
		title: 'Čo je nové',
		subtitle: 'Najnovšie produktové aktualizácie, nástroje a UX vylepšenia vo WeLovePDF.',
		updated: 'Aktualizované júl 2026',
		statsSuffix: 'nástrojov zadarmo · 100 % v prehliadači · bez nahrávania',
		jumpTo: 'Preskočiť na',
		newToolsTitle: 'Nové nástroje',
		newToolsSubtitle: 'Nedávno pridané — vyskúšajte jedným klikom.',
		newToolsBadge: 'nových nástrojov',
		exploreAll: 'Prehliadať všetky nástroje',
		openTool: 'Vyskúšať',
		showAll: 'Zobraziť všetko',
		showLess: 'Zobraziť menej',
		sections: {
			product: {
				title: 'Produkt a rast',
				subtitle: 'SEO, lokalizácia, analytika a offline podpora'
			},
			'tools-office': { title: 'Office a podpis' },
			'tools-convert': { title: 'Konverzie a porovnanie' },
			'tools-edit': { title: 'Úpravy a bezpečnosť' },
			ux: { title: 'UX vylepšenia', subtitle: 'Naprieč všetkými nástrojmi' }
		},
		items: {
			i18n: {
				title: 'i18n EN / SK',
				description:
					'Angličtina na /, slovenčina na /sk — homepage, navigácia, názvy nástrojov, kategórie a pätička.'
			},
			'seo-landing': {
				title: 'SEO landing pre každý nástroj',
				description: 'Intro, výhody a FAQ pod stránkou nástroja vrátane FAQ JSON-LD schémy.'
			},
			'whats-new-badges': {
				title: 'Značky „Nové“',
				description: 'Zvýraznenie nedávno pridaných nástrojov na kartách a stránkach nástrojov.'
			},
			plausible: {
				title: 'Plausible analytika',
				description:
					'Voliteľné sledovanie zobrazení cez PUBLIC_PLAUSIBLE_DOMAIN — bez trackingu súborov.'
			},
			'offline-pwa': {
				title: 'Lepší offline PWA',
				description:
					'Service worker ukladá WASM, /_app/ assety a app shell pre rýchlejšie opakované návštevy.'
			},
			'vercel-fixes': {
				title: 'Opravy nasadenia na Vercel',
				description: 'Explicitný adapter-vercel a @embedpdf/models pre spoľahlivé CI buildy.'
			},
			'data-to-pdf': {
				title: 'CSV / JSON / XML / Excel do PDF',
				description: 'Štruktúrované dáta a tabuľky ako formátované PDF.'
			},
			favorites: {
				title: 'Obľúbené',
				description: 'Hviezdička na kartách — uložené lokálne v prehliadači.'
			},
			'recent-tools': {
				title: 'Nedávno použité',
				description: 'Rýchly prístup k posledným šiestim nástrojom na homepage.'
			},
			'share-link': {
				title: 'Zdieľaný odkaz',
				description: 'Kopírovanie URL aktuálneho nástroja z ľubovoľnej tool stránky.'
			},
			'how-it-works': {
				title: 'Ako to funguje',
				description: 'Kroky nad pracovnou plochou každého nástroja.'
			},
			'url-params': {
				title: 'URL parametre v odkazoch',
				description: 'Zdieľanie nastavení cez query string, napr. ?scale=2&pages=1-3.'
			},
			'progress-bars': {
				title: 'Progress bary',
				description: 'Vizuálna spätná väzba pri batch spracovaní a ZIP exporte.'
			},
			'page-thumbnails': {
				title: 'Náhľady strán',
				description: 'Živé miniatúry pri spájaní alebo organizovaní PDF.'
			},
			'view-shortcuts': {
				title: 'Skratky v Zobraziť PDF',
				description: 'Klávesové skratky pre stránky, zoom, fullscreen (F) a nápovedu (?).'
			},
			'dark-pwa': {
				title: 'Tmavý režim a PWA',
				description: 'Prepínač témy, inštalovateľná aplikácia a vylepšený service worker.'
			},
			'zip-export': {
				title: 'ZIP export',
				description: 'Viacstránkový PDF → JPG/PNG export v jednom archíve.'
			}
		}
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
