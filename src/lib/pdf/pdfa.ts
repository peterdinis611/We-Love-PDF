import { PDFDocument } from 'pdf-lib';

export type PdfAOptions = {
	/** Optional already-flattened PDF bytes (recommended). */
	preflattened?: Uint8Array;
	title?: string;
	conformance?: 'PDF/A-1b' | 'PDF/A-2b';
};

export type PdfAResult = {
	bytes: Uint8Array;
	pageCount: number;
	conformance: string;
	notes: string[];
};

/**
 * Produce a PDF/A-*ready* archival PDF in the browser.
 *
 * True ISO PDF/A validation needs a full preflight engine (fonts, color profiles,
 * XMP). This rebuild strips interactive content risks, cleans metadata, and
 * embeds an XMP identification packet so archives/viewers recognize the intent.
 */
export async function exportPdfA(file: File, options: PdfAOptions = {}): Promise<PdfAResult> {
	const conformance = options.conformance ?? 'PDF/A-2b';
	const notes: string[] = [];
	const input = options.preflattened ?? new Uint8Array(await file.arrayBuffer());

	let source: PDFDocument;
	try {
		source = await PDFDocument.load(input, { ignoreEncryption: true, updateMetadata: false });
	} catch (e) {
		throw new Error(e instanceof Error ? e.message : 'Failed to open PDF for PDF/A export.');
	}

	if (source.isEncrypted) {
		notes.push('Encryption was stripped during rebuild — PDF/A cannot be encrypted.');
	}

	const out = await PDFDocument.create();
	const indices = source.getPageIndices();
	const pages = await out.copyPages(source, indices);
	pages.forEach((p) => out.addPage(p));
	notes.push(`Rebuilt ${indices.length} page(s).`);

	const title = options.title || source.getTitle() || file.name.replace(/\.pdf$/i, '');
	out.setTitle(title);
	out.setAuthor('');
	out.setSubject(`Archival export (${conformance})`);
	out.setKeywords([]);
	out.setProducer(`WeLovePDF ${conformance}`);
	out.setCreator('WeLovePDF');
	out.setCreationDate(new Date());
	out.setModificationDate(new Date());
	notes.push('Cleared author/keywords; set archival producer metadata.');

	let bytes = await out.save({ useObjectStreams: true });
	bytes = injectPdfAXmp(bytes, { title, conformance });
	notes.push(`Injected ${conformance} XMP identification packet.`);
	notes.push(
		'Validate with a PDF/A preflight tool for formal archival submission — browser export is best-effort.'
	);

	return { bytes, pageCount: indices.length, conformance, notes };
}

function injectPdfAXmp(
	pdfBytes: Uint8Array,
	opts: { title: string; conformance: string }
): Uint8Array {
	const part = opts.conformance.includes('1') ? '1' : '2';
	const conf = 'B';
	const escapeXml = (s: string) =>
		s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

	const xmp = `<?xpacket begin="" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/"
    xmlns:xmp="http://ns.adobe.com/xap/1.0/"
    xmlns:pdf="http://ns.adobe.com/pdf/1.3/">
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${escapeXml(opts.title)}</rdf:li></rdf:Alt></dc:title>
   <pdfaid:part>${part}</pdfaid:part>
   <pdfaid:conformance>${conf}</pdfaid:conformance>
   <xmp:CreatorTool>WeLovePDF</xmp:CreatorTool>
   <pdf:Producer>WeLovePDF ${escapeXml(opts.conformance)}</pdf:Producer>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

	const encoder = new TextEncoder();
	const xmpBytes = encoder.encode(xmp);
	const header = encoder.encode(
		`\n${xmpBytes.length} 0 obj\n<< /Type /Metadata /Subtype /XML /Length ${xmpBytes.length} >>\nstream\n`
	);
	const footer = encoder.encode('\nendstream\nendobj\n');

	// Append metadata object before EOF; viewers that scan for pdfaid still pick it up.
	const eof = encoder.encode('\n%%EOF\n');
	const withoutEof = stripTrailingEof(pdfBytes);
	const combined = new Uint8Array(
		withoutEof.length + header.length + xmpBytes.length + footer.length + eof.length
	);
	let offset = 0;
	combined.set(withoutEof, offset);
	offset += withoutEof.length;
	combined.set(header, offset);
	offset += header.length;
	combined.set(xmpBytes, offset);
	offset += xmpBytes.length;
	combined.set(footer, offset);
	offset += footer.length;
	combined.set(eof, offset);
	return combined;
}

function stripTrailingEof(bytes: Uint8Array): Uint8Array {
	const text = new TextDecoder('latin1').decode(bytes);
	const idx = text.lastIndexOf('%%EOF');
	if (idx === -1) return bytes;
	return bytes.slice(0, idx);
}
