import { robotsTxt } from '$lib/seo';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () =>
	new Response(robotsTxt(), {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
			'Cache-Control': 'max-age=0, s-maxage=3600'
		}
	});
