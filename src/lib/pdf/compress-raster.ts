import { PDFDocument } from 'pdf-lib';
import { blobToJpeg } from '$lib/pdf/convert';

export type CompressProgress = { page: number; total: number };

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

/**
 * Strong compress: rasterize each page to JPEG and rebuild the PDF.
 * Destroys selectable text / forms / links — use for scans & image-heavy docs.
 */
export async function compressPdfRaster(
	file: File,
	engine: EngineLike,
	options: {
		quality?: number;
		scaleFactor?: number;
		onProgress?: (p: CompressProgress) => void;
		signal?: AbortSignal;
	} = {}
): Promise<Uint8Array> {
	const { quality = 0.72, scaleFactor = 1.5, onProgress, signal } = options;
	const buffer = await file.arrayBuffer();
	const doc = await engine
		.openDocumentBuffer({ id: `compress-${Date.now()}`, content: buffer })
		.toPromise();
	const out = await PDFDocument.create();
	const total = doc.pages.length;
	const render = engine.renderPage;

	for (let i = 0; i < total; i++) {
		if (signal?.aborted) throw new DOMException('Compression cancelled', 'AbortError');
		onProgress?.({ page: i + 1, total });
		const page = doc.pages[i];
		const pngBlob = await render(doc, page, { scaleFactor }).toPromise();
		const jpegBlob = await blobToJpeg(pngBlob, quality);
		const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
		const image = await out.embedJpg(jpegBytes);
		const pdfPage = out.addPage([page.size.width, page.size.height]);
		pdfPage.drawImage(image, {
			x: 0,
			y: 0,
			width: page.size.width,
			height: page.size.height
		});
	}

	return out.save({ useObjectStreams: true });
}
