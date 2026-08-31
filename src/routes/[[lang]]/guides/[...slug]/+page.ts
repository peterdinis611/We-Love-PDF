import { error } from '@sveltejs/kit';
import { flattenPageTree, getBreadcrumbs } from 'fumadocs-svelte';
import { createGuidesSource, guidePrerenderEntries } from '$lib/guides';
import { parseLocale } from '$lib/i18n/locale';
import type { EntryGenerator, PageLoad } from './$types';

export const prerender = true;

export const entries: EntryGenerator = () =>
	guidePrerenderEntries() as ReturnType<EntryGenerator>;

export const load: PageLoad = ({ params }) => {
	const locale = parseLocale(params.lang);
	const source = createGuidesSource(locale);
	const slugString = params.slug ?? '';
	const slug = slugString ? slugString.split('/').filter(Boolean) : [];

	const page = source.getPage(slug);
	if (!page) {
		error(404, { message: `Guide not found: /guides/${slugString}` });
	}

	const ordered = flattenPageTree(source.pageTree);
	const currentIndex = ordered.findIndex((entry) => entry.url === page.url);
	const prev = currentIndex > 0 ? ordered[currentIndex - 1] : undefined;
	const next = currentIndex >= 0 && currentIndex < ordered.length - 1 ? ordered[currentIndex + 1] : undefined;

	return {
		locale,
		page,
		pageTree: source.pageTree,
		guidesTitle: source.getPage([])?.data.title ?? 'Guides',
		breadcrumbs: getBreadcrumbs(source.pageTree, page.url),
		prev,
		next
	};
};
