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
	import { csvToPdf } from '$lib/pdf/csv';
	import type { ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let csvText = $state('');
	let title = $state('');
	let pageSize = $state<ConvertPageSize>('a4');
	let fontSize = $state(10);
	let outputName = $state('table.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			csvText = await f.text();
		} catch {
			error = 'Could not read CSV file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!csvText.trim()) {
			error = 'Add CSV content or upload a .csv file.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const result = await csvToPdf(csvText, {
				pageSize,
				fontSize,
				title: title.trim() || undefined
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert CSV to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select CSV file"
			hint="or drop a .csv file — or paste CSV below"
			accept=".csv,text/csv"
			onfiles={(f) => setFile(f[0])}
		/>
	{/if}

	{#if file}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
	{/if}

	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="csv-content" class="mb-1 block text-sm font-medium">CSV content</label>
				<textarea
					id="csv-content"
					bind:value={csvText}
					rows="10"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
					placeholder="Name,Email,Role&#10;Jane,jane@example.com,Admin"
				></textarea>
			</div>
			<div>
				<label for="csv-title" class="mb-1 block text-sm font-medium">Table title (optional)</label>
				<Input id="csv-title" bind:value={title} placeholder="Report title" />
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
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
				<div>
					<label for="csv-font" class="mb-1 block text-sm font-medium">Font size: {fontSize}pt</label>
					<input id="csv-font" type="range" min="8" max="14" step="1" bind:value={fontSize} class="w-full accent-primary" />
				</div>
			</div>
			<OutputFilename bind:value={outputName} />
		</div>
	</ToolPanel>

	<ToolAction disabled={processing || !csvText.trim()} loading={processing} loadingText="Converting…" onclick={handleConvert}>
		Convert to PDF
	</ToolAction>
	<Alert message={error} />
	<ToolSuccess message={success} />
</div>
