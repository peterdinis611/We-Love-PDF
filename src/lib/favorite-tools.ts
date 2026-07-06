const STORAGE_KEY = 'welovepdf-favorite-tools';

export function getFavoriteToolSlugs(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

export function isFavoriteTool(slug: string): boolean {
	return getFavoriteToolSlugs().includes(slug);
}

export function toggleFavoriteTool(slug: string): string[] {
	if (typeof localStorage === 'undefined') return [];
	const favorites = getFavoriteToolSlugs();
	const next = favorites.includes(slug)
		? favorites.filter((item) => item !== slug)
		: [...favorites, slug];
	localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
	return next;
}
