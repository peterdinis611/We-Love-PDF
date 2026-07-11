import { describe, expect, it } from 'vitest';
import { createUndoStack } from '$lib/undo-stack';

describe('createUndoStack', () => {
	it('pushes and pops state', () => {
		const stack = createUndoStack<number[]>();
		stack.push([1, 2]);
		stack.push([1, 2, 3]);
		expect(stack.pop()).toEqual([1, 2, 3]);
		expect(stack.pop()).toEqual([1, 2]);
		expect(stack.canUndo()).toBe(false);
	});
});
