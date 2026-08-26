import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { blobToJpeg } from '$lib/pdf/convert';

export type OcrProgress = { page: number; total: number; status: string };

export class OcrCancelledError extends Error {
	constructor() {
		super('OCR cancelled');
		this.name = 'OcrCancelledError';
	}
}

type OcrWord = {
	text?: string;
	bbox?: { x0: number; y0: number; x1: number; y1: number };
};

type EngineLike = {
	openDocumentBuffer: (opts: { id: string; content: ArrayBuffer }) => {
		toPromise: () => Promise<{ pages: Array<{ size: { width: number; height: number } }> }>;
	};
	renderPage: (
		doc: unknown,
		page: unknown,
		opts: { scaleFactor: number }
	) => { toPromise: () => Promise<Blob> };
};

let activeWorker: { terminate: () => Promise<unknown> } | null = null;
let cancelRequested = false;

export function cancelOcr(): void {
	cancelRequested = true;
	const w = activeWorker;
	activeWorker = null;
	void w?.terminate().catch(() => {});
}

function throwIfCancelled() {
	if (cancelRequested) throw new OcrCancelledError();
}

/**
 * OCR selected pages and rebuild a searchable PDF (JPEG pages + invisible text).
 */
export async function makeSearchablePdf(
	file: File,
	engine: EngineLike,
	options: {
		lang?: string;
		scaleFactor?: number;
		pageIndexes?: number[];
		onProgress?: (p: OcrProgress) => void;
	} = {}
): Promise<Uint8Array> {
	cancelRequested = false;
	const { lang = 'eng', scaleFactor = 2, onProgress } = options;
	const { createWorker } = await import('tesseract.js');
	const worker = await createWorker(lang);
	activeWorker = worker;

	try {
		throwIfCancelled();
		const buffer = await file.arrayBuffer();
		const doc = await engine
			.openDocumentBuffer({ id: `ocr-${Date.now()}`, content: buffer })
			.toPromise();
		const indexes =
			options.pageIndexes?.length
				? options.pageIndexes
				: Array.from({ length: doc.pages.length }, (_, i) => i);
		const out = await PDFDocument.create();
		const font = await out.embedFont(StandardFonts.Helvetica);
		const total = indexes.length;
		const render = engine.renderPage as (
			doc: unknown,
			page: unknown,
			opts: { scaleFactor: number }
		) => { toPromise: () => Promise<Blob> };

		for (let n = 0; n < indexes.length; n++) {
			throwIfCancelled();
			const i = indexes[n];
			onProgress?.({ page: n + 1, total, status: 'rendering' });
			const page = doc.pages[i];
			if (!page) continue;
			const blob = await render(doc, page, { scaleFactor }).toPromise();
			throwIfCancelled();
			const jpegBlob = await blobToJpeg(blob, 0.88);
			const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
			const image = await out.embedJpg(jpegBytes);

			onProgress?.({ page: n + 1, total, status: 'ocr' });
			const result = await worker.recognize(blob);
			throwIfCancelled();
			const data = result.data as { words?: OcrWord[] };
			const words = data.words ?? [];

			const pageWidth = page.size.width;
			const pageHeight = page.size.height;
			const pdfPage = out.addPage([pageWidth, pageHeight]);
			pdfPage.drawImage(image, {
				x: 0,
				y: 0,
				width: pageWidth,
				height: pageHeight
			});

			const imgW = image.width;
			const imgH = image.height;
			const sx = pageWidth / imgW;
			const sy = pageHeight / imgH;

			for (const word of words) {
				const text = word.text?.trim();
				if (!text) continue;
				const box = word.bbox;
				if (!box) continue;
				const w = Math.max(1, (box.x1 - box.x0) * sx);
				const h = Math.max(4, (box.y1 - box.y0) * sy);
				const x = box.x0 * sx;
				const y = pageHeight - box.y1 * sy;
				const fontSize = Math.min(h * 0.9, 64);
				try {
					pdfPage.drawText(text, {
						x,
						y,
						size: fontSize,
						font,
						color: rgb(0, 0, 0),
						opacity: 0,
						maxWidth: w
					});
				} catch {
					/* skip glyphs Helvetica can't encode */
				}
			}
		}

		return out.save({ useObjectStreams: true });
	} catch (e) {
		if (cancelRequested || (e instanceof Error && e.name === 'OcrCancelledError')) {
			throw new OcrCancelledError();
		}
		throw e;
	} finally {
		activeWorker = null;
		try {
			await worker.terminate();
		} catch {
			/* already terminated by cancel */
		}
	}
}

/** OCR pages to plain text (for table export fallback). */
export async function ocrPagesToText(
	file: File,
	engine: EngineLike,
	options: {
		lang?: string;
		scaleFactor?: number;
		pageIndexes?: number[];
		onProgress?: (p: OcrProgress) => void;
	} = {}
): Promise<string> {
	cancelRequested = false;
	const { lang = 'eng', scaleFactor = 2, onProgress } = options;
	const { createWorker } = await import('tesseract.js');
	const worker = await createWorker(lang);
	activeWorker = worker;

	try {
		const buffer = await file.arrayBuffer();
		const doc = await engine
			.openDocumentBuffer({ id: `ocr-text-${Date.now()}`, content: buffer })
			.toPromise();
		const indexes =
			options.pageIndexes?.length
				? options.pageIndexes
				: Array.from({ length: doc.pages.length }, (_, i) => i);
		const render = engine.renderPage as (
			doc: unknown,
			page: unknown,
			opts: { scaleFactor: number }
		) => { toPromise: () => Promise<Blob> };
		const parts: string[] = [];

		for (let n = 0; n < indexes.length; n++) {
			throwIfCancelled();
			const i = indexes[n];
			onProgress?.({ page: n + 1, total: indexes.length, status: 'ocr' });
			const page = doc.pages[i];
			if (!page) continue;
			const blob = await render(doc, page, { scaleFactor }).toPromise();
			const result = await worker.recognize(blob);
			parts.push((result.data.text ?? '').trim());
		}

		return parts.filter(Boolean).join('\n\n');
	} catch (e) {
		if (cancelRequested || (e instanceof Error && e.name === 'OcrCancelledError')) {
			throw new OcrCancelledError();
		}
		throw e;
	} finally {
		activeWorker = null;
		try {
			await worker.terminate();
		} catch {
			/* ignore */
		}
	}
}
