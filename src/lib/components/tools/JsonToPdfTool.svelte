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
	import { jsonToPdf } from '$lib/pdf/data-to-pdf';
	import type { ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let jsonText = $state('');
	let title = $state('');
	let pageSize = $state<ConvertPageSize>('a4');
	let fontSize = $state(10);
	let outputName = $state('data.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			jsonText = await f.text();
			JSON.parse(jsonText);
		} catch {
			error = 'Could not read valid JSON file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!jsonText.trim()) {
			error = 'Add JSON content or upload a .json file.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const result = await jsonToPdf(jsonText, {
				pageSize,
				fontSize,
				title: title.trim() || undefined
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert JSON to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select JSON file" hint="or drop a .json file — or paste JSON below" accept=".json,application/json" onfiles={(f) => setFile(f[0])} />
	{/if}
	{#if file}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
	{/if}
	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="json-content" class="mb-1 block text-sm font-medium">JSON content</label>
				<textarea
					id="json-content"
					bind:value={jsonText}
					rows="10"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
					placeholder={'[{"name":"Jane","role":"Admin"}]'}
				></textarea>
			</div>
			<div>
				<label for="json-title" class="mb-1 block text-sm font-medium">Table title (optional)</label>
				<Input id="json-title" bind:value={title} placeholder="Report title" />
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
					<label for="json-font" class="mb-1 block text-sm font-medium">Font size: {fontSize}pt</label>
					<input id="json-font" type="range" min="8" max="14" step="1" bind:value={fontSize} class="w-full accent-primary" />
				</div>
			</div>
			<OutputFilename bind:value={outputName} />
		</div>
	</ToolPanel>
	<ToolAction disabled={processing || !jsonText.trim()} loading={processing} loadingText="Converting…" onclick={handleConvert}>
		Convert to PDF
	</ToolAction>
	<Alert message={error} />
	<ToolSuccess message={success} />
</div>
