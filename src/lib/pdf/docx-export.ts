import {
	Document,
	HeadingLevel,
	Packer,
	Paragraph,
	Table,
	TableCell,
	TableRow,
	TextRun,
	WidthType,
	BorderStyle
} from 'docx';
import { textToTableRows } from '$lib/pdf/pdf-to-table';

export type DocxPageInput = {
	page: number;
	text: string;
};

function looksLikeTable(rows: string[][]): boolean {
	if (rows.length < 2) return false;
	const multi = rows.filter((r) => r.length > 1).length;
	return multi >= Math.ceil(rows.length * 0.4) && Math.max(...rows.map((r) => r.length)) >= 2;
}

function paragraphFromLine(line: string): Paragraph {
	const trimmed = line.trim();
	// Heuristic headings: short ALL-CAPS or trailing colon titles
	if (
		trimmed.length > 0 &&
		trimmed.length <= 80 &&
		(/^[A-Z0-9][A-Z0-9\s\-–—:&/]+$/.test(trimmed) || /:\s*$/.test(trimmed))
	) {
		return new Paragraph({
			children: [new TextRun({ text: trimmed, bold: true })],
			spacing: { before: 160, after: 80 }
		});
	}
	return new Paragraph({
		children: [new TextRun(trimmed)],
		spacing: { after: 60 }
	});
}

function tableFromRows(rows: string[][]): Table {
	const width = Math.max(...rows.map((r) => r.length), 1);
	const colWidth = Math.floor(9000 / width);
	const border = {
		style: BorderStyle.SINGLE,
		size: 4,
		color: '999999'
	};
	const borders = { top: border, bottom: border, left: border, right: border };

	return new Table({
		width: { size: 9000, type: WidthType.DXA },
		rows: rows.map(
			(row, ri) =>
				new TableRow({
					children: Array.from({ length: width }, (_, ci) => {
						const cell = row[ci] ?? '';
						return new TableCell({
							borders,
							width: { size: colWidth, type: WidthType.DXA },
							children: [
								new Paragraph({
									children: [
										new TextRun({
											text: cell,
											bold: ri === 0,
											size: 20
										})
									]
								})
							]
						});
					})
				})
		)
	});
}

/**
 * Convert extracted PDF page text into a Word document.
 * Detects multi-column / tab-separated tables and basic headings.
 */
export async function pagesTextToDocx(
	pages: DocxPageInput[],
	title?: string,
	options: { detectTables?: boolean } = {}
): Promise<Blob> {
	const detectTables = options.detectTables !== false;
	const children: (Paragraph | Table)[] = [];

	if (title) {
		children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }));
	}

	for (const { page, text } of pages) {
		children.push(new Paragraph({ text: `Page ${page}`, heading: HeadingLevel.HEADING_2 }));

		const raw = text?.trim() ?? '';
		if (!raw) {
			children.push(new Paragraph({ children: [new TextRun({ text: '(empty page)', italics: true })] }));
			continue;
		}

		const rows = textToTableRows(raw);
		if (detectTables && looksLikeTable(rows)) {
			children.push(tableFromRows(rows));
			children.push(new Paragraph({ children: [] }));
			continue;
		}

		// Prefer original line breaks for body copy (preserves short paragraphs better)
		const lines = raw.split(/\r?\n/).map((l) => l.trimEnd());
		let blankRun = 0;
		for (const line of lines) {
			if (!line.trim()) {
				blankRun += 1;
				if (blankRun === 1) children.push(new Paragraph({ children: [] }));
				continue;
			}
			blankRun = 0;
			children.push(paragraphFromLine(line));
		}
	}

	const doc = new Document({
		sections: [
			{
				properties: {
					page: {
						margin: { top: 720, right: 720, bottom: 720, left: 720 }
					}
				},
				children
			}
		]
	});
	return Packer.toBlob(doc);
}
