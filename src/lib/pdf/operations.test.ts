import { PDFDocument, StandardFonts } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import {
	addPageNumbers,
	addWatermark,
	compressPdf,
	deletePages,
	duplicatePages,
	editMetadata,
	extractPages,
	formatFileSize,
	getPageCount,
	getPdfInfo,
	imagesToPdf,
	mergePdfs,
	organizePdf,
	parsePageRanges,
	compressionRatio,
	rotateAllPages,
	rotatePdf,
	signPdf,
	splitPdf
} from './operations';

async function createPdf(pages = 1, meta?: { title?: string; author?: string }): Promise<File> {
	const doc = await PDFDocument.create();
	if (meta?.title) doc.setTitle(meta.title);
	if (meta?.author) doc.setAuthor(meta.author);
	const font = await doc.embedFont(StandardFonts.Helvetica);

	for (let i = 0; i < pages; i++) {
		const page = doc.addPage();
		page.drawText(`Page ${i + 1}`, { x: 50, y: 700, size: 18, font });
	}

	const bytes = await doc.save();
	return new File([new Uint8Array(bytes)], 'test.pdf', { type: 'application/pdf' });
}

async function pageCountFromBytes(bytes: Uint8Array): Promise<number> {
	const doc = await PDFDocument.load(bytes);
	return doc.getPageCount();
}

describe('parsePageRanges', () => {
	it('parses single pages and ranges', () => {
		expect(parsePageRanges('1, 3-5', 10)).toEqual([[0], [2, 3, 4]]);
	});

	it('clamps to document bounds', () => {
		expect(parsePageRanges('1-99', 3)).toEqual([[0, 1, 2]]);
	});

	it('ignores invalid parts', () => {
		expect(parsePageRanges('abc, 2', 5)).toEqual([[1]]);
	});
});

describe('utilities', () => {
	it('formatFileSize formats bytes', () => {
		expect(formatFileSize(500)).toBe('500 B');
		expect(formatFileSize(2048)).toBe('2.0 KB');
	});

	it('compressionRatio calculates percentage', () => {
		expect(compressionRatio(1000, 700)).toBe(30);
		expect(compressionRatio(0, 0)).toBe(0);
	});
});

describe('mergePdfs', () => {
	it('merges multiple PDFs', async () => {
		const a = await createPdf(2);
		const b = await createPdf(1);
		const result = await mergePdfs([a, b]);
		expect(await pageCountFromBytes(result)).toBe(3);
	});
});

describe('splitPdf', () => {
	it('splits by ranges', async () => {
		const file = await createPdf(3);
		const parts = await splitPdf(file, [[0], [1, 2]]);
		expect(parts).toHaveLength(2);
		expect(await pageCountFromBytes(parts[0])).toBe(1);
		expect(await pageCountFromBytes(parts[1])).toBe(2);
	});
});

describe('extractPages', () => {
	it('extracts selected pages', async () => {
		const file = await createPdf(4);
		const result = await extractPages(file, [0, 2]);
		expect(await pageCountFromBytes(result)).toBe(2);
	});
});

describe('deletePages', () => {
	it('removes pages and keeps the rest', async () => {
		const file = await createPdf(3);
		const result = await deletePages(file, new Set([1]));
		expect(await pageCountFromBytes(result)).toBe(2);
	});

	it('throws when all pages would be removed', async () => {
		const file = await createPdf(1);
		await expect(deletePages(file, new Set([0]))).rejects.toThrow(/keep at least one/i);
	});
});

describe('rotatePdf', () => {
	it('rotates specific pages', async () => {
		const file = await createPdf(2);
		const rotations = new Map<number, 90 | 180 | 270>();
		rotations.set(0, 90);
		const result = await rotatePdf(file, rotations);
		const doc = await PDFDocument.load(result);
		expect(doc.getPage(0).getRotation().angle).toBe(90);
	});
});

describe('rotateAllPages', () => {
	it('rotates every page', async () => {
		const file = await createPdf(2);
		const result = await rotateAllPages(file, 180);
		const doc = await PDFDocument.load(result);
		expect(doc.getPage(0).getRotation().angle).toBe(180);
		expect(doc.getPage(1).getRotation().angle).toBe(180);
	});
});

describe('organizePdf', () => {
	it('reorders pages', async () => {
		const file = await createPdf(3);
		const result = await organizePdf(file, [2, 0, 1]);
		expect(await pageCountFromBytes(result)).toBe(3);
	});
});

describe('duplicatePages', () => {
	it('appends copies of selected pages', async () => {
		const file = await createPdf(2);
		const result = await duplicatePages(file, [0]);
		expect(await pageCountFromBytes(result)).toBe(3);
	});

	it('requires at least one page', async () => {
		const file = await createPdf(1);
		await expect(duplicatePages(file, [])).rejects.toThrow(/at least one page/i);
	});
});

describe('addWatermark', () => {
	it('returns a valid PDF', async () => {
		const file = await createPdf(1);
		const result = await addWatermark(file, 'DRAFT');
		expect(await pageCountFromBytes(result)).toBe(1);
	});
});

describe('addPageNumbers', () => {
	it('returns a valid PDF', async () => {
		const file = await createPdf(2);
		const result = await addPageNumbers(file, { position: 'bottom-center' });
		expect(await pageCountFromBytes(result)).toBe(2);
	});
});

describe('compressPdf', () => {
	it('returns a valid PDF', async () => {
		const file = await createPdf(1, { title: 'Old', author: 'Author' });
		const result = await compressPdf(file);
		const doc = await PDFDocument.load(result);
		expect(doc.getPageCount()).toBe(1);
		expect(doc.getTitle()).toBe('');
	});
});

describe('getPdfInfo', () => {
	it('reads metadata and page count', async () => {
		const file = await createPdf(2, { title: 'My Doc', author: 'Tester' });
		const info = await getPdfInfo(file);
		expect(info.pageCount).toBe(2);
		expect(info.title).toBe('My Doc');
		expect(info.author).toBe('Tester');
	});
});

describe('getPageCount', () => {
	it('returns page count', async () => {
		const file = await createPdf(3);
		expect(await getPageCount(file)).toBe(3);
	});
});

describe('signPdf', () => {
	it('signs last page by default', async () => {
		const file = await createPdf(2);
		const result = await signPdf(file, 'John Doe');
		expect(await pageCountFromBytes(result)).toBe(2);
	});

	it('can sign all pages', async () => {
		const file = await createPdf(2);
		const result = await signPdf(file, 'Jane', { allPages: true, includeDate: false });
		expect(await pageCountFromBytes(result)).toBe(2);
	});
});

describe('editMetadata', () => {
	it('updates document properties', async () => {
		const file = await createPdf(1, { title: 'Old' });
		const result = await editMetadata(file, {
			title: 'New Title',
			author: 'New Author',
			subject: 'Testing',
			keywords: 'pdf, test'
		});
		const doc = await PDFDocument.load(result);
		expect(doc.getTitle()).toBe('New Title');
		expect(doc.getAuthor()).toBe('New Author');
		expect(doc.getSubject()).toBe('Testing');
		expect(String(doc.getKeywords())).toContain('pdf');
		expect(String(doc.getKeywords())).toContain('test');
	});
});

describe('imagesToPdf', () => {
	it('converts PNG to PDF', async () => {
		const png = Buffer.from(
			'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
			'base64'
		);
		const image = new File([png], 'pixel.png', { type: 'image/png' });
		const result = await imagesToPdf([image]);
		expect(await pageCountFromBytes(result)).toBe(1);
	});

	it('rejects unsupported formats', async () => {
		const bad = new File(['not an image'], 'file.gif', { type: 'image/gif' });
		await expect(imagesToPdf([bad])).rejects.toThrow(/unsupported/i);
	});
});
