import type { PdfTool } from '$lib/tools';
import type { Locale } from './locale';
import { getMessages, toolTranslation } from './messages';

export function localizeTool(tool: PdfTool, locale: Locale): PdfTool {
	if (locale === 'en') return tool;
	const tr = toolTranslation(tool.slug, locale);
	if (!tr) return tool;
	return { ...tool, name: tr.name, description: tr.description };
}

export function localizeTools(tools: PdfTool[], locale: Locale): PdfTool[] {
	return tools.map((tool) => localizeTool(tool, locale));
}

export function msg(locale: Locale) {
	return getMessages(locale);
}
