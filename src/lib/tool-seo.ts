import type { Locale } from '$lib/i18n/locale';

export interface ToolSeoContent {
	title: string;
	description: string;
	intro: string;
	benefits: string[];
	faq: { question: string; answer: string }[];
}

const CUSTOM: Partial<Record<string, Partial<Record<Locale, ToolSeoContent>>>> = {
	'merge-pdf': {
		en: {
			title: 'Merge PDF Free Online',
			description:
				'Combine multiple PDF files into one document for free. No signup, no upload to servers — merge PDFs privately in your browser.',
			intro:
				'Merge PDF files in seconds. Upload two or more documents, drag to reorder, and download a single combined PDF. Everything runs locally in your browser.',
			benefits: [
				'Free with no page limits',
				'Drag-and-drop file reordering',
				'Optional blank page between documents',
				'100% private — files never leave your device'
			],
			faq: [
				{
					question: 'Is merging PDFs free?',
					answer: 'Yes. WeLovePDF is completely free with no account required.'
				},
				{
					question: 'Are my files uploaded to a server?',
					answer: 'No. All merging happens in your browser using client-side PDF libraries.'
				},
				{
					question: 'How many PDFs can I merge?',
					answer: 'There is no fixed limit — limited only by your device memory.'
				}
			]
		},
		sk: {
			title: 'Spojiť PDF zadarmo online',
			description:
				'Spojte viacero PDF súborov do jedného dokumentu zadarmo. Bez registrácie a bez nahrávania na server — súkromne v prehliadači.',
			intro:
				'Spojte PDF súbory za pár sekúnd. Nahrajte dva alebo viac dokumentov, pretiahnite ich do poradia a stiahnite jeden výsledný PDF.',
			benefits: [
				'Úplne zadarmo bez limitu strán',
				'Presúvanie súborov drag-and-drop',
				'Voliteľná prázdna strana medzi dokumentmi',
				'100 % súkromné — súbory neopustia zariadenie'
			],
			faq: [
				{
					question: 'Je spájanie PDF zadarmo?',
					answer: 'Áno. WeLovePDF je úplne zadarmo a nevyžaduje účet.'
				},
				{
					question: 'Nahrávajú sa moje súbory na server?',
					answer: 'Nie. Všetko prebieha v prehliadači pomocou klientských PDF knižníc.'
				},
				{
					question: 'Koľko PDF môžem spojiť?',
					answer: 'Žiadny pevný limit — obmedzuje len pamäť vášho zariadenia.'
				}
			]
		}
	},
	'pdf-to-png': {
		en: {
			title: 'PDF to PNG Free — Convert Pages to Images',
			description:
				'Convert PDF pages to lossless PNG images and download as a ZIP. Adjustable resolution, free and private.',
			intro:
				'Turn every page of your PDF into a high-quality PNG image. Choose scale and page range, then download all images in one ZIP archive.',
			benefits: [
				'Lossless PNG output',
				'Multi-page ZIP download',
				'Adjustable render scale (1×–4×)',
				'Runs entirely in your browser'
			],
			faq: [
				{
					question: 'PNG or JPG — which should I use?',
					answer: 'PNG is lossless and best for screenshots or graphics. Use PDF to JPG for smaller photo-like files.'
				},
				{
					question: 'Can I convert only some pages?',
					answer: 'Yes. Enter a page range like 1-3, 5 before converting.'
				}
			]
		},
		sk: {
			title: 'PDF do PNG zadarmo — konverzia strán na obrázky',
			description:
				'Preveďte strany PDF na PNG bez straty kvality a stiahnite ako ZIP. Nastaviteľné rozlíšenie, zadarmo a súkromne.',
			intro:
				'Každú stranu PDF premeníte na kvalitný PNG obrázok. Zvoľte mierku a rozsah strán a stiahnite všetky obrázky v jednom ZIP archíve.',
			benefits: [
				'PNG bez straty kvality',
				'ZIP pre viac strán',
				'Mierka vykreslenia 1×–4×',
				'Beží celé v prehliadači'
			],
			faq: [
				{
					question: 'PNG alebo JPG?',
					answer: 'PNG je bezstratový a vhodný pre grafiku. Pre menšie fotografie použite PDF do JPG.'
				},
				{
					question: 'Môžem konvertovať len niektoré strany?',
					answer: 'Áno. Zadajte rozsah strán, napríklad 1-3, 5.'
				}
			]
		}
	},
	'compress-pdf': {
		en: {
			title: 'Compress PDF Free Online',
			description: 'Reduce PDF file size for free. Optimize and strip metadata — private, in-browser compression.',
			intro: 'Shrink PDF files by removing unnecessary metadata and optimizing the document structure. No quality loss for text-based PDFs.',
			benefits: ['Free PDF compression', 'Metadata cleanup', 'Instant download', 'No file uploads'],
			faq: [
				{
					question: 'How much can I compress a PDF?',
					answer: 'Results vary. Scanned PDFs compress less than text-only documents.'
				},
				{ question: 'Is it safe?', answer: 'Yes — processing is 100% local in your browser.' }
			]
		},
		sk: {
			title: 'Komprimovať PDF zadarmo online',
			description: 'Zmenšite PDF zadarmo. Optimalizácia a odstránenie metadát — súkromne v prehliadači.',
			intro: 'Zmenšite PDF odstránením metadát a optimalizáciou štruktúry dokumentu.',
			benefits: ['Komprimácia zadarmo', 'Čistenie metadát', 'Okamžité stiahnutie', 'Bez nahrávania'],
			faq: [
				{
					question: 'O koľko zmenším PDF?',
					answer: 'Záleží na type PDF. Skenované súbory sa komprimujú menej ako textové.'
				},
				{ question: 'Je to bezpečné?', answer: 'Áno — spracovanie je 100 % lokálne.' }
			]
		}
	},
	'digital-sign-pdf': {
		en: {
			title: 'Digital Sign PDF with Certificate (.p12 / .pfx)',
			description:
				'Apply a PKCS#7 digital signature to your PDF using your own certificate. Free, private, verifiable in Adobe Acrobat.',
			intro:
				'Sign PDFs with a real digital certificate — not just a text overlay. Upload your PDF and .p12/.pfx file; your private key never leaves the browser.',
			benefits: [
				'PKCS#7 detached signature',
				'Certificate stays on your device',
				'Verifiable in Adobe Reader',
				'Supports .p12 and .pfx files'
			],
			faq: [
				{
					question: 'Is this the same as Sign PDF (text)?',
					answer: 'No. Digital Sign PDF creates a cryptographic PKCS#7 signature. Sign PDF only adds visible text.'
				},
				{
					question: 'Will Adobe trust my signature?',
					answer: 'Adobe verifies the signature structure. Trust depends on your certificate authority.'
				}
			]
		},
		sk: {
			title: 'Digitálne podpísať PDF certifikátom (.p12 / .pfx)',
			description:
				'Použite PKCS#7 digitálny podpis s vlastným certifikátom. Zadarmo, súkromne, overiteľné v Adobe Acrobat.',
			intro:
				'Podpíšte PDF skutočným certifikátom — nie len textom. Nahrajte PDF a .p12/.pfx; súkromný kľúč neopustí prehliadač.',
			benefits: [
				'PKCS#7 detached podpis',
				'Certifikát ostáva v zariadení',
				'Overiteľné v Adobe Reader',
				'Podpora .p12 a .pfx'
			],
			faq: [
				{
					question: 'Je to to isté ako textový podpis?',
					answer: 'Nie. Digitálny podpis vytvára kryptografický PKCS#7 podpis. Textový podpis len pridá viditeľný text.'
				},
				{
					question: 'Bude Adobe podpis dôverovať?',
					answer: 'Adobe overí štruktúru podpisu. Dôvera závisí od vydavateľa certifikátu.'
				}
			]
		}
	},
	'split-pdf': {
		en: {
			title: 'Split PDF Free Online',
			description:
				'Split a PDF into separate files or extract page ranges for free. Private, in-browser — no upload to servers.',
			intro:
				'Divide one PDF into multiple documents or pull out specific pages. Choose split mode, preview ranges, and download a ZIP of results.',
			benefits: [
				'Split by page ranges or every N pages',
				'Extract selected pages only',
				'ZIP download for multiple parts',
				'100% private — files stay on your device'
			],
			faq: [
				{
					question: 'Can I extract only certain pages?',
					answer: 'Yes. Use page ranges like 1-3, 5 or split the PDF into individual pages.'
				},
				{
					question: 'Is splitting PDFs free?',
					answer: 'Yes. WeLovePDF split PDF is free with no account required.'
				}
			]
		},
		sk: {
			title: 'Rozdeliť PDF zadarmo online',
			description:
				'Rozdeľte PDF na viac súborov alebo extrahujte strany zadarmo. Súkromne v prehliadači — bez nahrávania na server.',
			intro:
				'Rozdeľte jedno PDF na viac dokumentov alebo vyberte konkrétne strany. Zvoľte režim, skontrolujte rozsahy a stiahnite ZIP.',
			benefits: [
				'Delenie podľa rozsahu alebo každých N strán',
				'Extrakcia vybraných strán',
				'ZIP pre viac častí',
				'100 % súkromné'
			],
			faq: [
				{
					question: 'Môžem extrahovať len niektoré strany?',
					answer: 'Áno. Použite rozsah strán, napríklad 1-3, 5, alebo rozdeľte PDF po stranách.'
				},
				{
					question: 'Je rozdeľovanie PDF zadarmo?',
					answer: 'Áno. Rozdeliť PDF je bezplatné a nevyžaduje účet.'
				}
			]
		}
	},
	'watermark-pdf': {
		en: {
			title: 'Watermark PDF Free Online',
			description:
				'Add text or image watermarks to PDF pages for free. Adjust opacity, position, and rotation — private in-browser tool.',
			intro:
				'Stamp confidential labels, logos, or draft marks across every page. Customize font, size, color, and placement before downloading.',
			benefits: [
				'Text and image watermarks',
				'Opacity and rotation controls',
				'Apply to all pages or a range',
				'No server uploads'
			],
			faq: [
				{
					question: 'Can I watermark with my logo?',
					answer: 'Yes. Upload a PNG or JPG image and place it on each page.'
				},
				{
					question: 'Will the watermark be removable?',
					answer: 'Watermarks are embedded into the page content for standard viewing.'
				}
			]
		}
	},
	'protect-pdf': {
		en: {
			title: 'Protect PDF with Password Free',
			description:
				'Encrypt PDF files with a password for free. Set user and owner passwords — secure documents privately in your browser.',
			intro:
				'Lock sensitive PDFs with AES encryption. Choose passwords, restrict printing or copying, and download a protected file instantly.',
			benefits: [
				'Password encryption',
				'Optional permission restrictions',
				'Instant download',
				'Private — keys never leave your browser'
			],
			faq: [
				{
					question: 'What encryption is used?',
					answer: 'PDFs are encrypted with standard PDF password protection compatible with major viewers.'
				},
				{
					question: 'Can I remove the password later?',
					answer: 'Use Unlock PDF if you know the password.'
				}
			]
		}
	},
	'ocr-pdf': {
		en: {
			title: 'OCR PDF Free — Extract Text from Scanned PDFs',
			description:
				'Run OCR on scanned PDFs to extract searchable text for free. Multi-language support, page ranges, private in-browser processing.',
			intro:
				'Turn image-based PDF pages into selectable, searchable text. Pick languages, choose pages, and export text or searchable PDF.',
			benefits: [
				'Multi-language OCR',
				'Page range selection',
				'Searchable PDF output',
				'Runs locally in your browser'
			],
			faq: [
				{
					question: 'Does OCR work on scanned documents?',
					answer: 'Yes. OCR is designed for image-based or scanned PDF pages.'
				},
				{
					question: 'Which languages are supported?',
					answer: 'English, Slovak, Czech, German, Polish, and more can be selected in the tool.'
				}
			]
		}
	},
	'pdf-to-jpg': {
		en: {
			title: 'PDF to JPG Free — Convert PDF Pages to Images',
			description:
				'Convert PDF pages to JPG images and download as ZIP. Adjustable quality and scale — free, private, in-browser.',
			intro:
				'Export each PDF page as a JPEG photo. Tune compression quality and resolution, then download all images in one archive.',
			benefits: [
				'Adjustable JPEG quality',
				'Multi-page ZIP export',
				'Scale up to 4× for sharp output',
				'No file uploads'
			],
			faq: [
				{
					question: 'JPG or PNG — which is better?',
					answer: 'JPG gives smaller files for photos. Use PDF to PNG for lossless graphics and screenshots.'
				},
				{
					question: 'Can I convert selected pages only?',
					answer: 'Yes. Enter a page range before converting.'
				}
			]
		}
	},
	'sign-pdf': {
		en: {
			title: 'Sign PDF Free Online',
			description:
				'Add a visible signature to PDF documents for free. Draw, type, or upload a signature image — private in-browser signing.',
			intro:
				'Place your signature on any page. Draw with mouse or touch, type your name, or upload a PNG signature with date and placement controls.',
			benefits: [
				'Draw, type, or upload signature',
				'Place on any page',
				'Optional date stamp',
				'100% private processing'
			],
			faq: [
				{
					question: 'Is this a digital certificate signature?',
					answer: 'This tool adds a visible signature. For PKCS#7 certificate signing, use Digital Sign PDF.'
				},
				{
					question: 'Can I sign multiple pages?',
					answer: 'Yes. Add signatures to any page before downloading.'
				}
			]
		}
	},
	'organize-pdf': {
		en: {
			title: 'Organize PDF Pages Free Online',
			description:
				'Reorder, rotate, and delete PDF pages for free. Drag-and-drop page organizer — private, in-browser, no uploads.',
			intro:
				'Rearrange pages visually, rotate individual sheets, or remove unwanted pages. Download a reorganized PDF in seconds.',
			benefits: [
				'Drag-and-drop page order',
				'Rotate and delete pages',
				'Visual thumbnail grid',
				'Files never leave your device'
			],
			faq: [
				{
					question: 'Can I combine organizing with merging?',
					answer: 'Organize one PDF at a time, or merge first then organize the combined file.'
				},
				{
					question: 'Is there a page limit?',
					answer: 'Limited by your device memory — no fixed cap.'
				}
			]
		}
	},
	'annotate-pdf': {
		en: {
			title: 'Annotate PDF Free Online',
			description:
				'Highlight, comment, and mark up PDFs for free. Draw, add notes, and save annotated PDFs privately in your browser.',
			intro:
				'Review documents with highlights, freehand drawing, and sticky notes. Export your annotated PDF when finished.',
			benefits: [
				'Highlight and draw tools',
				'Add text notes',
				'Save annotated PDF',
				'Private in-browser editing'
			],
			faq: [
				{
					question: 'Can I save my annotations?',
					answer: 'Yes. Download the PDF with annotations embedded.'
				},
				{
					question: 'Do annotations upload to a server?',
					answer: 'No. All editing happens locally in your browser.'
				}
			]
		}
	}
};

const GENERIC: Record<Locale, (name: string) => ToolSeoContent> = {
	en: (name) => ({
		title: `${name} Free Online`,
		description: `${name} — free online tool. Private, in-browser processing with no server uploads.`,
		intro: `Use ${name} directly in your browser. Your files are processed locally and never leave your device.`,
		benefits: ['Completely free', 'No signup required', '100% in-browser', 'Files stay on your device'],
		faq: [
			{ question: `Is ${name} free?`, answer: 'Yes, all WeLovePDF tools are free to use.' },
			{
				question: 'Are my files uploaded?',
				answer: 'No. Processing happens entirely in your browser.'
			}
		]
	}),
	sk: (name) => ({
		title: `${name} zadarmo online`,
		description: `${name} — bezplatný online nástroj. Súkromne v prehliadači, bez nahrávania súborov na server.`,
		intro: `Použite ${name} priamo v prehliadači. Vaše súbory sa spracujú lokálne a nikdy neopustia vaše zariadenie.`,
		benefits: ['Úplne zadarmo', 'Bez registrácie', '100 % v prehliadači', 'Súbory zostávajú na zariadení'],
		faq: [
			{ question: `Je ${name} zadarmo?`, answer: 'Áno, všetky nástroje WeLovePDF sú bezplatné.' },
			{
				question: 'Nahrávajú sa moje súbory?',
				answer: 'Nie. Spracovanie prebieha výhradne vo vašom prehliadači.'
			}
		]
	}),
	cs: (name) => ({
		title: `${name} zdarma online`,
		description: `${name} — bezplatný online nástroj. Soukromě v prohlížeči, bez nahrávání souborů na server.`,
		intro: `Použijte ${name} přímo v prohlížeči. Soubory se zpracují lokálně a nikdy neopustí vaše zařízení.`,
		benefits: ['Zcela zdarma', 'Bez registrace', '100 % v prohlížeči', 'Soubory zůstávají v zařízení'],
		faq: [
			{ question: `Je ${name} zdarma?`, answer: 'Ano, všechny nástroje WeLovePDF jsou zdarma.' },
			{
				question: 'Nahrávají se mé soubory?',
				answer: 'Ne. Zpracování probíhá výhradně ve vašem prohlížeči.'
			}
		]
	}),
	de: (name) => ({
		title: `${name} kostenlos online`,
		description: `${name} — kostenloses Online-Tool. Privat im Browser, ohne Upload auf Server.`,
		intro: `Nutzen Sie ${name} direkt im Browser. Dateien werden lokal verarbeitet und verlassen Ihr Gerät nicht.`,
		benefits: ['Komplett kostenlos', 'Keine Anmeldung', '100 % im Browser', 'Dateien bleiben auf dem Gerät'],
		faq: [
			{ question: `Ist ${name} kostenlos?`, answer: 'Ja, alle WeLovePDF-Tools sind kostenlos.' },
			{
				question: 'Werden meine Dateien hochgeladen?',
				answer: 'Nein. Die Verarbeitung erfolgt vollständig in Ihrem Browser.'
			}
		]
	}),
	pl: (name) => ({
		title: `${name} za darmo online`,
		description: `${name} — darmowe narzędzie online. Prywatnie w przeglądarce, bez wysyłania plików na serwer.`,
		intro: `Użyj ${name} bezpośrednio w przeglądarce. Pliki są przetwarzane lokalnie i nigdy nie opuszczają urządzenia.`,
		benefits: ['Całkowicie za darmo', 'Bez rejestracji', '100% w przeglądarce', 'Pliki zostają na urządzeniu'],
		faq: [
			{ question: `Czy ${name} jest darmowe?`, answer: 'Tak, wszystkie narzędzia WeLovePDF są bezpłatne.' },
			{
				question: 'Czy moje pliki są wysyłane?',
				answer: 'Nie. Przetwarzanie odbywa się wyłącznie w przeglądarce.'
			}
		]
	})
};

function genericSeo(name: string, locale: Locale): ToolSeoContent {
	return GENERIC[locale](name);
}

export function getToolSeo(slug: string, name: string, locale: Locale): ToolSeoContent {
	const custom = CUSTOM[slug];
	if (custom) {
		return custom[locale] ?? custom.en ?? genericSeo(name, locale);
	}
	return genericSeo(name, locale);
}

export function faqJsonLd(faq: ToolSeoContent['faq']) {
	return {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faq.map((item) => ({
			'@type': 'Question',
			name: item.question,
			acceptedAnswer: { '@type': 'Answer', text: item.answer }
		}))
	};
}
