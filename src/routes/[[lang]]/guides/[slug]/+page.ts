import { error } from '@sveltejs/kit';
import { getGuide, guides } from '$lib/guides';
import { guideSlugEntries } from '$lib/i18n/prerender';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const guide = getGuide(params.slug);
	if (!guide) error(404, 'Guide not found');
	return { guide };
};

export function entries() {
	return guideSlugEntries(guides.map((g) => g.slug));
}

export const prerender = true;
