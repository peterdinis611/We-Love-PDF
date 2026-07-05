import { PDFDocument, StandardFonts, type PDFFont } from 'pdf-lib';

export type ConvertPageSize = 'a4' | 'letter';

export interface TextLayoutOptions {
	pageSize?: ConvertPageSize;
	margin?: number;
	fontSize?: number;
	lineHeight?: number;
}

export interface TextBlock {
	text: string;
	fontSize: number;
	bold?: boolean;
	spacingAfter?: number;
	prefix?: string;
}

const PAGE_SIZES: Record<ConvertPageSize, [number, number]> = {
	a4: [595.28, 841.89],
	letter: [612, 792]
};

export function ensureHtmlFilename(filename: string): string {
	const normalized = filename.trim() || 'document.html';
	return normalized.toLowerCase().endsWith('.html') ? normalized : `${normalized}.html`;
}

export function ensureMdFilename(filename: string): string {
	const normalized = filename.trim() || 'document.md';
	return normalized.toLowerCase().endsWith('.md') ? normalized : `${normalized}.md`;
}

export function escapeHtml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number): string[] {
	if (!text.trim()) return [''];

	const words = text.split(/\s+/).filter(Boolean);
	const lines: string[] = [];
	let current = '';

	for (const word of words) {
		const candidate = current ? `${current} ${word}` : word;
		if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
			current = candidate;
		} else {
			if (current) lines.push(current);
			current = word;
		}
	}

	if (current) lines.push(current);
	return lines.length ? lines : [''];
}

export async function blocksToPdf(
	blocks: TextBlock[],
	options: TextLayoutOptions = {}
): Promise<Uint8Array> {
	if (!blocks.length) throw new Error('No content to convert.');

	const { pageSize = 'a4', margin = 48, lineHeight = 1.45 } = options;
	const doc = await PDFDocument.create();
	const regular = await doc.embedFont(StandardFonts.Helvetica);
	const bold = await doc.embedFont(StandardFonts.HelveticaBold);

	let page = doc.addPage(PAGE_SIZES[pageSize]);
	let { width, height } = page.getSize();
	let y = height - margin;
	const maxWidth = width - margin * 2;

	const newPage = () => {
		page = doc.addPage(PAGE_SIZES[pageSize]);
		({ width, height } = page.getSize());
		y = height - margin;
	};

	for (const block of blocks) {
		const font = block.bold ? bold : regular;
		const content = block.prefix ? `${block.prefix}${block.text}` : block.text;
		const lines = wrapText(content, font, block.fontSize, maxWidth);
		const step = block.fontSize * lineHeight;

		for (const line of lines) {
			if (y - step < margin) newPage();
			page.drawText(line, { x: margin, y: y - block.fontSize, size: block.fontSize, font });
			y -= step;
		}

		if (block.spacingAfter) {
			y -= block.spacingAfter;
			if (y < margin) newPage();
		}
	}

	return doc.save();
}

export async function textToPdf(text: string, options: TextLayoutOptions = {}): Promise<Uint8Array> {
	const fontSize = options.fontSize ?? 12;
	const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
	const blocks: TextBlock[] = paragraphs.flatMap((paragraph, index) => {
		const lines = paragraph.split('\n');
		return lines.map((line, lineIndex) => ({
			text: line,
			fontSize,
			spacingAfter: lineIndex === lines.length - 1 && index < paragraphs.length - 1 ? 8 : 0
		}));
	});

	return blocksToPdf(blocks, options);
}

export function parseMarkdownBlocks(markdown: string): TextBlock[] {
	const blocks: TextBlock[] = [];

	for (const rawLine of markdown.replace(/\r\n/g, '\n').split('\n')) {
		const line = rawLine.trimEnd();

		if (!line.trim()) {
			blocks.push({ text: '', fontSize: 12, spacingAfter: 10 });
			continue;
		}

		if (line.startsWith('# ')) {
			blocks.push({ text: line.slice(2), fontSize: 24, bold: true, spacingAfter: 14 });
		} else if (line.startsWith('## ')) {
			blocks.push({ text: line.slice(3), fontSize: 20, bold: true, spacingAfter: 12 });
		} else if (line.startsWith('### ')) {
			blocks.push({ text: line.slice(4), fontSize: 16, bold: true, spacingAfter: 10 });
		} else if (/^[-*]\s+/.test(line)) {
			blocks.push({ text: line.replace(/^[-*]\s+/, ''), fontSize: 12, prefix: '• ', spacingAfter: 4 });
		} else if (/^\d+\.\s+/.test(line)) {
			blocks.push({ text: line.replace(/^\d+\.\s+/, ''), fontSize: 12, prefix: '– ', spacingAfter: 4 });
		} else if (line.startsWith('> ')) {
			blocks.push({ text: line.slice(2), fontSize: 12, prefix: '“', spacingAfter: 6 });
		} else {
			blocks.push({ text: line, fontSize: 12, spacingAfter: 6 });
		}
	}

	return blocks;
}

export async function markdownToPdf(
	markdown: string,
	options: TextLayoutOptions = {}
): Promise<Uint8Array> {
	return blocksToPdf(parseMarkdownBlocks(markdown), options);
}

export function parseHtmlBlocks(html: string): TextBlock[] {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	const blocks: TextBlock[] = [];

	const push = (text: string, fontSize: number, bold = false, spacingAfter = 6, prefix = '') => {
		const trimmed = text.replace(/\s+/g, ' ').trim();
		if (!trimmed) return;
		blocks.push({ text: trimmed, fontSize, bold, spacingAfter, prefix });
	};

	const walk = (node: Node) => {
		if (node.nodeType === Node.TEXT_NODE) {
			const text = node.textContent?.trim();
			if (text && node.parentElement?.tagName.toLowerCase() === 'body') {
				push(text, 12);
			}
			return;
		}

		if (node.nodeType !== Node.ELEMENT_NODE) return;
		const el = node as HTMLElement;
		const tag = el.tagName.toLowerCase();

		switch (tag) {
			case 'h1':
				push(el.textContent ?? '', 24, true, 14);
				break;
			case 'h2':
				push(el.textContent ?? '', 20, true, 12);
				break;
			case 'h3':
				push(el.textContent ?? '', 16, true, 10);
				break;
			case 'h4':
			case 'h5':
			case 'h6':
				push(el.textContent ?? '', 14, true, 8);
				break;
			case 'p':
				push(el.textContent ?? '', 12, false, 8);
				break;
			case 'li':
				push(el.textContent ?? '', 12, false, 4, '• ');
				break;
			case 'blockquote':
				push(el.textContent ?? '', 12, false, 8, '“');
				break;
			case 'br':
				blocks.push({ text: '', fontSize: 12, spacingAfter: 6 });
				break;
			default:
				for (const child of el.childNodes) walk(child);
		}
	};

	for (const child of doc.body.childNodes) walk(child);

	if (!blocks.length) {
		const fallback = doc.body.textContent?.trim();
		if (fallback) push(fallback, 12);
	}

	return blocks;
}

export async function htmlToPdf(html: string, options: TextLayoutOptions = {}): Promise<Uint8Array> {
	const wrapped = html.includes('<html') ? html : `<!DOCTYPE html><html><body>${html}</body></html>`;
	return blocksToPdf(parseHtmlBlocks(wrapped), options);
}

export function textToHtml(text: string, title = 'Extracted PDF'): string {
	const paragraphs = text.replace(/\r\n/g, '\n').split(/\n{2,}/);
	const body = paragraphs
		.map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
		.join('\n');

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>
    body { font-family: Georgia, serif; line-height: 1.6; max-width: 720px; margin: 2rem auto; padding: 0 1rem; color: #111; }
    p { margin: 0 0 1rem; }
  </style>
</head>
<body>
${body}
</body>
</html>`;
}

export function textToMarkdown(text: string, title = 'Document'): string {
	const normalized = text.replace(/\r\n/g, '\n').trim();
	const sections = normalized.split(/\n{2,}/);
	const body = sections.map((section) => section.replace(/\n/g, '  \n')).join('\n\n');
	return `# ${title}\n\n${body}\n`;
}

export async function blobToJpeg(blob: Blob, quality = 0.92): Promise<Blob> {
	if (blob.type === 'image/jpeg') return blob;

	const bitmap = await createImageBitmap(blob);
	const canvas = document.createElement('canvas');
	canvas.width = bitmap.width;
	canvas.height = bitmap.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not create canvas context.');
	ctx.drawImage(bitmap, 0, 0);
	bitmap.close();

	return new Promise((resolve, reject) => {
		canvas.toBlob(
			(result) => (result ? resolve(result) : reject(new Error('JPEG conversion failed.'))),
			'image/jpeg',
			quality
		);
	});
}
