<script lang="ts">
	import { onMount } from 'svelte';
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PageThumbnail from '$lib/components/PageThumbnail.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { createUndoStack } from '$lib/undo-stack';
	import { downloadBlob, ensurePdfFilename, formatFileSize, getPageCount, organizePdf } from '$lib/pdf/operations';
	import { ChevronDown, ChevronUp, X, RotateCcw, GripVertical, ArrowDownAZ, Eraser, Undo2 } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();
	const ws = $derived(msg(getAppLocale()).workspace);
	const undoStack = createUndoStack<number[]>();

	let file = $state<File | null>(null);
	let pageOrder = $state<number[]>([]);
	let dragIdx = $state<number | null>(null);
	let touchIdx = $state<number | null>(null);
	let touchStartY = $state(0);
	let outputName = $state('organized.pdf');
	let processing = $state(false);
	let removingBlanks = $state(false);
	let error = $state('');
	let success = $state('');

	const canUndo = $derived(undoStack.canUndo());

	function snapshot() {
		undoStack.push(pageOrder);
	}

	function undo() {
		const prev = undoStack.pop();
		if (prev) pageOrder = prev;
	}

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			const count = await getPageCount(f);
			pageOrder = Array.from({ length: count }, (_, i) => i);
		} catch {
			error = ws.errors.couldNotReadPdf;
			file = null;
		}
	}

	function movePage(idx: number, direction: -1 | 1) {
		const newIdx = idx + direction;
		if (newIdx < 0 || newIdx >= pageOrder.length) return;
		snapshot();
		const updated = [...pageOrder];
		[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
		pageOrder = updated;
	}

	function swapPages(from: number, to: number) {
		if (from === to || from < 0 || to < 0 || from >= pageOrder.length || to >= pageOrder.length) return;
		snapshot();
		const updated = [...pageOrder];
		[updated[from], updated[to]] = [updated[to], updated[from]];
		pageOrder = updated;
	}

	function removePage(idx: number) {
		if (pageOrder.length <= 1) return;
		snapshot();
		pageOrder = pageOrder.filter((_, i) => i !== idx);
	}

	function reverseOrder() {
		snapshot();
		pageOrder = [...pageOrder].reverse();
	}

	function sortByPageNumber() {
		snapshot();
		pageOrder = [...pageOrder].sort((a, b) => a - b);
	}

	async function removeBlankPages() {
		if (!file || !pdfEngine.engine) return;
		removingBlanks = true;
		error = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'organize-blanks', content: buffer })
				.toPromise();

			const kept: number[] = [];
			for (const pageIdx of pageOrder) {
				const text = await pdfEngine.engine.extractText(doc, [pageIdx]).toPromise();
				if (text.trim().length > 8) kept.push(pageIdx);
			}

			if (!kept.length) {
				error = 'All pages appear blank.';
				return;
			}
			snapshot();
			pageOrder = kept;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not detect blank pages.';
		} finally {
			removingBlanks = false;
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
		const updated = [...pageOrder];
		const [moved] = updated.splice(dragIdx, 1);
		updated.splice(targetIdx, 0, moved);
		pageOrder = updated;
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
		if (target < 0 || target >= pageOrder.length) return;
		swapPages(touchIdx, target);
		touchIdx = target;
		touchStartY = touch.clientY;
	}

	function onTouchEnd() {
		touchIdx = null;
	}

	async function handleOrganize() {
		if (!file || !pageOrder.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await organizePdf(file, pageOrder);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${pageOrder.length} pages, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to organize PDF.';
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
	{#if !file}
		<FileDropzone onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} {file} showPageCount onremove={() => (file = null)} />
		<ToolPanel>
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<p class="text-sm text-muted-foreground">Drag to reorder pages. Swipe on mobile or use arrows.</p>
				<div class="flex flex-wrap gap-2">
					{#if canUndo}
						<Button variant="outline" size="sm" onclick={undo}>
							<Undo2 class="size-3.5" />
							{ws.undo}
						</Button>
					{/if}
					<Button variant="outline" size="sm" onclick={sortByPageNumber}>
						<ArrowDownAZ class="size-3.5" />
						Sort 1…n
					</Button>
					<Button variant="outline" size="sm" onclick={reverseOrder}>
						<RotateCcw class="size-3.5" />
						Reverse
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={removingBlanks || pdfEngine.isLoading || !pdfEngine.engine}
						onclick={removeBlankPages}
					>
						<Eraser class="size-3.5" />
						{removingBlanks ? 'Checking…' : 'Remove blanks'}
					</Button>
				</div>
			</div>
			<div class="space-y-2" role="list">
				{#each pageOrder as pageIndex, i (i)}
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
						class="flex touch-manipulation items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5 transition sm:py-2 {dragIdx === i
							? 'opacity-50'
							: ''}"
					>
						<GripVertical class="size-5 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing sm:size-4" />
						{#if pdfEngine.engine}
							<PageThumbnail {file} pageIndex={pageIndex} class="h-14 w-10 shrink-0" />
						{/if}
						<span class="w-8 text-xs font-medium text-muted-foreground">#{i + 1}</span>
						<span class="flex-1 text-sm">Page {pageIndex + 1}</span>
						<Button variant="ghost" size="icon-sm" class="size-10 sm:size-8" disabled={i === 0} onclick={() => movePage(i, -1)} aria-label={ws.a11y.moveUp}>
							<ChevronUp class="size-4" />
						</Button>
						<Button variant="ghost" size="icon-sm" class="size-10 sm:size-8" disabled={i === pageOrder.length - 1} onclick={() => movePage(i, 1)} aria-label={ws.a11y.moveDown}>
							<ChevronDown class="size-4" />
						</Button>
						<Button variant="ghost" size="icon-sm" class="size-10 hover:text-destructive sm:size-8" disabled={pageOrder.length <= 1} onclick={() => removePage(i)} aria-label={ws.a11y.removeFile}>
							<X class="size-4" />
						</Button>
					</div>
				{/each}
			</div>
			<div class="mt-4">
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || pageOrder.length === 0} loading={processing} loadingText="Saving…" onclick={handleOrganize}>
			Download organized PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Thumbnails and blank detection may be unavailable." variant="info" />
	{/if}
	<Alert message={error} />
</div>
