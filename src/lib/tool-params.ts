import { browser } from '$app/environment';

export function readToolParam(key: string): string | null {
	if (!browser) return null;
	return new URL(window.location.href).searchParams.get(key);
}

export function syncToolParams(params: Record<string, string | number | boolean | undefined | null>) {
	if (!browser) return;
	const url = new URL(window.location.href);
	for (const [key, value] of Object.entries(params)) {
		if (value === undefined || value === null || value === '') {
			url.searchParams.delete(key);
		} else {
			url.searchParams.set(key, String(value));
		}
	}
	history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);
}

export function readNumberParam(key: string, fallback: number): number {
	const raw = readToolParam(key);
	if (raw === null) return fallback;
	const parsed = Number(raw);
	return Number.isFinite(parsed) ? parsed : fallback;
}

export function readStringParam(key: string, fallback = ''): string {
	return readToolParam(key) ?? fallback;
}
