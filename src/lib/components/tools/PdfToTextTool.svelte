<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensureTxtFilename, formatFileSize, getPageCount, parsePageRanges } from '$lib/pdf/operations';
	import { Copy } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let pageRange = $state('');
	let outputName = $state('extracted.txt');
	let extractedText = $state('');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let copied = $state(false);

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		extractedText = '';
		try {
			pageCount = await getPageCount(f);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	function getPageIndexes(): number[] {
		if (!pageRange.trim()) {
			return Array.from({ length: pageCount }, (_, i) => i);
		}
		return [...new Set(parsePageRanges(pageRange, pageCount).flat())].sort((a, b) => a - b);
	}

	async function handleExtract() {
		if (!file || !pdfEngine.engine) return;
		const indexes = getPageIndexes();
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
				.openDocumentBuffer({ id: 'text', content: buffer })
				.toPromise();
			const text = await pdfEngine.engine.extractText(doc, indexes).toPromise();
			extractedText = text;
			const name = ensureTxtFilename(outputName);
			downloadBlob(new Blob([text], { type: 'text/plain' }), name, 'text/plain');
			success = `Downloaded ${name} — ${formatFileSize(new Blob([text]).size)} from ${indexes.length} page${indexes.length === 1 ? '' : 's'}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract text.';
		} finally {
			processing = false;
		}
	}

	async function copyText() {
		if (!extractedText) return;
		await navigator.clipboard.writeText(extractedText);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to extract text" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Extract text from <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'}.
				</p>
				<div>
					<label for="range" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<Input id="range" bind:value={pageRange} placeholder="All pages, or e.g. 1-3, 5" />
				</div>
				<OutputFilename bind:value={outputName} placeholder="extracted.txt" label="Output filename" />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Extracting…'}
			onclick={handleExtract}
		>
			Extract text
		</ToolAction>
		{#if extractedText}
			<ToolPanel>
				<div class="mb-2 flex items-center justify-between">
					<p class="text-sm font-medium">Preview</p>
					<Button variant="outline" size="sm" onclick={copyText}>
						<Copy class="size-3.5" />
						{copied ? 'Copied!' : 'Copy'}
					</Button>
				</div>
				<pre class="max-h-48 overflow-auto rounded-lg bg-muted/50 p-3 text-xs whitespace-pre-wrap">{extractedText.slice(0, 2000)}{extractedText.length > 2000 ? '…' : ''}</pre>
			</ToolPanel>
		{/if}
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
