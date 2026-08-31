import { env } from '$env/dynamic/public';
import { alternatePaths, localeHreflang, LOCALES, localizedPath, type Locale } from '$lib/i18n/locale';
import { GUIDE_SLUGS } from '$lib/guides';
import { tools } from '$lib/tools';

const DEFAULT_SITE_URL = 'https://welovepdf.app';

/** ISO date for sitemap lastmod (build day). */
const SITEMAP_LASTMOD = new Date().toISOString().slice(0, 10);

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
	ogType?: 'website' | 'article';
	ogImage?: string;
}

export function canonicalUrl(path = ''): string {
	const base = site.url.replace(/\/$/, '');
	const normalized = path.startsWith('/') ? path : path ? `/${path}` : '';
	return `${base}${normalized}`;
}

export function defaultOgImage(): string {
	return canonicalUrl('/og-image.svg');
}

export function pageTitle(title: string): string {
	return title.includes(site.name) ? title : `${title} — ${site.name}`;
}

export function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

export function organizationJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: site.name,
		url: site.url,
		logo: defaultOgImage(),
		description: site.description
	};
}

export function websiteJsonLd() {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: site.name,
		url: site.url,
		description: site.description,
		publisher: { '@type': 'Organization', name: site.name, url: site.url },
		potentialAction: {
			'@type': 'SearchAction',
			target: `${site.url}/?q={search_term_string}`,
			'query-input': 'required name=search_term_string'
		}
	};
}

export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: crumbs.map((crumb, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name: crumb.name,
			item: canonicalUrl(crumb.path)
		}))
	};
}

export function articleJsonLd(
	title: string,
	description: string,
	path: string,
	locale: Locale
) {
	return {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline: title,
		description,
		url: canonicalUrl(path),
		inLanguage: localeHreflang(locale),
		author: { '@type': 'Organization', name: site.name, url: site.url },
		publisher: {
			'@type': 'Organization',
			name: site.name,
			url: site.url,
			logo: { '@type': 'ImageObject', url: defaultOgImage() }
		},
		isPartOf: { '@type': 'WebSite', name: site.name, url: site.url }
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
		inLanguage: localeHreflang(locale)
	};
}

export function workflowJsonLd(
	name: string,
	description: string,
	slug: string,
	locale: Locale
) {
	const path = localizedPath(`/workflows/${slug}`, locale);
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
		inLanguage: localeHreflang(locale)
	};
}

export interface SitemapUrl {
	loc: string;
	changefreq: 'weekly' | 'monthly' | 'yearly';
	priority: number;
	lastmod: string;
	alternates: Record<Locale, string>;
}

type SitemapSeed = {
	basePath: string;
	changefreq: SitemapUrl['changefreq'];
	priority: number;
};

function sitemapSeeds(): SitemapSeed[] {
	const staticPaths: SitemapSeed[] = [
		{ basePath: '/', changefreq: 'weekly', priority: 1 },
		{ basePath: '/changelog', changefreq: 'monthly', priority: 0.6 },
		{ basePath: '/guides', changefreq: 'monthly', priority: 0.65 },
		{ basePath: '/workflows/secure-pdf', changefreq: 'monthly', priority: 0.7 },
		{ basePath: '/workflows/prepare-for-send', changefreq: 'monthly', priority: 0.7 },
		{ basePath: '/workflows/scan-cleanup', changefreq: 'monthly', priority: 0.7 },
		{ basePath: '/workflows/archive-pack', changefreq: 'monthly', priority: 0.7 }
	];

	const toolSeeds = tools
		.filter((t) => t.available)
		.map(
			(t): SitemapSeed => ({
				basePath: `/tools/${t.slug}`,
				changefreq: 'monthly',
				priority: 0.8
			})
		);

	const guideSeeds = GUIDE_SLUGS.map(
		(slug): SitemapSeed => ({
			basePath: `/guides/${slug}`,
			changefreq: 'monthly',
			priority: 0.6
		})
	);

	return [...staticPaths, ...toolSeeds, ...guideSeeds];
}

export function sitemapEntries(): SitemapUrl[] {
	return sitemapSeeds().flatMap((seed) =>
		LOCALES.map((locale) => {
			const path = localizedPath(seed.basePath, locale);
			return {
				loc: canonicalUrl(path),
				changefreq: seed.changefreq,
				priority: locale === 'en' ? seed.priority : Math.round(seed.priority * 0.95 * 100) / 100,
				lastmod: SITEMAP_LASTMOD,
				alternates: alternatePaths(seed.basePath)
			};
		})
	);
}

export function sitemapXml(): string {
	const urls = sitemapEntries();
	return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls
	.map((entry) => {
		const altLinks = LOCALES.map(
			(loc) =>
				`    <xhtml:link rel="alternate" hreflang="${localeHreflang(loc)}" href="${escapeXml(canonicalUrl(entry.alternates[loc]))}" />`
		).join('\n');
		const xDefault = `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(canonicalUrl(entry.alternates.en))}" />`;

		return `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(2)}</priority>
${altLinks}
${xDefault}
  </url>`;
	})
	.join('\n')}
</urlset>`;
}

export function robotsTxt(): string {
	const sitemap = canonicalUrl('/sitemap.xml');
	return `# WeLovePDF — ${site.name}
User-agent: *
Allow: /

# Client-side search filters — avoid indexing duplicate SERP snippets
Disallow: /*?q=

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${sitemap}
`;
}
