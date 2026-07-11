export type Locale = 'en' | 'sk' | 'cs' | 'de' | 'pl';

export const LOCALES: Locale[] = ['en', 'sk', 'cs', 'de', 'pl'];

const NON_EN_LOCALES = new Set<Locale>(['sk', 'cs', 'de', 'pl']);

export function parseLocale(lang: string | undefined): Locale {
	if (lang && LOCALES.includes(lang as Locale) && lang !== 'en') {
		return lang as Locale;
	}
	return 'en';
}

export function isValidLangParam(lang: string | undefined): boolean {
	return !lang || NON_EN_LOCALES.has(lang as Locale);
}

/** Strip /sk, /cs, … prefix and return the English path. */
export function stripLocalePrefix(path: string): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	for (const locale of LOCALES) {
		if (locale === 'en') continue;
		if (normalized === `/${locale}`) return '/';
		if (normalized.startsWith(`/${locale}/`)) {
			return normalized.slice(locale.length + 1) || '/';
		}
	}
	return normalized;
}

export function localizedPath(path: string, locale: Locale): string {
	const base = stripLocalePrefix(path.startsWith('/') ? path : `/${path}`);
	if (locale === 'en') return base;
	return base === '/' ? `/${locale}` : `/${locale}${base}`;
}

export function toolPath(slug: string, locale: Locale): string {
	return localizedPath(`/tools/${slug}`, locale);
}

export function alternatePaths(path: string): Record<Locale, string> {
	const base = stripLocalePrefix(path.startsWith('/') ? path : `/${path}`);
	return Object.fromEntries(LOCALES.map((locale) => [locale, localizedPath(base, locale)])) as Record<
		Locale,
		string
	>;
}

export function localeHreflang(locale: Locale): string {
	const map: Record<Locale, string> = {
		en: 'en',
		sk: 'sk',
		cs: 'cs',
		de: 'de',
		pl: 'pl'
	};
	return map[locale];
}

export function ogLocale(locale: Locale): string {
	const map: Record<Locale, string> = {
		en: 'en_US',
		sk: 'sk_SK',
		cs: 'cs_CZ',
		de: 'de_DE',
		pl: 'pl_PL'
	};
	return map[locale];
}
