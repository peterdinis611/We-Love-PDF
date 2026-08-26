import { describe, expect, it } from 'vitest';
import { rowsToCsv, textToTableRows } from '$lib/pdf/pdf-to-table';

describe('textToTableRows', () => {
	it('splits tab-separated lines', () => {
		const rows = textToTableRows('a\tb\tc\n1\t2\t3');
		expect(rows).toEqual([
			['a', 'b', 'c'],
			['1', '2', '3']
		]);
	});

	it('falls back to single-column lines', () => {
		expect(textToTableRows('hello\nworld')).toEqual([['hello'], ['world']]);
	});
});

describe('rowsToCsv', () => {
	it('escapes quotes and commas', () => {
		expect(rowsToCsv([['a,b', 'say "hi"']])).toBe('"a,b","say ""hi"""');
	});
});
