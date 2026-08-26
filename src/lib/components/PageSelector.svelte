<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';

	interface Props {
		pageCount: number;
		selected: Set<number>;
		onchange: (selected: Set<number>) => void;
	}

	let { pageCount, selected, onchange }: Props = $props();

	const ps = $derived(msg(getAppLocale()).workspace.pageSelector);
	const selectedLabel = $derived(ps.selectedCount.replace('{n}', String(selected.size)));
	const useCompact = $derived(pageCount > 40);
	let rangeText = $state('');

	function toggle(page: number) {
		const next = new Set(selected);
		if (next.has(page)) next.delete(page);
		else next.add(page);
		onchange(next);
	}

	function applyRange() {
		const next = new Set<number>();
		const parts = rangeText.split(',').map((p) => p.trim()).filter(Boolean);
		for (const part of parts) {
			const m = part.match(/^(\d+)\s*-\s*(\d+)$/);
			if (m) {
				const start = Math.max(1, Number(m[1]));
				const end = Math.min(pageCount, Number(m[2]));
				for (let i = start; i <= end; i++) next.add(i - 1);
			} else {
				const n = Number(part);
				if (Number.isInteger(n) && n >= 1 && n <= pageCount) next.add(n - 1);
			}
		}
		onchange(next);
	}
</script>

<div class="space-y-3">
	<div class="flex flex-wrap items-center gap-2">
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
		{#if selected.size > 0}
			<span class="text-xs text-muted-foreground">{selectedLabel}</span>
		{/if}
	</div>

	{#if useCompact}
		<div class="flex gap-2">
			<Input
				bind:value={rangeText}
				placeholder="1-3, 5"
				class="font-mono text-sm"
				aria-label={ps.selectedCount.replace('{n}', '…')}
				onkeydown={(e) => e.key === 'Enter' && applyRange()}
				onchange={applyRange}
			/>
		</div>
	{/if}

	<div class="max-h-48 overflow-y-auto rounded-lg border border-border/60 p-2" style="content-visibility: auto;">
		<div class="flex flex-wrap gap-1.5">
			{#each Array.from({ length: pageCount }, (_, i) => i) as page}
				<button
					type="button"
					aria-pressed={selected.has(page)}
					class="flex size-8 shrink-0 items-center justify-center rounded-md border text-xs font-medium transition {selected.has(page)
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-border bg-background text-muted-foreground hover:bg-muted'}"
					style="content-visibility: auto; contain-intrinsic-size: 32px 32px;"
					onclick={() => toggle(page)}
				>
					{page + 1}
				</button>
			{/each}
		</div>
	</div>
</div>
