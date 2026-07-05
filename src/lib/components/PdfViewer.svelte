<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/theme.svelte';

	interface Props {
		src: string;
		class?: string;
	}

	let { src, class: className = '' }: Props = $props();

	let PDFViewer: typeof import('@embedpdf/svelte-pdf-viewer').PDFViewer | null = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const mod = await import('@embedpdf/svelte-pdf-viewer');
		PDFViewer = mod.PDFViewer;
		loading = false;
	});
</script>

<div class="overflow-hidden rounded-xl border border-border bg-muted/30 {className}">
	{#if loading || !PDFViewer}
		<div class="flex min-h-96 items-center justify-center">
			<div class="flex flex-col items-center gap-3 text-muted-foreground">
				<div class="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
				<p class="text-sm">Loading PDF viewer…</p>
			</div>
		</div>
	{:else}
		{#key theme.resolved}
			<PDFViewer
				config={{
					src,
					theme: { preference: theme.resolved },
					tabBar: 'never'
				}}
				style="width: 100%; height: 100%; min-height: 600px;"
			/>
		{/key}
	{/if}
</div>
