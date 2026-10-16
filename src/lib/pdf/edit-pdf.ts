import { PDFDocument, rgb, StandardFonts, degrees, type RGB } from 'pdf-lib';

export type EditOverlay =
	| {
			kind: 'text';
			page: number;
			x: number;
			y: number;
			text: string;
			fontSize?: number;
			color?: RGB;
	  }
	| {
			kind: 'image';
			page: number;
			x: number;
			y: number;
			width: number;
			height: number;
			bytes: Uint8Array;
			mime?: string;
	  }
	| {
			kind: 'rect';
			page: number;
			x: number;
			y: number;
			width: number;
			height: number;
			fill?: RGB;
			stroke?: RGB;
			strokeWidth?: number;
			opacity?: number;
	  }
	| {
			kind: 'line';
			page: number;
			x1: number;
			y1: number;
			x2: number;
			y2: number;
			color?: RGB;
			thickness?: number;
	  };

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

/** Burn text, images, rectangles, and lines into PDF pages (pdf-lib coordinates, origin bottom-left). */
export async function applyEditOverlays(file: File, overlays: EditOverlay[]): Promise<Uint8Array> {
	if (!overlays.length) throw new Error('Add at least one element to edit.');
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	for (const overlay of overlays) {
		const page = pages[overlay.page];
		if (!page) continue;

		if (overlay.kind === 'text') {
			page.drawText(overlay.text, {
				x: overlay.x,
				y: overlay.y,
				size: overlay.fontSize ?? 14,
				font,
				color: overlay.color ?? rgb(0, 0, 0)
			});
		} else if (overlay.kind === 'image') {
			const mime = overlay.mime ?? 'image/png';
			const image =
				mime.includes('jpeg') || mime.includes('jpg')
					? await doc.embedJpg(overlay.bytes)
					: await doc.embedPng(overlay.bytes);
			page.drawImage(image, {
				x: overlay.x,
				y: overlay.y,
				width: overlay.width,
				height: overlay.height
			});
		} else if (overlay.kind === 'rect') {
			page.drawRectangle({
				x: overlay.x,
				y: overlay.y,
				width: overlay.width,
				height: overlay.height,
				color: overlay.fill,
				borderColor: overlay.stroke ?? rgb(0.15, 0.15, 0.15),
				borderWidth: overlay.strokeWidth ?? (overlay.fill ? 0 : 1.5),
				opacity: overlay.opacity ?? 1,
				borderOpacity: overlay.opacity ?? 1
			});
		} else if (overlay.kind === 'line') {
			page.drawLine({
				start: { x: overlay.x1, y: overlay.y1 },
				end: { x: overlay.x2, y: overlay.y2 },
				thickness: overlay.thickness ?? 1.5,
				color: overlay.color ?? rgb(0.15, 0.15, 0.15)
			});
		}
	}

	return doc.save();
}

export { rgb, degrees };
