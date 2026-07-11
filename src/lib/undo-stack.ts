/** Small undo stack for reorderable tool state (merge, organize). */
export function createUndoStack<T>(maxSize = 24) {
	const stack: T[] = [];

	return {
		push(state: T) {
			stack.push(structuredClone(state));
			if (stack.length > maxSize) stack.shift();
		},
		pop(): T | undefined {
			return stack.pop();
		},
		canUndo(): boolean {
			return stack.length > 0;
		},
		clear() {
			stack.length = 0;
		}
	};
}
