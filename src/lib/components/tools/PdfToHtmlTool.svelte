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
	import { downloadBlob, formatFileSize, getPageCount, parsePageRanges } from '$lib/pdf/operations';
	import { ensureHtmlFilename, ensureMdFilename, textToHtml, textToMarkdown } from '$lib/pdf/convert';
	import { Copy } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let pageRange = $state('');
	let format = $state<'html' | 'markdown'>('html');
	let outputName = $state('document.html');
	let preview = $state('');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let copied = $state(false);

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		preview = '';
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

	$effect(() => {
		outputName = format === 'html' ? 'document.html' : 'document.md';
	});

	async function handleConvert() {
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
				.openDocumentBuffer({ id: 'html-export', content: buffer })
				.toPromise();
			const text = await pdfEngine.engine.extractText(doc, indexes).toPromise();
			const title = file.name.replace(/\.pdf$/i, '');

			if (format === 'html') {
				preview = textToHtml(text, title);
				const name = ensureHtmlFilename(outputName);
				downloadBlob(new Blob([preview], { type: 'text/html' }), name, 'text/html');
				success = `Downloaded ${name} — ${formatFileSize(new Blob([preview]).size)} from ${indexes.length} page${indexes.length === 1 ? '' : 's'}`;
			} else {
				preview = textToMarkdown(text, title);
				const name = ensureMdFilename(outputName);
				downloadBlob(new Blob([preview], { type: 'text/markdown' }), name, 'text/markdown');
				success = `Downloaded ${name} — ${formatFileSize(new Blob([preview]).size)} from ${indexes.length} page${indexes.length === 1 ? '' : 's'}`;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert PDF.';
		} finally {
			processing = false;
		}
	}

	async function copyPreview() {
		if (!preview) return;
		await navigator.clipboard.writeText(preview);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to convert" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Convert <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'} to HTML or Markdown.
				</p>
				<div>
					<p class="mb-2 text-sm font-medium">Output format</p>
					<div class="flex flex-wrap gap-2">
						{#each [['html', 'HTML'], ['markdown', 'Markdown']] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {format === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								onclick={() => (format = value as typeof format)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<div>
					<label for="range" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<Input id="range" bind:value={pageRange} placeholder="All pages, or e.g. 1-3, 5" />
				</div>
				<OutputFilename bind:value={outputName} label="Output filename" />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Converting…'}
			onclick={handleConvert}
		>
			Convert to {format === 'html' ? 'HTML' : 'Markdown'}
		</ToolAction>
		{#if preview}
			<ToolPanel>
				<div class="mb-2 flex items-center justify-between">
					<p class="text-sm font-medium">Preview</p>
					<Button variant="outline" size="sm" onclick={copyPreview}>
						<Copy class="size-3.5" />
						{copied ? 'Copied!' : 'Copy'}
					</Button>
				</div>
				<pre class="max-h-48 overflow-auto rounded-lg bg-muted/50 p-3 text-xs whitespace-pre-wrap">{preview.slice(0, 2000)}{preview.length > 2000 ? '…' : ''}</pre>
			</ToolPanel>
		{/if}
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
