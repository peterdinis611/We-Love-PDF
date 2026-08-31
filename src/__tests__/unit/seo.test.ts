import { describe, expect, it } from 'vitest';
import { deriveGuideSlugs } from '$lib/guides';
import { tools } from '$lib/tools';
import { LOCALES } from '$lib/i18n/locale';
import { robotsTxt, sitemapEntries, sitemapXml } from '$lib/seo';
import { getToolSeo } from '$lib/tool-seo';

describe('seo', () => {
	it('robots.txt references sitemap and blocks search query URLs', () => {
		const body = robotsTxt();
		expect(body).toContain('Sitemap: https://welovepdf.app/sitemap.xml');
		expect(body).toContain('Disallow: /*?q=');
		expect(body).toContain('User-agent: *');
	});

	it('sitemap includes all locales, tools, guides, and workflows', () => {
		const entries = sitemapEntries();
		const availableTools = tools.filter((t) => t.available).length;
		const guideSlugCount = deriveGuideSlugs().length;
		const staticPages = 7 + guideSlugCount; // home, changelog, guides index, 4 workflows + guide articles
		const expectedMin = (staticPages + availableTools) * LOCALES.length;

		expect(entries.length).toBeGreaterThanOrEqual(expectedMin);
		expect(entries.some((e) => e.loc.endsWith('/tools/merge-pdf'))).toBe(true);
		expect(entries.some((e) => e.loc.endsWith('/sk/tools/merge-pdf'))).toBe(true);
		expect(entries.some((e) => e.loc.endsWith('/guides'))).toBe(true);
		expect(entries.some((e) => e.loc.includes('/guides/merge-pdf-free'))).toBe(true);
	});

	it('sitemap XML includes hreflang alternates and lastmod', () => {
		const xml = sitemapXml();
		expect(xml).toContain('xmlns:xhtml="http://www.w3.org/1999/xhtml"');
		expect(xml).toContain('hreflang="en"');
		expect(xml).toContain('hreflang="sk"');
		expect(xml).toContain('hreflang="x-default"');
		expect(xml).toContain('<lastmod>');
	});

	it('each sitemap entry has alternates for every locale', () => {
		for (const entry of sitemapEntries()) {
			for (const locale of LOCALES) {
				expect(entry.alternates[locale]).toBeTruthy();
			}
		}
	});
});

describe('tool-seo locales', () => {
	it('returns localized generic SEO for cs, de, and pl', () => {
		expect(getToolSeo('unknown-tool', 'Test Tool', 'cs').title).toContain('zdarma');
		expect(getToolSeo('unknown-tool', 'Test Tool', 'de').title).toContain('kostenlos');
		expect(getToolSeo('unknown-tool', 'Test Tool', 'pl').title).toContain('za darmo');
	});

	it('falls back to English custom SEO for unsupported locale', () => {
		const seo = getToolSeo('split-pdf', 'Split PDF', 'de');
		expect(seo.title).toContain('Split PDF');
	});
});
