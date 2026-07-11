import { getContext, setContext } from 'svelte';
import type { Locale } from './locale';

const LOCALE_KEY = 'welovepdf-locale';

export function setAppLocale(locale: Locale) {
	setContext(LOCALE_KEY, locale);
}

export function getAppLocale(fallback: Locale = 'en'): Locale {
	return getContext<Locale>(LOCALE_KEY) ?? fallback;
}
