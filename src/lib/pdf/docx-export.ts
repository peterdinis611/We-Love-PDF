import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

export async function pagesTextToDocx(
	pages: { page: number; text: string }[],
	title?: string
): Promise<Blob> {
	const children: Paragraph[] = [];

	if (title) {
		children.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }));
	}

	for (const { page, text } of pages) {
		children.push(
			new Paragraph({ text: `Page ${page}`, heading: HeadingLevel.HEADING_2 })
		);
		const lines = text.split('\n').filter((line) => line.trim());
		if (!lines.length) {
			children.push(new Paragraph({ children: [new TextRun('(empty page)')] }));
			continue;
		}
		for (const line of lines) {
			children.push(new Paragraph({ children: [new TextRun(line)] }));
		}
	}

	const doc = new Document({ sections: [{ children }] });
	return Packer.toBlob(doc);
}
