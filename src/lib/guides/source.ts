import { createFileSystemSource, type RawSvxModule } from 'fumadocs-svelte';
import { LOCALES, localizedPath, type Locale } from '$lib/i18n/locale';

const modules = import.meta.glob<RawSvxModule>('/src/content/guides/**/*.svx', { eager: true });

/** Derive guide slug paths from English content (e.g. `merge-pdf-free`, `getting-started/privacy`). */
export function deriveGuideSlugs(): string[] {
	const slugs = new Set<string>();
	for (const path of Object.keys(modules)) {
		if (!path.startsWith('/src/content/guides/en/')) continue;
		const relative = path.replace('/src/content/guides/en/', '').replace(/\.svx$/, '');
		if (relative === 'index') continue;
		if (relative.endsWith('/index')) {
			slugs.add(relative.replace(/\/index$/, ''));
			continue;
		}
		slugs.add(relative);
	}
	return [...slugs].sort();
}

/** @deprecated Use deriveGuideSlugs() — kept for imports that expect a static list. */
export const GUIDE_SLUGS = deriveGuideSlugs() as readonly string[];

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export function createGuidesSource(locale: Locale) {
	const prefix = `/src/content/guides/${locale}/`;
	const localeModules: Record<string, RawSvxModule> = {};

	for (const [path, mod] of Object.entries(modules)) {
		if (path.startsWith(prefix)) {
			localeModules[path] = mod;
		}
	}

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

export function listGuidePages(locale: Locale) {
	return createGuidesSource(locale).getPages();
}

/** Prerender entries for rest param under [[lang]]/guides/[...slug] */
export function guidePrerenderEntries(): { lang?: string; slug: string }[] {
	const enPages = createGuidesSource('en').getPages();
	const slugPaths = enPages.map((page) => page.slug.join('/'));

	return LOCALES.flatMap((locale) =>
		['', ...slugPaths].map((slug) => {
			const entry: { lang?: string; slug: string } = { slug };
			if (locale !== 'en') entry.lang = locale;
			return entry;
		})
	);
}
