<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import { getHowItWorks } from '$lib/how-it-works';
	import { guidePath, guideSlugForTool } from '$lib/guides';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { BookOpen, ChevronDown, CircleHelp } from '@lucide/svelte';

	let { tool, locale = 'en' }: { tool: PdfTool; locale?: Locale } = $props();

	let open = $state(false);
	const steps = $derived(getHowItWorks(tool));
	const m = $derived(msg(locale));
	const panelId = $derived(`how-it-works-${tool.slug}`);
	const relatedGuide = $derived(guideSlugForTool(tool.slug));
</script>

<ToolPanel>
	<button
		type="button"
		class="flex w-full items-center justify-between gap-2 text-left"
		aria-expanded={open}
		aria-controls={panelId}
		onclick={() => (open = !open)}
	>
		<span class="flex items-center gap-2 text-sm font-medium">
			<CircleHelp class="size-4 text-primary" />
			{m.tool.howItWorks}
		</span>
		<ChevronDown class="size-4 text-muted-foreground transition {open ? 'rotate-180' : ''}" />
	</button>
	{#if open}
		<ol id={panelId} class="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
			{#each steps as step, i}
				<li class="flex gap-2">
					<span class="font-medium text-foreground">{i + 1}.</span>
					<span>{step}</span>
				</li>
			{/each}
		</ol>
		{#if relatedGuide}
			<p class="mt-4 border-t border-border/60 pt-3">
				<a
					href={guidePath(relatedGuide, locale)}
					class="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
				>
					<BookOpen class="size-4" />
					{m.guides.readGuide}
				</a>
			</p>
		{/if}
	{/if}
</ToolPanel>
