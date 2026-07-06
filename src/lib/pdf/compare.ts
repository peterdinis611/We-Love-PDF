export type DiffLine = { type: 'same' | 'add' | 'remove'; text: string };

export interface PageComparison {
	page: number;
	equal: boolean;
	leftText: string;
	rightText: string;
	lines: DiffLine[];
}

export function diffText(left: string, right: string): DiffLine[] {
	const leftLines = left.replace(/\r\n/g, '\n').split('\n');
	const rightLines = right.replace(/\r\n/g, '\n').split('\n');
	const result: DiffLine[] = [];

	const max = Math.max(leftLines.length, rightLines.length);
	for (let i = 0; i < max; i++) {
		const l = leftLines[i] ?? '';
		const r = rightLines[i] ?? '';
		if (l === r) {
			if (l) result.push({ type: 'same', text: l });
		} else {
			if (l) result.push({ type: 'remove', text: l });
			if (r) result.push({ type: 'add', text: r });
		}
	}

	return result;
}

export function comparePageTexts(
	leftPages: string[],
	rightPages: string[]
): PageComparison[] {
	const count = Math.max(leftPages.length, rightPages.length);
	const comparisons: PageComparison[] = [];

	for (let i = 0; i < count; i++) {
		const leftText = leftPages[i] ?? '';
		const rightText = rightPages[i] ?? '';
		const lines = diffText(leftText, rightText);
		comparisons.push({
			page: i + 1,
			equal: leftText === rightText,
			leftText,
			rightText,
			lines
		});
	}

	return comparisons;
}
