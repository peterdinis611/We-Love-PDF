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
	}
};

function genericSeo(name: string, locale: Locale): ToolSeoContent {
	if (locale === 'sk') {
		return {
			title: `${name} zadarmo online`,
			description: `${name} — bezplatný online nástroj. Súkromne v prehliadači, bez nahrávania súborov na server.`,
			intro: `Použite ${name} priamo v prehliadači. Vaše súbory sa spracujú lokálne a nikdy neopustia vaše zariadenie.`,
			benefits: [
				'Úplne zadarmo',
				'Bez registrácie',
				'100 % v prehliadači',
				'Súbory zostávajú na zariadení'
			],
			faq: [
				{ question: `Je ${name} zadarmo?`, answer: 'Áno, všetky nástroje WeLovePDF sú bezplatné.' },
				{
					question: 'Nahrávajú sa moje súbory?',
					answer: 'Nie. Spracovanie prebieha výhradne vo vašom prehliadači.'
				}
			]
		};
	}

	return {
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
	};
}

export function getToolSeo(slug: string, name: string, locale: Locale): ToolSeoContent {
	return CUSTOM[slug]?.[locale] ?? genericSeo(name, locale);
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
