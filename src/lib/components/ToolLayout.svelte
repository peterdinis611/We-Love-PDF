<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import ToolIcon from './ToolIcon.svelte';
	import ShareLink from './ShareLink.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';

	let {
		tool,
		children
	}: {
		tool: PdfTool;
		children: import('svelte').Snippet;
	} = $props();
</script>

<div class="min-h-[calc(100vh-3.5rem)] bg-muted/20">
	<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
		<div class="mb-8 text-center">
			<div
				class="{tool.color} mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-black/10"
			>
				<ToolIcon icon={tool.icon} />
			</div>
			<Badge variant="secondary" class="mb-3">{tool.category}</Badge>
			<h1 class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1>
			<p class="mx-auto max-w-md text-sm text-muted-foreground">{tool.description}</p>
			<div class="mt-4">
				<ShareLink />
			</div>
		</div>

		{@render children()}
	</div>
</div>
