import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { cropPdf, removeAllMetadata } from '$lib/pdf/operations';
import { buildZip, uniqueZipName } from '$lib/pdf/zip';
import { parseCsv, csvToPdf } from '$lib/pdf/csv';

async function createPdf(): Promise<File> {
	const doc = await PDFDocument.create();
	doc.setTitle('Secret');
	doc.setAuthor('Tester');
	doc.addPage([400, 600]);
	const bytes = await doc.save();
	return new File([new Uint8Array(bytes)], 'test.pdf', { type: 'application/pdf' });
}

describe('cropPdf', () => {
	it('reduces crop box dimensions', async () => {
		const file = await createPdf();
		const result = await cropPdf(file, { top: 20, right: 20, bottom: 20, left: 20 });
		const doc = await PDFDocument.load(result);
		const box = doc.getPage(0).getCropBox();
		expect(box.width).toBeLessThan(400);
		expect(box.height).toBeLessThan(600);
	});
});

describe('removeAllMetadata', () => {
	it('clears document metadata', async () => {
		const file = await createPdf();
		const result = await removeAllMetadata(file);
		const doc = await PDFDocument.load(result);
		expect(doc.getTitle()).toBe('');
		expect(doc.getAuthor()).toBe('');
	});
});

describe('zip helpers', () => {
	it('builds a zip archive', async () => {
		const zipped = await buildZip([
			{ name: 'a.txt', data: new TextEncoder().encode('hello') },
			{ name: 'b.txt', data: new TextEncoder().encode('world') }
		]);
		expect(zipped.length).toBeGreaterThan(0);
	});

	it('deduplicates zip entry names', () => {
		const used = new Set<string>();
		expect(uniqueZipName('file.pdf', used)).toBe('file.pdf');
		expect(uniqueZipName('file.pdf', used)).toBe('file-2.pdf');
	});
});

describe('csvToPdf', () => {
	it('parses quoted CSV fields', () => {
		const rows = parseCsv('Name,Note\nJane,"Hello, world"');
		expect(rows).toEqual([
			['Name', 'Note'],
			['Jane', 'Hello, world']
		]);
	});

	it('creates a PDF from CSV data', async () => {
		const csv = 'Name,Score\nAlice,10\nBob,20';
		const bytes = await csvToPdf(csv, { title: 'Scores' });
		const doc = await PDFDocument.load(bytes);
		expect(doc.getPageCount()).toBeGreaterThan(0);
	});
});
