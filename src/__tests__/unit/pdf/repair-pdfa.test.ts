import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { repairPdf } from '$lib/pdf/repair';
import { exportPdfA } from '$lib/pdf/pdfa';

async function makePdfFile(pages = 2): Promise<File> {
	const doc = await PDFDocument.create();
	doc.setTitle('Repair Me');
	doc.setAuthor('Tester');
	const font = await doc.embedFont(StandardFonts.Helvetica);
	for (let i = 0; i < pages; i++) {
		const page = doc.addPage();
		page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 18, font });
	}
	const bytes = await doc.save();
	return new File([bytes.slice()], 'sample.pdf', { type: 'application/pdf' });
}

describe('repairPdf', () => {
	it('rebuilds pages and preserves page count', async () => {
		const file = await makePdfFile(3);
		const result = await repairPdf(file);
		expect(result.pageCount).toBe(3);
		expect(result.bytes.length).toBeGreaterThan(100);
		expect(result.notes.length).toBeGreaterThan(0);

		const reopened = await PDFDocument.load(result.bytes);
		expect(reopened.getPageCount()).toBe(3);
	});
});

describe('exportPdfA', () => {
	it('embeds PDF/A identification markers', async () => {
		const file = await makePdfFile(1);
		const result = await exportPdfA(file, { conformance: 'PDF/A-2b' });
		expect(result.pageCount).toBe(1);
		expect(result.conformance).toBe('PDF/A-2b');
		const text = new TextDecoder('latin1').decode(result.bytes);
		expect(text).toContain('pdfaid:part');
		expect(text).toContain('pdfaid:conformance');
	});
});
