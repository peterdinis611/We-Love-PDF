import type { Component } from 'svelte';

export const toolLoaders: Record<string, () => Promise<{ default: Component }>> = {
	'merge-pdf': () => import('$lib/components/tools/MergeTool.svelte'),
	'split-pdf': () => import('$lib/components/tools/SplitTool.svelte'),
	'view-pdf': () => import('$lib/components/tools/ViewTool.svelte'),
	'rotate-pdf': () => import('$lib/components/tools/RotateTool.svelte'),
	'organize-pdf': () => import('$lib/components/tools/OrganizeTool.svelte'),
	'pdf-to-jpg': () => import('$lib/components/tools/PdfToJpgTool.svelte'),
	'pdf-to-text': () => import('$lib/components/tools/PdfToTextTool.svelte'),
	'pdf-to-html': () => import('$lib/components/tools/PdfToHtmlTool.svelte'),
	'txt-to-pdf': () => import('$lib/components/tools/TxtToPdfTool.svelte'),
	'html-to-pdf': () => import('$lib/components/tools/HtmlToPdfTool.svelte'),
	'markdown-to-pdf': () => import('$lib/components/tools/MarkdownToPdfTool.svelte'),
	'extract-pages': () => import('$lib/components/tools/ExtractPagesTool.svelte'),
	'delete-pages': () => import('$lib/components/tools/DeletePagesTool.svelte'),
	'duplicate-pages': () => import('$lib/components/tools/DuplicatePagesTool.svelte'),
	'images-to-pdf': () => import('$lib/components/tools/ImagesToPdfTool.svelte'),
	'watermark-pdf': () => import('$lib/components/tools/WatermarkTool.svelte'),
	'compress-pdf': () => import('$lib/components/tools/CompressTool.svelte'),
	'pdf-info': () => import('$lib/components/tools/PdfInfoTool.svelte'),
	'edit-metadata': () => import('$lib/components/tools/EditMetadataTool.svelte'),
	'page-numbers': () => import('$lib/components/tools/PageNumbersTool.svelte'),
	'sign-pdf': () => import('$lib/components/tools/SignTool.svelte'),
	'flatten-pdf': () => import('$lib/components/tools/FlattenTool.svelte'),
	'protect-pdf': () => import('$lib/components/tools/ProtectTool.svelte'),
	'unlock-pdf': () => import('$lib/components/tools/UnlockTool.svelte'),
	'change-pdf-password': () => import('$lib/components/tools/ChangePasswordTool.svelte'),
	'pdf-security-check': () => import('$lib/components/tools/CheckSecurityTool.svelte')
};

export const engineTools = new Set([
	'pdf-to-jpg',
	'pdf-to-text',
	'pdf-to-html',
	'protect-pdf',
	'unlock-pdf',
	'change-pdf-password',
	'pdf-security-check',
	'flatten-pdf'
]);

export async function loadToolComponent(slug: string): Promise<Component | null> {
	const loader = toolLoaders[slug];
	if (!loader) return null;
	const mod = await loader();
	return mod.default;
}
