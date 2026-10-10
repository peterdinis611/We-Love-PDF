import {
	PDFDocument,
	PDFName,
	PDFDict,
	PDFArray,
	PDFNumber,
	PDFHexString
} from 'pdf-lib';

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

/** PDF page label styles: D=decimal, R=Roman upper, r=roman lower, A=alpha upper, a=alpha lower */
export type PageLabelStyle = 'D' | 'R' | 'r' | 'A' | 'a';

export type PageLabelRange = {
	/** 0-based page index where this range starts */
	startPage: number;
	style: PageLabelStyle;
	/** Optional prefix (e.g. "App-" ) */
	prefix?: string;
	/** Starting number for this range (default 1) */
	startAt?: number;
};

/**
 * Set PDF /PageLabels number tree so viewers show i, ii, 1… instead of flat indices.
 * Ranges must be sorted by startPage ascending.
 */
export async function setPageLabels(file: File, ranges: PageLabelRange[]): Promise<Uint8Array> {
	if (!ranges.length) throw new Error('Add at least one page label range.');
	const sorted = [...ranges].sort((a, b) => a.startPage - b.startPage);
	const doc = await loadPdf(file);
	const pageCount = doc.getPageCount();
	for (const r of sorted) {
		if (r.startPage < 0 || r.startPage >= pageCount) {
			throw new Error(`Page index ${r.startPage + 1} is out of range (1–${pageCount}).`);
		}
	}

	const nums = doc.context.obj([]) as PDFArray;
	for (const range of sorted) {
		nums.push(PDFNumber.of(range.startPage));
		const dict = doc.context.obj({
			S: PDFName.of(range.style),
			St: PDFNumber.of(range.startAt ?? 1)
		}) as PDFDict;
		if (range.prefix) {
			dict.set(PDFName.of('P'), PDFHexString.fromText(range.prefix));
		}
		nums.push(dict);
	}

	const pageLabels = doc.context.obj({ Nums: nums }) as PDFDict;
	doc.catalog.set(PDFName.of('PageLabels'), pageLabels);
	return doc.save({ useObjectStreams: true });
}

/** Common preset: roman front matter then decimal body. */
export async function setRomanThenDecimal(
	file: File,
	bodyStartPage1Based: number
): Promise<Uint8Array> {
	const bodyIdx = Math.max(1, bodyStartPage1Based) - 1;
	const ranges: PageLabelRange[] = [{ startPage: 0, style: 'r', startAt: 1 }];
	if (bodyIdx > 0) {
		ranges.push({ startPage: bodyIdx, style: 'D', startAt: 1 });
	} else {
		ranges[0] = { startPage: 0, style: 'D', startAt: 1 };
	}
	return setPageLabels(file, ranges);
}
