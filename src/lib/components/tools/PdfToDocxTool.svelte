<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, formatFileSize, getPageCount, parsePageIndexes } from '$lib/pdf/operations';
	import { pagesTextToDocx } from '$lib/pdf/docx-export';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let pageRange = $state('');
	let outputName = $state('document.docx');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!file || !pdfEngine.engine) return;
		const indexes = parsePageIndexes(pageRange, pageCount);
		if (!indexes.length) {
			error = 'Invalid page range.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'docx-export', content: buffer })
				.toPromise();

			const pages: { page: number; text: string }[] = [];
			for (const i of indexes) {
				const text = await pdfEngine.engine.extractText(doc, [i]).toPromise();
				pages.push({ page: i + 1, text });
			}

			const title = file.name.replace(/\.pdf$/i, '');
			const blob = await pagesTextToDocx(pages, title);
			const name = outputName.endsWith('.docx') ? outputName : `${outputName}.docx`;
			downloadBlob(
				new Uint8Array(await blob.arrayBuffer()),
				name,
				'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
			);
			success = `Downloaded ${name} — ${pages.length} page${pages.length === 1 ? '' : 's'} of text (${formatFileSize(blob.size)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert PDF to Word.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to convert to Word (.docx)" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Extract text from <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'} into a Word document. Images and exact layout are not preserved.
				</p>
				<div>
					<label for="docx-range" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<Input id="docx-range" bind:value={pageRange} placeholder="All pages, or e.g. 1-3, 5" />
				</div>
				<OutputFilename bind:value={outputName} placeholder="document.docx" label="Output filename" />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Converting…'}
			onclick={handleConvert}
		>
			Convert to Word
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
