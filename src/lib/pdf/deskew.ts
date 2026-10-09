import { PDFDocument } from 'pdf-lib';
import { blobToJpeg } from '$lib/pdf/convert';

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
 * Fine-rotate (deskew) pages by re-rasterizing with a small angle and optional contrast boost.
 * Best for scans; text becomes an image.
 */
export async function deskewPdf(
	file: File,
	engine: EngineLike,
	options: {
		angleDeg?: number;
		contrast?: number;
		quality?: number;
		scaleFactor?: number;
		onProgress?: (p: { page: number; total: number }) => void;
	} = {}
): Promise<Uint8Array> {
	const angle = options.angleDeg ?? 0;
	const contrast = options.contrast ?? 1;
	const quality = options.quality ?? 0.85;
	const scaleFactor = options.scaleFactor ?? 1.5;

	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: `deskew-${Date.now()}`, content: buffer }).toPromise();
	const out = await PDFDocument.create();
	const total = doc.pages.length;

	for (let i = 0; i < total; i++) {
		options.onProgress?.({ page: i + 1, total });
		const page = doc.pages[i];
		const pngBlob = await engine.renderPage(doc, page, { scaleFactor }).toPromise();
		const processed = await transformBlob(pngBlob, { angle, contrast });
		const jpeg = await blobToJpeg(processed, quality);
		const jpegBytes = new Uint8Array(await jpeg.arrayBuffer());
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

async function transformBlob(
	blob: Blob,
	opts: { angle: number; contrast: number }
): Promise<Blob> {
	const bmp = await createImageBitmap(blob);
	const rad = (opts.angle * Math.PI) / 180;
	const cos = Math.abs(Math.cos(rad));
	const sin = Math.abs(Math.sin(rad));
	const w = Math.ceil(bmp.width * cos + bmp.height * sin);
	const h = Math.ceil(bmp.width * sin + bmp.height * cos);
	const canvas = document.createElement('canvas');
	canvas.width = Math.max(1, w);
	canvas.height = Math.max(1, h);
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Canvas unavailable');
	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.translate(canvas.width / 2, canvas.height / 2);
	ctx.rotate(rad);
	if (opts.contrast !== 1) {
		ctx.filter = `contrast(${opts.contrast})`;
	}
	ctx.drawImage(bmp, -bmp.width / 2, -bmp.height / 2);
	bmp.close();
	return new Promise((resolve, reject) => {
		canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to process page'))), 'image/png');
	});
}
