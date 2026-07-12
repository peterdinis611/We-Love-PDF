<script lang="ts">
	import { onDestroy, onMount, tick } from 'svelte';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PdfViewer from '$lib/components/PdfViewer.svelte';
	import { consumePendingFile } from '$lib/pending-file';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Maximize2, Minimize2, X, Keyboard } from '@lucide/svelte';

	let file = $state<File | null>(null);
	let pdfUrl = $state<string | null>(null);
	let fullscreen = $state(false);
	let showHelp = $state(false);
	let viewerEl = $state<HTMLDivElement | null>(null);

	function syncFullscreenState() {
		fullscreen = document.fullscreenElement === viewerEl;
	}

	function isPdf(f: File) {
		return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
	}

	onMount(() => {
		const pending = consumePendingFile();
		if (pending && isPdf(pending)) void setFile(pending);

		document.addEventListener('fullscreenchange', syncFullscreenState);

		function onKeydown(e: KeyboardEvent) {
			if (!file) return;
			const tag = document.activeElement?.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA') return;

			if (e.key === 'f' && !e.metaKey && !e.ctrlKey && !e.altKey) {
				e.preventDefault();
				if (fullscreen) exitFullscreen();
				else enterFullscreen();
			}
			if (e.key === '?' || (e.shiftKey && e.key === '/')) {
				e.preventDefault();
				showHelp = !showHelp;
			}
			if (e.key === 'Escape' && showHelp) {
				showHelp = false;
			}
		}

		window.addEventListener('keydown', onKeydown);
		return () => {
			document.removeEventListener('fullscreenchange', syncFullscreenState);
			window.removeEventListener('keydown', onKeydown);
		};
	});

	async function setFile(f: File) {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = f;
		pdfUrl = URL.createObjectURL(f);
		await tick();
		viewerEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	}

	async function clearFile() {
		if (document.fullscreenElement === viewerEl) {
			await document.exitFullscreen().catch(() => {});
		}
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = null;
		pdfUrl = null;
		fullscreen = false;
		showHelp = false;
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
		<FileDropzone
			label="Select PDF file"
			hint="or drop a PDF here to view"
			loadPending={false}
			onfiles={(files) => setFile(files[0])}
		/>
	{:else}
		<div class="flex items-center justify-between gap-2">
			<FileListItem name={file.name} size={file.size} onremove={clearFile} />
			<div class="flex gap-2">
				<Button variant="outline" size="sm" onclick={() => (showHelp = !showHelp)} aria-label="Keyboard shortcuts">
					<Keyboard class="size-4" />
					Shortcuts
				</Button>
				{#if pdfUrl && !fullscreen}
					<Button variant="outline" size="sm" onclick={enterFullscreen}>
						<Maximize2 class="size-4" />
						Fullscreen
					</Button>
				{/if}
			</div>
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

		{#if showHelp}
			<div class="rounded-lg border border-border bg-muted/40 p-4 text-sm">
				<p class="mb-2 font-medium">Keyboard shortcuts</p>
				<dl class="grid gap-1.5 sm:grid-cols-2">
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Previous / next page</dt>
						<dd><kbd class="rounded border px-1.5 py-0.5 text-xs">←</kbd> <kbd class="rounded border px-1.5 py-0.5 text-xs">→</kbd></dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Zoom in / out</dt>
						<dd><kbd class="rounded border px-1.5 py-0.5 text-xs">+</kbd> <kbd class="rounded border px-1.5 py-0.5 text-xs">−</kbd></dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Toggle fullscreen</dt>
						<dd><kbd class="rounded border px-1.5 py-0.5 text-xs">F</kbd></dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Show shortcuts</dt>
						<dd><kbd class="rounded border px-1.5 py-0.5 text-xs">?</kbd></dd>
					</div>
					<div class="flex justify-between gap-4">
						<dt class="text-muted-foreground">Exit fullscreen / close help</dt>
						<dd><kbd class="rounded border px-1.5 py-0.5 text-xs">Esc</kbd></dd>
					</div>
				</dl>
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
