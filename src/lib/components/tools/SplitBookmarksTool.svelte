<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, formatFileSize } from '$lib/pdf/operations';
	import { splitByBookmarks } from '$lib/pdf/bookmarks-split';

	const pdfEngine = usePdfEngineContext();
	let file = $state<File | null>(null);
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handle() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const { zip, parts } = await splitByBookmarks(file, pdfEngine.engine as never);
			const name = file.name.replace(/\.pdf$/i, '') + '-by-bookmarks.zip';
			downloadBlob(zip, name, 'application/zip');
			success = `Downloaded ${name} — ${parts} part${parts === 1 ? '' : 's'}, ${formatFileSize(zip.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to split by bookmarks.';
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
			<p class="text-sm text-muted-foreground">
				Creates one PDF per bookmark section (from each bookmark to the next) and downloads a ZIP.
			</p>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			onclick={handle}
		>
			Split by bookmarks
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
