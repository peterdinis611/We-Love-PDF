<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let outputName = $state('flattened.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleFlatten() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'flatten', content: buffer })
				.toPromise();

			for (const page of doc.pages) {
				await pdfEngine.engine.flattenPage(doc, page).toPromise();
			}

			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `Downloaded ${name} — ${doc.pages.length} pages flattened, ${formatFileSize(result.byteLength)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to flatten PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF with forms or annotations" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-4 text-center text-sm text-muted-foreground">
				Flatten form fields and annotations into the page content so they cannot be edited.
			</p>
			<OutputFilename bind:value={outputName} />
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Flattening…'}
			onclick={handleFlatten}
		>
			Flatten PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
