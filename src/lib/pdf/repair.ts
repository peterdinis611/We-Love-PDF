import { PDFDocument } from 'pdf-lib';

export type RepairReport = {
	bytes: Uint8Array;
	pageCount: number;
	originalSize: number;
	repairedSize: number;
	notes: string[];
};

/**
 * Rebuild a PDF by copying every page into a fresh document.
 * Fixes many broken xref / object-stream / incremental-update issues
 * that still allow pdf-lib to read page content.
 */
export async function repairPdf(file: File): Promise<RepairReport> {
	const original = new Uint8Array(await file.arrayBuffer());
	const notes: string[] = [];

	let source: PDFDocument;
	try {
		source = await PDFDocument.load(original, { ignoreEncryption: true, updateMetadata: false });
		notes.push('Loaded with encryption ignored if present.');
	} catch (e) {
		throw new Error(
			e instanceof Error
				? `Cannot open PDF: ${e.message}`
				: 'Cannot open PDF — file may be too corrupted.'
		);
	}

	const out = await PDFDocument.create();
	const indices = source.getPageIndices();
	if (indices.length === 0) {
		throw new Error('PDF has no pages to repair.');
	}

	const copied = await out.copyPages(source, indices);
	copied.forEach((page) => out.addPage(page));
	notes.push(`Copied ${indices.length} page(s) into a new document structure.`);

	try {
		const title = source.getTitle();
		const author = source.getAuthor();
		const subject = source.getSubject();
		const keywords = source.getKeywords();
		if (title) out.setTitle(title);
		if (author) out.setAuthor(author);
		if (subject) out.setSubject(subject);
		if (keywords) {
			out.setKeywords(Array.isArray(keywords) ? [...keywords] : [String(keywords)]);
		}
	} catch {
		notes.push('Original metadata could not be copied.');
	}

	out.setProducer('WeLovePDF');
	out.setCreator('WeLovePDF Fix PDF');
	out.setModificationDate(new Date());

	const bytes = await out.save({ useObjectStreams: true });
	notes.push('Saved with object streams for a cleaner file structure.');

	return {
		bytes,
		pageCount: indices.length,
		originalSize: original.byteLength,
		repairedSize: bytes.length,
		notes
	};
}
