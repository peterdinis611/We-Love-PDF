import { onDestroy } from 'svelte';
import { Debouncer, type DebouncerOptions } from '@tanstack/pacer/debouncer';
import { Throttler, type ThrottlerOptions } from '@tanstack/pacer/throttler';

export { PACER } from '$lib/pacer/index.js';

type AnyFunction = (...args: never[]) => unknown;

/**
 * Create a Debouncer that is cancelled when the owning Svelte component is destroyed.
 * Must be called synchronously during component initialization.
 */
export function useDebouncer<TFn extends AnyFunction>(
	fn: TFn,
	options: DebouncerOptions<TFn>
): Debouncer<TFn> {
	const debouncer = new Debouncer(fn, options);
	onDestroy(() => debouncer.cancel());
	return debouncer;
}

/**
 * Create a Throttler that is cancelled when the owning Svelte component is destroyed.
 * Must be called synchronously during component initialization.
 */
export function useThrottler<TFn extends AnyFunction>(
	fn: TFn,
	options: ThrottlerOptions<TFn>
): Throttler<TFn> {
	const throttler = new Throttler(fn, options);
	onDestroy(() => throttler.cancel());
	return throttler;
}

/**
 * Debounce a reactive source into `$state` — instant value stays in `source`,
 * consumers read `debounced` for expensive derived work.
 */
export function useDebouncedValue<T>(
	source: () => T,
	options: DebouncerOptions<(value: T) => void>
): { get debounced(): T; flush: () => void; cancel: () => void } {
	let debounced = $state(source());

	const debouncer = useDebouncer((value: T) => {
		debounced = value;
	}, options);

	$effect(() => {
		debouncer.maybeExecute(source());
	});

	return {
		get debounced() {
			return debounced;
		},
		flush: () => debouncer.flush(),
		cancel: () => debouncer.cancel()
	};
}
