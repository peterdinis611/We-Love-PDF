import { PDFDocument, PDFName, PDFRawStream, PDFDict, decodePDFRawStream } from 'pdf-lib';

export type ExtractedImage = {
	name: string;
	bytes: Uint8Array;
	mime: 'image/jpeg' | 'image/png';
};

/**
 * Extract embedded JPEG/PNG image XObjects from a PDF.
 * Falls back to empty list if none found (caller may rasterize pages instead).
 */
export async function extractEmbeddedImages(file: File): Promise<ExtractedImage[]> {
	const bytes = await file.arrayBuffer();
	const doc = await PDFDocument.load(bytes, { ignoreEncryption: true, updateMetadata: false });
	const results: ExtractedImage[] = [];
	const seen = new Set<string>();
	let index = 0;

	for (const [, obj] of doc.context.enumerateIndirectObjects()) {
		if (!(obj instanceof PDFRawStream)) continue;
		const dict = obj.dict;
		if (!(dict instanceof PDFDict)) continue;
		const subtype = dict.get(PDFName.of('Subtype'));
		if (subtype?.toString() !== '/Image') continue;

		try {
			const decoded = decodePDFRawStream(obj).decode();
			const filter = dict.get(PDFName.of('Filter'))?.toString() ?? '';
			const key = `${decoded.byteLength}:${decoded[0]}:${decoded[1]}`;
			if (seen.has(key)) continue;
			seen.add(key);

			if (filter.includes('DCTDecode') || (decoded[0] === 0xff && decoded[1] === 0xd8)) {
				index++;
				results.push({
					name: `image-${String(index).padStart(3, '0')}.jpg`,
					bytes: decoded,
					mime: 'image/jpeg'
				});
			} else if (
				filter.includes('FlateDecode') ||
				(decoded[0] === 0x89 && decoded[1] === 0x50)
			) {
				// PNG signature or flate — only keep if it looks like PNG
				if (decoded[0] === 0x89 && decoded[1] === 0x50) {
					index++;
					results.push({
						name: `image-${String(index).padStart(3, '0')}.png`,
						bytes: decoded,
						mime: 'image/png'
					});
				}
			}
		} catch {
			// skip undecodable streams
		}
	}

	return results;
}
