<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { createFileId, downloadBlob, ensurePdfFilename, formatFileSize, imagesToPdf, type PdfFile } from '$lib/pdf/operations';

	let files = $state<PdfFile[]>([]);
	let pageSize = $state<'fit' | 'a4' | 'letter'>('a4');
	let margin = $state(36);
	let outputName = $state('images.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	function addFiles(newFiles: File[]) {
		const images = newFiles.filter(
			(f) => f.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(f.name)
		);
		if (!images.length) {
			error = 'Please select JPG or PNG images.';
			return;
		}
		files = [
			...files,
			...images.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
		error = '';
		success = '';
	}

	async function handleConvert() {
		if (!files.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await imagesToPdf(files.map((f) => f.file), { pageSize, margin });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${files.length} image${files.length === 1 ? '' : 's'}, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	<FileDropzone
		multiple
		accept="image/jpeg,image/png,.jpg,.jpeg,.png"
		label="Select images"
		hint="or drop JPG/PNG files here"
		onfiles={addFiles}
		fileFilter={(f) => f.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(f.name)}
	/>

	{#if files.length > 0}
		<div class="space-y-2">
			{#each files as file, i (file.id)}
				<FileListItem
					name={file.name}
					size={file.size}
					index={i}
					onremove={() => (files = files.filter((f) => f.id !== file.id))}
				/>
			{/each}
		</div>
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<p class="mb-2 text-sm font-medium">Page size</p>
					<div class="flex flex-wrap gap-2">
						{#each [['fit', 'Fit image'], ['a4', 'A4'], ['letter', 'Letter']] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {pageSize === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								onclick={() => (pageSize = value as typeof pageSize)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				{#if pageSize !== 'fit'}
					<div>
						<label for="margin" class="mb-1 block text-sm font-medium">Margin: {margin}pt</label>
						<input id="margin" type="range" min="0" max="72" step="4" bind:value={margin} class="w-full accent-primary" />
					</div>
				{/if}
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Converting…" onclick={handleConvert}>
			Create PDF ({files.length} image{files.length === 1 ? '' : 's'})
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
