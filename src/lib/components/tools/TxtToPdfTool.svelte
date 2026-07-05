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
	import { textToPdf, type ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let pastedText = $state('');
	let pageSize = $state<ConvertPageSize>('a4');
	let fontSize = $state(12);
	let margin = $state(48);
	let outputName = $state('document.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		pastedText = '';
		error = '';
		success = '';
		try {
			pastedText = await f.text();
		} catch {
			error = 'Could not read text file.';
			file = null;
		}
	}

	async function handleConvert() {
		const text = file ? pastedText : pastedText.trim();
		if (!text) {
			error = 'Add text content or upload a .txt file.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const result = await textToPdf(text, { pageSize, fontSize, margin });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select text file"
			hint="or drop a .txt file — or paste text below"
			accept=".txt,text/plain"
			onfiles={(f) => setFile(f[0])}
		/>
	{/if}

	{#if file}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
	{/if}

	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="txt-content" class="mb-1 block text-sm font-medium">Text content</label>
				<textarea
					id="txt-content"
					bind:value={pastedText}
					rows="10"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
					placeholder="Paste or type text here…"
				></textarea>
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
					<label for="font-size" class="mb-1 block text-sm font-medium">Font size: {fontSize}pt</label>
					<input id="font-size" type="range" min="9" max="18" step="1" bind:value={fontSize} class="w-full accent-primary" />
				</div>
			</div>
			<div>
				<label for="margin" class="mb-1 block text-sm font-medium">Margin: {margin}pt</label>
				<input id="margin" type="range" min="24" max="96" step="4" bind:value={margin} class="w-full accent-primary" />
			</div>
			<OutputFilename bind:value={outputName} />
		</div>
	</ToolPanel>

	<ToolAction disabled={processing || !pastedText.trim()} loading={processing} loadingText="Creating PDF…" onclick={handleConvert}>
		Create PDF
	</ToolAction>
	<ToolSuccess message={success} />
	<Alert message={error} />
</div>
