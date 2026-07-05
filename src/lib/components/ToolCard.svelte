<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import ToolIcon from './ToolIcon.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { ArrowRight } from '@lucide/svelte';

	let { tool }: { tool: PdfTool } = $props();
</script>

<a href="/tools/{tool.slug}" class="group block h-full">
	<Card.Root
		class="h-full border-border/60 bg-card transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
	>
		<Card.Content class="flex items-start gap-4 p-4">
			<div
				class="{tool.color} flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
			>
				<ToolIcon icon={tool.icon} />
			</div>
			<div class="min-w-0 flex-1 pt-0.5">
				<div class="mb-1 flex items-center justify-between gap-2">
					<Card.Title class="text-sm font-semibold leading-tight">{tool.name}</Card.Title>
					<ArrowRight
						class="size-4 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:text-primary group-hover:opacity-100"
					/>
				</div>
				<Card.Description class="line-clamp-2 text-xs leading-relaxed">
					{tool.description}
				</Card.Description>
			</div>
		</Card.Content>
	</Card.Root>
</a>
