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
	import { downloadBlob, formatFileSize, getPageCount, parsePageRanges } from '$lib/pdf/operations';
	import { rowsToCsv, rowsToXlsx, textToTableRows } from '$lib/pdf/pdf-to-table';
	import { ocrPagesToText, OcrCancelledError, cancelOcr } from '$lib/pdf/ocr';
	import { Button } from '$lib/components/ui/button/index.js';

	const pdfEngine = usePdfEngineContext();

	let {
		format = 'xlsx' as 'xlsx' | 'csv'
	}: { format?: 'xlsx' | 'csv' } = $props();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let pageRange = $state('');
	let outputName = $state('tables.xlsx');
	let ocrFallback = $state(true);
	let ocrLang = $state('eng');
	let processing = $state(false);
	let progressLabel = $state('');
	let progressCurrent = $state(0);
	let progressMax = $state(0);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		outputName = format === 'csv' ? 'tables.csv' : 'tables.xlsx';
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

	async function downloadRows(rows: string[][]) {
		if (format === 'csv') {
			const csv = rowsToCsv(rows);
			const name = outputName.toLowerCase().endsWith('.csv') ? outputName : `${outputName}.csv`;
			downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8' }), name, 'text/csv');
			success = `Downloaded ${name} — ${rows.length} row${rows.length === 1 ? '' : 's'} (${formatFileSize(new Blob([csv]).size)})`;
		} else {
			const data = await rowsToXlsx(rows);
			const name = outputName.toLowerCase().endsWith('.xlsx') ? outputName : `${outputName}.xlsx`;
			downloadBlob(
				data,
				name,
				'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
			);
			success = `Downloaded ${name} — ${rows.length} row${rows.length === 1 ? '' : 's'} (${formatFileSize(data.length)})`;
		}
	}

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
		progressCurrent = 0;
		progressMax = 0;
		progressLabel = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'pdf-to-table', content: buffer })
				.toPromise();
			let text = await pdfEngine.engine.extractText(doc, indexes).toPromise();
			let rows = textToTableRows(text);

			if (!rows.length && ocrFallback) {
				progressLabel = 'No text layer — running OCR…';
				progressMax = indexes.length;
				text = await ocrPagesToText(file, pdfEngine.engine as never, {
					lang: ocrLang,
					pageIndexes: indexes,
					onProgress: ({ page, total }) => {
						progressCurrent = page;
						progressMax = total;
						progressLabel = `OCR page ${page} of ${total}…`;
					}
				});
				rows = textToTableRows(text);
			}

			if (!rows.length) {
				error = 'No extractable text found. Enable OCR fallback or run OCR PDF first.';
				return;
			}

			await downloadRows(rows);
		} catch (e) {
			if (e instanceof OcrCancelledError) {
				error = 'OCR cancelled.';
			} else {
				error = e instanceof Error ? e.message : 'Conversion failed.';
			}
		} finally {
			processing = false;
			progressLabel = '';
			progressCurrent = 0;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Extracts text and detects columns. If no text layer is found, OCR can run automatically.
				</p>
				<div>
					<label for="table-pages" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<input
						id="table-pages"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						bind:value={pageRange}
						placeholder="e.g. 1-3, 5"
					/>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={ocrFallback} class="accent-primary" />
					OCR fallback for scanned PDFs
				</label>
				{#if ocrFallback}
					<div>
						<label for="table-ocr-lang" class="mb-1 block text-sm font-medium">OCR language</label>
						<select
							id="table-ocr-lang"
							bind:value={ocrLang}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						>
							<option value="eng">English</option>
							<option value="eng+slk+ces">Auto (EN+SK+CS)</option>
							<option value="eng+deu+pol">Auto (EN+DE+PL)</option>
						</select>
					</div>
				{/if}
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		{#if processing && progressMax > 0}
			<ProgressBar value={progressCurrent} max={progressMax} label={progressLabel} />
		{/if}
		<div class="flex gap-2">
			{#if processing && progressMax > 0}
				<Button type="button" variant="outline" onclick={() => cancelOcr()}>Cancel</Button>
			{/if}
			<div class="flex-1">
				<ToolAction
					disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
					loading={processing || pdfEngine.isLoading}
					loadingText={processing ? progressLabel || 'Converting…' : 'Loading engine…'}
					onclick={handleConvert}
				>
					Convert to {format === 'csv' ? 'CSV' : 'Excel'}
				</ToolAction>
			</div>
		</div>
		<ToolSuccess message={success} />
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
