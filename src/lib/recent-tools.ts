const STORAGE_KEY = 'welovepdf-recent-tools';
const MAX_RECENT = 6;

export function recordToolVisit(slug: string) {
	if (typeof localStorage === 'undefined') return;
	const recent = getRecentToolSlugs().filter((item) => item !== slug);
	recent.unshift(slug);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

export function getRecentToolSlugs(): string[] {
	if (typeof localStorage === 'undefined') return [];
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as string[]) : [];
	} catch {
		return [];
	}
}

export function clearRecentTools() {
	if (typeof localStorage === 'undefined') return;
	localStorage.removeItem(STORAGE_KEY);
}
