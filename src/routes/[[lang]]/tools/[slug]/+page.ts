import { error } from '@sveltejs/kit';
import { getTool, tools } from '$lib/tools';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	const tool = getTool(params.slug);
	if (!tool || !tool.available) error(404, 'Tool not found');
	return { tool };
};

export function entries() {
	const slugs = tools.filter((t) => t.available).map((t) => t.slug);
	return [...slugs.map((slug) => ({ slug })), ...slugs.map((slug) => ({ lang: 'sk', slug }))];
}

export const prerender = true;
