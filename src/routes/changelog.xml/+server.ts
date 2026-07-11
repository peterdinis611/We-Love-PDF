import { getChangelogPage } from '$lib/changelog';
import { canonicalUrl, site } from '$lib/seo';

const RSS_ITEMS = [
	{ locale: 'en' as const, id: 'growth-wave-2026' },
	{ locale: 'sk' as const, id: 'growth-wave-2026-sk' }
];

function escapeXml(text: string): string {
	return text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export async function GET() {
	const now = new Date().toUTCString();
	const items = RSS_ITEMS.flatMap(({ locale }) => {
		const page = getChangelogPage(locale);
		const link = canonicalUrl(locale === 'sk' ? '/sk/changelog' : '/changelog');
		const highlights = page.sections
			.flatMap((s) => s.items)
			.slice(0, 8)
			.map((item) => `<li>${escapeXml(item.title)}</li>`)
			.join('');

		return [
			`<item>
	<title>${escapeXml(page.title)} — ${escapeXml(page.updated)}</title>
	<link>${link}</link>
	<guid isPermaLink="true">${link}#${locale}</guid>
	<pubDate>${now}</pubDate>
	<description>${escapeXml(page.subtitle)}</description>
	<content:encoded><![CDATA[<ul>${highlights}</ul>]]></content:encoded>
</item>`
		];
	}).join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
<channel>
	<title>${escapeXml(site.name)} Changelog</title>
	<link>${canonicalUrl('/changelog')}</link>
	<description>Product updates for ${escapeXml(site.name)}</description>
	<language>en</language>
	<lastBuildDate>${now}</lastBuildDate>
	<atom:link href="${canonicalUrl('/changelog.xml')}" rel="self" type="application/rss+xml"/>
${items}
</channel>
</rss>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600'
		}
	});
}
