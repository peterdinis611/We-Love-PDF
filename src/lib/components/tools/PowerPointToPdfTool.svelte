<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { pptxToPdf } from '$lib/pdf/office';
	import type { ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let title = $state('');
	let pageSize = $state<ConvertPageSize>('a4');
	let outputName = $state('presentation.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	function setFile(f: File) {
		file = f;
		error = '';
		success = '';
	}

	async function handleConvert() {
		if (!file) return;

		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const result = await pptxToPdf(buffer, {
				pageSize,
				title: title.trim() || file.name.replace(/\.pptx$/i, '')
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert PowerPoint to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select PowerPoint file"
			hint="or drop a .pptx file (Office Open XML)"
			accept=".pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation"
			onfiles={(f) => setFile(f[0])}
		/>
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Extracts slide text from .pptx and lays it out as a PDF. Images, animations, and legacy .ppt files are not supported.
				</p>
				<div>
					<label for="ppt-title" class="mb-1 block text-sm font-medium">Presentation title (optional)</label>
					<Input id="ppt-title" bind:value={title} placeholder="Presentation title" />
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Page size</p>
					<div class="flex flex-wrap gap-2">
						{#each [['a4', 'A4'], ['letter', 'Letter']] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {pageSize === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								onclick={() => (pageSize = value as ConvertPageSize)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Converting…" onclick={handleConvert}>
			Convert to PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
