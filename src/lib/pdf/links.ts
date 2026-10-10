import {
	PdfActionType,
	PdfAnnotationSubtype,
	type PdfDocumentObject,
	type PdfLinkAnnoObject,
	type PdfPageObject
} from '@embedpdf/models';

export type PdfLinkRow = {
	id: string;
	pageIndex: number;
	uri: string;
	rect: { origin: { x: number; y: number }; size: { width: number; height: number } };
	annotation: PdfLinkAnnoObject;
	page: PdfPageObject;
};

type EngineLike = {
	openDocumentBuffer: (opts: { id: string; content: ArrayBuffer }) => {
		toPromise: () => Promise<PdfDocumentObject>;
	};
	getPageAnnotations: (
		doc: PdfDocumentObject,
		page: PdfPageObject
	) => { toPromise: () => Promise<unknown[]> };
	removePageAnnotation: (
		doc: PdfDocumentObject,
		page: PdfPageObject,
		annotation: PdfLinkAnnoObject
	) => { toPromise: () => Promise<boolean> };
	createPageAnnotation: (
		doc: PdfDocumentObject,
		page: PdfPageObject,
		annotation: PdfLinkAnnoObject
	) => { toPromise: () => Promise<string> };
	saveAsCopy: (doc: PdfDocumentObject) => { toPromise: () => Promise<ArrayBuffer> };
};

function uriFromLink(anno: PdfLinkAnnoObject): string | null {
	const t = anno.target;
	if (!t || t.type !== 'action') return null;
	if (t.action.type === PdfActionType.URI) return t.action.uri;
	return null;
}

export async function listPdfLinks(file: File, engine: EngineLike): Promise<PdfLinkRow[]> {
	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: `links-${Date.now()}`, content: buffer }).toPromise();
	const rows: PdfLinkRow[] = [];

	for (const page of doc.pages) {
		const annots = (await engine.getPageAnnotations(doc, page).toPromise()) as PdfLinkAnnoObject[];
		for (const a of annots) {
			if (a.type !== PdfAnnotationSubtype.LINK) continue;
			const uri = uriFromLink(a);
			if (!uri) continue;
			rows.push({
				id: String(a.id),
				pageIndex: page.index,
				uri,
				rect: a.rect,
				annotation: a,
				page
			});
		}
	}
	return rows;
}

/**
 * Bulk-replace link URIs. `replacements` maps old URI → new URI (exact match),
 * or pass `find`/`replace` for substring replace across all URIs.
 */
export async function rewritePdfLinks(
	file: File,
	engine: EngineLike,
	options: {
		map?: Record<string, string>;
		find?: string;
		replace?: string;
	}
): Promise<{ bytes: Uint8Array; changed: number }> {
	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: `links-edit-${Date.now()}`, content: buffer }).toPromise();
	let changed = 0;

	for (const page of doc.pages) {
		const annots = (await engine.getPageAnnotations(doc, page).toPromise()) as PdfLinkAnnoObject[];
		for (const a of annots) {
			if (a.type !== PdfAnnotationSubtype.LINK) continue;
			const uri = uriFromLink(a);
			if (!uri) continue;
			let next = uri;
			if (options.map && options.map[uri] != null) next = options.map[uri];
			else if (options.find != null && options.find.length) {
				next = uri.split(options.find).join(options.replace ?? '');
			}
			if (next === uri) continue;

			await engine.removePageAnnotation(doc, page, a).toPromise();
			const updated: PdfLinkAnnoObject = {
				...a,
				target: {
					type: 'action',
					action: { type: PdfActionType.URI, uri: next }
				}
			};
			await engine.createPageAnnotation(doc, page, updated).toPromise();
			changed++;
		}
	}

	const result = await engine.saveAsCopy(doc).toPromise();
	return { bytes: new Uint8Array(result), changed };
}

export function linksToCsv(rows: PdfLinkRow[]): string {
	const header = 'page,uri';
	const lines = rows.map((r) => `${r.pageIndex + 1},"${r.uri.replace(/"/g, '""')}"`);
	return [header, ...lines].join('\n');
}
