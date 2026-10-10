import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { PageNumberPosition } from './operations';

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

export type BatesOptions = {
	prefix?: string;
	suffix?: string;
	start?: number;
	pad?: number;
	position?: PageNumberPosition;
	fontSize?: number;
};

/** Legal/archive Bates-style numbering: PREFIX000001SUFFIX on each page. */
export async function addBatesNumbers(file: File, options: BatesOptions = {}): Promise<Uint8Array> {
	const {
		prefix = '',
		suffix = '',
		start = 1,
		pad = 6,
		position = 'bottom-right',
		fontSize = 10
	} = options;

	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	pages.forEach((page, i) => {
		const n = String(start + i).padStart(pad, '0');
		const label = `${prefix}${n}${suffix}`;
		const { width, height } = page.getSize();
		const tw = font.widthOfTextAtSize(label, fontSize);
		let x = width - tw - 36;
		let y = 24;
		if (position === 'bottom-left') x = 36;
		if (position === 'bottom-center') x = (width - tw) / 2;
		if (position === 'top-center') {
			x = (width - tw) / 2;
			y = height - 28;
		}
		if (position === 'top-right') {
			x = width - tw - 36;
			y = height - 28;
		}
		page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
	});

	return doc.save();
}
