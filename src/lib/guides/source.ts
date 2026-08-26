import { createFileSystemSource, type RawSvxModule } from 'fumadocs-svelte';
import { LOCALES, localizedPath, type Locale } from '$lib/i18n/locale';

const modules = import.meta.glob<RawSvxModule>('/src/content/guides/**/*.svx', { eager: true });

/** Guide slugs (without locale / index) for sitemap & prerender. */
export const GUIDE_SLUGS = [
	'merge-pdf-free',
	'pdf-digital-sign-p12',
	'compress-pdf-online'
] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export function createGuidesSource(locale: Locale) {
	const prefix = `/src/content/guides/${locale}/`;
	const localeModules: Record<string, RawSvxModule> = {};

	for (const [path, mod] of Object.entries(modules)) {
		if (path.startsWith(prefix)) {
			localeModules[path] = mod;
		}
	}

	// Fallback to English if a locale folder is empty / missing a page
	if (Object.keys(localeModules).length === 0 && locale !== 'en') {
		return createGuidesSource('en');
	}

	return createFileSystemSource({
		glob: localeModules,
		rootDir: `guides/${locale}`,
		baseUrl: localizedPath('/guides', locale)
	});
}

export function guidePath(slug: string, locale: Locale): string {
	return localizedPath(`/guides/${slug}`, locale);
}

/** Prerender entries for rest param under [[lang]]/guides/[...slug] */
export function guidePrerenderEntries(): { lang?: string; slug: string }[] {
	const paths = ['', ...GUIDE_SLUGS];
	return LOCALES.flatMap((locale) =>
		paths.map((slug) => {
			const entry: { lang?: string; slug: string } = { slug };
			if (locale !== 'en') entry.lang = locale;
			return entry;
		})
	);
}
