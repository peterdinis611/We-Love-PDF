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

	const styled = `<style>
body{font-family:Georgia,serif;line-height:1.5;color:#111}
h1,h2,h3{font-family:Helvetica,Arial,sans-serif;line-height:1.25;margin:1.2em 0 0.4em}
p{margin:0.6em 0} table{border-collapse:collapse;width:100%;margin:1em 0}
td,th{border:1px solid #ccc;padding:4px 8px;vertical-align:top}
img{max-width:100%;height:auto} ul,ol{margin:0.5em 0 0.5em 1.4em}
</style>${options.title ? `<h1>${escapeHtml(options.title)}</h1>` : ''}${html}`;

	return htmlToPdf(styled, { pageSize: options.pageSize });
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
	const parts: string[] = [
		`<style>
body{font-family:Helvetica,Arial,sans-serif;line-height:1.45;color:#111}
h1{font-size:22pt;margin-bottom:0.6em} h2{font-size:16pt;margin:1.4em 0 0.4em;border-bottom:1px solid #ddd;padding-bottom:0.2em}
.slide{page-break-after:always;margin-bottom:1.5em} .slide:last-child{page-break-after:auto}
ul{margin:0.4em 0 0.4em 1.2em} li{margin:0.25em 0}
</style>`
	];
	if (title) parts.push(`<h1>${escapeHtml(title)}</h1>`);

	for (const [index, lines] of slides.entries()) {
		parts.push(`<section class="slide"><h2>Slide ${index + 1}</h2>`);
		if (!lines.length) {
			parts.push('<p><em>(empty slide)</em></p></section>');
			continue;
		}
		parts.push('<ul>');
		for (const line of lines) {
			parts.push(`<li>${escapeHtml(line)}</li>`);
		}
		parts.push('</ul></section>');
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
