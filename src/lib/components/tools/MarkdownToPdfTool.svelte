<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { markdownToPdf, type ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let markdown = $state('');
	let pageSize = $state<ConvertPageSize>('a4');
	let outputName = $state('document.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			markdown = await f.text();
		} catch {
			error = 'Could not read Markdown file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!markdown.trim()) {
			error = 'Add Markdown content or upload a .md file.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const result = await markdownToPdf(markdown, { pageSize });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert Markdown to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select Markdown file"
			hint="or drop a .md file — or paste Markdown below"
			accept=".md,.markdown,text/markdown"
			onfiles={(f) => setFile(f[0])}
		/>
	{/if}

	{#if file}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
	{/if}

	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="md-content" class="mb-1 block text-sm font-medium">Markdown content</label>
				<textarea
					id="md-content"
					bind:value={markdown}
					rows="12"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
					placeholder="# Title&#10;&#10;Your **markdown** content here…"
				></textarea>
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
			<p class="text-xs text-muted-foreground">
				Supports headings (#), lists (-), blockquotes (&gt;), and paragraphs.
			</p>
			<OutputFilename bind:value={outputName} />
		</div>
	</ToolPanel>

	<ToolAction disabled={processing || !markdown.trim()} loading={processing} loadingText="Converting…" onclick={handleConvert}>
		Convert to PDF
	</ToolAction>
	<ToolSuccess message={success} />
	<Alert message={error} />
</div>
