import { localizeTool } from '$lib/i18n';
import { msg } from '$lib/i18n';
import type { Locale } from '$lib/i18n/locale';
import { getTool, tools, type PdfTool } from '$lib/tools';

/** Tools marked as new in the UI (badge + changelog featured). */
export const NEW_TOOL_SLUGS = [
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
] as const;

export type NewToolSlug = (typeof NEW_TOOL_SLUGS)[number];

const newToolSet = new Set<string>(NEW_TOOL_SLUGS);

export function isNewTool(slug: string): boolean {
	return newToolSet.has(slug);
}

export function getNewTools(locale: Locale): PdfTool[] {
	return NEW_TOOL_SLUGS.map((slug) => getTool(slug))
		.filter((t): t is PdfTool => !!t && t.available)
		.map((t) => localizeTool(t, locale));
}

export type ChangelogItem = {
	id: string;
	title: string;
	description: string;
	toolSlug?: string;
	highlight: boolean;
};

export type ChangelogSection = {
	id: string;
	title: string;
	subtitle?: string;
	items: ChangelogItem[];
};

export type ChangelogPage = {
	title: string;
	subtitle: string;
	updated: string;
	stats: string;
	newToolsCount: number;
	jumpTo: string;
	newToolsTitle: string;
	newToolsSubtitle: string;
	newToolsBadge: string;
	exploreAll: string;
	openTool: string;
	showAll: string;
	showLess: string;
	sections: ChangelogSection[];
};

type CopyEntry = { type: 'copy'; key: string };
type ToolEntry = { type: 'tool'; slug: string; descKey?: string };

const SECTION_DEFS: { id: string; entries: (CopyEntry | ToolEntry)[] }[] = [
	{
		id: 'product',
		entries: [
			{ type: 'copy', key: 'i18n' },
			{ type: 'copy', key: 'seo-landing' },
			{ type: 'copy', key: 'whats-new-badges' },
			{ type: 'copy', key: 'plausible' },
			{ type: 'copy', key: 'offline-pwa' },
			{ type: 'copy', key: 'vercel-fixes' }
		]
	},
	{
		id: 'tools-office',
		entries: [
			{ type: 'tool', slug: 'word-to-pdf' },
			{ type: 'tool', slug: 'powerpoint-to-pdf' },
			{ type: 'tool', slug: 'digital-sign-pdf' },
			{ type: 'tool', slug: 'pdf-signature-check' }
		]
	},
	{
		id: 'tools-convert',
		entries: [
			{ type: 'tool', slug: 'pdf-to-png' },
			{ type: 'tool', slug: 'pdf-to-docx' },
			{ type: 'tool', slug: 'csv-to-pdf', descKey: 'data-to-pdf' },
			{ type: 'tool', slug: 'compare-pdf' }
		]
	},
	{
		id: 'tools-edit',
		entries: [
			{ type: 'tool', slug: 'crop-pdf' },
			{ type: 'tool', slug: 'redact-pdf' },
			{ type: 'tool', slug: 'remove-metadata' },
			{ type: 'tool', slug: 'fill-pdf-form' },
			{ type: 'tool', slug: 'batch-pdf' },
			{ type: 'tool', slug: 'organize-pdf' }
		]
	},
	{
		id: 'ux',
		entries: [
			{ type: 'copy', key: 'favorites' },
			{ type: 'copy', key: 'recent-tools' },
			{ type: 'copy', key: 'share-link' },
			{ type: 'copy', key: 'how-it-works' },
			{ type: 'copy', key: 'url-params' },
			{ type: 'copy', key: 'progress-bars' },
			{ type: 'copy', key: 'page-thumbnails' },
			{ type: 'copy', key: 'view-shortcuts' },
			{ type: 'copy', key: 'dark-pwa' },
			{ type: 'copy', key: 'zip-export' }
		]
	}
];

/** UX section collapses after this many visible items. */
export const CHANGELOG_UX_PREVIEW = 5;

function resolveEntry(
	entry: CopyEntry | ToolEntry,
	locale: Locale
): ChangelogItem {
	const m = msg(locale);

	if (entry.type === 'copy') {
		const copy = m.changelog.items[entry.key];
		return {
			id: entry.key,
			title: copy.title,
			description: copy.description,
			highlight: false
		};
	}

	const tool = getTool(entry.slug);
	if (!tool) {
		return {
			id: entry.slug,
			title: entry.slug,
			description: '',
			toolSlug: entry.slug,
			highlight: isNewTool(entry.slug)
		};
	}

	const localized = localizeTool(tool, locale);
	const override = entry.descKey ? m.changelog.items[entry.descKey] : undefined;

	return {
		id: entry.slug,
		title: override?.title ?? localized.name,
		description: override?.description ?? localized.description,
		toolSlug: entry.slug,
		highlight: isNewTool(entry.slug)
	};
}

export function getChangelogPage(locale: Locale): ChangelogPage {
	const m = msg(locale);
	const toolCount = tools.filter((t) => t.available).length;

	return {
		title: m.changelog.title,
		subtitle: m.changelog.subtitle,
		updated: m.changelog.updated,
		stats: `${toolCount} ${m.changelog.statsSuffix}`,
		newToolsCount: NEW_TOOL_SLUGS.length,
		jumpTo: m.changelog.jumpTo,
		newToolsTitle: m.changelog.newToolsTitle,
		newToolsSubtitle: m.changelog.newToolsSubtitle,
		newToolsBadge: m.changelog.newToolsBadge,
		exploreAll: m.changelog.exploreAll,
		openTool: m.changelog.openTool,
		showAll: m.changelog.showAll,
		showLess: m.changelog.showLess,
		sections: SECTION_DEFS.map(({ id, entries }) => ({
			id,
			title: m.changelog.sections[id].title,
			subtitle: m.changelog.sections[id].subtitle,
			items: entries.map((entry) => resolveEntry(entry, locale))
		}))
	};
}
