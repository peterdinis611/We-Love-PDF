import { describe, expect, it } from 'vitest';
import { PDFDocument } from 'pdf-lib';
import { suggestDropActions } from '$lib/smart-drop';

async function pdfFile(name: string, pages: number, padBytes = 0): Promise<File> {
	const doc = await PDFDocument.create();
	for (let i = 0; i < pages; i++) doc.addPage();
	const bytes = await doc.save();
	const padded = new Uint8Array(bytes.length + padBytes);
	padded.set(bytes);
	return new File([padded.slice()], name, { type: 'application/pdf' });
}

describe('suggestDropActions', () => {
	it('suggests merge first for multiple files', async () => {
		const a = await pdfFile('a.pdf', 1);
		const b = await pdfFile('b.pdf', 1);
		const actions = await suggestDropActions([a, b], 'en');
		expect(actions[0]?.slug).toBe('merge-pdf');
		expect(actions[0]?.primary).toBe(true);
	});

	it('suggests compress for large multi-page files', async () => {
		// Many pages + padding → large total, but not "scan-like" per page
		const large = await pdfFile('big.pdf', 20, 5.5 * 1024 * 1024);
		const actions = await suggestDropActions([large], 'en');
		expect(actions.some((a) => a.slug === 'compress-pdf' && a.primary)).toBe(true);
	});

	it('suggests OCR for heavy per-page files', async () => {
		const scanLike = await pdfFile('scan.pdf', 1, 500_000);
		const actions = await suggestDropActions([scanLike], 'en');
		expect(actions[0]?.slug).toBe('ocr-pdf');
	});
});
