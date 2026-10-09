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
	import { downloadBlob, ensureExtension, formatFileSize } from '$lib/pdf/operations';
	import { pdfToPptx } from '$lib/pdf/pdf-to-pptx';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let includeNotes = $state(true);
	let outputName = $state('slides.pptx');
	let processing = $state(false);
	let progress = $state({ page: 0, total: 0 });
	let error = $state('');
	let success = $state('');

	async function handle() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await pdfToPptx(file, pdfEngine.engine as never, {
				includeNotes,
				onProgress: (p) => (progress = p)
			});
			const name = ensureExtension(outputName, 'pptx');
			downloadBlob(bytes, name, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert to PowerPoint.';
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
			<p class="mb-3 text-sm text-muted-foreground">
				Each PDF page becomes a slide image. Optional speaker notes from extracted text.
			</p>
			<label class="mb-4 flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={includeNotes} class="accent-primary" />
				Include text as slide notes
			</label>
			<OutputFilename bind:value={outputName} />
		</ToolPanel>
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Slide {progress.page}/{progress.total}" />
		{/if}
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={processing ? 'Converting…' : 'Loading engine…'}
			onclick={handle}
		>
			Convert to PowerPoint
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
