<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import {
		compressPdf,
		createFileId,
		formatFileSize,
		outputNameFromInput,
		removeAllMetadata,
		rotateAllPages,
		type PdfFile
	} from '$lib/pdf/operations';
	import { downloadZip, uniqueZipName } from '$lib/pdf/zip';

	const pdfEngine = usePdfEngineContext();

	type BatchOperation = 'compress' | 'rotate-90' | 'remove-metadata' | 'flatten';

	let files = $state<PdfFile[]>([]);
	let operation = $state<BatchOperation>('compress');
	let processing = $state(false);
	let progress = $state('');
	let error = $state('');
	let success = $state('');

	function addFiles(newFiles: File[]) {
		const pdfs = newFiles.filter((f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'));
		if (!pdfs.length) {
			error = 'Please select PDF files.';
			return;
		}
		files = [
			...files,
			...pdfs.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
		error = '';
		success = '';
	}

	async function processFile(file: File, op: BatchOperation): Promise<Uint8Array> {
		switch (op) {
			case 'compress':
				return compressPdf(file);
			case 'rotate-90':
				return rotateAllPages(file, 90);
			case 'remove-metadata':
				return removeAllMetadata(file);
			case 'flatten': {
				if (!pdfEngine.engine) throw new Error('PDF engine not ready.');
				const buffer = await file.arrayBuffer();
				const doc = await pdfEngine.engine
					.openDocumentBuffer({ id: `batch-${file.name}`, content: buffer })
					.toPromise();
				for (const page of doc.pages) {
					await pdfEngine.engine.flattenPage(doc, page).toPromise();
				}
				return new Uint8Array(await pdfEngine.engine.saveAsCopy(doc).toPromise());
			}
		}
	}

	function suffixFor(op: BatchOperation): string {
		switch (op) {
			case 'compress':
				return '-compressed';
			case 'rotate-90':
				return '-rotated';
			case 'remove-metadata':
				return '-clean';
			case 'flatten':
				return '-flattened';
		}
	}

	async function handleBatch() {
		if (!files.length) return;
		if (operation === 'flatten' && !pdfEngine.engine) return;

		processing = true;
		error = '';
		success = '';
		progress = '';

		try {
			const used = new Set<string>();
			const entries: { name: string; data: Uint8Array }[] = [];

			for (let i = 0; i < files.length; i++) {
				const item = files[i];
				progress = `Processing ${i + 1} of ${files.length}: ${item.name}`;
				const result = await processFile(item.file, operation);
				const outName = uniqueZipName(outputNameFromInput(item.name, suffixFor(operation)), used);
				entries.push({ name: outName, data: result });
			}

			const zipSize = await downloadZip(entries, `batch-${operation}.zip`);
			success = `Downloaded batch-${operation}.zip — ${entries.length} file${entries.length === 1 ? '' : 's'} (${formatFileSize(zipSize)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Batch processing failed.';
		} finally {
			processing = false;
			progress = '';
		}
	}
</script>

<div class="space-y-4">
	<FileDropzone multiple label="Select PDF files" hint="or drop multiple PDFs to process in batch" onfiles={addFiles} />

	{#if files.length > 0}
		<p class="text-sm text-muted-foreground">{files.length} file{files.length === 1 ? '' : 's'} queued</p>
		<div class="space-y-2">
			{#each files as file, i (file.id)}
				<FileListItem
					name={file.name}
					size={file.size}
					index={i}
					onremove={() => (files = files.filter((f) => f.id !== file.id))}
				/>
			{/each}
		</div>

		<ToolPanel>
			<div class="space-y-3">
				<p class="text-sm font-medium">Operation</p>
				<div class="flex flex-wrap gap-2">
					{#each [
						['compress', 'Compress'],
						['rotate-90', 'Rotate 90°'],
						['remove-metadata', 'Remove metadata'],
						['flatten', 'Flatten forms']
					] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {operation === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
							onclick={() => (operation = value as BatchOperation)}
						>
							{label}
						</button>
					{/each}
				</div>
				<p class="text-xs text-muted-foreground">
					All files are processed with the same operation and downloaded as a single ZIP archive.
				</p>
			</div>
		</ToolPanel>

		{#if progress}
			<p class="text-sm text-muted-foreground">{progress}</p>
		{/if}

		<ToolAction
			disabled={processing || (operation === 'flatten' && (pdfEngine.isLoading || !pdfEngine.engine))}
			loading={processing || (operation === 'flatten' && pdfEngine.isLoading)}
			loadingText={processing ? 'Processing…' : 'Loading engine…'}
			onclick={handleBatch}
		>
			Run batch ({files.length} file{files.length === 1 ? '' : 's'})
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
