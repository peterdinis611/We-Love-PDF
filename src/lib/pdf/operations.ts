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
			: new Blob([new Uint8Array(data)], { type: mime ?? 'application/pdf' });
	const url = URL.createObjectURL(blob);
	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.click();
	URL.revokeObjectURL(url);
}

export function ensureExtension(filename: string, ext: string): string {
	const normalized = filename.trim() || `output.${ext}`;
	return normalized.toLowerCase().endsWith(`.${ext}`) ? normalized : `${normalized}.${ext}`;
}

export function ensurePdfFilename(filename: string): string {
	return ensureExtension(filename, 'pdf');
}

export function ensureTxtFilename(filename: string): string {
	return ensureExtension(filename, 'txt');
}

const PAGE_SIZES = {
	a4: [595.28, 841.89] as [number, number],
	letter: [612, 792] as [number, number]
};

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

export async function mergePdfs(
	files: File[],
	options: { blankBetween?: boolean } = {}
): Promise<Uint8Array> {
	const merged = await PDFDocument.create();

	for (let i = 0; i < files.length; i++) {
		const doc = await loadPdf(files[i]);
		const pages = await merged.copyPages(doc, doc.getPageIndices());
		pages.forEach((page) => merged.addPage(page));
		if (options.blankBetween && i < files.length - 1) {
			merged.addPage(PAGE_SIZES.a4);
		}
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

export async function imagesToPdf(
	files: File[],
	options: { pageSize?: 'fit' | 'a4' | 'letter'; margin?: number } = {}
): Promise<Uint8Array> {
	if (!files.length) throw new Error('No images selected.');
	const doc = await PDFDocument.create();
	const { pageSize = 'fit', margin = 0 } = options;

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
		const scaled = image.scale(1);
		let { width, height } = scaled;

		if (pageSize === 'fit') {
			const page = doc.addPage([width, height]);
			page.drawImage(image, { x: 0, y: 0, width, height });
			continue;
		}

		const [pageW, pageH] = PAGE_SIZES[pageSize];
		const innerW = pageW - margin * 2;
		const innerH = pageH - margin * 2;
		const scale = Math.min(innerW / width, innerH / height, 1);
		width *= scale;
		height *= scale;
		const page = doc.addPage([pageW, pageH]);
		page.drawImage(image, {
			x: margin + (innerW - width) / 2,
			y: margin + (innerH - height) / 2,
			width,
			height
		});
	}

	return doc.save();
}

export type WatermarkPosition = 'center' | 'diagonal' | 'top' | 'bottom';

export async function addWatermark(
	file: File,
	text: string,
	options: {
		opacity?: number;
		fontSize?: number;
		rotation?: number;
		position?: WatermarkPosition;
	} = {}
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.HelveticaBold);
	const { opacity = 0.25, fontSize = 48, rotation = -45, position = 'diagonal' } = options;

	for (const page of doc.getPages()) {
		const { width, height } = page.getSize();
		const textWidth = font.widthOfTextAtSize(text, fontSize);

		let x = width / 2 - textWidth / 2;
		let y = height / 2;
		let rotate = rotation;

		if (position === 'top') {
			y = height - 80;
			rotate = 0;
		} else if (position === 'bottom') {
			y = 60;
			rotate = 0;
		} else if (position === 'center') {
			rotate = 0;
		}

		page.drawText(text, {
			x,
			y,
			size: fontSize,
			font,
			color: rgb(0.5, 0.5, 0.5),
			opacity,
			rotate: degrees(rotate)
		});
	}

	return doc.save();
}

export type PageNumberPosition =
	| 'bottom-center'
	| 'bottom-right'
	| 'bottom-left'
	| 'top-center'
	| 'top-right';

export type PageNumberFormat = 'number' | 'fraction' | 'page-of';

export async function addPageNumbers(
	file: File,
	options: {
		position?: PageNumberPosition;
		startNumber?: number;
		format?: PageNumberFormat;
		fontSize?: number;
	} = {}
): Promise<Uint8Array> {
	const {
		position = 'bottom-center',
		startNumber = 1,
		format = 'fraction',
		fontSize = 12
	} = options;

	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();

	pages.forEach((page, i) => {
		const { width, height } = page.getSize();
		const num = startNumber + i;
		const label =
			format === 'number'
				? `${num}`
				: format === 'page-of'
					? `Page ${num} of ${pages.length + startNumber - 1}`
					: `${num} / ${pages.length + startNumber - 1}`;
		const textWidth = font.widthOfTextAtSize(label, fontSize);

		let x = width / 2 - textWidth / 2;
		let y = 30;

		if (position === 'bottom-right') x = width - textWidth - 40;
		if (position === 'bottom-left') x = 40;
		if (position === 'top-center') y = height - 40;
		if (position === 'top-right') {
			x = width - textWidth - 40;
			y = height - 40;
		}

		page.drawText(label, { x, y, size: fontSize, font, color: rgb(0.3, 0.3, 0.3) });
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

export type SignPosition = 'bottom-left' | 'bottom-center' | 'bottom-right';

export async function signPdf(
	file: File,
	signature: string,
	options: {
		includeDate?: boolean;
		allPages?: boolean;
		position?: SignPosition;
	} = {}
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const font = await doc.embedFont(StandardFonts.Helvetica);
	const pages = doc.getPages();
	const targetPages = options.allPages ? pages : [pages[pages.length - 1]];
	const line = options.includeDate
		? `${signature} — ${new Date().toLocaleDateString()}`
		: signature;
	const position = options.position ?? 'bottom-left';

	for (const page of targetPages) {
		const { width } = page.getSize();
		const textWidth = font.widthOfTextAtSize(line, 14);
		let x = 40;
		if (position === 'bottom-center') x = width / 2 - textWidth / 2;
		if (position === 'bottom-right') x = width - textWidth - 40;

		page.drawLine({
			start: { x, y: 60 },
			end: { x: x + Math.min(textWidth + 40, 200), y: 60 },
			thickness: 0.5,
			color: rgb(0.2, 0.2, 0.2)
		});
		page.drawText('Signed by', { x, y: 68, size: 8, font, color: rgb(0.5, 0.5, 0.5) });
		page.drawText(line, { x, y: 42, size: 14, font, color: rgb(0, 0, 0) });
	}

	return doc.save();
}

export async function editMetadata(
	file: File,
	metadata: { title?: string; author?: string; subject?: string; keywords?: string; creator?: string }
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	if (metadata.title !== undefined) doc.setTitle(metadata.title);
	if (metadata.author !== undefined) doc.setAuthor(metadata.author);
	if (metadata.subject !== undefined) doc.setSubject(metadata.subject);
	if (metadata.creator !== undefined) doc.setCreator(metadata.creator);
	if (metadata.keywords !== undefined) {
		doc.setKeywords(
			metadata.keywords
				.split(',')
				.map((k) => k.trim())
				.filter(Boolean)
		);
	}
	return doc.save();
}

export async function duplicatePages(file: File, pageIndices: number[]): Promise<Uint8Array> {
	if (!pageIndices.length) throw new Error('Select at least one page to duplicate.');
	const doc = await loadPdf(file);
	const sorted = [...pageIndices].sort((a, b) => a - b);
	const copies = await doc.copyPages(doc, sorted);
	copies.forEach((page) => doc.addPage(page));
	return doc.save();
}

export async function cropPdf(
	file: File,
	margins: { top: number; right: number; bottom: number; left: number },
	pageIndices?: number[]
): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	const pages = doc.getPages();
	const targets = pageIndices?.length
		? pageIndices
		: pages.map((_, index) => index);

	for (const index of targets) {
		const page = pages[index];
		if (!page) continue;

		const box = page.getCropBox();
		const x = box.x;
		const y = box.y;
		const width = box.width;
		const height = box.height;
		const cropW = width - margins.left - margins.right;
		const cropH = height - margins.top - margins.bottom;

		if (cropW <= 0 || cropH <= 0) {
			throw new Error('Crop margins are too large for the page size.');
		}

		page.setCropBox(x + margins.left, y + margins.bottom, cropW, cropH);
	}

	return doc.save();
}

export async function removeAllMetadata(file: File): Promise<Uint8Array> {
	const doc = await loadPdf(file);
	doc.setTitle('');
	doc.setAuthor('');
	doc.setSubject('');
	doc.setKeywords([]);
	doc.setCreator('');
	doc.setProducer('');
	return doc.save({ useObjectStreams: true });
}

export function parsePageIndexes(input: string, total: number): number[] {
	if (!input.trim()) {
		return Array.from({ length: total }, (_, i) => i);
	}
	return [...new Set(parsePageRanges(input, total).flat())].sort((a, b) => a - b);
}

export function outputNameFromInput(name: string, suffix: string): string {
	const base = name.replace(/\.pdf$/i, '');
	return `${base}${suffix}.pdf`;
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
