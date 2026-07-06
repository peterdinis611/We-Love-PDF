<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import { getHowItWorks } from '$lib/how-it-works';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { ChevronDown, CircleHelp } from '@lucide/svelte';

	let { tool, locale = 'en' }: { tool: PdfTool; locale?: Locale } = $props();

	let open = $state(false);
	const steps = $derived(getHowItWorks(tool));
	const m = $derived(msg(locale));
</script>

<ToolPanel>
	<button
		type="button"
		class="flex w-full items-center justify-between gap-2 text-left"
		onclick={() => (open = !open)}
	>
		<span class="flex items-center gap-2 text-sm font-medium">
			<CircleHelp class="size-4 text-primary" />
			{m.tool.howItWorks}
		</span>
		<ChevronDown class="size-4 text-muted-foreground transition {open ? 'rotate-180' : ''}" />
	</button>
	{#if open}
		<ol class="mt-3 space-y-2 border-t border-border/60 pt-3 text-sm text-muted-foreground">
			{#each steps as step, i}
				<li class="flex gap-2">
					<span class="font-medium text-foreground">{i + 1}.</span>
					<span>{step}</span>
				</li>
			{/each}
		</ol>
	{/if}
</ToolPanel>
