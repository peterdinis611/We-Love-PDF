import { PDFDocument, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
	escapeHtml,
	markdownToPdf,
	parseMarkdownBlocks,
	textToHtml,
	textToMarkdown,
	textToPdf,
	wrapText
} from '$lib/pdf/convert';

describe('parseMarkdownBlocks', () => {
	it('parses headings and lists', () => {
		const blocks = parseMarkdownBlocks('# Title\n\n- one\n- two');
		expect(blocks[0]).toMatchObject({ text: 'Title', fontSize: 24, bold: true });
		expect(blocks.some((b) => b.prefix === '• ')).toBe(true);
	});
});

describe('textToHtml', () => {
	it('escapes HTML and wraps paragraphs', () => {
		const html = textToHtml('Hello <world>\n\nSecond paragraph', 'Test');
		expect(html).toContain('&lt;world&gt;');
		expect(html).toContain('<p>Hello &lt;world&gt;</p>');
		expect(html).toContain('Second paragraph');
	});
});

describe('textToMarkdown', () => {
	it('adds a title and preserves line breaks', () => {
		const md = textToMarkdown('Line one\n\nLine two', 'Doc');
		expect(md).toContain('# Doc');
		expect(md).toContain('Line one');
	});
});

describe('escapeHtml', () => {
	it('escapes special characters', () => {
		expect(escapeHtml(`a & b <c>`)).toBe('a &amp; b &lt;c&gt;');
	});
});

describe('textToPdf', () => {
	it('creates a valid PDF', async () => {
		const bytes = await textToPdf('Hello PDF world');
		const doc = await PDFDocument.load(bytes);
		expect(doc.getPageCount()).toBeGreaterThan(0);
	});
});

describe('markdownToPdf', () => {
	it('creates a valid PDF from markdown', async () => {
		const bytes = await markdownToPdf('# Hello\n\nParagraph text.');
		const doc = await PDFDocument.load(bytes);
		expect(doc.getPageCount()).toBe(1);
	});
});

describe('wrapText', () => {
	it('wraps long lines', async () => {
		const doc = await PDFDocument.create();
		const font = await doc.embedFont(StandardFonts.Helvetica);
		const lines = wrapText('one two three four five six seven eight nine ten', font, 12, 80);
		expect(lines.length).toBeGreaterThan(1);
	});
});
