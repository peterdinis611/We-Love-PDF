export function parseCsv(text: string): string[][] {
	const rows: string[][] = [];

	for (const line of text.replace(/\r\n/g, '\n').split('\n')) {
		if (!line.trim()) continue;
		const row: string[] = [];
		let current = '';
		let inQuotes = false;

		for (let i = 0; i < line.length; i++) {
			const char = line[i];
			if (char === '"') {
				if (inQuotes && line[i + 1] === '"') {
					current += '"';
					i++;
				} else {
					inQuotes = !inQuotes;
				}
				continue;
			}
			if (char === ',' && !inQuotes) {
				row.push(current.trim());
				current = '';
				continue;
			}
			current += char;
		}

		row.push(current.trim());
		rows.push(row);
	}

	return rows.filter((row) => row.some((cell) => cell.length > 0));
}
