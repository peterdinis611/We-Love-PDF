<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { theme } from '$lib/theme.svelte';
	import type { EmbedPdfContainer } from '@embedpdf/snippet';

	interface Props {
		src: string;
		class?: string;
	}

	let { src, class: className = '' }: Props = $props();

	let containerEl = $state<HTMLDivElement | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let viewer: EmbedPdfContainer | null = null;

	function destroyViewer() {
		if (containerEl) containerEl.innerHTML = '';
		viewer = null;
	}

	async function initViewer(documentSrc: string, themePreference: 'light' | 'dark') {
		if (!browser || !containerEl || !documentSrc) return;

		loading = true;
		loadError = '';
		destroyViewer();

		try {
			const EmbedPDF = (await import('@embedpdf/snippet')).default;
			viewer = EmbedPDF.init({
				type: 'container',
				target: containerEl,
				src: documentSrc,
				theme: { preference: themePreference },
				tabBar: 'never'
			}) ?? null;

			if (!viewer) {
				loadError = 'Could not initialize PDF viewer.';
			}
		} catch {
			loadError = 'Could not load PDF viewer.';
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		const documentSrc = src;
		const themePreference = theme.resolved;
		const el = containerEl;
		if (!browser || !el || !documentSrc) return;

		let cancelled = false;

		initViewer(documentSrc, themePreference).then(() => {
			if (cancelled) destroyViewer();
		});

		return () => {
			cancelled = true;
			destroyViewer();
		};
	});

	onDestroy(() => {
		destroyViewer();
	});
</script>

<div
	class="flex flex-col overflow-hidden rounded-xl border border-border bg-muted/30 {className}"
>
	{#if loadError}
		<div class="flex min-h-96 flex-1 items-center justify-center p-6 text-center">
			<p class="text-sm text-destructive">{loadError}</p>
		</div>
	{:else if loading}
		<div class="flex min-h-96 flex-1 items-center justify-center">
			<div class="flex flex-col items-center gap-3 text-muted-foreground">
				<div class="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
				<p class="text-sm">Loading PDF viewer…</p>
			</div>
		</div>
	{/if}
	<div
		bind:this={containerEl}
		class="min-h-0 w-full flex-1 {loading || loadError ? 'hidden' : ''}"
		style="min-height: 480px;"
	></div>
</div>
