<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import { isFavoriteTool, toggleFavoriteTool } from '$lib/favorite-tools';
	import { isNewTool } from '$lib/changelog';
	import { categoryLabel } from '$lib/i18n/messages';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import ToolIcon from './ToolIcon.svelte';
	import NewBadge from './NewBadge.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowUpRight, Star } from '@lucide/svelte';

	let { tool, locale = 'en', index = 0 }: { tool: PdfTool; locale?: Locale; index?: number } = $props();

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
	class="animate-fade-in-up group block h-full"
	style="animation-delay: var(--stagger, 0ms); --stagger: {index * 55}ms"
>
	<Card.Root
		class="relative h-full overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm transition-[transform,box-shadow,border-color] duration-300 ease-out group-hover:-translate-y-1 group-hover:border-primary/25 group-hover:shadow-lg group-hover:shadow-primary/8"
	>
		<div
			class="{tool.color} absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-hover:scale-x-100"
		></div>

		<Card.Content class="flex flex-col gap-3 p-5">
			<div class="flex items-start justify-between gap-3">
				<div
					class="{tool.color} relative flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-md transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
				>
					<div
						class="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
					></div>
					<ToolIcon icon={tool.icon} />
				</div>
				<div class="flex gap-1">
					<Button
						variant="ghost"
						size="icon-sm"
						class={favorited ? 'text-amber-500' : 'text-muted-foreground'}
						onclick={toggleFavorite}
						aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
					>
						<Star class="size-4 {favorited ? 'fill-current' : ''}" />
					</Button>
					<span
						class="flex size-8 items-center justify-center rounded-full bg-muted/80 text-muted-foreground opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:bg-primary/10 group-hover:text-primary"
					>
						<ArrowUpRight class="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
					</span>
				</div>
			</div>

			<div class="min-w-0 flex-1">
				<div class="mb-1.5 flex flex-wrap items-center gap-1.5">
					<span class="inline-block rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
						{categoryLabel(tool.category, locale).replace(' PDF', '')}
					</span>
					{#if isNewTool(tool.slug)}
						<NewBadge {locale} />
					{/if}
				</div>
				<Card.Title class="mb-1 text-base font-semibold leading-snug transition-colors duration-200 group-hover:text-primary">
					{tool.name}
				</Card.Title>
				<Card.Description class="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
					{tool.description}
				</Card.Description>
			</div>
		</Card.Content>
	</Card.Root>
</a>
