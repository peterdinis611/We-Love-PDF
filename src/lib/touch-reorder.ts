/** Swap list item when finger moves past threshold — mobile-friendly reorder. */
const SWIPE_THRESHOLD = 44;

export type TouchReorderHandlers = {
	ontouchstart: (e: TouchEvent) => void;
	ontouchmove: (e: TouchEvent) => void;
	ontouchend: () => void;
};

export function createTouchReorder(
	index: () => number,
	length: () => number,
	swap: (from: number, to: number) => void
): TouchReorderHandlers {
	let startY = 0;
	let activeIdx: number | null = null;

	return {
		ontouchstart(e: TouchEvent) {
			activeIdx = index();
			startY = e.touches[0]?.clientY ?? 0;
		},
		ontouchmove(e: TouchEvent) {
			if (activeIdx === null) return;
			const touch = e.touches[0];
			if (!touch) return;
			const dy = touch.clientY - startY;
			if (Math.abs(dy) < SWIPE_THRESHOLD) return;
			e.preventDefault();
			const dir = dy > 0 ? 1 : -1;
			const target = activeIdx + dir;
			if (target < 0 || target >= length()) return;
			swap(activeIdx, target);
			activeIdx = target;
			startY = touch.clientY;
		},
		ontouchend() {
			activeIdx = null;
		}
	};
}
