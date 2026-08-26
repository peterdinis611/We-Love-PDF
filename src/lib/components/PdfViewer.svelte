<script lang="ts">
	import { onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import { theme } from '$lib/theme.svelte';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { EmbedPdfContainer } from '@embedpdf/snippet';

	interface Props {
		src: string;
		class?: string;
	}

	let { src, class: className = '' }: Props = $props();

	const locale = getAppLocale();
	const view = $derived(msg(locale).workspace.view);

	let containerEl = $state<HTMLDivElement | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let viewer: EmbedPdfContainer | null = null;
	let ready = $state(false);

	export async function exportAnnotatedPdf(): Promise<Uint8Array> {
		if (!viewer) throw new Error('Viewer not ready.');
		const registry = await viewer.registry;
		const annotation = registry.getPlugin('annotation')?.provides?.() as
			| { commit?: () => { toPromise: () => Promise<unknown> } }
			| undefined;
		if (annotation?.commit) {
			try {
				await annotation.commit().toPromise();
			} catch {
				/* autoCommit may already have flushed */
			}
		}
		// Brief wait for ink stroke commitDelay
		await new Promise((r) => setTimeout(r, 100));
		const exp = registry.getPlugin('export')?.provides?.() as
			| { saveAsCopy: () => { toPromise: () => Promise<ArrayBuffer> } }
			| undefined;
		if (!exp?.saveAsCopy) throw new Error('Export plugin unavailable.');
		const buf = await exp.saveAsCopy().toPromise();
		return new Uint8Array(buf);
	}

	export function isViewerReady() {
		return ready && !!viewer && !loading && !loadError;
	}

	function destroyViewer() {
		if (containerEl) containerEl.innerHTML = '';
		viewer = null;
		ready = false;
	}

	async function initViewer(documentSrc: string, themePreference: 'light' | 'dark') {
		if (!browser || !containerEl || !documentSrc) return;

		loading = true;
		ready = false;
		loadError = '';
		destroyViewer();

		try {
			const EmbedPDF = (await import('@embedpdf/snippet')).default;
			const { PDFIUM_WASM_URL } = await import('$lib/pdf/wasm');
			viewer =
				EmbedPDF.init({
					type: 'container',
					target: containerEl,
					src: documentSrc,
					wasmUrl: PDFIUM_WASM_URL,
					theme: { preference: themePreference },
					tabBar: 'never',
					fontFallback: null
				}) ?? null;

			if (!viewer) {
				loadError = msg(locale).workspace.view.initError;
			} else {
				ready = true;
			}
		} catch {
			loadError = msg(locale).workspace.view.loadError;
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
				<p class="text-sm">{view.loadingViewer}</p>
			</div>
		</div>
	{/if}
	<div
		bind:this={containerEl}
		class="min-h-0 w-full flex-1 {loading || loadError ? 'hidden' : ''}"
		style="min-height: 480px;"
	></div>
</div>
