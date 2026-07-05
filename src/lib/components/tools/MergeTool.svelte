<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import {
		createFileId,
		downloadBlob,
		mergePdfs,
		type PdfFile
	} from '$lib/pdf/operations';

	let files = $state<PdfFile[]>([]);
	let processing = $state(false);
	let error = $state('');

	function addFiles(newFiles: File[]) {
		files = [
			...files,
			...newFiles.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
		error = '';
	}

	function removeFile(id: string) {
		files = files.filter((f) => f.id !== id);
	}

	function moveFile(id: string, direction: -1 | 1) {
		const idx = files.findIndex((f) => f.id === id);
		const newIdx = idx + direction;
		if (newIdx < 0 || newIdx >= files.length) return;
		const updated = [...files];
		[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
		files = updated;
	}

	async function handleMerge() {
		if (files.length < 2) {
			error = 'Please add at least 2 PDF files to merge.';
			return;
		}
		processing = true;
		error = '';
		try {
			const result = await mergePdfs(files.map((f) => f.file));
			downloadBlob(result, 'merged.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to merge PDFs.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	<FileDropzone multiple label="Select PDF files" hint="or drop PDFs here to merge" onfiles={addFiles} />

	{#if files.length > 0}
		<p class="text-sm text-muted-foreground">
			{files.length} file{files.length === 1 ? '' : 's'} — use arrows to reorder
		</p>
		<div class="space-y-2">
			{#each files as file, i (file.id)}
				<FileListItem
					name={file.name}
					size={file.size}
					index={i}
					showReorder
					canMoveUp={i > 0}
					canMoveDown={i < files.length - 1}
					onremove={() => removeFile(file.id)}
					onmoveup={() => moveFile(file.id, -1)}
					onmovedown={() => moveFile(file.id, 1)}
				/>
			{/each}
		</div>
		<ToolAction disabled={processing || files.length < 2} loading={processing} loadingText="Merging…" onclick={handleMerge}>
			Merge PDF
		</ToolAction>
	{/if}

	<Alert message={error} />
</div>
