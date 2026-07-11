/** Shared TanStack Pacer timing defaults (ms). */
export const PACER = {
	/** Homepage tool search — filter grid after typing pauses */
	searchWait: 200,
	/** Tool share URL query sync — avoid history spam while dragging sliders */
	urlSyncWait: 350,
	/** Scroll visibility checks — limit layout reads during scroll */
	scrollWait: 100
} as const;

export { Debouncer, debounce, debouncerOptions } from '@tanstack/pacer/debouncer';
export { Throttler, throttle, throttlerOptions } from '@tanstack/pacer/throttler';

export type { DebouncerOptions } from '@tanstack/pacer/debouncer';
export type { ThrottlerOptions } from '@tanstack/pacer/throttler';
