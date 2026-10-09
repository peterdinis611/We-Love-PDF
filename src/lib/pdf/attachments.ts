import { PDFDocument, PDFName, PDFDict, PDFHexString, PDFArray, PDFString } from 'pdf-lib';

export type PdfAttachment = { name: string; description?: string };

async function load(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

export async function listAttachments(file: File): Promise<PdfAttachment[]> {
	const doc = await load(file);
	const names = doc.catalog.lookup(PDFName.of('Names'));
	if (!(names instanceof PDFDict)) return [];
	const embedded = names.lookup(PDFName.of('EmbeddedFiles'));
	if (!(embedded instanceof PDFDict)) return [];
	const tree = embedded.lookup(PDFName.of('Names'));
	if (!(tree instanceof PDFArray)) return [];

	const result: PdfAttachment[] = [];
	for (let i = 0; i + 1 < tree.size(); i += 2) {
		const nameObj = tree.get(i);
		const name =
			nameObj instanceof PDFHexString || nameObj instanceof PDFString
				? nameObj.decodeText()
				: String(nameObj);
		result.push({ name });
	}
	return result;
}

export async function attachFilesToPdf(
	pdf: File,
	attachments: File[]
): Promise<Uint8Array> {
	const doc = await load(pdf);
	for (const file of attachments) {
		const bytes = new Uint8Array(await file.arrayBuffer());
		await doc.attach(bytes, file.name, {
			mimeType: file.type || 'application/octet-stream',
			description: `Attached via WeLovePDF`,
			creationDate: new Date(),
			modificationDate: new Date()
		});
	}
	return doc.save();
}

export async function stripAttachments(file: File): Promise<Uint8Array> {
	const doc = await load(file);
	const names = doc.catalog.lookup(PDFName.of('Names'));
	if (names instanceof PDFDict && names.has(PDFName.of('EmbeddedFiles'))) {
		names.delete(PDFName.of('EmbeddedFiles'));
	}
	if (doc.catalog.has(PDFName.of('Names'))) {
		const n = doc.catalog.lookup(PDFName.of('Names'));
		if (n instanceof PDFDict && n.entries().length === 0) {
			doc.catalog.delete(PDFName.of('Names'));
		}
	}
	return doc.save({ useObjectStreams: true });
}
