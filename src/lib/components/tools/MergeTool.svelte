<script lang="ts">
	import { onMount } from 'svelte';
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import PageThumbnail from '$lib/components/PageThumbnail.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createUndoStack } from '$lib/undo-stack';
	import {
		createFileId,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPageCount,
		mergePdfs,
		type PdfFile
	} from '$lib/pdf/operations';
	import { ChevronDown, ChevronUp, GripVertical, Undo2, X } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();
	const ws = $derived(msg(getAppLocale()).workspace);
	const undoStack = createUndoStack<PdfFile[]>();

	let files = $state<PdfFile[]>([]);
	let dragIdx = $state<number | null>(null);
	let touchIdx = $state<number | null>(null);
	let touchStartY = $state(0);
	let blankBetween = $state(false);
	let outputName = $state('merged.pdf');
	let totalPages = $state(0);
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const canUndo = $derived(undoStack.canUndo());

	function snapshot() {
		undoStack.push(files);
	}

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
		snapshot();
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
		snapshot();
		files = files.filter((f) => f.id !== id);
		refreshPageCount();
	}

	function moveFile(id: string, direction: -1 | 1) {
		const idx = files.findIndex((f) => f.id === id);
		const newIdx = idx + direction;
		if (newIdx < 0 || newIdx >= files.length) return;
		snapshot();
		const updated = [...files];
		[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
		files = updated;
	}

	function swapFiles(from: number, to: number) {
		if (from === to || from < 0 || to < 0 || from >= files.length || to >= files.length) return;
		snapshot();
		const updated = [...files];
		[updated[from], updated[to]] = [updated[to], updated[from]];
		files = updated;
	}

	function undo() {
		const prev = undoStack.pop();
		if (prev) {
			files = prev;
			refreshPageCount();
		}
	}

	function onDragStart(idx: number) {
		dragIdx = idx;
	}

	function onDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onDrop(targetIdx: number) {
		if (dragIdx === null || dragIdx === targetIdx) return;
		snapshot();
		const updated = [...files];
		const [moved] = updated.splice(dragIdx, 1);
		updated.splice(targetIdx, 0, moved);
		files = updated;
		dragIdx = null;
	}

	function onDragEnd() {
		dragIdx = null;
	}

	function onTouchStart(idx: number, e: TouchEvent) {
		touchIdx = idx;
		touchStartY = e.touches[0]?.clientY ?? 0;
	}

	function onTouchMove(e: TouchEvent) {
		if (touchIdx === null) return;
		const touch = e.touches[0];
		if (!touch) return;
		const dy = touch.clientY - touchStartY;
		if (Math.abs(dy) < 44) return;
		e.preventDefault();
		const dir = dy > 0 ? 1 : -1;
		const target = touchIdx + dir;
		if (target < 0 || target >= files.length) return;
		swapFiles(touchIdx, target);
		touchIdx = target;
		touchStartY = touch.clientY;
	}

	function onTouchEnd() {
		touchIdx = null;
	}

	async function handleMerge() {
		if (files.length < 2) {
			error = ws.errors.mergeMinFiles;
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

	onMount(() => {
		function onKeydown(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
				const tag = document.activeElement?.tagName;
				if (tag === 'INPUT' || tag === 'TEXTAREA') return;
				e.preventDefault();
				undo();
			}
		}
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

<div class="space-y-4">
	<FileDropzone multiple onfiles={addFiles} />

	{#if files.length > 0}
		<div class="flex flex-wrap items-center justify-between gap-2">
			<p class="text-sm text-muted-foreground">
				{files.length} file{files.length === 1 ? '' : 's'}
				{#if totalPages}· {totalPages} total pages after merge{/if}
			</p>
			{#if canUndo}
				<Button variant="outline" size="sm" onclick={undo}>
					<Undo2 class="size-3.5" />
					{ws.undo}
				</Button>
			{/if}
		</div>
		<div class="space-y-2" role="list">
			{#each files as file, i (file.id)}
				<div
					role="listitem"
					draggable="true"
					ondragstart={() => onDragStart(i)}
					ondragover={onDragOver}
					ondrop={() => onDrop(i)}
					ondragend={onDragEnd}
					ontouchstart={(e) => onTouchStart(i, e)}
					ontouchmove={onTouchMove}
					ontouchend={onTouchEnd}
					class="flex touch-manipulation items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 transition sm:gap-3 {dragIdx === i
						? 'opacity-50'
						: ''}"
				>
					<GripVertical class="size-5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing sm:size-4" />
					{#if pdfEngine.engine}
						<PageThumbnail file={file.file} class="h-14 w-10 shrink-0" />
					{/if}
					<div class="min-w-0 flex-1">
						<p class="truncate text-sm font-medium">{file.name}</p>
						<p class="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
					</div>
					<span class="hidden text-xs text-muted-foreground sm:inline">#{i + 1}</span>
					<Button variant="ghost" size="icon-sm" class="size-10 sm:size-8" disabled={i === 0} onclick={() => moveFile(file.id, -1)} aria-label={ws.a11y.moveUp}>
						<ChevronUp class="size-4" />
					</Button>
					<Button variant="ghost" size="icon-sm" class="size-10 sm:size-8" disabled={i === files.length - 1} onclick={() => moveFile(file.id, 1)} aria-label={ws.a11y.moveDown}>
						<ChevronDown class="size-4" />
					</Button>
					<Button variant="ghost" size="icon-sm" class="size-10 hover:text-destructive sm:size-8" onclick={() => removeFile(file.id)} aria-label={ws.a11y.removeFile}>
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
		<ToolAction disabled={processing || files.length < 2} loading={processing} loadingText={ws.actions.merging} onclick={handleMerge}>
			{ws.actions.merge}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Thumbnails may be unavailable." variant="info" />
	{/if}
	<Alert message={error} />
</div>
