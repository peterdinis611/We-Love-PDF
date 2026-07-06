<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import PageThumbnail from '$lib/components/PageThumbnail.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		createFileId,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPageCount,
		mergePdfs,
		type PdfFile
	} from '$lib/pdf/operations';
	import { ChevronDown, ChevronUp, GripVertical, X } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	let files = $state<PdfFile[]>([]);
	let dragIdx = $state<number | null>(null);
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

	function onDragStart(idx: number) {
		dragIdx = idx;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDrop(targetIdx: number) {
		if (dragIdx === null || dragIdx === targetIdx) return;
		const updated = [...files];
		const [moved] = updated.splice(dragIdx, 1);
		updated.splice(targetIdx, 0, moved);
		files = updated;
		dragIdx = null;
	}

	function onDragEnd() {
		dragIdx = null;
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
				<div
					role="listitem"
					draggable="true"
					ondragstart={() => onDragStart(i)}
					ondragover={onDragOver}
					ondrop={() => onDrop(i)}
					ondragend={onDragEnd}
					class="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2 transition {dragIdx === i
						? 'opacity-50'
						: ''}"
				>
					<GripVertical class="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
					{#if pdfEngine.engine}
						<PageThumbnail file={file.file} class="h-14 w-10 shrink-0" />
					{/if}
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{file.name}</p>
						<p class="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
					</div>
					<span class="text-xs text-muted-foreground">#{i + 1}</span>
					<Button variant="ghost" size="icon-sm" disabled={i === 0} onclick={() => moveFile(file.id, -1)} aria-label="Move up">
						<ChevronUp class="size-4" />
					</Button>
					<Button variant="ghost" size="icon-sm" disabled={i === files.length - 1} onclick={() => moveFile(file.id, 1)} aria-label="Move down">
						<ChevronDown class="size-4" />
					</Button>
					<Button variant="ghost" size="icon-sm" onclick={() => removeFile(file.id)} aria-label="Remove file" class="hover:text-destructive">
						<X class="size-4" />
					</Button>
				</div>
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

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Thumbnails may be unavailable." variant="info" />
	{/if}
	<Alert message={error} />
</div>
