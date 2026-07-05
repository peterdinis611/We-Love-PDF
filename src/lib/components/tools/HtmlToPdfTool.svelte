<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { htmlToPdf, type ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let html = $state('');
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
			html = await f.text();
		} catch {
			error = 'Could not read HTML file.';
			file = null;
		}
	}

	async function handleConvert() {
		if (!html.trim()) {
			error = 'Add HTML content or upload an .html file.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const result = await htmlToPdf(html, { pageSize });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert HTML to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select HTML file"
			hint="or drop an .html file — or paste HTML below"
			accept=".html,text/html"
			onfiles={(f) => setFile(f[0])}
		/>
	{/if}

	{#if file}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
	{/if}

	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="html-content" class="mb-1 block text-sm font-medium">HTML content</label>
				<textarea
					id="html-content"
					bind:value={html}
					rows="12"
					class="w-full rounded-lg border border-input bg-background px-3 py-2 font-mono text-xs"
					placeholder="<h1>Hello</h1><p>Your content here…</p>"
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
				Supports headings, paragraphs, lists, and blockquotes. Complex CSS/layout is not preserved.
			</p>
			<OutputFilename bind:value={outputName} />
		</div>
	</ToolPanel>

	<ToolAction disabled={processing || !html.trim()} loading={processing} loadingText="Converting…" onclick={handleConvert}>
		Convert to PDF
	</ToolAction>
	<ToolSuccess message={success} />
	<Alert message={error} />
</div>
