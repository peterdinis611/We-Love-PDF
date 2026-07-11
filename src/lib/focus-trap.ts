const FOCUSABLE =
	'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function trapFocus(container: HTMLElement, onEscape?: () => void): () => void {
	function onKeyDown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			onEscape?.();
			return;
		}
		if (e.key !== 'Tab') return;

		const nodes = Array.from(container.querySelectorAll(FOCUSABLE)) as HTMLElement[];
		if (!nodes.length) return;

		const first = nodes[0];
		const last = nodes[nodes.length - 1];
		const active = document.activeElement as HTMLElement | null;

		if (e.shiftKey && active === first) {
			e.preventDefault();
			last.focus();
		} else if (!e.shiftKey && active === last) {
			e.preventDefault();
			first.focus();
		}
	}

	container.addEventListener('keydown', onKeyDown);
	return () => container.removeEventListener('keydown', onKeyDown);
}
