<script lang="ts">
	import { CheckCircle2, Download } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import { trackToolSuccess } from '$lib/analytics';

	let {
		message,
		onRedownload
	}: {
		message: string;
		onRedownload?: () => void;
	} = $props();

	const downloadAgain = $derived(msg(getAppLocale()).workspace.downloadAgain);
	let el = $state<HTMLDivElement | null>(null);
	let lastTracked = $state('');

	$effect(() => {
		if (!message || !el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		if (message !== lastTracked) {
			lastTracked = message;
			trackToolSuccess();
		}
	});
</script>

{#if message}
	<div
		bind:this={el}
		class="flex flex-wrap items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
		role="status"
		aria-live="polite"
	>
		<CheckCircle2 class="size-4 shrink-0" aria-hidden="true" />
		<span class="min-w-0 flex-1">{message}</span>
		{#if onRedownload}
			<Button
				type="button"
				variant="outline"
				size="sm"
				class="border-green-300 bg-white/70 text-green-900 hover:bg-white dark:border-green-800 dark:bg-green-950 dark:text-green-200"
				onclick={onRedownload}
			>
				<Download class="size-3.5" />
				{downloadAgain}
			</Button>
		{/if}
	</div>
{/if}
