import { zipSync, strToU8 } from 'fflate';
import { escapeHtml } from './convert';

type EngineLike = {
	openDocumentBuffer: (opts: { id: string; content: ArrayBuffer }) => {
		toPromise: () => Promise<{ pages: Array<{ size: { width: number; height: number } }> }>;
	};
	renderPage: (
		doc: unknown,
		page: unknown,
		opts: { scaleFactor: number }
	) => { toPromise: () => Promise<Blob> };
	extractText?: (doc: unknown, indexes: number[]) => { toPromise: () => Promise<string> };
};

function blobToUint8(blob: Blob): Promise<Uint8Array> {
	return blob.arrayBuffer().then((b) => new Uint8Array(b));
}

/**
 * Build a simple EPUB3: one XHTML chapter per PDF page with embedded JPEG + extracted text.
 */
export async function pdfToEpub(
	file: File,
	engine: EngineLike,
	options: {
		scaleFactor?: number;
		onProgress?: (p: { page: number; total: number }) => void;
	} = {}
): Promise<Uint8Array> {
	const scaleFactor = options.scaleFactor ?? 1.25;
	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: `epub-${Date.now()}`, content: buffer }).toPromise();
	const total = doc.pages.length;
	const title = file.name.replace(/\.pdf$/i, '') || 'Document';

	const files: Record<string, Uint8Array> = {};
	files['mimetype'] = strToU8('application/epub+zip');
	files['META-INF/container.xml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

	const manifestItems: string[] = [];
	const spineItems: string[] = [];
	const navPoints: string[] = [];

	for (let i = 0; i < total; i++) {
		options.onProgress?.({ page: i + 1, total });
		const page = doc.pages[i];
		const png = await engine.renderPage(doc, page, { scaleFactor }).toPromise();
		// Prefer JPEG for size
		const bitmap = await createImageBitmap(png);
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const ctx = canvas.getContext('2d');
		if (!ctx) throw new Error('Canvas unavailable.');
		ctx.drawImage(bitmap, 0, 0);
		bitmap.close();
		const jpegBlob = await new Promise<Blob>((resolve, reject) => {
			canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('JPEG encode failed'))), 'image/jpeg', 0.85);
		});
		const imgName = `page-${String(i + 1).padStart(3, '0')}.jpg`;
		files[`OEBPS/images/${imgName}`] = await blobToUint8(jpegBlob);

		let text = '';
		if (engine.extractText) {
			try {
				text = (await engine.extractText(doc, [i]).toPromise())?.trim() ?? '';
			} catch {
				text = '';
			}
		}

		const chapterId = `chap${i + 1}`;
		const xhtmlName = `page-${String(i + 1).padStart(3, '0')}.xhtml`;
		const bodyText = text
			? `<p>${escapeHtml(text).replace(/\n+/g, '</p><p>')}</p>`
			: '<p><em>(no extractable text)</em></p>';
		const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="en">
<head><title>${escapeHtml(title)} — ${i + 1}</title>
<style>img{max-width:100%;height:auto} body{font-family:serif;line-height:1.45;margin:1em}</style>
</head>
<body>
<section epub:type="chapter">
<h1>Page ${i + 1}</h1>
<img src="images/${imgName}" alt="Page ${i + 1}"/>
${bodyText}
</section>
</body>
</html>`;
		files[`OEBPS/${xhtmlName}`] = strToU8(xhtml);
		manifestItems.push(
			`<item id="${chapterId}" href="${xhtmlName}" media-type="application/xhtml+xml"/>`,
			`<item id="img${i + 1}" href="images/${imgName}" media-type="image/jpeg"/>`
		);
		spineItems.push(`<itemref idref="${chapterId}"/>`);
		navPoints.push(`<li><a href="${xhtmlName}">Page ${i + 1}</a></li>`);
	}

	files['OEBPS/nav.xhtml'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops">
<head><title>Contents</title></head>
<body>
<nav epub:type="toc"><ol>${navPoints.join('')}</ol></nav>
</body></html>`);

	files['OEBPS/content.opf'] = strToU8(`<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">welovepdf-${Date.now()}</dc:identifier>
    <dc:title>${escapeHtml(title)}</dc:title>
    <dc:language>en</dc:language>
    <meta property="dcterms:modified">${new Date().toISOString().replace(/\.\d{3}Z$/, 'Z')}</meta>
  </metadata>
  <manifest>
    <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
    ${manifestItems.join('\n    ')}
  </manifest>
  <spine>
    ${spineItems.join('\n    ')}
  </spine>
</package>`);

	// mimetype must be stored uncompressed (EPUB spec)
	const zippable: Record<string, Uint8Array | [Uint8Array, { level: number }]> = {
		...files,
		mimetype: [files['mimetype'], { level: 0 }]
	};
	return zipSync(zippable as never);
}
