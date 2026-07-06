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
	import { xmlToPdf } from '$lib/pdf/data-to-pdf';
	import type { ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let xmlText = $state('');
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
			xmlText = await f.text();
		} catch {
			error = 'Could not read XML file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!xmlText.trim()) {
			error = 'Add XML content or upload an .xml file.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const result = await xmlToPdf(xmlText, {
				pageSize,
				fontSize,
				title: title.trim() || undefined
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert XML to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select XML file" hint="or drop an .xml file — or paste XML below" accept=".xml,text/xml,application/xml" onfiles={(f) => setFile(f[0])} />
	{/if}
	{#if file}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
	{/if}
	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="xml-content" class="mb-1 block text-sm font-medium">XML content</label>
				<textarea
					id="xml-content"
					bind:value={xmlText}
					rows="10"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
					placeholder={'<rows><row><name>Jane</name></row></rows>'}
				></textarea>
			</div>
			<div>
				<label for="xml-title" class="mb-1 block text-sm font-medium">Table title (optional)</label>
				<Input id="xml-title" bind:value={title} placeholder="Report title" />
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
					<label for="xml-font" class="mb-1 block text-sm font-medium">Font size: {fontSize}pt</label>
					<input id="xml-font" type="range" min="8" max="14" step="1" bind:value={fontSize} class="w-full accent-primary" />
				</div>
			</div>
			<OutputFilename bind:value={outputName} />
		</div>
	</ToolPanel>
	<ToolAction disabled={processing || !xmlText.trim()} loading={processing} loadingText="Converting…" onclick={handleConvert}>
		Convert to PDF
	</ToolAction>
	<Alert message={error} />
	<ToolSuccess message={success} />
</div>
