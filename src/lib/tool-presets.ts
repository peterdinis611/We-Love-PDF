const STORAGE_KEY = 'welovepdf-tool-presets';

type PresetStore = Record<string, Record<string, unknown>>;

function readStore(): PresetStore {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as PresetStore) : {};
	} catch {
		return {};
	}
}

function writeStore(store: PresetStore) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch {
		/* quota or private mode */
	}
}

export function getToolPreset<T>(toolSlug: string, key: string, fallback: T): T {
	const store = readStore();
	const value = store[toolSlug]?.[key];
	return (value as T | undefined) ?? fallback;
}

export function setToolPreset(toolSlug: string, key: string, value: unknown): void {
	const store = readStore();
	store[toolSlug] = { ...store[toolSlug], [key]: value };
	writeStore(store);
}

export function getToolPresets(toolSlug: string): Record<string, unknown> {
	return readStore()[toolSlug] ?? {};
}
