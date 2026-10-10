<script lang="ts">
	import { formatFileSize } from '$lib/pdf/operations';

	export type QueueItem = {
		id: string;
		name: string;
		size: number;
		status: 'pending' | 'running' | 'done' | 'error';
		message?: string;
		progress?: number;
	};

	let {
		items = [],
		title = 'Queue'
	}: {
		items?: QueueItem[];
		title?: string;
	} = $props();

	const done = $derived(items.filter((i) => i.status === 'done').length);
	const total = $derived(items.length);
</script>

{#if items.length}
	<div class="space-y-2 rounded-xl border border-border/60 bg-muted/20 p-3">
		<div class="flex items-center justify-between gap-2">
			<p class="text-sm font-medium">{title}</p>
			<p class="text-xs text-muted-foreground">{done}/{total} done</p>
		</div>
		<ul class="space-y-1.5">
			{#each items as item (item.id)}
				<li class="flex items-center gap-2 text-xs">
					<span
						class="size-2 shrink-0 rounded-full {item.status === 'done'
							? 'bg-emerald-500'
							: item.status === 'running'
								? 'bg-sky-500 animate-pulse'
								: item.status === 'error'
									? 'bg-destructive'
									: 'bg-muted-foreground/40'}"
					></span>
					<span class="min-w-0 flex-1 truncate font-medium">{item.name}</span>
					<span class="shrink-0 text-muted-foreground">{formatFileSize(item.size)}</span>
					{#if item.status === 'running' && item.progress != null}
						<span class="w-10 text-right tabular-nums text-muted-foreground">{item.progress}%</span>
					{:else if item.message}
						<span class="max-w-[8rem] truncate text-muted-foreground">{item.message}</span>
					{/if}
				</li>
			{/each}
		</ul>
	</div>
{/if}
