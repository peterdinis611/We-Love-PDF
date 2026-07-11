<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';

	interface Props {
		pageCount: number;
		selected: Set<number>;
		onchange: (selected: Set<number>) => void;
	}

	let { pageCount, selected, onchange }: Props = $props();

	const ps = $derived(msg(getAppLocale()).workspace.pageSelector);

	function toggle(page: number) {
		const next = new Set(selected);
		if (next.has(page)) next.delete(page);
		else next.add(page);
		onchange(next);
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap gap-2">
		<Button
			variant="outline"
			size="sm"
			onclick={() => onchange(new Set(Array.from({ length: pageCount }, (_, i) => i)))}
		>
			{ps.selectAll}
		</Button>
		<Button variant="outline" size="sm" onclick={() => onchange(new Set())}>{ps.clear}</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => onchange(new Set(Array.from({ length: pageCount }, (_, i) => i).filter((i) => i % 2 === 0)))}
		>
			{ps.odd}
		</Button>
		<Button
			variant="outline"
			size="sm"
			onclick={() => onchange(new Set(Array.from({ length: pageCount }, (_, i) => i).filter((i) => i % 2 === 1)))}
		>
			{ps.even}
		</Button>
	</div>
	<div class="flex flex-wrap gap-1.5">
		{#each Array.from({ length: pageCount }, (_, i) => i) as page}
			<button
				type="button"
				class="flex size-8 items-center justify-center rounded-md border text-xs font-medium transition {selected.has(page)
					? 'border-primary bg-primary text-primary-foreground'
					: 'border-border bg-background text-muted-foreground hover:bg-muted'}"
				onclick={() => toggle(page)}
			>
				{page + 1}
			</button>
		{/each}
	</div>
</div>
