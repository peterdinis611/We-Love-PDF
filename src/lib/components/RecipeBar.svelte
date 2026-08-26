<script lang="ts">
	import { listRecipes, saveRecipe, deleteRecipe, type NamedRecipe } from '$lib/recipes';
	import { flushToolParams, syncToolParams } from '$lib/tool-params';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Bookmark, Trash2 } from '@lucide/svelte';

	let {
		toolSlug,
		params,
		onApply
	}: {
		toolSlug: string;
		params: Record<string, string | number | boolean>;
		onApply: (params: Record<string, string | number | boolean>) => void;
	} = $props();

	let name = $state('');
	let recipes = $state<NamedRecipe[]>([]);
	let message = $state('');

	function refresh() {
		recipes = listRecipes(toolSlug);
	}

	$effect(() => {
		toolSlug;
		refresh();
	});

	function handleSave() {
		if (!name.trim()) {
			message = 'Enter a recipe name.';
			return;
		}
		flushToolParams();
		saveRecipe(toolSlug, name.trim(), params);
		message = `Saved “${name.trim()}”. Share with ?recipe=${encodeURIComponent(name.trim())}`;
		name = '';
		refresh();
	}

	function handleApply(recipe: NamedRecipe) {
		onApply(recipe.params);
		syncToolParams({ ...recipe.params, recipe: recipe.name });
		message = `Applied “${recipe.name}”`;
	}

	function handleDelete(id: string) {
		deleteRecipe(toolSlug, id);
		refresh();
	}
</script>

<div class="space-y-3 rounded-lg border border-border/60 p-3">
	<p class="text-sm font-medium">Recipes</p>
	<p class="text-xs text-muted-foreground">
		Save settings locally and share via <code class="rounded bg-muted px-1">?recipe=name</code> in the URL.
	</p>
	<div class="flex gap-2">
		<Input bind:value={name} placeholder="Recipe name (e.g. email)" class="flex-1" />
		<Button type="button" size="sm" variant="outline" onclick={handleSave}>
			<Bookmark class="size-3.5" />
			Save
		</Button>
	</div>
	{#if recipes.length}
		<ul class="space-y-1">
			{#each recipes as recipe (recipe.id)}
				<li class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50">
					<button type="button" class="min-w-0 flex-1 truncate text-left font-medium" onclick={() => handleApply(recipe)}>
						{recipe.name}
					</button>
					<button
						type="button"
						class="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
						aria-label="Delete recipe"
						onclick={() => handleDelete(recipe.id)}
					>
						<Trash2 class="size-3.5" />
					</button>
				</li>
			{/each}
		</ul>
	{/if}
	{#if message}
		<p class="text-xs text-muted-foreground">{message}</p>
	{/if}
</div>
