<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import {
		createFileId,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPageCount,
		mergePdfs,
		type PdfFile
	} from '$lib/pdf/operations';

	let files = $state<PdfFile[]>([]);
	let blankBetween = $state(false);
	let outputName = $state('merged.pdf');
	let totalPages = $state(0);
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function refreshPageCount() {
		if (!files.length) {
			totalPages = 0;
			return;
		}
		let count = 0;
		for (const f of files) count += await getPageCount(f.file);
		totalPages = blankBetween ? count + files.length - 1 : count;
	}

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
		success = '';
		refreshPageCount();
	}

	function removeFile(id: string) {
		files = files.filter((f) => f.id !== id);
		refreshPageCount();
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
		success = '';
		try {
			const result = await mergePdfs(
				files.map((f) => f.file),
				{ blankBetween }
			);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${totalPages} pages, ${formatFileSize(result.length)}`;
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
			{files.length} file{files.length === 1 ? '' : 's'}
			{#if totalPages}· {totalPages} total pages after merge{/if}
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
		<ToolPanel>
			<div class="space-y-4">
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={blankBetween} onchange={refreshPageCount} class="rounded border-border accent-primary" />
					Insert blank page between each PDF
				</label>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || files.length < 2} loading={processing} loadingText="Merging…" onclick={handleMerge}>
			Merge PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}

	<Alert message={error} />
</div>
