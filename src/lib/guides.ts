import type { Locale } from '$lib/i18n/locale';
import { localizedPath } from '$lib/i18n/locale';

export type Guide = {
	slug: string;
	title: Record<Locale, string>;
	description: Record<Locale, string>;
	relatedTool?: string;
	body: Record<Locale, string[]>;
};

export const guides: Guide[] = [
	{
		slug: 'merge-pdf-free',
		title: {
			en: 'How to merge PDF files for free',
			sk: 'Ako zlúčiť PDF zadarmo',
			cs: 'Jak sloučit PDF zdarma',
			de: 'PDF-Dateien kostenlos zusammenfügen',
			pl: 'Jak połączyć pliki PDF za darmo'
		},
		description: {
			en: 'Combine multiple PDFs in your browser — no upload, no account.',
			sk: 'Spojte viac PDF v prehliadači — bez nahrávania a registrácie.',
			cs: 'Slučte více PDF v prohlížeči — bez nahrávání.',
			de: 'Mehrere PDFs im Browser kombinieren — ohne Upload.',
			pl: 'Połącz wiele PDF w przeglądarce — bez wysyłania plików.'
		},
		relatedTool: 'merge-pdf',
		body: {
			en: [
				'Open the Merge PDF tool on WeLovePDF.',
				'Select two or more PDF files, or drag them onto the drop zone.',
				'Reorder files if needed — order determines page sequence.',
				'Optionally enable blank pages between documents.',
				'Click Merge PDF and download the combined file instantly.'
			],
			sk: [
				'Otvorte nástroj Spojiť PDF na WeLovePDF.',
				'Vyberte dva alebo viac PDF súborov, prípadne ich pretiahnite do zóny.',
				'Zoraďte súbory podľa potreby — poradie určuje poradie strán.',
				'Voliteľne zapnite prázdne strany medzi dokumentmi.',
				'Kliknite na Spojiť PDF a okamžite stiahnite výsledok.'
			],
			cs: [
				'Otevřete nástroj Sloučit PDF na WeLovePDF.',
				'Vyberte dva nebo více PDF souborů nebo je přetáhněte do zóny.',
				'Seřaďte soubory podle potřeby.',
				'Klikněte na Sloučit PDF a stáhněte výsledek.'
			],
			de: [
				'Öffnen Sie das Tool PDF zusammenfügen auf WeLovePDF.',
				'Wählen Sie zwei oder mehr PDF-Dateien oder ziehen Sie sie in die Zone.',
				'Sortieren Sie die Dateien bei Bedarf.',
				'Klicken Sie auf Zusammenfügen und laden Sie die Datei herunter.'
			],
			pl: [
				'Otwórz narzędzie Połącz PDF w WeLovePDF.',
				'Wybierz dwa lub więcej plików PDF albo upuść je w strefie.',
				'Uporządkuj pliki w razie potrzeby.',
				'Kliknij Połącz PDF i pobierz wynik.'
			]
		}
	},
	{
		slug: 'pdf-digital-sign-p12',
		title: {
			en: 'Sign a PDF with a .p12 / .pfx certificate',
			sk: 'Podpísať PDF certifikátom .p12 / .pfx',
			cs: 'Podepsat PDF certifikátem .p12 / .pfx',
			de: 'PDF mit .p12-/.pfx-Zertifikat signieren',
			pl: 'Podpisz PDF certyfikatem .p12 / .pfx'
		},
		description: {
			en: 'Add a PKCS#7 digital signature using your certificate — processed locally.',
			sk: 'Pridajte PKCS#7 digitálny podpis certifikátom — spracovanie lokálne.',
			cs: 'Přidejte digitální podpis PKCS#7 — zpracování lokálně.',
			de: 'PKCS#7-Signatur mit Zertifikat — lokal verarbeitet.',
			pl: 'Podpis PKCS#7 certyfikatem — przetwarzanie lokalne.'
		},
		relatedTool: 'digital-sign-pdf',
		body: {
			en: [
				'Export your qualified certificate as .p12 or .pfx (includes private key).',
				'Open Digital Sign PDF on WeLovePDF.',
				'Upload the PDF and your certificate file.',
				'Enter the certificate password when prompted.',
				'Download the signed PDF — signature is embedded in the document.'
			],
			sk: [
				'Exportujte kvalifikovaný certifikát ako .p12 alebo .pfx (s privátnym kľúčom).',
				'Otvorte Digitálny podpis na WeLovePDF.',
				'Nahrajte PDF a súbor certifikátu.',
				'Zadajte heslo certifikátu.',
				'Stiahnite podpísané PDF — podpis je súčasťou dokumentu.'
			],
			cs: [
				'Exportujte certifikát jako .p12 nebo .pfx.',
				'Otevřete Digitální podpis na WeLovePDF.',
				'Nahrajte PDF a certifikát.',
				'Zadejte heslo certifikátu.',
				'Stáhněte podepsané PDF.'
			],
			de: [
				'Exportieren Sie Ihr Zertifikat als .p12 oder .pfx.',
				'Öffnen Sie Digitale Signatur auf WeLovePDF.',
				'Laden Sie PDF und Zertifikat hoch.',
				'Geben Sie das Zertifikatpasswort ein.',
				'Laden Sie das signierte PDF herunter.'
			],
			pl: [
				'Eksportuj certyfikat jako .p12 lub .pfx.',
				'Otwórz Podpis cyfrowy w WeLovePDF.',
				'Prześlij PDF i certyfikat.',
				'Wprowadź hasło certyfikatu.',
				'Pobierz podpisany PDF.'
			]
		}
	},
	{
		slug: 'compress-pdf-online',
		title: {
			en: 'Compress a PDF without uploading',
			sk: 'Komprimovať PDF bez nahrávania',
			cs: 'Komprimovat PDF bez nahrávání',
			de: 'PDF komprimieren ohne Upload',
			pl: 'Kompresuj PDF bez wysyłania'
		},
		description: {
			en: 'Reduce PDF file size in the browser while keeping your files private.',
			sk: 'Zmenšite PDF v prehliadači a súbory zostanú u vás.',
			cs: 'Zmenšete PDF v prohlížeči — soubory zůstanou u vás.',
			de: 'PDF-Größe im Browser reduzieren — Dateien bleiben lokal.',
			pl: 'Zmniejsz PDF w przeglądarce — pliki zostają u Ciebie.'
		},
		relatedTool: 'compress-pdf',
		body: {
			en: [
				'Open Compress PDF on WeLovePDF.',
				'Select your PDF file.',
				'Review the original vs compressed size preview.',
				'Download the optimized PDF — results vary by source file.'
			],
			sk: [
				'Otvorte Komprimovať PDF na WeLovePDF.',
				'Vyberte PDF súbor.',
				'Porovnajte pôvodnú a komprimovanú veľkosť.',
				'Stiahnite optimalizované PDF — výsledok závisí od súboru.'
			],
			cs: [
				'Otevřete Komprimovat PDF na WeLovePDF.',
				'Vyberte soubor PDF.',
				'Porovnejte velikost před a po.',
				'Stáhněte optimalizované PDF.'
			],
			de: [
				'Öffnen Sie PDF komprimieren auf WeLovePDF.',
				'Wählen Sie Ihre PDF-Datei.',
				'Vergleichen Sie Original- und komprimierte Größe.',
				'Laden Sie die optimierte PDF herunter.'
			],
			pl: [
				'Otwórz Kompresuj PDF w WeLovePDF.',
				'Wybierz plik PDF.',
				'Porównaj rozmiar przed i po.',
				'Pobierz zoptymalizowany PDF.'
			]
		}
	}
];

export function getGuide(slug: string): Guide | undefined {
	return guides.find((g) => g.slug === slug);
}

export function guidePath(slug: string, locale: Locale): string {
	return localizedPath(`/guides/${slug}`, locale);
}
