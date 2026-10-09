<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensureExtension } from '$lib/pdf/operations';
	import { pdfToMarkdown } from '$lib/pdf/pdf-to-md';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let outputName = $state('document.md');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let preview = $state('');

	async function handle() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const md = await pdfToMarkdown(file, pdfEngine.engine as never);
			preview = md.slice(0, 1200);
			const name = ensureExtension(outputName, 'md');
			downloadBlob(new TextEncoder().encode(md), name, 'text/markdown;charset=utf-8');
			success = `Downloaded ${name}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert to Markdown.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Extracts text per page into a Markdown file with page headings.
			</p>
			<OutputFilename bind:value={outputName} />
			{#if preview}
				<pre class="mt-3 max-h-40 overflow-auto rounded-lg bg-muted/50 p-3 text-xs whitespace-pre-wrap">{preview}…</pre>
			{/if}
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={processing ? 'Extracting…' : 'Loading engine…'}
			onclick={handle}
		>
			Convert to Markdown
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
