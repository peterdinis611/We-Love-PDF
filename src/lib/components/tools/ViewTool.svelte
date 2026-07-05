<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PdfViewer from '$lib/components/PdfViewer.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Maximize2, Minimize2, X } from '@lucide/svelte';

	let file = $state<File | null>(null);
	let pdfUrl = $state<string | null>(null);
	let fullscreen = $state(false);
	let viewerEl = $state<HTMLDivElement | null>(null);

	function syncFullscreenState() {
		fullscreen = document.fullscreenElement === viewerEl;
	}

	onMount(() => {
		document.addEventListener('fullscreenchange', syncFullscreenState);
		return () => document.removeEventListener('fullscreenchange', syncFullscreenState);
	});

	async function setFile(f: File) {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = f;
		pdfUrl = URL.createObjectURL(f);
	}

	async function clearFile() {
		if (document.fullscreenElement === viewerEl) {
			await document.exitFullscreen().catch(() => {});
		}
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = null;
		pdfUrl = null;
		fullscreen = false;
	}

	async function enterFullscreen() {
		if (!viewerEl) return;
		await viewerEl.requestFullscreen();
	}

	async function exitFullscreen() {
		if (document.fullscreenElement) {
			await document.exitFullscreen();
		}
	}

	onDestroy(() => {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
	});
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to view" onfiles={(files) => setFile(files[0])} />
	{:else}
		<div class="flex items-center justify-between gap-2">
			<FileListItem name={file.name} size={file.size} onremove={clearFile} />
			{#if pdfUrl && !fullscreen}
				<Button variant="outline" size="sm" onclick={enterFullscreen}>
					<Maximize2 class="size-4" />
					Fullscreen
				</Button>
			{/if}
		</div>
		{#if pdfUrl}
			<div
				bind:this={viewerEl}
				class="relative bg-background {fullscreen ? 'flex h-full flex-col' : ''}"
			>
				{#if fullscreen}
					<div class="absolute top-3 right-3 z-50 flex gap-2">
						<Button variant="secondary" size="sm" onclick={exitFullscreen}>
							<Minimize2 class="size-4" />
							Exit fullscreen
						</Button>
						<Button variant="secondary" size="icon-sm" onclick={exitFullscreen} aria-label="Close fullscreen">
							<X class="size-4" />
						</Button>
					</div>
				{/if}
				<PdfViewer src={pdfUrl} class={fullscreen ? 'min-h-0 flex-1' : 'h-[70vh]'} />
			</div>
		{/if}
	{/if}
</div>

<style>
	:global(:fullscreen) {
		background: var(--background);
		padding: 0.75rem;
	}
</style>
