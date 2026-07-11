import { browser } from '$app/environment';
import { Debouncer } from '@tanstack/pacer/debouncer';
import { PACER } from '$lib/pacer';

type ToolParams = Record<string, string | number | boolean | undefined | null>;

function applyToolParams(params: ToolParams) {
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

const syncDebouncer = new Debouncer(applyToolParams, {
	wait: PACER.urlSyncWait,
	trailing: true,
	leading: false,
	key: 'tool-url-sync'
});

export function readToolParam(key: string): string | null {
	if (!browser) return null;
	return new URL(window.location.href).searchParams.get(key);
}

/** Debounced — batches rapid slider/input changes before updating the share URL. */
export function syncToolParams(params: ToolParams) {
	if (!browser) return;
	syncDebouncer.maybeExecute(params);
}

/** Apply pending URL params immediately (e.g. before copying share link). */
export function flushToolParams() {
	syncDebouncer.flush();
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
