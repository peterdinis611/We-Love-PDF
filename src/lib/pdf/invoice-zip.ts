import { PDFDocument } from 'pdf-lib';
import { stampPdf } from './layout-ops';
import { buildZip, uniqueZipName } from './zip';

async function loadMeta(file: File) {
	const bytes = await file.arrayBuffer();
	let doc: PDFDocument;
	try {
		doc = await PDFDocument.load(bytes);
	} catch {
		doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
	return {
		title: doc.getTitle()?.trim() || '',
		author: doc.getAuthor()?.trim() || '',
		bytes: new Uint8Array(bytes)
	};
}

function slugPart(s: string): string {
	return s
		.replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')
		.replace(/\s+/g, '-')
		.slice(0, 40);
}

/**
 * Stamp each invoice PAID (optional) and pack into a ZIP named from PDF metadata/title.
 */
export async function buildInvoiceZipPack(
	files: File[],
	options: { stampPaid?: boolean; nameTemplate?: string } = {}
): Promise<{ zip: Uint8Array; names: string[] }> {
	if (!files.length) throw new Error('Add at least one PDF.');
	const stampPaid = options.stampPaid ?? true;
	const template = options.nameTemplate ?? '{title}-{index}.pdf';
	const used = new Set<string>();
	const entries: { name: string; data: Uint8Array }[] = [];
	const names: string[] = [];

	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const meta = await loadMeta(file);
		let data: Uint8Array = meta.bytes;
		if (stampPaid) {
			const f = new File([data.slice()], file.name, { type: 'application/pdf' });
			data = await stampPdf(f, { text: 'PAID', color: 'green' });
		}
		const title = meta.title || file.name.replace(/\.pdf$/i, '');
		const name = uniqueZipName(
			template
				.replace('{title}', slugPart(title) || 'invoice')
				.replace('{author}', slugPart(meta.author) || 'na')
				.replace('{index}', String(i + 1).padStart(2, '0'))
				.replace(/\.pdf$/i, '') + '.pdf',
			used
		);
		entries.push({ name, data });
		names.push(name);
	}

	const zip = await buildZip(entries);
	return { zip, names };
}
