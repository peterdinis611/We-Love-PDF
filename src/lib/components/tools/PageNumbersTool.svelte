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
		addPageNumbers,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		type PageNumberFormat,
		type PageNumberPosition
	} from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let position = $state<PageNumberPosition>('bottom-center');
	let format = $state<PageNumberFormat>('fraction');
	let startNumber = $state(1);
	let fontSize = $state(12);
	let outputName = $state('numbered.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleAdd() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await addPageNumbers(file, { position, format, startNumber, fontSize });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add page numbers.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<p class="mb-2 text-sm font-medium">Format</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['fraction', '1 / 10'],
							['number', '1'],
							['page-of', 'Page 1 of 10']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {format === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (format = value as PageNumberFormat)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Position</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['bottom-center', 'Bottom center'],
							['bottom-right', 'Bottom right'],
							['bottom-left', 'Bottom left'],
							['top-center', 'Top center'],
							['top-right', 'Top right']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {position === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (position = value as PageNumberPosition)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="start" class="mb-1 block text-sm font-medium">Start number</label>
						<Input id="start" type="number" bind:value={startNumber} min={1} />
					</div>
					<div>
						<label for="fontSize" class="mb-1 block text-sm font-medium">Font size: {fontSize}px</label>
						<input id="fontSize" type="range" min="8" max="24" step="1" bind:value={fontSize} class="w-full accent-primary" />
					</div>
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Adding numbers…" onclick={handleAdd}>
			Add page numbers
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
