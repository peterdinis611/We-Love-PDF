export { TOOL_TO_GUIDE, guideSlugForTool } from './registry';
export {
	deriveGuideSlugs,
	GUIDE_SLUGS,
	guidePath,
	createGuidesSource,
	guidePrerenderEntries,
	listGuidePages,
	type GuideSlug
} from './source';

import { createGuidesSource, listGuidePages } from './source';
import type { Locale } from '$lib/i18n/locale';

/** Featured guides shown on homepage (slug path segments). */
export const FEATURED_GUIDE_SLUGS = [
	'getting-started',
	'merge-pdf-free',
	'split-pdf-free',
	'compress-pdf-online',
	'ocr-pdf-guide'
] as const;

export function featuredGuides(locale: Locale) {
	const source = createGuidesSource(locale);
	return FEATURED_GUIDE_SLUGS.map((slugPath) => {
		const slug = slugPath.split('/').filter(Boolean);
		const page = source.getPage(slug);
		if (!page) return null;
		return {
			title: page.data.title,
			description: page.data.description ?? '',
			url: page.url
		};
	}).filter((entry): entry is NonNullable<typeof entry> => !!entry);
}

export function guideSearchItems(locale: Locale) {
	return listGuidePages(locale)
		.filter((page) => page.slug.length > 0)
		.map((page) => ({
			title: page.data.title,
			description: page.data.description ?? '',
			url: page.url
		}));
}
