import { LOCALES, type Locale } from './locale';

/** Prerender param objects for optional `[[lang]]` segment (English = `{}`). */
export function localeParamEntries(): { lang?: Locale }[] {
	return LOCALES.map((locale) => (locale === 'en' ? {} : { lang: locale }));
}

/** Cross-product of locales × tool slugs for `/tools/[slug]` prerender. */
export function toolSlugEntries(slugs: string[]): { lang?: Locale; slug: string }[] {
	return slugs.flatMap((slug) =>
		LOCALES.map((locale) => (locale === 'en' ? { slug } : { lang: locale, slug }))
	);
}

/** Cross-product of locales × guide slugs. */
export function guideSlugEntries(slugs: string[]): { lang?: Locale; slug: string }[] {
	return toolSlugEntries(slugs);
}
