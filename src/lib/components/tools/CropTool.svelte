<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		cropPdf,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPageCount,
		parsePageIndexes
	} from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let pageRange = $state('');
	let top = $state(36);
	let right = $state(36);
	let bottom = $state(36);
	let left = $state(36);
	let outputName = $state('cropped.pdf');
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

	async function handleCrop() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const indexes = parsePageIndexes(pageRange, pageCount);
			const result = await cropPdf(file, { top, right, bottom, left }, indexes);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${indexes.length} page${indexes.length === 1 ? '' : 's'} cropped, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to crop PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to crop margins" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Trim margins from <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'}.
				</p>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="crop-top" class="mb-1 block text-sm font-medium">Top: {top}pt</label>
						<input id="crop-top" type="range" min="0" max="144" step="4" bind:value={top} class="w-full accent-primary" />
					</div>
					<div>
						<label for="crop-bottom" class="mb-1 block text-sm font-medium">Bottom: {bottom}pt</label>
						<input id="crop-bottom" type="range" min="0" max="144" step="4" bind:value={bottom} class="w-full accent-primary" />
					</div>
					<div>
						<label for="crop-left" class="mb-1 block text-sm font-medium">Left: {left}pt</label>
						<input id="crop-left" type="range" min="0" max="144" step="4" bind:value={left} class="w-full accent-primary" />
					</div>
					<div>
						<label for="crop-right" class="mb-1 block text-sm font-medium">Right: {right}pt</label>
						<input id="crop-right" type="range" min="0" max="144" step="4" bind:value={right} class="w-full accent-primary" />
					</div>
				</div>
				<div>
					<label for="crop-range" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<Input id="crop-range" bind:value={pageRange} placeholder="All pages, or e.g. 1-3, 5" />
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Cropping…" onclick={handleCrop}>
			Crop PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
