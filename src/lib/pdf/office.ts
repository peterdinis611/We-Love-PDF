import mammoth from 'mammoth';
import { unzipSync } from 'fflate';
import { escapeHtml, htmlToPdf, type ConvertPageSize } from './convert';

export interface OfficeToPdfOptions {
	pageSize?: ConvertPageSize;
	title?: string;
}

export async function docxToPdf(
	buffer: ArrayBuffer,
	options: OfficeToPdfOptions = {}
): Promise<Uint8Array> {
	const { value: html, messages } = await mammoth.convertToHtml({ arrayBuffer: buffer });
	if (!html.trim()) {
		const warning = messages.find((message) => message.type === 'error');
		throw new Error(warning?.message ?? 'Could not extract content from Word document.');
	}

	const wrapped = options.title
		? `<h1>${escapeHtml(options.title)}</h1>${html}`
		: html;

	return htmlToPdf(wrapped, { pageSize: options.pageSize });
}

function slideNumber(path: string): number {
	return Number(path.match(/slide(\d+)\.xml$/)?.[1] ?? 0);
}

export function extractPptxSlideTexts(buffer: ArrayBuffer): string[][] {
	const archive = unzipSync(new Uint8Array(buffer));
	const slidePaths = Object.keys(archive)
		.filter((path) => /ppt\/slides\/slide\d+\.xml$/.test(path))
		.sort((a, b) => slideNumber(a) - slideNumber(b));

	if (!slidePaths.length) throw new Error('No slides found in PowerPoint file.');

	return slidePaths.map((path) => {
		const xml = new TextDecoder().decode(archive[path]);
		const doc = new DOMParser().parseFromString(xml, 'text/xml');
		return [...doc.getElementsByTagName('a:t')]
			.map((node) => node.textContent?.trim() ?? '')
			.filter(Boolean);
	});
}

export function pptxSlidesToHtml(slides: string[][], title?: string): string {
	const parts: string[] = [];
	if (title) parts.push(`<h1>${escapeHtml(title)}</h1>`);

	for (const [index, lines] of slides.entries()) {
		parts.push(`<h2>Slide ${index + 1}</h2>`);
		if (!lines.length) {
			parts.push('<p><em>(empty slide)</em></p>');
			continue;
		}
		parts.push('<ul>');
		for (const line of lines) {
			parts.push(`<li>${escapeHtml(line)}</li>`);
		}
		parts.push('</ul>');
	}

	return parts.join('\n');
}

export async function pptxToPdf(
	buffer: ArrayBuffer,
	options: OfficeToPdfOptions = {}
): Promise<Uint8Array> {
	const slides = extractPptxSlideTexts(buffer);
	const html = pptxSlidesToHtml(slides, options.title);
	return htmlToPdf(html, { pageSize: options.pageSize });
}
