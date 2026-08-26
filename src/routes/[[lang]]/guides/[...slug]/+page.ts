import { error } from '@sveltejs/kit';
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

	return {
		locale,
		page,
		pageTree: source.pageTree,
		guidesTitle: source.getPage([])?.data.title ?? 'Guides'
	};
};
