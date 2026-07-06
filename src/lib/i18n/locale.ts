export type Locale = 'en' | 'sk';

export const LOCALES: Locale[] = ['en', 'sk'];

export function parseLocale(lang: string | undefined): Locale {
	return lang === 'sk' ? 'sk' : 'en';
}

export function localizedPath(path: string, locale: Locale): string {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	if (locale === 'sk') {
		return normalized === '/' ? '/sk' : `/sk${normalized}`;
	}
	return normalized;
}

export function toolPath(slug: string, locale: Locale): string {
	return localizedPath(`/tools/${slug}`, locale);
}

export function alternatePaths(path: string): { en: string; sk: string } {
	const normalized = path.startsWith('/') ? path : `/${path}`;
	const base =
		normalized.startsWith('/sk/') ? normalized.slice(3) || '/' : normalized.startsWith('/sk') ? '/' : normalized;
	return {
		en: base,
		sk: localizedPath(base, 'sk')
	};
}
