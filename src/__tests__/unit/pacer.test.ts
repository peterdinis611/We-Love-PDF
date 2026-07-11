import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { Debouncer } from '@tanstack/pacer/debouncer';
import { PACER } from '$lib/pacer';

describe('Pacer debouncer', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('debounces URL sync style updates', () => {
		const fn = vi.fn();
		const debouncer = new Debouncer(fn, { wait: PACER.urlSyncWait, trailing: true, leading: false });

		debouncer.maybeExecute({ scale: 2 });
		debouncer.maybeExecute({ scale: 3 });
		debouncer.maybeExecute({ scale: 4 });

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(PACER.urlSyncWait);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith({ scale: 4 });

		debouncer.cancel();
	});

	it('flushes pending execution immediately', () => {
		const fn = vi.fn();
		const debouncer = new Debouncer(fn, { wait: PACER.searchWait, trailing: true, leading: false });

		debouncer.maybeExecute('merge');
		debouncer.flush();

		expect(fn).toHaveBeenCalledTimes(1);
		expect(fn).toHaveBeenCalledWith('merge');

		debouncer.cancel();
	});
});
