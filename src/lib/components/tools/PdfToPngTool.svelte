<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formatFileSize, getPageCount, parsePageIndexes } from '$lib/pdf/operations';
	import { downloadZip } from '$lib/pdf/zip';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import { getToolPreset, setToolPreset } from '$lib/tool-presets';
	import { readNumberParam, readStringParam, syncToolParams } from '$lib/tool-params';

	const pdfEngine = usePdfEngineContext();
	const ws = $derived(msg(getAppLocale()).workspace);

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let scaleFactor = $state(
		readNumberParam('scale', getToolPreset<number>('pdf-to-png', 'scale', 2))
	);
	let pageRange = $state(readStringParam('pages') || getToolPreset<string>('pdf-to-png', 'pages', ''));
	let processing = $state(false);
	let progressCurrent = $state(0);
	let error = $state('');
	let success = $state('');

	$effect(() => {
		syncToolParams({ scale: scaleFactor, pages: pageRange || undefined });
		setToolPreset('pdf-to-png', 'scale', scaleFactor);
		setToolPreset('pdf-to-png', 'pages', pageRange);
	});

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
		} catch {
			error = ws.errors.couldNotReadPdf;
			file = null;
		}
	}

	async function handleConvert() {
		if (!file || !pdfEngine.engine) return;
		const indexes = parsePageIndexes(pageRange, pageCount);
		if (!indexes.length) {
			error = ws.errors.invalidPageRange;
			return;
		}

		processing = true;
		error = '';
		success = '';
		progressCurrent = 0;
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'png-convert', content: buffer })
				.toPromise();

			const entries: { name: string; data: Blob }[] = [];
			for (let n = 0; n < indexes.length; n++) {
				progressCurrent = n + 1;
				const i = indexes[n];
				const page = doc.pages[i];
				if (!page) continue;
				const blob = await pdfEngine.engine.renderPage(doc, page, { scaleFactor }).toPromise();
				entries.push({ name: `page-${i + 1}.png`, data: blob });
			}

			const baseName = file.name.replace(/\.pdf$/i, '');
			const zipSize = await downloadZip(entries, `${baseName}-png.zip`);
			success = `Downloaded ${baseName}-png.zip — ${entries.length} PNG image${entries.length === 1 ? '' : 's'} (${formatFileSize(zipSize)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert PDF to PNG.';
		} finally {
			processing = false;
			progressCurrent = 0;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} {file} showPageCount onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Convert <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'} to lossless PNG images in a ZIP archive.
				</p>
				<div>
					<label for="png-scale" class="mb-1 block text-sm font-medium">Resolution (scale): {scaleFactor}x</label>
					<input id="png-scale" type="range" min="1" max="4" step="0.5" bind:value={scaleFactor} class="w-full accent-primary" />
				</div>
				<div>
					<label for="png-range" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<Input id="png-range" bind:value={pageRange} placeholder="All pages, or e.g. 1-3, 5" />
				</div>
			</div>
		</ToolPanel>
		{#if processing && progressCurrent > 0}
			<ProgressBar value={progressCurrent} max={parsePageIndexes(pageRange, pageCount).length || pageCount} label="Rendering page {progressCurrent}…" />
		{/if}
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Converting…'}
			onclick={handleConvert}
		>
			Convert to PNG (ZIP)
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
