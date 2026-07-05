import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import type { ConvertPageSize } from './convert';

export interface CsvToPdfOptions {
	pageSize?: ConvertPageSize;
	fontSize?: number;
	margin?: number;
	title?: string;
}

const PAGE_SIZES: Record<ConvertPageSize, [number, number]> = {
	a4: [595.28, 841.89],
	letter: [612, 792]
};

export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];

	for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
		if (!line.trim()) continue;
		const row: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
				continue;
			}
			if (char === ',' && !inQuotes) {
				row.push(current.trim());
				current = '';
				continue;
			}
			current += char;
		}

		row.push(current.trim());
		rows.push(row);
	}

	return rows.filter((row) => row.some((cell) => cell.length > 0));
}

export async function csvToPdf(csv: string, options: CsvToPdfOptions = {}): Promise<Uint8Array> {
	const rows = parseCsv(csv);
	if (!rows.length) throw new Error('CSV file is empty.');

	const { pageSize = 'a4', fontSize = 10, margin = 40, title } = options;
	const doc = await PDFDocument.create();
	const regular = await doc.embedFont(StandardFonts.Helvetica);
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);
	const [pageW, pageH] = PAGE_SIZES[pageSize];
	const columns = Math.max(...rows.map((row) => row.length));
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

	const drawRow = (row: string[], header = false) => {
		if (y - rowHeight < margin) {
			page = doc.addPage([pageW, pageH]);
			y = pageH - margin;
		}

		const font = header ? bold : regular;
		if (header) {
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

	drawRow(rows[0], true);
	for (const row of rows.slice(1)) {
		drawRow(row);
	}

	return doc.save();
}
