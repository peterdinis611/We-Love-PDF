<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import ToolIcon from '$lib/components/ToolIcon.svelte';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';

	let {
		tools,
		locale = 'en'
	}: {
		tools: PdfTool[];
		locale?: Locale;
	} = $props();
</script>

<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
	{#each tools as tool (tool.slug)}
		<a
			href={toolPath(tool.slug, locale)}
			class="group flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/8"
		>
			<div
				class="{tool.color} flex size-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform group-hover:scale-105"
			>
				<ToolIcon icon={tool.icon} />
			</div>
			<span class="min-w-0 text-sm font-medium leading-snug group-hover:text-primary">{tool.name}</span>
		</a>
	{/each}
</div>
