<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { deskewPdf } from '$lib/pdf/deskew';
	import { getAppLocale } from '$lib/i18n/context';

	const pdfEngine = usePdfEngineContext();
	const locale = getAppLocale();

	let file = $state<File | null>(null);
	let angle = $state(0);
	let contrast = $state(1.1);
	let outputName = $state('deskewed.pdf');
	let processing = $state(false);
	let progress = $state({ page: 0, total: 0 });
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);

	async function handle() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await deskewPdf(file, pdfEngine.engine as never, {
				angleDeg: angle,
				contrast,
				onProgress: (p) => (progress = p)
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)}) — pages rasterized`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to deskew PDF.';
		} finally {
			processing = false;
			progress = { page: 0, total: 0 };
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Fine-rotate skewed scans and boost contrast. Pages become images (text is no longer
					selectable unless you run OCR after).
				</p>
				<div>
					<label for="ang" class="mb-1 block text-sm font-medium">Angle: {angle.toFixed(1)}°</label>
					<input id="ang" type="range" min="-8" max="8" step="0.5" bind:value={angle} class="w-full accent-primary" />
				</div>
				<div>
					<label for="ct" class="mb-1 block text-sm font-medium">Contrast: {contrast.toFixed(2)}</label>
					<input id="ct" type="range" min="0.8" max="1.6" step="0.05" bind:value={contrast} class="w-full accent-primary" />
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Page {progress.page}/{progress.total}" />
		{/if}
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={processing ? 'Processing…' : 'Loading engine…'}
			onclick={handle}
		>
			Deskew PDF
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain
			bytes={lastBytes}
			filename={outputName}
			{locale}
			suggestions={[
				{ slug: 'ocr-pdf', label: 'OCR' },
				{ slug: 'compress-pdf', label: 'Compress' },
				{ slug: 'pdf-to-pdfa', label: 'PDF/A' }
			]}
		/>
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
