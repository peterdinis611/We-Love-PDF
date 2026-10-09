import { PDFDocument, StandardFonts, rgb, degrees, PageSizes, type PDFPage } from 'pdf-lib';

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

export const PAGE_TARGETS: Record<string, [number, number]> = {
	a4: PageSizes.A4,
	letter: PageSizes.Letter,
	a3: PageSizes.A3,
	a5: PageSizes.A5
};

/** Place multiple source pages onto each output sheet (2-up, 4-up, 9-up). */
export async function nUpPdf(
	file: File,
	options: { n?: 2 | 4 | 9; target?: keyof typeof PAGE_TARGETS; gap?: number } = {}
): Promise<Uint8Array> {
	const n = options.n ?? 2;
	const gap = options.gap ?? 12;
	const targetSize = PAGE_TARGETS[options.target ?? 'a4'] ?? PageSizes.A4;
	const cols = n === 2 ? 2 : n === 4 ? 2 : 3;
	const rows = n === 2 ? 1 : n === 4 ? 2 : 3;

	const source = await loadPdf(file);
	const out = await PDFDocument.create();
	const sourcePages = source.getPages();
	const cellW = (targetSize[0] - gap * (cols + 1)) / cols;
	const cellH = (targetSize[1] - gap * (rows + 1)) / rows;

	for (let i = 0; i < sourcePages.length; i += n) {
		const chunk = sourcePages.slice(i, i + n);
		const sheet = out.addPage(targetSize);
		for (let j = 0; j < chunk.length; j++) {
			const embedded = await out.embedPage(chunk[j]);
			const col = j % cols;
			const row = Math.floor(j / cols);
			const sw = embedded.width;
			const sh = embedded.height;
			const scale = Math.min(cellW / sw, cellH / sh);
			const w = sw * scale;
			const h = sh * scale;
			const x = gap + col * (cellW + gap) + (cellW - w) / 2;
			const y = targetSize[1] - gap - (row + 1) * cellH - row * gap + (cellH - h) / 2;
			sheet.drawPage(embedded, { x, y, xScale: scale, yScale: scale });
		}
	}

	return out.save({ useObjectStreams: true });
}

/** Booklet imposition (saddle-stitch order) on landscape A4 sheets (2-up). */
export async function bookletPdf(file: File): Promise<Uint8Array> {
	const source = await loadPdf(file);
	const outSrc = await PDFDocument.create();
	const all = await outSrc.copyPages(source, source.getPageIndices());
	all.forEach((p) => outSrc.addPage(p));
	const pad = (4 - (outSrc.getPageCount() % 4)) % 4;
	for (let i = 0; i < pad; i++) outSrc.addPage(PageSizes.A4);
	const count = outSrc.getPageCount();
	const srcPages = outSrc.getPages();

	const imposed = await PDFDocument.create();
	const [sheetW, sheetH] = [PageSizes.A4[1], PageSizes.A4[0]];
	const sheets = count / 2;

	for (let s = 0; s < sheets; s++) {
		const leftIdx = count - 1 - s;
		const rightIdx = s;
		const sheet = imposed.addPage([sheetW, sheetH]);
		const halfW = sheetW / 2;

		const place = async (page: PDFPage, xOffset: number) => {
			const embedded = await imposed.embedPage(page);
			const sw = embedded.width;
			const sh = embedded.height;
			const scale = Math.min(halfW / sw, sheetH / sh) * 0.95;
			const w = sw * scale;
			const h = sh * scale;
			const x = xOffset + (halfW - w) / 2;
			const y = (sheetH - h) / 2;
			sheet.drawPage(embedded, { x, y, xScale: scale, yScale: scale });
		};

		await place(srcPages[leftIdx], 0);
		await place(srcPages[rightIdx], halfW);
	}

	return imposed.save({ useObjectStreams: true });
}

export async function addHeaderFooter(
	file: File,
	options: {
		header?: string;
		footer?: string;
		fontSize?: number;
		margin?: number;
		includePageNumber?: boolean;
	} = {}
): Promise<Uint8Array> {
	const {
		header = '',
		footer = '',
		fontSize = 10,
		margin = 36,
		includePageNumber = false
	} = options;
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();
	const total = pages.length;

	pages.forEach((page, i) => {
		const { width, height } = page.getSize();
		if (header) {
			const hw = font.widthOfTextAtSize(header, fontSize);
			page.drawText(header, {
				x: Math.max(margin, (width - hw) / 2),
				y: height - margin,
				size: fontSize,
				font,
				color: rgb(0.25, 0.25, 0.25)
			});
		}
		let foot = footer;
		if (includePageNumber) {
			const num = `${i + 1} / ${total}`;
			foot = foot ? `${foot}   ${num}` : num;
		}
		if (foot) {
			const fw = font.widthOfTextAtSize(foot, fontSize);
			page.drawText(foot, {
				x: Math.max(margin, (width - fw) / 2),
				y: margin - 4,
				size: fontSize,
				font,
				color: rgb(0.25, 0.25, 0.25)
			});
		}
	});

	return doc.save();
}

/** Remove mostly-empty pages (tiny/missing content streams). */
export async function removeBlankPages(
	file: File,
	options: { minContentBytes?: number } = {}
): Promise<{ bytes: Uint8Array; removed: number; kept: number }> {
	const minBytes = options.minContentBytes ?? 48;
	const source = await loadPdf(file);
	const keep: number[] = [];
	const pages = source.getPages();

	for (let i = 0; i < pages.length; i++) {
		const page = pages[i];
		const contents = page.node.Contents();
		let size = 0;
		if (contents) {
			const asArray = Array.isArray(contents) ? contents : [contents];
			for (const ref of asArray) {
				try {
					const stream = source.context.lookup(ref);
					const raw = (stream as { getContents?: () => Uint8Array }).getContents?.();
					if (raw) size += raw.length;
					else size += 100;
				} catch {
					size += 100;
				}
			}
		}
		if (size >= minBytes) keep.push(i);
	}

	if (!keep.length) throw new Error('All pages look blank — nothing to keep.');

	const out = await PDFDocument.create();
	const copied = await out.copyPages(source, keep);
	copied.forEach((p) => out.addPage(p));
	const bytes = await out.save({ useObjectStreams: true });
	return { bytes, removed: pages.length - keep.length, kept: keep.length };
}

export async function resizePdfPages(
	file: File,
	options: { target?: keyof typeof PAGE_TARGETS; mode?: 'fit' | 'stretch' } = {}
): Promise<Uint8Array> {
	const target = PAGE_TARGETS[options.target ?? 'a4'] ?? PageSizes.A4;
	const mode = options.mode ?? 'fit';
	const source = await loadPdf(file);
	const out = await PDFDocument.create();

	for (const page of source.getPages()) {
		const sheet = out.addPage(target);
		const embedded = await out.embedPage(page);
		const sw = embedded.width;
		const sh = embedded.height;
		let scaleX = target[0] / sw;
		let scaleY = target[1] / sh;
		if (mode === 'fit') {
			const s = Math.min(scaleX, scaleY);
			scaleX = s;
			scaleY = s;
		}
		const w = sw * scaleX;
		const h = sh * scaleY;
		const x = (target[0] - w) / 2;
		const y = (target[1] - h) / 2;
		sheet.drawPage(embedded, { x, y, xScale: scaleX, yScale: scaleY });
	}

	return out.save({ useObjectStreams: true });
}

export async function stampPdf(
	file: File,
	options: {
		text: string;
		color?: 'red' | 'blue' | 'gray' | 'green';
		opacity?: number;
		angle?: number;
		allPages?: boolean;
	}
): Promise<Uint8Array> {
	const colors = {
		red: rgb(0.75, 0.1, 0.1),
		blue: rgb(0.1, 0.25, 0.7),
		gray: rgb(0.4, 0.4, 0.4),
		green: rgb(0.1, 0.55, 0.25)
	};
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.HelveticaBold);
	const pages = doc.getPages();
	const targets = options.allPages === false ? [pages[0]] : pages;
	const size = 48;
	const color = colors[options.color ?? 'red'];
	const angle = options.angle ?? -35;

	for (const page of targets) {
		const { width, height } = page.getSize();
		const textWidth = font.widthOfTextAtSize(options.text, size);
		page.drawText(options.text, {
			x: width / 2 - textWidth / 2,
			y: height / 2,
			size,
			font,
			color,
			rotate: degrees(angle),
			opacity: options.opacity ?? 0.35
		});
	}

	return doc.save();
}
