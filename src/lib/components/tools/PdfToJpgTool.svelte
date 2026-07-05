<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, formatFileSize, getPageCount, parsePageIndexes } from '$lib/pdf/operations';
	import { blobToJpeg } from '$lib/pdf/convert';
	import { downloadZip } from '$lib/pdf/zip';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let scaleFactor = $state(2);
	let pageRange = $state('');
	let imageFormat = $state<'png' | 'jpeg'>('png');
	let jpegQuality = $state(0.92);
	let downloadMode = $state<'zip' | 'separate'>('zip');
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

	function getPageIndexes(): number[] {
		return parsePageIndexes(pageRange, pageCount);
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
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'convert', content: buffer })
				.toPromise();

			const ext = imageFormat === 'jpeg' ? 'jpg' : 'png';
			const entries: { name: string; data: Blob }[] = [];
			let totalSize = 0;

			for (const i of indexes) {
				const page = doc.pages[i];
				if (!page) continue;
				let blob = await pdfEngine.engine.renderPage(doc, page, { scaleFactor }).toPromise();
				if (imageFormat === 'jpeg') {
					blob = await blobToJpeg(blob, jpegQuality);
				}
				totalSize += blob.size;
				entries.push({ name: `page-${i + 1}.${ext}`, data: blob });
			}

			const baseName = file.name.replace(/\.pdf$/i, '');
			if (downloadMode === 'zip' || entries.length > 1) {
				const zipSize = await downloadZip(entries, `${baseName}-pages.zip`);
				const extLabel = imageFormat === 'jpeg' ? 'JPEG' : 'PNG';
				success = `Downloaded ${baseName}-pages.zip — ${entries.length} ${extLabel} image${entries.length === 1 ? '' : 's'} (${formatFileSize(zipSize)})`;
			} else {
				downloadBlob(entries[0].data, entries[0].name, entries[0].data.type);
				success = `Downloaded ${entries[0].name} (${formatFileSize(totalSize)})`;
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
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Convert pages from a <strong class="text-foreground">{pageCount}-page</strong> PDF to images.
				</p>
				<div>
					<p class="mb-2 text-sm font-medium">Image format</p>
					<div class="flex flex-wrap gap-2">
						{#each [['png', 'PNG'], ['jpeg', 'JPEG']] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {imageFormat === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								onclick={() => (imageFormat = value as typeof imageFormat)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Download as</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['zip', 'ZIP archive'],
							['separate', 'Separate files']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {downloadMode === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								onclick={() => (downloadMode = value as typeof downloadMode)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				{#if imageFormat === 'jpeg'}
					<div>
						<label for="quality" class="mb-1 block text-sm font-medium">JPEG quality: {Math.round(jpegQuality * 100)}%</label>
						<input id="quality" type="range" min="0.5" max="1" step="0.05" bind:value={jpegQuality} class="w-full accent-primary" />
					</div>
				{/if}
				<div>
					<label for="scale" class="mb-1 block text-sm font-medium">Quality (scale): {scaleFactor}x</label>
					<input id="scale" type="range" min="1" max="4" step="0.5" bind:value={scaleFactor} class="w-full accent-primary" />
				</div>
				<div>
					<label for="range" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<Input id="range" bind:value={pageRange} placeholder="All pages, or e.g. 1-3, 5" />
				</div>
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Converting…'}
			onclick={handleConvert}
		>
			Convert to {imageFormat === 'jpeg' ? 'JPEG' : 'PNG'}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
