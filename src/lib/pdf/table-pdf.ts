import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ConvertPageSize } from './convert';

export interface TableToPdfOptions {
	pageSize?: ConvertPageSize;
	fontSize?: number;
	margin?: number;
	title?: string;
	header?: boolean;
}

const PAGE_SIZES: Record<ConvertPageSize, [number, number]> = {
	a4: [595.28, 841.89],
	letter: [612, 792]
};

export async function tableToPdf(rows: string[][], options: TableToPdfOptions = {}): Promise<Uint8Array> {
	if (!rows.length) throw new Error('No table data.');

	const { pageSize = 'a4', fontSize = 10, margin = 40, title, header = true } = options;
	const doc = await PDFDocument.create();
	const regular = await doc.embedFont(StandardFonts.Helvetica);
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);
	const [pageW, pageH] = PAGE_SIZES[pageSize];
	const columns = Math.max(...rows.map((row) => row.length), 1);
	const innerW = pageW - margin * 2;
	const colWidth = innerW / columns;
	const lineHeight = fontSize * 1.5;
	const rowHeight = lineHeight + 6;

	let page = doc.addPage([pageW, pageH]);
	let y = pageH - margin;

	if (title) {
		page.drawText(title, { x: margin, y: y - fontSize, size: fontSize + 4, font: bold });
		y -= lineHeight * 2;
	}

	const drawRow = (row: string[], isHeader = false) => {
		if (y - rowHeight < margin) {
			page = doc.addPage([pageW, pageH]);
			y = pageH - margin;
		}

		const font = isHeader ? bold : regular;
		if (isHeader) {
			page.drawRectangle({
				x: margin,
				y: y - rowHeight + 4,
				width: innerW,
				height: rowHeight,
				color: rgb(0.95, 0.95, 0.95)
			});
		}

		for (let col = 0; col < columns; col++) {
			const cell = row[col] ?? '';
			const clipped = cell.length > 28 ? `${cell.slice(0, 25)}…` : cell;
			page.drawText(clipped, {
				x: margin + col * colWidth + 4,
				y: y - fontSize,
				size: fontSize,
				font,
				color: rgb(0.1, 0.1, 0.1)
			});
		}

		y -= rowHeight;
	};

	const [first, ...rest] = rows;
	if (header && first) {
		drawRow(first, true);
		for (const row of rest) drawRow(row);
	} else {
		for (const row of rows) drawRow(row);
	}

	return doc.save();
}
