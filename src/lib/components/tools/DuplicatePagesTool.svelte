<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PageSelector from '$lib/components/PageSelector.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, duplicatePages, ensurePdfFilename, formatFileSize, getPageCount } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let selected = $state<Set<number>>(new Set());
	let outputName = $state('duplicated.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
			selected = new Set([pageCount - 1]);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleDuplicate() {
		if (!file || selected.size === 0) return;
		processing = true;
		error = '';
		success = '';
		try {
			const indices = [...selected].sort((a, b) => a - b);
			const result = await duplicatePages(file, indices);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			const newCount = pageCount + indices.length;
			success = `Downloaded ${name} — ${newCount} pages total, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to duplicate pages.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Select pages to duplicate ({selected.size} of {pageCount} selected). Copies are appended at the end.
			</p>
			<PageSelector {pageCount} {selected} onchange={(s) => (selected = s)} />
			<div class="mt-4">
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || selected.size === 0}
			loading={processing}
			loadingText="Duplicating…"
			onclick={handleDuplicate}
		>
			Duplicate pages
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
