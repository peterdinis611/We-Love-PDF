<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PageSelector from '$lib/components/PageSelector.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, extractPages, getPageCount } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let selected = $state<Set<number>>(new Set());
	let processing = $state(false);
	let error = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		try {
			pageCount = await getPageCount(f);
			selected = new Set(Array.from({ length: pageCount }, (_, i) => i));
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleExtract() {
		if (!file || selected.size === 0) return;
		processing = true;
		error = '';
		try {
			const indices = [...selected].sort((a, b) => a - b);
			const result = await extractPages(file, indices);
			downloadBlob(result, 'extracted.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract pages.';
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
			<p class="mb-4 text-sm text-gray-600 dark:text-gray-400">
				Select pages to extract ({selected.size} of {pageCount} selected)
			</p>
			<PageSelector {pageCount} {selected} onchange={(s) => (selected = s)} />
		</ToolPanel>
		<ToolAction disabled={processing || selected.size === 0} loading={processing} loadingText="Extracting…" onclick={handleExtract}>
			Extract pages
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
