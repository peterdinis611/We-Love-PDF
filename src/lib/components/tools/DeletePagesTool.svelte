<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PageSelector from '$lib/components/PageSelector.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { deletePages, downloadBlob, ensurePdfFilename, formatFileSize, getPageCount } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let toDelete = $state<Set<number>>(new Set());
	let outputName = $state('cleaned.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
			toDelete = new Set();
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleDelete() {
		if (!file || toDelete.size === 0) return;
		if (toDelete.size >= pageCount) {
			error = 'You must keep at least one page.';
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const result = await deletePages(file, toDelete);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			const remaining = pageCount - toDelete.size;
			success = `Downloaded ${name} — ${remaining} page${remaining === 1 ? '' : 's'} kept, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to delete pages.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Select pages to delete ({toDelete.size} selected, {pageCount - toDelete.size} will remain)
			</p>
			<PageSelector pageCount={pageCount} selected={toDelete} onchange={(s) => (toDelete = s)} />
			<div class="mt-4">
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || toDelete.size === 0} loading={processing} loadingText="Deleting…" onclick={handleDelete}>
			Delete selected pages
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
