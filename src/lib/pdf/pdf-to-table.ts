/** Heuristic PDF text → table rows (for CSV / Excel export). */

export function textToTableRows(text: string): string[][] {
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.trim())
		.filter(Boolean);

	if (!lines.length) return [];

	const tabRows = lines.map((l) => l.split('\t').map((c) => c.trim()));
	if (tabRows.some((r) => r.length > 1)) {
		const width = Math.max(...tabRows.map((r) => r.length));
		return tabRows.map((r) => {
			while (r.length < width) r.push('');
			return r;
		});
	}

	const multiSpace = lines.map((l) => l.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean));
	if (multiSpace.filter((r) => r.length > 1).length >= Math.ceil(lines.length * 0.3)) {
		const width = Math.max(...multiSpace.map((r) => r.length));
		return multiSpace.map((r) => {
			while (r.length < width) r.push('');
			return r;
		});
	}

	return lines.map((l) => [l]);
}

export function rowsToCsv(rows: string[][]): string {
	return rows
		.map((row) =>
			row
				.map((cell) => {
					const needsQuote = /[",\n\r]/.test(cell);
					const escaped = cell.replace(/"/g, '""');
					return needsQuote ? `"${escaped}"` : escaped;
				})
				.join(',')
		)
		.join('\n');
}

export async function rowsToXlsx(rows: string[][], sheetName = 'Sheet1'): Promise<Uint8Array> {
	const XLSX = await import('xlsx');
	const ws = XLSX.utils.aoa_to_sheet(rows);
	const wb = XLSX.utils.book_new();
	XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31) || 'Sheet1');
	const out = XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer;
	return new Uint8Array(out);
}
