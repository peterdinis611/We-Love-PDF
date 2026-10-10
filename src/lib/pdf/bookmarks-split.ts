import {
	PdfActionType,
	type PdfBookmarkObject,
	type PdfDocumentObject,
	type PdfLinkTarget
} from '@embedpdf/models';
import { splitPdf } from './operations';
import { buildZip, uniqueZipName } from './zip';

type EngineLike = {
	openDocumentBuffer: (opts: { id: string; content: ArrayBuffer }) => {
		toPromise: () => Promise<PdfDocumentObject>;
	};
	getBookmarks: (doc: PdfDocumentObject) => { toPromise: () => Promise<{ bookmarks: PdfBookmarkObject[] }> };
};

function pageIndexFromTarget(target?: PdfLinkTarget): number | null {
	if (!target) return null;
	if (target.type === 'destination') {
		return typeof target.destination.pageIndex === 'number' ? target.destination.pageIndex : null;
	}
	if (target.type === 'action' && target.action.type === PdfActionType.Goto) {
		return typeof target.action.destination?.pageIndex === 'number'
			? target.action.destination.pageIndex
			: null;
	}
	return null;
}

function flattenBookmarks(
	bookmarks: PdfBookmarkObject[],
	acc: { title: string; pageIndex: number }[] = []
): { title: string; pageIndex: number }[] {
	for (const b of bookmarks) {
		const pageIndex = pageIndexFromTarget(b.target);
		if (pageIndex != null && b.title.trim()) {
			acc.push({ title: b.title.trim(), pageIndex });
		}
		if (b.children?.length) flattenBookmarks(b.children, acc);
	}
	return acc;
}

function sanitizeFilename(title: string): string {
	return (
		title
			.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
			.replace(/\s+/g, ' ')
			.trim()
			.slice(0, 80) || 'section'
	);
}

/**
 * Split a PDF into one file per top-level bookmark range (bookmark → next bookmark / end).
 * Returns a ZIP of PDFs.
 */
export async function splitByBookmarks(
	file: File,
	engine: EngineLike
): Promise<{ zip: Uint8Array; parts: number }> {
	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: `bm-${Date.now()}`, content: buffer }).toPromise();
	const { bookmarks } = await engine.getBookmarks(doc).toPromise();
	const flat = flattenBookmarks(bookmarks)
		.sort((a, b) => a.pageIndex - b.pageIndex)
		.filter((b, i, arr) => i === 0 || b.pageIndex !== arr[i - 1].pageIndex);

	if (flat.length < 2 && !(flat.length === 1 && flat[0].pageIndex === 0)) {
		if (!flat.length) throw new Error('No bookmarks with page targets found in this PDF.');
	}

	const pageCount = doc.pageCount;
	const starts = flat.length ? flat : [{ title: 'Document', pageIndex: 0 }];
	const ranges: number[][] = [];
	const names: string[] = [];

	for (let i = 0; i < starts.length; i++) {
		const from = starts[i].pageIndex;
		const to = i + 1 < starts.length ? starts[i + 1].pageIndex - 1 : pageCount - 1;
		if (from > to || from < 0) continue;
		const pages: number[] = [];
		for (let p = from; p <= to; p++) pages.push(p);
		ranges.push(pages);
		names.push(`${String(i + 1).padStart(2, '0')}-${sanitizeFilename(starts[i].title)}.pdf`);
	}

	if (!ranges.length) throw new Error('Could not build page ranges from bookmarks.');

	const parts = await splitPdf(file, ranges);
	const used = new Set<string>();
	const entries = parts.map((data, i) => ({
		name: uniqueZipName(names[i] ?? `part-${i + 1}.pdf`, used),
		data
	}));
	const zip = await buildZip(entries);
	return { zip, parts: entries.length };
}
