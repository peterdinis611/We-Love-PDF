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
	import { downloadBlob, ensureExtension, getPageCount } from '$lib/pdf/operations';
	import { pageToSvg } from '$lib/pdf/pdf-to-svg';
	import { downloadZip } from '$lib/pdf/zip';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageNumber = $state(1);
	let pageCount = $state(0);
	let allPages = $state(false);
	let outputName = $state('page.svg');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		pageCount = await getPageCount(f);
		pageNumber = 1;
	}

	async function handle() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'svg-export', content: buffer })
				.toPromise();
			if (allPages) {
				const entries: { name: string; data: Uint8Array }[] = [];
				for (let i = 0; i < doc.pages.length; i++) {
					const page = doc.pages[i];
					const blob = await pdfEngine.engine.renderPage(doc, page, { scaleFactor: 2 }).toPromise();
					const svg = await pageToSvg(blob, page.size);
					entries.push({
						name: `page-${String(i + 1).padStart(3, '0')}.svg`,
						data: new TextEncoder().encode(svg)
					});
				}
				await downloadZip(entries, `${file.name.replace(/\.pdf$/i, '')}-svg.zip`);
				success = `Downloaded ${entries.length} SVG files as ZIP`;
			} else {
				const idx = Math.min(Math.max(pageNumber, 1), doc.pages.length) - 1;
				const page = doc.pages[idx];
				const blob = await pdfEngine.engine.renderPage(doc, page, { scaleFactor: 2 }).toPromise();
				const svg = await pageToSvg(blob, page.size);
				const name = ensureExtension(outputName, 'svg');
				downloadBlob(new TextEncoder().encode(svg), name, 'image/svg+xml');
				success = `Downloaded ${name}`;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to export SVG.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-3 text-sm text-muted-foreground">
				Exports a page as SVG wrapping a high-resolution PNG (great for embedding).
			</p>
			<label class="mb-3 flex items-center gap-2 text-sm">
				<input type="checkbox" bind:checked={allPages} class="accent-primary" />
				Export all pages as ZIP
			</label>
			{#if !allPages}
				<div class="mb-3">
					<label for="pg" class="mb-1 block text-sm font-medium">Page (1–{pageCount || '?'})</label>
					<Input id="pg" type="number" min={1} max={pageCount || 1} bind:value={pageNumber} />
				</div>
				<OutputFilename bind:value={outputName} />
			{/if}
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={processing ? 'Exporting…' : 'Loading engine…'}
			onclick={handle}
		>
			Export SVG
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
