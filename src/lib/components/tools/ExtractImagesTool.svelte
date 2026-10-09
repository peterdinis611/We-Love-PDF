<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { formatFileSize } from '$lib/pdf/operations';
	import { extractEmbeddedImages } from '$lib/pdf/extract-images';
	import { downloadZip } from '$lib/pdf/zip';
	import { blobToJpeg } from '$lib/pdf/convert';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let mode = $state<'embedded' | 'pages'>('embedded');
	let processing = $state(false);
	let progress = $state({ page: 0, total: 0 });
	let error = $state('');
	let success = $state('');

	async function handleExtract() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			if (mode === 'embedded') {
				const images = await extractEmbeddedImages(file);
				if (!images.length) {
					error = 'No embedded JPEG/PNG images found. Try “Export pages as images”.';
					return;
				}
				await downloadZip(
					images.map((img) => ({ name: img.name, data: img.bytes })),
					`${file.name.replace(/\.pdf$/i, '')}-images.zip`
				);
				success = `Downloaded ${images.length} embedded image(s) (${formatFileSize(images.reduce((s, i) => s + i.bytes.length, 0))})`;
			} else {
				if (!pdfEngine.engine) return;
				const buffer = await file.arrayBuffer();
				const doc = await pdfEngine.engine
					.openDocumentBuffer({ id: 'extract-pages', content: buffer })
					.toPromise();
				const entries: { name: string; data: Blob }[] = [];
				progress = { page: 0, total: doc.pages.length };
				for (let i = 0; i < doc.pages.length; i++) {
					progress = { page: i + 1, total: doc.pages.length };
					const blob = await pdfEngine.engine
						.renderPage(doc, doc.pages[i], { scaleFactor: 2 })
						.toPromise();
					const jpeg = await blobToJpeg(blob, 0.9);
					entries.push({
						name: `page-${String(i + 1).padStart(3, '0')}.jpg`,
						data: jpeg
					});
				}
				await downloadZip(entries, `${file.name.replace(/\.pdf$/i, '')}-pages.zip`);
				success = `Downloaded ${entries.length} page image(s) as ZIP`;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract images.';
		} finally {
			processing = false;
			progress = { page: 0, total: 0 };
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-3 text-sm text-muted-foreground">
				Pull embedded image XObjects, or export every page as a JPEG.
			</p>
			<div class="flex flex-wrap gap-2">
				{#each [['embedded', 'Embedded images'], ['pages', 'Export pages as images']] as [value, label]}
					<button
						type="button"
						class="rounded-full px-3 py-1.5 text-xs font-medium transition {mode === value
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary text-secondary-foreground'}"
						onclick={() => (mode = value as typeof mode)}
					>
						{label}
					</button>
				{/each}
			</div>
		</ToolPanel>
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Page {progress.page}/{progress.total}" />
		{/if}
		<ToolAction
			disabled={processing || (mode === 'pages' && (pdfEngine.isLoading || !pdfEngine.engine))}
			loading={processing || (mode === 'pages' && pdfEngine.isLoading)}
			loadingText={processing ? 'Extracting…' : 'Loading engine…'}
			onclick={handleExtract}
		>
			Extract images
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error && mode === 'pages'}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
