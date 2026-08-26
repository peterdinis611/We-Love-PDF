<script lang="ts">
	import type { Snippet } from 'svelte';
	import { Check } from '@lucide/svelte';

	type Step = { n: number; label: string };

	let {
		steps,
		step,
		children
	}: {
		steps: Step[];
		step: number;
		children: Snippet;
	} = $props();
</script>

<ol class="mb-6 flex flex-wrap gap-2">
	{#each steps as s}
		<li
			class="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium {step >= s.n
				? 'border-primary bg-primary/10 text-primary'
				: 'border-border text-muted-foreground'}"
		>
			{#if step > s.n}
				<Check class="size-3.5" />
			{:else}
				<span class="tabular-nums">{s.n}</span>
			{/if}
			{s.label}
		</li>
	{/each}
</ol>

{@render children()}
