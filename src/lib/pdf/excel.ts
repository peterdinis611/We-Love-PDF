import * as XLSX from 'xlsx';
import { tableToPdf } from './table-pdf';
import type { ConvertPageSize } from './convert';

export function excelToRows(buffer: ArrayBuffer): string[][] {
	const workbook = XLSX.read(buffer, { type: 'array' });
	const sheetName = workbook.SheetNames[0];
	if (!sheetName) throw new Error('Excel file has no sheets.');

	const sheet = workbook.Sheets[sheetName];
	const raw = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
		header: 1,
		defval: ''
	});

	return raw
		.map((row) => row.map((cell) => (cell === null || cell === undefined ? '' : String(cell))))
		.filter((row) => row.some((cell) => cell.trim().length > 0));
}

export async function excelToPdf(
	buffer: ArrayBuffer,
	options: { pageSize?: ConvertPageSize; fontSize?: number; title?: string } = {}
): Promise<Uint8Array> {
	const rows = excelToRows(buffer);
	if (!rows.length) throw new Error('Excel sheet is empty.');
	return tableToPdf(rows, options);
}
