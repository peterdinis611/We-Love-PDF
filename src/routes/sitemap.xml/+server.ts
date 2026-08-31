import { sitemapXml } from '$lib/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	new Response(sitemapXml(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
