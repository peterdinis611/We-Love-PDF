import { error } from '@sveltejs/kit';
import { getTool, tools } from '$lib/tools';
import { toolSlugEntries } from '$lib/i18n/prerender';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const tool = getTool(params.slug);
	if (!tool || !tool.available) error(404, 'Tool not found');
	return { tool };
};

export function entries() {
	const slugs = tools.filter((t) => t.available).map((t) => t.slug);
	return toolSlugEntries(slugs);
}

export const prerender = true;
