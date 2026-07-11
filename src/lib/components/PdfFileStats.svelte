<script lang="ts">
	import { formatFileSize, getPageCount } from '$lib/pdf/operations';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';

	let { file }: { file: File } = $props();

	let pageCount = $state<number | null>(null);
	let loading = $state(true);

	const ws = $derived(msg(getAppLocale()).workspace);

	$effect(() => {
		const f = file;
		loading = true;
		pageCount = null;
		getPageCount(f)
			.then((count) => {
				pageCount = count;
			})
			.catch(() => {
				pageCount = null;
			})
			.finally(() => {
				loading = false;
			});
	});
</script>

<span class="text-xs text-muted-foreground tabular-nums">
	{formatFileSize(file.size)}
	{#if loading}
		· …
	{:else if pageCount !== null}
		· {pageCount} {pageCount === 1 ? ws.stats.page : ws.stats.pages}
	{/if}
</span>
