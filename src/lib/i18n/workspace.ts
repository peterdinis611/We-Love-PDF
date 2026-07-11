/** Shared tool workspace UI strings (dropzones, actions, errors). */
export type WorkspaceMessages = {
	dropzone: {
		selectPdf: string;
		selectPdfs: string;
		orDropPdf: string;
		orDropPdfs: string;
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
	a11y: {
		moveUp: string;
		moveDown: string;
		removeFile: string;
	};
	errors: {
		couldNotReadPdf: string;
		invalidPageRange: string;
		engineFailed: string;
		toolUnavailable: string;
		mergeMinFiles: string;
	};
};

export const workspaceEn: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'Select PDF file',
		selectPdfs: 'Select PDF files',
		orDropPdf: 'or drop a PDF here',
		orDropPdfs: 'or drop PDFs here'
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
	a11y: {
		moveUp: 'Move up',
		moveDown: 'Move down',
		removeFile: 'Remove file'
	},
	errors: {
		couldNotReadPdf: 'Could not read PDF file.',
		invalidPageRange: 'Invalid page range.',
		engineFailed: 'Failed to load PDF engine. Please refresh the page.',
		toolUnavailable: 'This tool is not available yet.',
		mergeMinFiles: 'Please add at least 2 PDF files to merge.'
	}
};

export const workspaceSk: WorkspaceMessages = {
	dropzone: {
		selectPdf: 'Vybrať PDF súbor',
		selectPdfs: 'Vybrať PDF súbory',
		orDropPdf: 'alebo pretiahnite PDF sem',
		orDropPdfs: 'alebo pretiahnite PDF súbory sem'
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
	a11y: {
		moveUp: 'Posunúť hore',
		moveDown: 'Posunúť dole',
		removeFile: 'Odstrániť súbor'
	},
	errors: {
		couldNotReadPdf: 'Nepodarilo sa načítať PDF súbor.',
		invalidPageRange: 'Neplatný rozsah strán.',
		engineFailed: 'Nepodarilo sa načítať PDF engine. Obnovte stránku.',
		toolUnavailable: 'Tento nástroj zatiaľ nie je k dispozícii.',
		mergeMinFiles: 'Pridajte aspoň 2 PDF súbory na spojenie.'
	}
};

/** CS/DE/PL use English workspace until fully translated. */
export const workspaceCs = workspaceEn;
export const workspaceDe = workspaceEn;
export const workspacePl = workspaceEn;
