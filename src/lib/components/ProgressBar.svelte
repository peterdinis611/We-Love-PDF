<script lang="ts">
	let {
		value,
		max = 100,
		label = ''
	}: {
		value: number;
		max?: number;
		label?: string;
	} = $props();

	const percent = $derived(max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0);
</script>

<div class="space-y-1.5">
	{#if label}
		<p class="text-xs text-muted-foreground">{label}</p>
	{/if}
	<div class="h-2 overflow-hidden rounded-full bg-muted">
		<div class="h-full bg-primary transition-all duration-300" style="width: {percent}%"></div>
	</div>
</div>
