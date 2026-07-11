import { env } from '$env/dynamic/public';
import { LOCALES, localizedPath, type Locale } from '$lib/i18n/locale';
import { tools } from '$lib/tools';

const DEFAULT_SITE_URL = 'https://welovepdf.app';

export const site = {
	name: 'WeLovePDF',
	tagline: 'Every PDF tool you need',
	description:
		'Free online PDF tools — merge, split, compress, rotate, watermark, sign, encrypt and more. 100% private, runs entirely in your browser.',
	get url() {
		return env.PUBLIC_SITE_URL || DEFAULT_SITE_URL;
	},
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

export function toolJsonLd(name: string, description: string, slug: string, locale: Locale = 'en') {
	const path = localizedPath(`/tools/${slug}`, locale);
	return {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name,
		description,
		url: canonicalUrl(path),
		applicationCategory: 'UtilitiesApplication',
		operatingSystem: 'Any',
		browserRequirements: 'Requires JavaScript',
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
		isPartOf: { '@type': 'WebSite', name: site.name, url: site.url },
		inLanguage: locale === 'en' ? 'en' : locale
	};
}

export function sitemapEntries() {
	const staticPaths = [
		{ path: '', changefreq: 'weekly' as const, priority: 1 },
		{ path: '/changelog', changefreq: 'monthly' as const, priority: 0.6 },
		{ path: '/guides', changefreq: 'monthly' as const, priority: 0.65 },
		{ path: '/workflows/secure-pdf', changefreq: 'monthly' as const, priority: 0.7 },
		{ path: '/changelog.xml', changefreq: 'weekly' as const, priority: 0.4 }
	];

	const localePaths = LOCALES.flatMap((locale) =>
		staticPaths.map((entry) => ({
			path: localizedPath(entry.path, locale),
			changefreq: entry.changefreq,
			priority: locale === 'en' ? entry.priority : entry.priority * 0.95
		}))
	);

	const toolPaths = tools
		.filter((t) => t.available)
		.flatMap((t) =>
			LOCALES.map((locale) => ({
				path: localizedPath(`/tools/${t.slug}`, locale),
				changefreq: 'monthly' as const,
				priority: locale === 'en' ? 0.8 : 0.75
			}))
		);

	const guideSlugs = ['merge-pdf-free', 'pdf-digital-sign-p12', 'compress-pdf-online'];
	const guidePaths = guideSlugs.flatMap((slug) =>
		LOCALES.map((locale) => ({
			path: localizedPath(`/guides/${slug}`, locale),
			changefreq: 'monthly' as const,
			priority: 0.6
		}))
	);

	return [...localePaths, ...toolPaths, ...guidePaths].map((entry) => ({
		loc: canonicalUrl(entry.path),
		changefreq: entry.changefreq,
		priority: entry.priority
	}));
}
