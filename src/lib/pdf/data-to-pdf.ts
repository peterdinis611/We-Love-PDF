import { tableToPdf } from './table-pdf';
import type { ConvertPageSize } from './convert';

export function jsonToRows(data: unknown): string[][] {
	if (Array.isArray(data)) {
		if (data.length && typeof data[0] === 'object' && data[0] !== null && !Array.isArray(data[0])) {
			const keys = [
				...new Set(data.flatMap((item) => Object.keys(item as Record<string, unknown>)))
			];
			return [
				keys,
				...data.map((item) =>
					keys.map((key) => String((item as Record<string, unknown>)[key] ?? ''))
				)
			];
		}
		return [['Value'], ...data.map((value) => [formatCell(value)])];
	}

	if (typeof data === 'object' && data !== null) {
		return [
			['Key', 'Value'],
			...Object.entries(data as Record<string, unknown>).map(([key, value]) => [
				key,
				formatCell(value)
			])
		];
	}

	return [['Value'], [formatCell(data)]];
}

function formatCell(value: unknown): string {
	if (value === null || value === undefined) return '';
	if (typeof value === 'object') return JSON.stringify(value);
	return String(value);
}

export function xmlToRows(xml: string): string[][] {
	const doc = new DOMParser().parseFromString(xml, 'text/xml');
	if (doc.querySelector('parsererror')) throw new Error('Invalid XML.');

	const root = doc.documentElement;
	const children = [...root.children];

	if (children.length) {
		const leafTags = [
			...new Set(children.flatMap((child) => [...child.children].map((el) => el.tagName)))
		];
		if (leafTags.length) {
			return [
				leafTags,
				...children.map((child) =>
					leafTags.map((tag) => child.querySelector(`:scope > ${tag}`)?.textContent?.trim() ?? '')
				)
			];
		}
	}

	if (children.length) {
		return [
			['Element', 'Text'],
			...children.map((el) => [el.tagName, el.textContent?.trim() ?? ''])
		];
	}

	return [['Text'], [root.textContent?.trim() ?? '']];
}

export async function rowsToPdf(
	rows: string[][],
	options: { pageSize?: ConvertPageSize; fontSize?: number; title?: string } = {}
): Promise<Uint8Array> {
	return tableToPdf(rows, options);
}

export async function jsonToPdf(
	jsonText: string,
	options: { pageSize?: ConvertPageSize; fontSize?: number; title?: string } = {}
): Promise<Uint8Array> {
	const data = JSON.parse(jsonText) as unknown;
	const rows = jsonToRows(data);
	return rowsToPdf(rows, options);
}

export async function xmlToPdf(
	xmlText: string,
	options: { pageSize?: ConvertPageSize; fontSize?: number; title?: string } = {}
): Promise<Uint8Array> {
	const rows = xmlToRows(xmlText);
	return rowsToPdf(rows, options);
}
