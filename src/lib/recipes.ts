const STORAGE_KEY = 'welovepdf-named-recipes';
const MAX_RECIPES_PER_TOOL = 12;

export type NamedRecipe = {
	id: string;
	name: string;
	toolSlug: string;
	params: Record<string, string | number | boolean>;
	updatedAt: number;
};

type RecipeStore = Record<string, NamedRecipe[]>;

function readStore(): RecipeStore {
	if (typeof localStorage === 'undefined') return {};
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as RecipeStore) : {};
	} catch {
		return {};
	}
}

function writeStore(store: RecipeStore) {
	if (typeof localStorage === 'undefined') return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
	} catch {
		/* quota */
	}
}

export function listRecipes(toolSlug: string): NamedRecipe[] {
	return (readStore()[toolSlug] ?? []).slice().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getRecipe(toolSlug: string, id: string): NamedRecipe | undefined {
	return listRecipes(toolSlug).find((r) => r.id === id);
}

export function getRecipeByName(toolSlug: string, name: string): NamedRecipe | undefined {
	const needle = name.trim().toLowerCase();
	return listRecipes(toolSlug).find((r) => r.name.toLowerCase() === needle);
}

export function saveRecipe(
	toolSlug: string,
	name: string,
	params: Record<string, string | number | boolean>
): NamedRecipe {
	const store = readStore();
	const list = store[toolSlug] ?? [];
	const existing = list.find((r) => r.name.toLowerCase() === name.trim().toLowerCase());
	const recipe: NamedRecipe = existing
		? { ...existing, params, updatedAt: Date.now() }
		: {
				id: crypto.randomUUID(),
				name: name.trim() || 'Untitled',
				toolSlug,
				params,
				updatedAt: Date.now()
			};
	const next = existing
		? list.map((r) => (r.id === recipe.id ? recipe : r))
		: [recipe, ...list].slice(0, MAX_RECIPES_PER_TOOL);
	store[toolSlug] = next;
	writeStore(store);
	return recipe;
}

export function deleteRecipe(toolSlug: string, id: string): void {
	const store = readStore();
	store[toolSlug] = (store[toolSlug] ?? []).filter((r) => r.id !== id);
	writeStore(store);
}

/** Built-in starter recipes for common tools (applied if no local match). */
export const BUILTIN_RECIPES: Record<string, Omit<NamedRecipe, 'id' | 'updatedAt' | 'toolSlug'>[]> = {
	'compress-pdf': [
		{ name: 'email', params: { mode: 'strong', quality: 0.65, scale: 1.25 } },
		{ name: 'archive', params: { mode: 'light' } },
		{ name: 'web', params: { mode: 'strong', quality: 0.78, scale: 1.5 } }
	],
	'ocr-pdf': [
		{ name: 'auto-en', params: { lang: 'eng', pages: '' } },
		{ name: 'sk-cs', params: { lang: 'eng+slk+ces', pages: '' } }
	],
	'pdf-to-jpg': [
		{ name: 'print', params: { scale: 2, format: 'jpeg', quality: 0.92, mode: 'zip' } },
		{ name: 'preview', params: { scale: 1, format: 'jpeg', quality: 0.75, mode: 'zip' } }
	]
};

export function resolveRecipe(
	toolSlug: string,
	nameOrId: string
): NamedRecipe | { name: string; params: Record<string, string | number | boolean> } | undefined {
	const local = getRecipe(toolSlug, nameOrId) ?? getRecipeByName(toolSlug, nameOrId);
	if (local) return local;
	const builtin = BUILTIN_RECIPES[toolSlug]?.find(
		(r) => r.name.toLowerCase() === nameOrId.trim().toLowerCase()
	);
	if (builtin) return { name: builtin.name, params: builtin.params };
	return undefined;
}
