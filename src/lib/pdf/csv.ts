import { parseCsv } from './csv-parse';
import { tableToPdf, type TableToPdfOptions } from './table-pdf';

export { parseCsv } from './csv-parse';
export type { TableToPdfOptions } from './table-pdf';

export type CsvToPdfOptions = TableToPdfOptions;

export async function csvToPdf(csv: string, options: CsvToPdfOptions = {}): Promise<Uint8Array> {
	const rows = parseCsv(csv);
	if (!rows.length) throw new Error('CSV file is empty.');
	return tableToPdf(rows, options);
}
