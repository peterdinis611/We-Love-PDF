import { PDFDocument, rgb, type PDFImage } from 'pdf-lib';

export type DrawnSignPosition = 'bottom-left' | 'bottom-center' | 'bottom-right';

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

/** Place a PNG/JPEG signature image on the last page (or all pages). */
export async function applyImageSignature(
	file: File,
	imageBytes: Uint8Array,
	options: {
		mime?: string;
		allPages?: boolean;
		position?: DrawnSignPosition;
		maxWidth?: number;
		includeDate?: boolean;
	} = {}
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const mime = options.mime ?? 'image/png';
	let image: PDFImage;
	if (mime.includes('jpeg') || mime.includes('jpg')) {
		image = await doc.embedJpg(imageBytes);
	} else {
		image = await doc.embedPng(imageBytes);
	}

	const maxW = options.maxWidth ?? 160;
	const scale = Math.min(1, maxW / image.width);
	const w = image.width * scale;
	const h = image.height * scale;
	const pages = doc.getPages();
	const targets = options.allPages ? pages : [pages[pages.length - 1]];
	const position = options.position ?? 'bottom-left';
	const dateLabel = options.includeDate ? new Date().toLocaleDateString() : '';

	for (const page of targets) {
		const { width } = page.getSize();
		let x = 40;
		if (position === 'bottom-center') x = (width - w) / 2;
		if (position === 'bottom-right') x = width - w - 40;
		const y = 36;
		page.drawImage(image, { x, y, width: w, height: h });
		if (dateLabel) {
			page.drawText(dateLabel, {
				x,
				y: y - 12,
				size: 9,
				color: rgb(0.35, 0.35, 0.35)
			});
		}
	}

	return doc.save();
}

/** Convert a canvas data URL (PNG) to bytes for embedding. */
export function dataUrlToBytes(dataUrl: string): Uint8Array {
	const base64 = dataUrl.split(',')[1];
	if (!base64) throw new Error('Invalid signature image.');
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
