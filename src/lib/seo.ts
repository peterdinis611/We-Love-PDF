import { PUBLIC_SITE_URL } from '$env/static/public';
import { tools } from '$lib/tools';

export const site = {
	name: 'WeLovePDF',
	tagline: 'Every PDF tool you need',
	description:
		'Free online PDF tools — merge, split, compress, rotate, watermark, sign, encrypt and more. 100% private, runs entirely in your browser.',
	url: PUBLIC_SITE_URL || 'https://welovepdf.app',
	locale: 'en_US',
	twitter: '@welovepdf'
} as const;

export interface SeoMeta {
	title: string;
	description: string;
	path?: string;
	noindex?: boolean;
}

export function canonicalUrl(path = ''): string {
	const base = site.url.replace(/\/$/, '');
	const normalized = path.startsWith('/') ? path : path ? `/${path}` : '';
	return `${base}${normalized}`;
}

export function pageTitle(title: string): string {
	return title.includes(site.name) ? title : `${title} — ${site.name}`;
}

export function websiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: site.name,
		url: site.url,
		description: site.description,
		potentialAction: {
			'@type': 'SearchAction',
			target: `${site.url}/?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	};
}

export function toolJsonLd(name: string, description: string, slug: string) {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name,
		description,
		url: canonicalUrl(`/tools/${slug}`),
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		isPartOf: { '@type': 'WebSite', name: site.name, url: site.url }
	};
}

export function sitemapEntries() {
	return [
		{ loc: site.url, changefreq: 'weekly' as const, priority: 1 },
		...tools
			.filter((t) => t.available)
			.map((t) => ({
				loc: canonicalUrl(`/tools/${t.slug}`),
				changefreq: 'monthly' as const,
				priority: 0.8
			}))
	];
}
