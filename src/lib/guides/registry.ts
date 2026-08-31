/** Maps tool slug → guide URL path segment (under /guides). */
export const TOOL_TO_GUIDE: Record<string, string> = {
	'merge-pdf': 'merge-pdf-free',
	'digital-sign-pdf': 'pdf-digital-sign-p12',
	'compress-pdf': 'compress-pdf-online',
	'split-pdf': 'split-pdf-free',
	'ocr-pdf': 'ocr-pdf-guide',
	'sign-pdf': 'sign-pdf-guide',
	'protect-pdf': 'protect-pdf-guide'
};

export function guideSlugForTool(toolSlug: string): string | undefined {
	return TOOL_TO_GUIDE[toolSlug];
}
