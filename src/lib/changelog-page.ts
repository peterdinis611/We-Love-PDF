import type { Locale } from '$lib/i18n/locale';

export type ChangelogItem = {
	title: string;
	description: string;
	/** Link to a tool page when set */
	toolSlug?: string;
	highlight?: boolean;
};

export type ChangelogSection = {
	id: string;
	title: string;
	subtitle?: string;
	items: ChangelogItem[];
};

type ChangelogPage = {
	title: string;
	subtitle: string;
	updated: string;
	stats: string;
	sections: ChangelogSection[];
};

const en: ChangelogPage = {
	title: "What's new",
	subtitle: 'Recent product updates, tools, and UX improvements in WeLovePDF.',
	updated: 'July 2026',
	stats: '42 free tools · 100% in-browser · no uploads',
	sections: [
		{
			id: 'product',
			title: 'Product & growth',
			subtitle: 'SEO, localization, analytics, and offline support',
			items: [
				{
					title: 'i18n EN / SK',
					description: 'English at /, Slovak at /sk — homepage, navigation, tool names, categories, and footer.'
				},
				{
					title: 'SEO landing per tool',
					description:
						'Intro, benefits, and FAQ under each tool page, plus FAQ JSON-LD schema for search engines.'
				},
				{
					title: "What's new badges",
					description: 'Highlight recently added tools on cards and tool pages.'
				},
				{
					title: 'Plausible analytics',
					description: 'Optional page-view tracking via PUBLIC_PLAUSIBLE_DOMAIN — no file or upload tracking.'
				},
				{
					title: 'Better offline PWA',
					description:
						'Service worker v2 caches WASM, /_app/ assets, and the app shell for faster repeat visits and limited offline use.'
				},
				{
					title: 'Vercel deployment fixes',
					description: 'Explicit adapter-vercel and @embedpdf/models as a direct dependency for reliable CI builds.'
				}
			]
		},
		{
			id: 'tools-office',
			title: 'Office & signing',
			items: [
				{
					title: 'Word to PDF',
					description: 'Convert .docx documents to PDF in the browser.',
					toolSlug: 'word-to-pdf',
					highlight: true
				},
				{
					title: 'PowerPoint to PDF',
					description: 'Extract slide text from .pptx into a PDF document.',
					toolSlug: 'powerpoint-to-pdf',
					highlight: true
				},
				{
					title: 'Digital Sign PDF',
					description: 'PKCS#7 signing with .p12 / .pfx certificates — password stays in your browser.',
					toolSlug: 'digital-sign-pdf',
					highlight: true
				},
				{
					title: 'PDF Signature Check',
					description: 'Inspect whether a PDF contains digital signature metadata.',
					toolSlug: 'pdf-signature-check',
					highlight: true
				}
			]
		},
		{
			id: 'tools-convert',
			title: 'Convert & compare',
			items: [
				{
					title: 'PDF to PNG',
					description: 'Lossless multi-page export as a ZIP archive with adjustable resolution.',
					toolSlug: 'pdf-to-png',
					highlight: true
				},
				{
					title: 'PDF to Word',
					description: 'Extract text from PDF pages into a .docx file.',
					toolSlug: 'pdf-to-docx',
					highlight: true
				},
				{
					title: 'CSV / JSON / XML / Excel to PDF',
					description: 'Turn structured data and spreadsheets into formatted PDF tables.',
					toolSlug: 'csv-to-pdf'
				},
				{
					title: 'Compare PDF',
					description: 'Side-by-side text comparison with per-page difference highlights.',
					toolSlug: 'compare-pdf',
					highlight: true
				}
			]
		},
		{
			id: 'tools-edit',
			title: 'Edit & security',
			items: [
				{
					title: 'Crop PDF',
					description: 'Trim page margins by adjusting the crop box.',
					toolSlug: 'crop-pdf'
				},
				{
					title: 'Redact PDF',
					description: 'Permanently remove sensitive text and replace it with black boxes.',
					toolSlug: 'redact-pdf'
				},
				{
					title: 'Remove Metadata',
					description: 'Strip document metadata for privacy.',
					toolSlug: 'remove-metadata'
				},
				{
					title: 'Fill PDF Form',
					description: 'Complete interactive PDF form fields in the browser.',
					toolSlug: 'fill-pdf-form'
				},
				{
					title: 'Batch PDF',
					description: 'Process multiple files in one run and download results as ZIP.',
					toolSlug: 'batch-pdf'
				},
				{
					title: 'Organize PDF',
					description: 'Drag-and-drop page reordering, sort, and blank-page cleanup.',
					toolSlug: 'organize-pdf'
				}
			]
		},
		{
			id: 'ux',
			title: 'UX improvements',
			subtitle: 'Across all tools',
			items: [
				{
					title: 'Favorites',
					description: 'Star tools on the homepage grid — stored locally in your browser.'
				},
				{
					title: 'Recent tools',
					description: 'Quick access to your last six used tools on the homepage.'
				},
				{
					title: 'Share link',
					description: 'Copy the current tool URL from any tool page.'
				},
				{
					title: 'How it works',
					description: 'Step-by-step guides above each tool workspace.'
				},
				{
					title: 'URL params in share links',
					description: 'Share tool settings via query string, e.g. ?scale=2&pages=1-3 on PDF to PNG.'
				},
				{
					title: 'Progress bars',
					description: 'Visual feedback during batch processing and multi-page ZIP exports.'
				},
				{
					title: 'Page thumbnails',
					description: 'Live page previews when merging or organizing PDFs.'
				},
				{
					title: 'View PDF shortcuts',
					description: 'Keyboard shortcuts for page navigation, zoom, fullscreen (F), and help (?).'
				},
				{
					title: 'Dark mode & PWA',
					description: 'Theme toggle, installable app manifest, and an enhanced service worker.'
				},
				{
					title: 'ZIP export',
					description: 'Multi-page PDF to JPG/PNG downloads bundled in one archive.'
				}
			]
		}
	]
};

const sk: ChangelogPage = {
	title: 'Čo je nové',
	subtitle: 'Najnovšie produktové aktualizácie, nástroje a UX vylepšenia vo WeLovePDF.',
	updated: 'júl 2026',
	stats: '42 nástrojov zadarmo · 100 % v prehliadači · bez nahrávania',
	sections: [
		{
			id: 'product',
			title: 'Produkt a rast',
			subtitle: 'SEO, lokalizácia, analytika a offline podpora',
			items: [
				{
					title: 'i18n EN / SK',
					description: 'Angličtina na /, slovenčina na /sk — homepage, navigácia, názvy nástrojov, kategórie a pätička.'
				},
				{
					title: 'SEO landing pre každý nástroj',
					description: 'Intro, výhody a FAQ pod stránkou nástroja vrátane FAQ JSON-LD schémy pre vyhľadávače.'
				},
				{
					title: 'Značky „Nové“',
					description: 'Zvýraznenie nedávno pridaných nástrojov na kartách a stránkach nástrojov.'
				},
				{
					title: 'Plausible analytika',
					description: 'Voliteľné sledovanie zobrazení stránok cez PUBLIC_PLAUSIBLE_DOMAIN — bez trackingu súborov.'
				},
				{
					title: 'Lepší offline PWA',
					description:
						'Service worker v2 ukladá WASM, /_app/ assety a app shell pre rýchlejšie opakované návštevy a obmedzené offline použitie.'
				},
				{
					title: 'Opravy nasadenia na Vercel',
					description: 'Explicitný adapter-vercel a @embedpdf/models ako priama závislosť pre spoľahlivé CI buildy.'
				}
			]
		},
		{
			id: 'tools-office',
			title: 'Office a podpis',
			items: [
				{
					title: 'Word do PDF',
					description: 'Konverzia .docx dokumentov do PDF v prehliadači.',
					toolSlug: 'word-to-pdf',
					highlight: true
				},
				{
					title: 'PowerPoint do PDF',
					description: 'Text snímok z .pptx do PDF dokumentu.',
					toolSlug: 'powerpoint-to-pdf',
					highlight: true
				},
				{
					title: 'Digitálny podpis PDF',
					description: 'PKCS#7 podpis certifikátom .p12 / .pfx — heslo zostáva v prehliadači.',
					toolSlug: 'digital-sign-pdf',
					highlight: true
				},
				{
					title: 'Kontrola podpisu PDF',
					description: 'Zistite, či PDF obsahuje digitálny podpis.',
					toolSlug: 'pdf-signature-check',
					highlight: true
				}
			]
		},
		{
			id: 'tools-convert',
			title: 'Konverzie a porovnanie',
			items: [
				{
					title: 'PDF do PNG',
					description: 'Bezstratný viacstránkový export ako ZIP archív s nastaviteľným rozlíšením.',
					toolSlug: 'pdf-to-png',
					highlight: true
				},
				{
					title: 'PDF do Word',
					description: 'Extrakcia textu zo strán PDF do súboru .docx.',
					toolSlug: 'pdf-to-docx',
					highlight: true
				},
				{
					title: 'CSV / JSON / XML / Excel do PDF',
					description: 'Štruktúrované dáta a tabuľky ako formátované PDF.',
					toolSlug: 'csv-to-pdf'
				},
				{
					title: 'Porovnať PDF',
					description: 'Porovnanie textu s rozdielmi po stránkach.',
					toolSlug: 'compare-pdf',
					highlight: true
				}
			]
		},
		{
			id: 'tools-edit',
			title: 'Úpravy a bezpečnosť',
			items: [
				{
					title: 'Orezať PDF',
					description: 'Úprava okrajov strán cez crop box.',
					toolSlug: 'crop-pdf'
				},
				{
					title: 'Redigovať PDF',
					description: 'Natrvalé odstránenie citlivého textu a čierne boxy.',
					toolSlug: 'redact-pdf'
				},
				{
					title: 'Odstrániť metadáta',
					description: 'Vymazanie metadát dokumentu pre súkromie.',
					toolSlug: 'remove-metadata'
				},
				{
					title: 'Vyplniť formulár PDF',
					description: 'Vyplnenie interaktívnych polí PDF formulára.',
					toolSlug: 'fill-pdf-form'
				},
				{
					title: 'Hromadné PDF',
					description: 'Spracovanie viacerých súborov naraz a stiahnutie ako ZIP.',
					toolSlug: 'batch-pdf'
				},
				{
					title: 'Organizovať PDF',
					description: 'Presúvanie strán drag-and-drop, triedenie a odstránenie prázdnych strán.',
					toolSlug: 'organize-pdf'
				}
			]
		},
		{
			id: 'ux',
			title: 'UX vylepšenia',
			subtitle: 'Naprieč všetkými nástrojmi',
			items: [
				{
					title: 'Obľúbené',
					description: 'Hviezdička na kartách nástrojov — uložené lokálne v prehliadači.'
				},
				{
					title: 'Nedávno použité',
					description: 'Rýchly prístup k posledným šiestim nástrojom na homepage.'
				},
				{
					title: 'Zdieľaný odkaz',
					description: 'Kopírovanie URL aktuálneho nástroja z ľubovoľnej tool stránky.'
				},
				{
					title: 'Ako to funguje',
					description: 'Kroky nad pracovnou plochou každého nástroja.'
				},
				{
					title: 'URL parametre v odkazoch',
					description: 'Zdieľanie nastavení cez query string, napr. ?scale=2&pages=1-3 pri PDF do PNG.'
				},
				{
					title: 'Progress bary',
					description: 'Vizuálna spätná väzba pri batch spracovaní a viacstránkovom ZIP exporte.'
				},
				{
					title: 'Náhľady strán',
					description: 'Živé miniatúry pri spájaní alebo organizovaní PDF.'
				},
				{
					title: 'Skratky v Zobraziť PDF',
					description: 'Klávesové skratky pre stránky, zoom, fullscreen (F) a nápovedu (?).'
				},
				{
					title: 'Tmavý režim a PWA',
					description: 'Prepínač témy, inštalovateľná aplikácia a vylepšený service worker.'
				},
				{
					title: 'ZIP export',
					description: 'Viacstránkový PDF → JPG/PNG export v jednom archíve.'
				}
			]
		}
	]
};

const pages: Record<Locale, ChangelogPage> = { en, sk };

export function getChangelogPage(locale: Locale): ChangelogPage {
	return pages[locale];
}
