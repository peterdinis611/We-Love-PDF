import type { Component } from 'svelte';
import MergeTool from '$lib/components/tools/MergeTool.svelte';
import SplitTool from '$lib/components/tools/SplitTool.svelte';
import ViewTool from '$lib/components/tools/ViewTool.svelte';
import RotateTool from '$lib/components/tools/RotateTool.svelte';
import OrganizeTool from '$lib/components/tools/OrganizeTool.svelte';
import PdfToJpgTool from '$lib/components/tools/PdfToJpgTool.svelte';
import ExtractPagesTool from '$lib/components/tools/ExtractPagesTool.svelte';
import DeletePagesTool from '$lib/components/tools/DeletePagesTool.svelte';
import ImagesToPdfTool from '$lib/components/tools/ImagesToPdfTool.svelte';
import WatermarkTool from '$lib/components/tools/WatermarkTool.svelte';
import CompressTool from '$lib/components/tools/CompressTool.svelte';
import PdfInfoTool from '$lib/components/tools/PdfInfoTool.svelte';
import PageNumbersTool from '$lib/components/tools/PageNumbersTool.svelte';
import ProtectTool from '$lib/components/tools/ProtectTool.svelte';
import UnlockTool from '$lib/components/tools/UnlockTool.svelte';

export const toolComponents: Record<string, Component> = {
	'merge-pdf': MergeTool,
	'split-pdf': SplitTool,
	'view-pdf': ViewTool,
	'rotate-pdf': RotateTool,
	'organize-pdf': OrganizeTool,
	'pdf-to-jpg': PdfToJpgTool,
	'extract-pages': ExtractPagesTool,
	'delete-pages': DeletePagesTool,
	'images-to-pdf': ImagesToPdfTool,
	'watermark-pdf': WatermarkTool,
	'compress-pdf': CompressTool,
	'pdf-info': PdfInfoTool,
	'page-numbers': PageNumbersTool,
	'protect-pdf': ProtectTool,
	'unlock-pdf': UnlockTool
};
