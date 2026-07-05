<script lang="ts">
	import { onDestroy } from 'svelte';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PdfViewer from '$lib/components/PdfViewer.svelte';

	let file = $state<File | null>(null);
	let pdfUrl = $state<string | null>(null);

	async function setFile(f: File) {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = f;
		pdfUrl = URL.createObjectURL(f);
	}

	function clearFile() {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = null;
		pdfUrl = null;
	}

	onDestroy(() => {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
	});
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to view" onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={clearFile} />
		{#if pdfUrl}
			<PdfViewer src={pdfUrl} class="h-[70vh]" />
		{/if}
	{/if}
</div>
