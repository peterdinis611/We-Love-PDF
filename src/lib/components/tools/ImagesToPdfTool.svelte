<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { createFileId, downloadBlob, imagesToPdf, type PdfFile } from '$lib/pdf/operations';

	let files = $state<PdfFile[]>([]);
	let processing = $state(false);
	let error = $state('');

	function addFiles(newFiles: File[]) {
		const images = newFiles.filter(
			(f) =>
				f.type.startsWith('image/') ||
				/\.(jpe?g|png)$/i.test(f.name)
		);
		if (!images.length) {
			error = 'Please select JPG or PNG images.';
			return;
		}
		files = [
			...files,
			...images.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
		error = '';
	}

	async function handleConvert() {
		if (!files.length) return;
		processing = true;
		error = '';
		try {
			const result = await imagesToPdf(files.map((f) => f.file));
			downloadBlob(result, 'images.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	<FileDropzone
		multiple
		accept="image/jpeg,image/png,.jpg,.jpeg,.png"
		label="Select images"
		hint="or drop JPG/PNG files here"
		onfiles={addFiles}
		fileFilter={(f) => f.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(f.name)}
	/>

	{#if files.length > 0}
		<div class="space-y-2">
			{#each files as file, i (file.id)}
				<FileListItem
					name={file.name}
					size={file.size}
					index={i}
					onremove={() => (files = files.filter((f) => f.id !== file.id))}
				/>
			{/each}
		</div>
		<ToolAction disabled={processing} loading={processing} loadingText="Converting…" onclick={handleConvert}>
			Create PDF ({files.length} image{files.length === 1 ? '' : 's'})
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
