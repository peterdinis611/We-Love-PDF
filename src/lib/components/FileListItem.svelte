<script lang="ts">
	import { formatFileSize } from '$lib/pdf/operations';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import PdfFileStats from '$lib/components/PdfFileStats.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ChevronUp, ChevronDown, X } from '@lucide/svelte';

	interface Props {
		name: string;
		size: number;
		file?: File;
		showPageCount?: boolean;
		index?: number;
		onremove?: () => void;
		onmoveup?: () => void;
		onmovedown?: () => void;
		showReorder?: boolean;
		canMoveUp?: boolean;
		canMoveDown?: boolean;
	}

	let {
		name,
		size,
		file,
		showPageCount = false,
		index,
		onremove,
		onmoveup,
		onmovedown,
		showReorder = false,
		canMoveUp = true,
		canMoveDown = true
	}: Props = $props();

	const a11y = $derived(msg(getAppLocale()).workspace.a11y);
</script>

<Card.Root class="border-border/60">
	<Card.Content class="flex items-center gap-3 p-3">
		<div
			class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary"
		>
			{index !== undefined ? index + 1 : 'PDF'}
		</div>

		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium">{name}</p>
			{#if showPageCount && file}
				<PdfFileStats {file} />
			{:else}
				<p class="text-xs text-muted-foreground">{formatFileSize(size)}</p>
			{/if}
		</div>

		{#if showReorder}
			<div class="flex gap-0.5">
				<Button variant="ghost" size="icon-sm" disabled={!canMoveUp} onclick={onmoveup} aria-label={a11y.moveUp}>
					<ChevronUp class="size-4" />
				</Button>
				<Button variant="ghost" size="icon-sm" disabled={!canMoveDown} onclick={onmovedown} aria-label={a11y.moveDown}>
					<ChevronDown class="size-4" />
				</Button>
			</div>
		{/if}

		{#if onremove}
			<Button variant="ghost" size="icon-sm" onclick={onremove} aria-label={a11y.removeFile} class="text-muted-foreground hover:text-destructive">
				<X class="size-4" />
			</Button>
		{/if}
	</Card.Content>
</Card.Root>
