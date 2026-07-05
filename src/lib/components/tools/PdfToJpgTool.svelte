<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, getPageCount } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let processing = $state(false);
	let error = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		try {
			pageCount = await getPageCount(f);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'convert', content: buffer })
				.toPromise();

			for (let i = 0; i < doc.pages.length; i++) {
				const page = doc.pages[i];
				const blob = await pdfEngine.engine.renderPage(doc, page, { scaleFactor: 2 }).toPromise();
				downloadBlob(blob, `page-${i + 1}.png`, blob.type || 'image/png');
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert PDF to images.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to convert to images" onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="text-center text-sm text-muted-foreground">
				Convert all <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'} to PNG images.
			</p>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Converting…'}
			onclick={handleConvert}
		>
			Convert to PNG
		</ToolAction>
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
