<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { formatFileSize, getPageCount, parsePageIndexes } from '$lib/pdf/operations';
	import { downloadZip } from '$lib/pdf/zip';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let scaleFactor = $state(2);
	let pageRange = $state('');
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
				.openDocumentBuffer({ id: 'png-convert', content: buffer })
				.toPromise();

			const entries: { name: string; data: Blob }[] = [];
			for (const i of indexes) {
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
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to convert to PNG" onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
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
