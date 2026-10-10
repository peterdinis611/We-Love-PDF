import { mergePdfs } from './operations';

/**
 * Filter and sort files by a glob-like pattern (`*` and `?`), then merge in name order.
 * Example pattern: `*_invoice.pdf`
 */
export function matchFilenamePattern(name: string, pattern: string): boolean {
	const escaped = pattern
		.replace(/[.+^${}()|[\]\\]/g, '\\$&')
		.replace(/\*/g, '.*')
		.replace(/\?/g, '.');
	const re = new RegExp(`^${escaped}$`, 'i');
	return re.test(name);
}

export async function mergeByFilenamePattern(
	files: File[],
	pattern: string
): Promise<{ bytes: Uint8Array; matched: string[] }> {
	const matched = files
		.filter((f) => matchFilenamePattern(f.name, pattern.trim() || '*'))
		.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

	if (!matched.length) {
		throw new Error(`No files matched pattern “${pattern}”.`);
	}

	const bytes = await mergePdfs(matched);
	return { bytes, matched: matched.map((f) => f.name) };
}
