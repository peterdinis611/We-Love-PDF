<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import { isFavoriteTool, toggleFavoriteTool } from '$lib/favorite-tools';
	import { isNewTool } from '$lib/changelog';
	import { msg } from '$lib/i18n';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import ToolIcon from './ToolIcon.svelte';
	import NewBadge from './NewBadge.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Star } from '@lucide/svelte';

	let { tool, locale = 'en' }: { tool: PdfTool; locale?: Locale; index?: number } = $props();

	const m = $derived(msg(locale));

	let favorited = $state(false);

	$effect(() => {
		favorited = isFavoriteTool(tool.slug);
	});

	function toggleFavorite(e: MouseEvent) {
		e.preventDefault();
		e.stopPropagation();
		toggleFavoriteTool(tool.slug);
		favorited = isFavoriteTool(tool.slug);
	}
</script>

<a
	href={toolPath(tool.slug, locale)}
	class="group flex items-stretch gap-3 border-b border-border/70 py-3.5 transition-colors hover:bg-[color-mix(in_oklab,var(--register)_6%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--register)_8%,transparent)]"
>
	<div
		class="{tool.color} flex size-10 shrink-0 items-center justify-center text-white transition-[filter] group-hover:brightness-110"
		style="border-radius: 2px;"
	>
		<ToolIcon icon={tool.icon} />
	</div>

	<div class="min-w-0 flex-1">
		<div class="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
			<span class="font-display text-[0.95rem] font-bold leading-tight tracking-tight text-foreground group-hover:text-primary">
				{tool.name}
			</span>
			{#if isNewTool(tool.slug)}
				<NewBadge {locale} />
			{/if}
		</div>
		<p class="mt-0.5 line-clamp-2 text-sm leading-snug text-muted-foreground">
			{tool.description}
		</p>
	</div>

	<Button
		variant="ghost"
		size="icon-sm"
		class="mt-0.5 shrink-0 {favorited ? 'text-amber-500' : 'text-muted-foreground opacity-60 group-hover:opacity-100'}"
		onclick={toggleFavorite}
		aria-label={favorited ? m.home.removeFavorite : m.home.addFavorite}
	>
		<Star class="size-4 {favorited ? 'fill-current' : ''}" />
	</Button>
</a>
