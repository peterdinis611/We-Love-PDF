/** Shared tool workspace UI strings (dropzones, actions, errors). */
export type WorkspaceMessages = {
	dropzone: {
		selectPdf: string;
		selectPdfs: string;
		orDropPdf: string;
		orDropPdfs: string;
		selectWord: string;
		orDropWord: string;
		selectExcel: string;
		orDropExcel: string;
		selectPowerpoint: string;
		orDropPowerpoint: string;
		selectMarkdown: string;
		orDropMarkdown: string;
		selectText: string;
		orDropText: string;
		selectHtml: string;
		orDropHtml: string;
		selectImages: string;
		orDropImages: string;
		selectJson: string;
		orDropJson: string;
		selectXml: string;
		orDropXml: string;
		selectCsv: string;
		orDropCsv: string;
		selectForm: string;
		orDropForm: string;
		selectProtected: string;
		orDropProtected: string;
		selectCert: string;
		orDropCert: string;
		orDropToView: string;
	};
	actions: {
		processing: string;
		loadingEngine: string;
		merge: string;
		merging: string;
		convertToPdf: string;
		converting: string;
	};
	output: {
		filename: string;
	};
	pageSelector: {
		selectAll: string;
		clear: string;
		odd: string;
		even: string;
	};
	pages: {
		optional: string;
		placeholder: string;
	};
	password: {
		password: string;
		confirmPassword: string;
		ownerPassword: string;
		currentPassword: string;
		newPassword: string;
		confirmNewPassword: string;
	};
	view: {
		shortcuts: string;
		fullscreen: string;
		exitFullscreen: string;
		closeFullscreen: string;
		keyboardShortcuts: string;
		prevNext: string;
		zoom: string;
		toggleFullscreen: string;
		showShortcuts: string;
		exitHelp: string;
		loadingViewer: string;
		initError: string;
		loadError: string;
	};
	a11y: {
		moveUp: string;
		moveDown: string;
		removeFile: string;
	};
	stats: {
		page: string;
		pages: string;
	};
	undo: string;
	errors: {
		couldNotReadPdf: string;
		invalidPageRange: string;
		engineFailed: string;
		toolUnavailable: string;
		mergeMinFiles: string;
		addAtLeastOne: string;
	};
};

export const workspaceEn: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'Select PDF file',
		selectPdfs: 'Select PDF files',
		orDropPdf: 'or drop a PDF here',
		orDropPdfs: 'or drop PDFs here',
		selectWord: 'Select Word file',
		orDropWord: 'or drop a .docx file',
		selectExcel: 'Select Excel file',
		orDropExcel: 'or drop an .xlsx or .xls file',
		selectPowerpoint: 'Select PowerPoint file',
		orDropPowerpoint: 'or drop a .pptx file',
		selectMarkdown: 'Select Markdown file',
		orDropMarkdown: 'or drop a .md file — or paste Markdown below',
		selectText: 'Select text file',
		orDropText: 'or drop a .txt file — or paste text below',
		selectHtml: 'Select HTML file',
		orDropHtml: 'or drop an .html file — or paste HTML below',
		selectImages: 'Select images',
		orDropImages: 'or drop JPG / PNG files',
		selectJson: 'Select JSON file',
		orDropJson: 'or drop a .json file — or paste JSON below',
		selectXml: 'Select XML file',
		orDropXml: 'or drop an .xml file — or paste XML below',
		selectCsv: 'Select CSV file',
		orDropCsv: 'or drop a .csv file — or paste CSV below',
		selectForm: 'Select PDF form',
		orDropForm: 'or drop a PDF with fillable fields',
		selectProtected: 'Select protected PDF',
		orDropProtected: 'or drop an encrypted PDF here',
		selectCert: 'Select certificate',
		orDropCert: 'or drop a .p12 / .pfx file',
		orDropToView: 'or drop a PDF here to view'
	},
	actions: {
		processing: 'Processing…',
		loadingEngine: 'Loading engine…',
		merge: 'Merge PDF',
		merging: 'Merging…',
		convertToPdf: 'Convert to PDF',
		converting: 'Converting…'
	},
	output: {
		filename: 'Output filename'
	},
	pageSelector: {
		selectAll: 'Select all',
		clear: 'Clear',
		odd: 'Odd pages',
		even: 'Even pages'
	},
	pages: {
		optional: 'Pages (optional)',
		placeholder: 'All pages, or e.g. 1-3, 5'
	},
	password: {
		password: 'Password',
		confirmPassword: 'Confirm password',
		ownerPassword: 'Owner password',
		currentPassword: 'Current password',
		newPassword: 'New password',
		confirmNewPassword: 'Confirm new password'
	},
	view: {
		shortcuts: 'Shortcuts',
		fullscreen: 'Fullscreen',
		exitFullscreen: 'Exit fullscreen',
		closeFullscreen: 'Close fullscreen',
		keyboardShortcuts: 'Keyboard shortcuts',
		prevNext: 'Previous / next page',
		zoom: 'Zoom in / out',
		toggleFullscreen: 'Toggle fullscreen',
		showShortcuts: 'Show shortcuts',
		exitHelp: 'Exit fullscreen / close help',
		loadingViewer: 'Loading PDF viewer…',
		initError: 'Could not initialize PDF viewer.',
		loadError: 'Could not load PDF viewer.'
	},
	a11y: {
		moveUp: 'Move up',
		moveDown: 'Move down',
		removeFile: 'Remove file'
	},
	stats: {
		page: 'page',
		pages: 'pages'
	},
	undo: 'Undo',
	errors: {
		couldNotReadPdf: 'Could not read PDF file.',
		invalidPageRange: 'Invalid page range.',
		engineFailed: 'Failed to load PDF engine. Please refresh the page.',
		toolUnavailable: 'This tool is not available yet.',
		mergeMinFiles: 'Please add at least 2 PDF files to merge.',
		addAtLeastOne: 'Please add at least one PDF file.'
	}
};

export const workspaceSk: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'Vybrať PDF súbor',
		selectPdfs: 'Vybrať PDF súbory',
		orDropPdf: 'alebo pretiahnite PDF sem',
		orDropPdfs: 'alebo pretiahnite PDF súbory sem',
		selectWord: 'Vybrať Word súbor',
		orDropWord: 'alebo pretiahnite .docx súbor',
		selectExcel: 'Vybrať Excel súbor',
		orDropExcel: 'alebo pretiahnite .xlsx alebo .xls súbor',
		selectPowerpoint: 'Vybrať PowerPoint súbor',
		orDropPowerpoint: 'alebo pretiahnite .pptx súbor',
		selectMarkdown: 'Vybrať Markdown súbor',
		orDropMarkdown: 'alebo pretiahnite .md súbor — alebo vložte Markdown nižšie',
		selectText: 'Vybrať textový súbor',
		orDropText: 'alebo pretiahnite .txt súbor — alebo vložte text nižšie',
		selectHtml: 'Vybrať HTML súbor',
		orDropHtml: 'alebo pretiahnite .html súbor — alebo vložte HTML nižšie',
		selectImages: 'Vybrať obrázky',
		orDropImages: 'alebo pretiahnite JPG / PNG súbory',
		selectJson: 'Vybrať JSON súbor',
		orDropJson: 'alebo pretiahnite .json súbor — alebo vložte JSON nižšie',
		selectXml: 'Vybrať XML súbor',
		orDropXml: 'alebo pretiahnite .xml súbor — alebo vložte XML nižšie',
		selectCsv: 'Vybrať CSV súbor',
		orDropCsv: 'alebo pretiahnite .csv súbor — alebo vložte CSV nižšie',
		selectForm: 'Vybrať PDF formulár',
		orDropForm: 'alebo pretiahnite PDF s vyplniteľnými poľami',
		selectProtected: 'Vybrať chránené PDF',
		orDropProtected: 'alebo pretiahnite šifrované PDF sem',
		selectCert: 'Vybrať certifikát',
		orDropCert: 'alebo pretiahnite .p12 / .pfx súbor',
		orDropToView: 'alebo pretiahnite PDF sem na zobrazenie'
	},
	actions: {
		processing: 'Spracovávam…',
		loadingEngine: 'Načítavam engine…',
		merge: 'Spojiť PDF',
		merging: 'Spájam…',
		convertToPdf: 'Konvertovať do PDF',
		converting: 'Konvertujem…'
	},
	output: {
		filename: 'Názov výstupného súboru'
	},
	pageSelector: {
		selectAll: 'Vybrať všetko',
		clear: 'Vymazať',
		odd: 'Nepárne strany',
		even: 'Párne strany'
	},
	pages: {
		optional: 'Strany (voliteľné)',
		placeholder: 'Všetky strany, alebo napr. 1-3, 5'
	},
	password: {
		password: 'Heslo',
		confirmPassword: 'Potvrdiť heslo',
		ownerPassword: 'Heslo vlastníka',
		currentPassword: 'Aktuálne heslo',
		newPassword: 'Nové heslo',
		confirmNewPassword: 'Potvrdiť nové heslo'
	},
	view: {
		shortcuts: 'Skratky',
		fullscreen: 'Celá obrazovka',
		exitFullscreen: 'Ukončiť celú obrazovku',
		closeFullscreen: 'Zavrieť celú obrazovku',
		keyboardShortcuts: 'Klávesové skratky',
		prevNext: 'Predchádzajúca / nasledujúca strana',
		zoom: 'Priblížiť / oddialiť',
		toggleFullscreen: 'Prepnúť celú obrazovku',
		showShortcuts: 'Zobraziť skratky',
		exitHelp: 'Ukončiť celú obrazovku / zavrieť nápovedu',
		loadingViewer: 'Načítavam PDF prehliadač…',
		initError: 'Nepodarilo sa inicializovať PDF prehliadač.',
		loadError: 'Nepodarilo sa načítať PDF prehliadač.'
	},
	a11y: {
		moveUp: 'Posunúť hore',
		moveDown: 'Posunúť dole',
		removeFile: 'Odstrániť súbor'
	},
	stats: {
		page: 'strana',
		pages: 'strán'
	},
	undo: 'Späť',
	errors: {
		couldNotReadPdf: 'Nepodarilo sa načítať PDF súbor.',
		invalidPageRange: 'Neplatný rozsah strán.',
		engineFailed: 'Nepodarilo sa načítať PDF engine. Obnovte stránku.',
		toolUnavailable: 'Tento nástroj zatiaľ nie je k dispozícii.',
		mergeMinFiles: 'Pridajte aspoň 2 PDF súbory na spojenie.',
		addAtLeastOne: 'Pridajte aspoň jeden PDF súbor.'
	}
};

export const workspaceCs: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'Vybrat PDF soubor',
		selectPdfs: 'Vybrat PDF soubory',
		orDropPdf: 'nebo přetáhněte PDF sem',
		orDropPdfs: 'nebo přetáhněte PDF soubory sem',
		selectWord: 'Vybrat Word soubor',
		orDropWord: 'nebo přetáhněte .docx soubor',
		selectExcel: 'Vybrat Excel soubor',
		orDropExcel: 'nebo přetáhněte .xlsx nebo .xls soubor',
		selectPowerpoint: 'Vybrat PowerPoint soubor',
		orDropPowerpoint: 'nebo přetáhněte .pptx soubor',
		selectMarkdown: 'Vybrat Markdown soubor',
		orDropMarkdown: 'nebo přetáhněte .md soubor — nebo vložte Markdown níže',
		selectText: 'Vybrat textový soubor',
		orDropText: 'nebo přetáhněte .txt soubor — nebo vložte text níže',
		selectHtml: 'Vybrat HTML soubor',
		orDropHtml: 'nebo přetáhněte .html soubor — nebo vložte HTML níže',
		selectImages: 'Vybrat obrázky',
		orDropImages: 'nebo přetáhněte JPG / PNG soubory',
		selectJson: 'Vybrat JSON soubor',
		orDropJson: 'nebo přetáhněte .json soubor — nebo vložte JSON níže',
		selectXml: 'Vybrat XML soubor',
		orDropXml: 'nebo přetáhněte .xml soubor — nebo vložte XML níže',
		selectCsv: 'Vybrat CSV soubor',
		orDropCsv: 'nebo přetáhněte .csv soubor — nebo vložte CSV níže',
		selectForm: 'Vybrat PDF formulář',
		orDropForm: 'nebo přetáhněte PDF s vyplnitelnými poli',
		selectProtected: 'Vybrat chráněné PDF',
		orDropProtected: 'nebo přetáhněte šifrované PDF sem',
		selectCert: 'Vybrat certifikát',
		orDropCert: 'nebo přetáhněte .p12 / .pfx soubor',
		orDropToView: 'nebo přetáhněte PDF sem k zobrazení'
	},
	actions: {
		processing: 'Zpracovávám…',
		loadingEngine: 'Načítám engine…',
		merge: 'Sloučit PDF',
		merging: 'Slučuji…',
		convertToPdf: 'Převést do PDF',
		converting: 'Převádím…'
	},
	output: {
		filename: 'Název výstupního souboru'
	},
	pageSelector: {
		selectAll: 'Vybrat vše',
		clear: 'Vymazat',
		odd: 'Liché strany',
		even: 'Sudé strany'
	},
	pages: {
		optional: 'Strany (volitelné)',
		placeholder: 'Všechny strany, nebo např. 1-3, 5'
	},
	password: {
		password: 'Heslo',
		confirmPassword: 'Potvrdit heslo',
		ownerPassword: 'Heslo vlastníka',
		currentPassword: 'Aktuální heslo',
		newPassword: 'Nové heslo',
		confirmNewPassword: 'Potvrdit nové heslo'
	},
	view: {
		shortcuts: 'Zkratky',
		fullscreen: 'Celá obrazovka',
		exitFullscreen: 'Ukončit celou obrazovku',
		closeFullscreen: 'Zavřít celou obrazovku',
		keyboardShortcuts: 'Klávesové zkratky',
		prevNext: 'Předchozí / následující strana',
		zoom: 'Přiblížit / oddálit',
		toggleFullscreen: 'Přepnout celou obrazovku',
		showShortcuts: 'Zobrazit zkratky',
		exitHelp: 'Ukončit celou obrazovku / zavřít nápovědu',
		loadingViewer: 'Načítám PDF prohlížeč…',
		initError: 'Nepodařilo se inicializovat PDF prohlížeč.',
		loadError: 'Nepodařilo se načíst PDF prohlížeč.'
	},
	a11y: {
		moveUp: 'Posunout nahoru',
		moveDown: 'Posunout dolů',
		removeFile: 'Odebrat soubor'
	},
	stats: {
		page: 'strana',
		pages: 'stran'
	},
	undo: 'Zpět',
	errors: {
		couldNotReadPdf: 'Nepodařilo se načíst PDF soubor.',
		invalidPageRange: 'Neplatný rozsah stran.',
		engineFailed: 'Nepodařilo se načíst PDF engine. Obnovte stránku.',
		toolUnavailable: 'Tento nástroj zatím není k dispozici.',
		mergeMinFiles: 'Přidejte alespoň 2 PDF soubory ke sloučení.',
		addAtLeastOne: 'Přidejte alespoň jeden PDF soubor.'
	}
};

export const workspaceDe: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'PDF-Datei auswählen',
		selectPdfs: 'PDF-Dateien auswählen',
		orDropPdf: 'oder PDF hier ablegen',
		orDropPdfs: 'oder PDFs hier ablegen',
		selectWord: 'Word-Datei auswählen',
		orDropWord: 'oder .docx-Datei ablegen',
		selectExcel: 'Excel-Datei auswählen',
		orDropExcel: 'oder .xlsx- bzw. .xls-Datei ablegen',
		selectPowerpoint: 'PowerPoint-Datei auswählen',
		orDropPowerpoint: 'oder .pptx-Datei ablegen',
		selectMarkdown: 'Markdown-Datei auswählen',
		orDropMarkdown: 'oder .md-Datei ablegen — oder Markdown unten einfügen',
		selectText: 'Textdatei auswählen',
		orDropText: 'oder .txt-Datei ablegen — oder Text unten einfügen',
		selectHtml: 'HTML-Datei auswählen',
		orDropHtml: 'oder .html-Datei ablegen — oder HTML unten einfügen',
		selectImages: 'Bilder auswählen',
		orDropImages: 'oder JPG-/PNG-Dateien ablegen',
		selectJson: 'JSON-Datei auswählen',
		orDropJson: 'oder .json-Datei ablegen — oder JSON unten einfügen',
		selectXml: 'XML-Datei auswählen',
		orDropXml: 'oder .xml-Datei ablegen — oder XML unten einfügen',
		selectCsv: 'CSV-Datei auswählen',
		orDropCsv: 'oder .csv-Datei ablegen — oder CSV unten einfügen',
		selectForm: 'PDF-Formular auswählen',
		orDropForm: 'oder PDF mit ausfüllbaren Feldern ablegen',
		selectProtected: 'Geschütztes PDF auswählen',
		orDropProtected: 'oder verschlüsseltes PDF hier ablegen',
		selectCert: 'Zertifikat auswählen',
		orDropCert: 'oder .p12-/.pfx-Datei ablegen',
		orDropToView: 'oder PDF hier ablegen zum Ansehen'
	},
	actions: {
		processing: 'Verarbeitung…',
		loadingEngine: 'Engine wird geladen…',
		merge: 'PDF zusammenfügen',
		merging: 'Wird zusammengefügt…',
		convertToPdf: 'In PDF umwandeln',
		converting: 'Wird umgewandelt…'
	},
	output: {
		filename: 'Ausgabedateiname'
	},
	pageSelector: {
		selectAll: 'Alle auswählen',
		clear: 'Leeren',
		odd: 'Ungerade Seiten',
		even: 'Gerade Seiten'
	},
	pages: {
		optional: 'Seiten (optional)',
		placeholder: 'Alle Seiten, oder z. B. 1-3, 5'
	},
	password: {
		password: 'Passwort',
		confirmPassword: 'Passwort bestätigen',
		ownerPassword: 'Besitzerpasswort',
		currentPassword: 'Aktuelles Passwort',
		newPassword: 'Neues Passwort',
		confirmNewPassword: 'Neues Passwort bestätigen'
	},
	view: {
		shortcuts: 'Tastenkürzel',
		fullscreen: 'Vollbild',
		exitFullscreen: 'Vollbild beenden',
		closeFullscreen: 'Vollbild schließen',
		keyboardShortcuts: 'Tastenkürzel',
		prevNext: 'Vorherige / nächste Seite',
		zoom: 'Vergrößern / verkleinern',
		toggleFullscreen: 'Vollbild umschalten',
		showShortcuts: 'Tastenkürzel anzeigen',
		exitHelp: 'Vollbild beenden / Hilfe schließen',
		loadingViewer: 'PDF-Viewer wird geladen…',
		initError: 'PDF-Viewer konnte nicht initialisiert werden.',
		loadError: 'PDF-Viewer konnte nicht geladen werden.'
	},
	a11y: {
		moveUp: 'Nach oben',
		moveDown: 'Nach unten',
		removeFile: 'Datei entfernen'
	},
	stats: {
		page: 'Seite',
		pages: 'Seiten'
	},
	undo: 'Rückgängig',
	errors: {
		couldNotReadPdf: 'PDF-Datei konnte nicht gelesen werden.',
		invalidPageRange: 'Ungültiger Seitenbereich.',
		engineFailed: 'PDF-Engine konnte nicht geladen werden. Bitte Seite neu laden.',
		toolUnavailable: 'Dieses Tool ist noch nicht verfügbar.',
		mergeMinFiles: 'Bitte mindestens 2 PDF-Dateien zum Zusammenfügen hinzufügen.',
		addAtLeastOne: 'Bitte mindestens eine PDF-Datei hinzufügen.'
	}
};

export const workspacePl: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'Wybierz plik PDF',
		selectPdfs: 'Wybierz pliki PDF',
		orDropPdf: 'lub upuść PDF tutaj',
		orDropPdfs: 'lub upuść pliki PDF tutaj',
		selectWord: 'Wybierz plik Word',
		orDropWord: 'lub upuść plik .docx',
		selectExcel: 'Wybierz plik Excel',
		orDropExcel: 'lub upuść plik .xlsx lub .xls',
		selectPowerpoint: 'Wybierz plik PowerPoint',
		orDropPowerpoint: 'lub upuść plik .pptx',
		selectMarkdown: 'Wybierz plik Markdown',
		orDropMarkdown: 'lub upuść plik .md — albo wklej Markdown poniżej',
		selectText: 'Wybierz plik tekstowy',
		orDropText: 'lub upuść plik .txt — albo wklej tekst poniżej',
		selectHtml: 'Wybierz plik HTML',
		orDropHtml: 'lub upuść plik .html — albo wklej HTML poniżej',
		selectImages: 'Wybierz obrazy',
		orDropImages: 'lub upuść pliki JPG / PNG',
		selectJson: 'Wybierz plik JSON',
		orDropJson: 'lub upuść plik .json — albo wklej JSON poniżej',
		selectXml: 'Wybierz plik XML',
		orDropXml: 'lub upuść plik .xml — albo wklej XML poniżej',
		selectCsv: 'Wybierz plik CSV',
		orDropCsv: 'lub upuść plik .csv — albo wklej CSV poniżej',
		selectForm: 'Wybierz formularz PDF',
		orDropForm: 'lub upuść PDF z polami do wypełnienia',
		selectProtected: 'Wybierz chroniony PDF',
		orDropProtected: 'lub upuść zaszyfrowany PDF tutaj',
		selectCert: 'Wybierz certyfikat',
		orDropCert: 'lub upuść plik .p12 / .pfx',
		orDropToView: 'lub upuść PDF tutaj, aby wyświetlić'
	},
	actions: {
		processing: 'Przetwarzanie…',
		loadingEngine: 'Ładowanie silnika…',
		merge: 'Połącz PDF',
		merging: 'Łączenie…',
		convertToPdf: 'Konwertuj do PDF',
		converting: 'Konwersja…'
	},
	output: {
		filename: 'Nazwa pliku wyjściowego'
	},
	pageSelector: {
		selectAll: 'Zaznacz wszystko',
		clear: 'Wyczyść',
		odd: 'Strony nieparzyste',
		even: 'Strony parzyste'
	},
	pages: {
		optional: 'Strony (opcjonalnie)',
		placeholder: 'Wszystkie strony lub np. 1-3, 5'
	},
	password: {
		password: 'Hasło',
		confirmPassword: 'Potwierdź hasło',
		ownerPassword: 'Hasło właściciela',
		currentPassword: 'Aktualne hasło',
		newPassword: 'Nowe hasło',
		confirmNewPassword: 'Potwierdź nowe hasło'
	},
	view: {
		shortcuts: 'Skróty',
		fullscreen: 'Pełny ekran',
		exitFullscreen: 'Zamknij pełny ekran',
		closeFullscreen: 'Zamknij pełny ekran',
		keyboardShortcuts: 'Skróty klawiszowe',
		prevNext: 'Poprzednia / następna strona',
		zoom: 'Powiększ / pomniejsz',
		toggleFullscreen: 'Przełącz pełny ekran',
		showShortcuts: 'Pokaż skróty',
		exitHelp: 'Zamknij pełny ekran / zamknij pomoc',
		loadingViewer: 'Ładowanie przeglądarki PDF…',
		initError: 'Nie udało się zainicjować przeglądarki PDF.',
		loadError: 'Nie udało się załadować przeglądarki PDF.'
	},
	a11y: {
		moveUp: 'Przenieś w górę',
		moveDown: 'Przenieś w dół',
		removeFile: 'Usuń plik'
	},
	stats: {
		page: 'strona',
		pages: 'stron'
	},
	undo: 'Cofnij',
	errors: {
		couldNotReadPdf: 'Nie udało się odczytać pliku PDF.',
		invalidPageRange: 'Nieprawidłowy zakres stron.',
		engineFailed: 'Nie udało się załadować silnika PDF. Odśwież stronę.',
		toolUnavailable: 'To narzędzie nie jest jeszcze dostępne.',
		mergeMinFiles: 'Dodaj co najmniej 2 pliki PDF do połączenia.',
		addAtLeastOne: 'Dodaj co najmniej jeden plik PDF.'
	}
};
