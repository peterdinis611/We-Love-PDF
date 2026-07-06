/** Tools marked as new in the UI (changelog / what's new badge). */
export const NEW_TOOL_SLUGS = new Set([
	'pdf-to-png',
	'csv-to-pdf',
	'json-to-pdf',
	'xml-to-pdf',
	'compare-pdf',
	'word-to-pdf',
	'powerpoint-to-pdf',
	'pdf-to-docx',
	'digital-sign-pdf',
	'pdf-signature-check'
]);

export function isNewTool(slug: string): boolean {
	return NEW_TOOL_SLUGS.has(slug);
}
