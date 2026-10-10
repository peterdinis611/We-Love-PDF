<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, formatFileSize } from '$lib/pdf/operations';
	import { pdfToEpub } from '$lib/pdf/pdf-to-epub';

	const pdfEngine = usePdfEngineContext();
	let file = $state<File | null>(null);
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
			const bytes = await pdfToEpub(file, pdfEngine.engine as never, {
				onProgress: (p) => (progress = p)
			});
			const name = file.name.replace(/\.pdf$/i, '') + '.epub';
			downloadBlob(bytes, name, 'application/epub+zip');
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to build EPUB.';
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
			<p class="text-sm text-muted-foreground">
				Each PDF page becomes an EPUB chapter with a raster image plus extracted text when available.
			</p>
		</ToolPanel>
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Page {progress.page}/{progress.total}" />
		{/if}
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			onclick={handle}
		>
			Convert to EPUB
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
