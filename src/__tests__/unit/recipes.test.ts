import { describe, expect, it } from 'vitest';
import { BUILTIN_RECIPES, resolveRecipe } from '$lib/recipes';

describe('recipes', () => {
	it('resolves builtin recipe names', () => {
		const r = resolveRecipe('compress-pdf', 'email');
		expect(r?.params.mode).toBe('strong');
		expect(BUILTIN_RECIPES['compress-pdf']?.length).toBeGreaterThan(0);
	});

	it('resolves ocr builtin', () => {
		const r = resolveRecipe('ocr-pdf', 'sk-cs');
		expect(r?.params.lang).toBe('eng+slk+ces');
	});
});
