import PptxGenJS from 'pptxgenjs';
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
	extractText?: (doc: unknown, indexes: number[]) => { toPromise: () => Promise<string> };
};

function blobToDataUrl(blob: Blob): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error('Failed to read image'));
		reader.readAsDataURL(blob);
	});
}

/** Convert each PDF page to a PPTX slide (raster image + optional extracted text in notes). */
export async function pdfToPptx(
	file: File,
	engine: EngineLike,
	options: {
		scaleFactor?: number;
		quality?: number;
		includeNotes?: boolean;
		onProgress?: (p: { page: number; total: number }) => void;
	} = {}
): Promise<Uint8Array> {
	const scaleFactor = options.scaleFactor ?? 1.5;
	const quality = options.quality ?? 0.82;
	const buffer = await file.arrayBuffer();
	const doc = await engine
		.openDocumentBuffer({ id: `pptx-${Date.now()}`, content: buffer })
		.toPromise();
	const pptx = new PptxGenJS();
	pptx.author = 'WeLovePDF';
	pptx.title = file.name.replace(/\.pdf$/i, '');
	const total = doc.pages.length;

	for (let i = 0; i < total; i++) {
		options.onProgress?.({ page: i + 1, total });
		const page = doc.pages[i];
		const png = await engine.renderPage(doc, page, { scaleFactor }).toPromise();
		const jpeg = await blobToJpeg(png, quality);
		const dataUrl = await blobToDataUrl(jpeg);

		const wPt = page.size.width;
		const hPt = page.size.height;
		const slideW = 10;
		const slideH = Math.max(5.625, (hPt / wPt) * slideW);
		const layoutName = `page-${i}`;
		pptx.defineLayout({ name: layoutName, width: slideW, height: slideH });
		pptx.layout = layoutName;
		const slide = pptx.addSlide();
		slide.addImage({
			data: dataUrl,
			x: 0,
			y: 0,
			w: slideW,
			h: slideH
		});

		if (options.includeNotes && engine.extractText) {
			try {
				const text = await engine.extractText(doc, [i]).toPromise();
				if (text?.trim()) slide.addNotes(text.trim().slice(0, 4000));
			} catch {
				// notes optional
			}
		}
	}

	const out = (await pptx.write({ outputType: 'uint8array' })) as Uint8Array;
	return out;
}
