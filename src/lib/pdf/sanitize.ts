import { PDFDocument, PDFName, PDFDict, PDFArray } from 'pdf-lib';

export type SanitizeReport = {
	bytes: Uint8Array;
	notes: string[];
};

/**
 * Strip common active content / tracking risks for safer sharing:
 * OpenAction, JS, AA, EmbeddedFiles catalog, URI launch-ish names when possible,
 * plus document metadata cleanup.
 */
export async function sanitizePdf(file: File): Promise<SanitizeReport> {
	const notes: string[] = [];
	const input = await file.arrayBuffer();
	const doc = await PDFDocument.load(input, { ignoreEncryption: true, updateMetadata: false });
	const catalog = doc.catalog;

	const stripKey = (key: string, label: string) => {
		const name = PDFName.of(key);
		if (catalog.has(name)) {
			catalog.delete(name);
			notes.push(`Removed /${key} (${label}).`);
		}
	};

	stripKey('OpenAction', 'auto-open action');
	stripKey('AA', 'additional actions');
	stripKey('Names', 'name tree — may include JS / embedded files');
	stripKey('AcroForm', 'interactive form dictionary');
	stripKey('Outlines', 'bookmarks');

	// Rebuild pages into a clean doc (drops many dangling refs)
	const out = await PDFDocument.create();
	const pages = await out.copyPages(doc, doc.getPageIndices());
	pages.forEach((p) => {
		const node = p.node;
		if (node.has(PDFName.of('AA'))) {
			node.delete(PDFName.of('AA'));
			notes.push('Removed page additional actions.');
		}
		if (node.has(PDFName.of('Annots'))) {
			const annots = node.lookup(PDFName.of('Annots'));
			if (annots instanceof PDFArray) {
				// Keep non-Link/Widget sparingly — drop all annots for sanitize mode
				node.delete(PDFName.of('Annots'));
				notes.push('Removed page annotations (links, widgets, popups).');
			}
		}
		out.addPage(p);
	});

	out.setTitle(doc.getTitle() ?? '');
	out.setAuthor('');
	out.setSubject('');
	out.setKeywords([]);
	out.setProducer('WeLovePDF Sanitize');
	out.setCreator('WeLovePDF');
	notes.push('Cleared author/subject/keywords metadata.');

	const bytes = await out.save({ useObjectStreams: true });
	if (!notes.length) notes.push('No risky catalog entries found — structure rebuilt.');
	return { bytes, notes };
}
