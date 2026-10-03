import { getPdfInfo } from '$lib/pdf/operations';
import type { Locale } from '$lib/i18n/locale';
import { msg } from '$lib/i18n';
import { toolTranslation } from '$lib/i18n/messages';

export type SmartDropAction = {
	slug: string;
	label: string;
	reason: string;
	primary?: boolean;
};

const LARGE_FILE_BYTES = 5 * 1024 * 1024;
const SCAN_BYTES_PER_PAGE = 400_000;

/**
 * Suggest tools based on dropped file(s): multi-file → merge, large/scan → compress/OCR, etc.
 */
export async function suggestDropActions(
	files: File[],
	locale: Locale = 'en'
): Promise<SmartDropAction[]> {
	const m = msg(locale);
	const label = (slug: string, fallback: string) =>
		toolTranslation(slug, locale)?.name ?? fallback;

	if (files.length > 1) {
		return [
			{
				slug: 'merge-pdf',
				label: m.hero.ctaMerge,
				reason: `${files.length} files — combine into one PDF`,
				primary: true
			},
			{
				slug: 'batch-pdf',
				label: label('batch-pdf', 'Batch PDF'),
				reason: 'Run the same action on every file'
			},
			{
				slug: 'compress-pdf',
				label: m.hero.ctaCompress,
				reason: 'Shrink files before sharing'
			}
		];
	}

	const file = files[0];
	if (!file) return [];

	let pageCount = 0;
	try {
		pageCount = (await getPdfInfo(file)).pageCount;
	} catch {
		return [
			{
				slug: 'fix-pdf',
				label: label('fix-pdf', 'Fix PDF'),
				reason: 'File may be damaged — try repair first',
				primary: true
			},
			{
				slug: 'view-pdf',
				label: m.hero.ctaView,
				reason: 'Open and inspect the document'
			}
		];
	}

	const bytesPerPage = pageCount > 0 ? file.size / pageCount : file.size;
	const likelyScan = bytesPerPage >= SCAN_BYTES_PER_PAGE;
	const large = file.size >= LARGE_FILE_BYTES;

	const actions: SmartDropAction[] = [];

	if (likelyScan) {
		actions.push({
			slug: 'ocr-pdf',
			label: label('ocr-pdf', 'OCR PDF'),
			reason: 'Looks like a scan — extract searchable text',
			primary: true
		});
		actions.push({
			slug: 'compress-pdf',
			label: m.hero.ctaCompress,
			reason: 'Scans are often large — strong compress helps'
		});
	} else if (large) {
		actions.push({
			slug: 'compress-pdf',
			label: m.hero.ctaCompress,
			reason: `Large file (${formatMb(file.size)}) — compress before send`,
			primary: true
		});
	} else {
		actions.push({
			slug: 'view-pdf',
			label: m.hero.ctaView,
			reason: pageCount ? `${pageCount} pages — preview first` : 'Preview the document',
			primary: true
		});
	}

	actions.push({
		slug: 'split-pdf',
		label: label('split-pdf', 'Split PDF'),
		reason: pageCount > 1 ? `Split ${pageCount} pages` : 'Extract or split pages'
	});

	if (!actions.some((a) => a.slug === 'compress-pdf')) {
		actions.push({
			slug: 'compress-pdf',
			label: m.hero.ctaCompress,
			reason: 'Reduce file size'
		});
	}

	if (!likelyScan) {
		actions.push({
			slug: 'merge-pdf',
			label: m.hero.ctaMerge,
			reason: 'Combine with other PDFs'
		});
	}

	actions.push({
		slug: 'protect-pdf',
		label: label('protect-pdf', 'Protect PDF'),
		reason: 'Password-protect before sharing'
	});

	// Deduplicate by slug, keep first (priority order)
	const seen = new Set<string>();
	return actions.filter((a) => {
		if (seen.has(a.slug)) return false;
		seen.add(a.slug);
		return true;
	}).slice(0, 6);
}

function formatMb(bytes: number): string {
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
