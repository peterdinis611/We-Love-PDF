import { PDFDocument, degrees, rgb, StandardFonts } from 'pdf-lib';

export interface PdfFile {
	id: string;
	file: File;
	name: string;
	size: number;
}

export interface PdfInfo {
	pageCount: number;
	title?: string;
	author?: string;
	subject?: string;
	creator?: string;
	producer?: string;
	creationDate?: Date;
	modificationDate?: string;
	fileSize: number;
}

export function downloadBlob(data: Blob | Uint8Array, filename: string, mime?: string) {
	const blob =
		data instanceof Blob
			? data
			: new Blob([data.buffer as ArrayBuffer], { type: mime ?? 'application/pdf' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

export async function readPdfFile(file: File): Promise<{ pageCount: number }> {
	const doc = await loadPdf(file);
	return { pageCount: doc.getPageCount() };
}

export async function mergePdfs(files: File[]): Promise<Uint8Array> {
	const merged = await PDFDocument.create();

	for (const file of files) {
		const doc = await loadPdf(file);
		const pages = await merged.copyPages(doc, doc.getPageIndices());
		pages.forEach((page) => merged.addPage(page));
	}

	return merged.save();
}

export async function splitPdf(file: File, ranges: number[][]): Promise<Uint8Array[]> {
	const source = await loadPdf(file);
	const results: Uint8Array[] = [];

	for (const range of ranges) {
		if (!range.length) continue;
		const newDoc = await PDFDocument.create();
		const pages = await newDoc.copyPages(source, range);
		pages.forEach((page) => newDoc.addPage(page));
		results.push(await newDoc.save());
	}

	return results;
}

export async function getPageCount(file: File): Promise<number> {
	const doc = await loadPdf(file);
	return doc.getPageCount();
}

export async function extractPages(file: File, pageIndices: number[]): Promise<Uint8Array> {
	return organizePdf(file, pageIndices);
}

export async function deletePages(file: File, pagesToRemove: Set<number>): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const keep = doc.getPageIndices().filter((i) => !pagesToRemove.has(i));
	if (!keep.length) throw new Error('You must keep at least one page.');
	const newDoc = await PDFDocument.create();
	const pages = await newDoc.copyPages(doc, keep);
	pages.forEach((page) => newDoc.addPage(page));
	return newDoc.save();
}

export async function rotatePdf(
	file: File,
	rotations: Map<number, 90 | 180 | 270>
): Promise<Uint8Array> {
	const doc = await loadPdf(file);

	rotations.forEach((angle, pageIndex) => {
		const page = doc.getPage(pageIndex);
		const current = page.getRotation().angle;
		page.setRotation(degrees(current + angle));
	});

	return doc.save();
}

export async function rotateAllPages(file: File, angle: 90 | 180 | 270): Promise<Uint8Array> {
	const doc = await loadPdf(file);

	doc.getPages().forEach((page) => {
		const current = page.getRotation().angle;
		page.setRotation(degrees(current + angle));
	});

	return doc.save();
}

export async function organizePdf(file: File, pageOrder: number[]): Promise<Uint8Array> {
	if (!pageOrder.length) throw new Error('No pages selected.');
	const source = await loadPdf(file);
	const newDoc = await PDFDocument.create();
	const pages = await newDoc.copyPages(source, pageOrder);
	pages.forEach((page) => newDoc.addPage(page));
	return newDoc.save();
}

export async function imagesToPdf(files: File[]): Promise<Uint8Array> {
	if (!files.length) throw new Error('No images selected.');
	const doc = await PDFDocument.create();

	for (const file of files) {
		const bytes = await file.arrayBuffer();
		const name = file.name.toLowerCase();
		const isPng = file.type === 'image/png' || name.endsWith('.png');
		const isJpg =
			file.type === 'image/jpeg' ||
			name.endsWith('.jpg') ||
			name.endsWith('.jpeg');

		if (!isPng && !isJpg) {
			throw new Error(`Unsupported image format: ${file.name}. Use JPG or PNG.`);
		}

		const image = isPng ? await doc.embedPng(bytes) : await doc.embedJpg(bytes);
		const { width, height } = image.scale(1);
		const page = doc.addPage([width, height]);
		page.drawImage(image, { x: 0, y: 0, width, height });
	}

	return doc.save();
}

export async function addWatermark(
	file: File,
	text: string,
	options: { opacity?: number; fontSize?: number; rotation?: number } = {}
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.HelveticaBold);
	const { opacity = 0.25, fontSize = 48, rotation = -45 } = options;

	for (const page of doc.getPages()) {
		const { width, height } = page.getSize();
		const textWidth = font.widthOfTextAtSize(text, fontSize);
		page.drawText(text, {
			x: width / 2 - textWidth / 2,
			y: height / 2,
			size: fontSize,
			font,
			color: rgb(0.5, 0.5, 0.5),
			opacity,
			rotate: degrees(rotation)
		});
	}

	return doc.save();
}

export async function addPageNumbers(
	file: File,
	position: 'bottom-center' | 'bottom-right' = 'bottom-center'
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	pages.forEach((page, i) => {
		const { width } = page.getSize();
		const label = `${i + 1} / ${pages.length}`;
		const textWidth = font.widthOfTextAtSize(label, 12);
		const x = position === 'bottom-center' ? width / 2 - textWidth / 2 : width - textWidth - 40;
		page.drawText(label, { x, y: 30, size: 12, font, color: rgb(0.3, 0.3, 0.3) });
	});

	return doc.save();
}

export async function compressPdf(file: File): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	doc.setTitle('');
	doc.setAuthor('');
	doc.setSubject('');
	doc.setKeywords([]);
	doc.setProducer('WeLovePDF');
	doc.setCreator('WeLovePDF');
	return doc.save({ useObjectStreams: true });
}

export async function getPdfInfo(file: File): Promise<PdfInfo> {
	const doc = await loadPdf(file);
	return {
		pageCount: doc.getPageCount(),
		title: doc.getTitle(),
		author: doc.getAuthor(),
		subject: doc.getSubject(),
		creator: doc.getCreator(),
		producer: doc.getProducer(),
		creationDate: doc.getCreationDate(),
		modificationDate: doc.getModificationDate()?.toISOString(),
		fileSize: file.size
	};
}

export function createFileId(): string {
	return crypto.randomUUID();
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function fileToBlobUrl(file: File): Promise<string> {
	const buffer = await file.arrayBuffer();
	const blob = new Blob([buffer], { type: 'application/pdf' });
	return URL.createObjectURL(blob);
}

export function compressionRatio(original: number, compressed: number): number {
	if (original === 0) return 0;
	return Math.round((1 - compressed / original) * 100);
}

export function parsePageRanges(input: string, total: number): number[][] {
	const ranges: number[][] = [];
	const parts = input.split(',').map((p) => p.trim()).filter(Boolean);

	for (const part of parts) {
		if (part.includes('-')) {
			const [startStr, endStr] = part.split('-').map((s) => s.trim());
			const startPage = parseInt(startStr, 10);
			const endPage = parseInt(endStr, 10);
			if (isNaN(startPage) || isNaN(endPage)) continue;
			const start = Math.max(0, startPage - 1);
			const end = Math.min(total - 1, endPage - 1);
			if (start <= end) {
				ranges.push(Array.from({ length: end - start + 1 }, (_, i) => start + i));
			}
		} else {
			const page = parseInt(part, 10) - 1;
			if (!isNaN(page) && page >= 0 && page < total) {
				ranges.push([page]);
			}
		}
	}

	return ranges;
}
