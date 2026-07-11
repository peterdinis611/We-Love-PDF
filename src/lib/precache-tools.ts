import { browser } from '$app/environment';
import { LOCALES, localizedPath } from '$lib/i18n/locale';
import { tools } from '$lib/tools';

const PRECACHE_KEY = 'welovepdf-tools-precached';

export function getToolPagePaths(): string[] {
	return tools
		.filter((t) => t.available)
		.flatMap((t) => LOCALES.map((locale) => localizedPath(`/tools/${t.slug}`, locale)));
}

/** Background-fetch tool pages so SW caches them for offline use. */
export async function precacheToolPages(): Promise<void> {
	if (!browser || sessionStorage.getItem(PRECACHE_KEY)) return;
	sessionStorage.setItem(PRECACHE_KEY, '1');

	const paths = getToolPagePaths();
	// Stagger requests to avoid blocking the main thread
	for (let i = 0; i < paths.length; i++) {
		const path = paths[i];
		try {
			await fetch(path, { credentials: 'same-origin' });
		} catch {
			/* offline or aborted — fine */
		}
		if (i % 4 === 3) {
			await new Promise((r) => setTimeout(r, 0));
		}
	}
}
