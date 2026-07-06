<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PageThumbnail from '$lib/components/PageThumbnail.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize, getPageCount, organizePdf } from '$lib/pdf/operations';
	import { ChevronDown, ChevronUp, X, RotateCcw, GripVertical, ArrowDownAZ, Eraser } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let pageOrder = $state<number[]>([]);
	let dragIdx = $state<number | null>(null);
	let outputName = $state('organized.pdf');
	let processing = $state(false);
	let removingBlanks = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			const count = await getPageCount(f);
			pageOrder = Array.from({ length: count }, (_, i) => i);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	function movePage(idx: number, direction: -1 | 1) {
		const newIdx = idx + direction;
		if (newIdx < 0 || newIdx >= pageOrder.length) return;
		const updated = [...pageOrder];
		[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]];
		pageOrder = updated;
	}

	function removePage(idx: number) {
		if (pageOrder.length <= 1) return;
		pageOrder = pageOrder.filter((_, i) => i !== idx);
	}

	function reverseOrder() {
		pageOrder = [...pageOrder].reverse();
	}

	function sortByPageNumber() {
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
		const updated = [...pageOrder];
		const [moved] = updated.splice(dragIdx, 1);
		updated.splice(targetIdx, 0, moved);
		pageOrder = updated;
		dragIdx = null;
	}

	function onDragEnd() {
		dragIdx = null;
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
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to organize pages" onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="mb-3 flex flex-wrap items-center justify-between gap-2">
				<p class="text-sm text-muted-foreground">Drag to reorder pages. Use actions to sort or clean up.</p>
				<div class="flex flex-wrap gap-2">
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
			<div class="space-y-2">
				{#each pageOrder as pageIndex, i (i)}
					<div
						role="listitem"
						draggable="true"
						ondragstart={() => onDragStart(i)}
						ondragover={onDragOver}
						ondrop={() => onDrop(i)}
						ondragend={onDragEnd}
						class="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2 transition {dragIdx === i
							? 'opacity-50'
							: ''}"
					>
						<GripVertical class="size-4 shrink-0 cursor-grab text-muted-foreground active:cursor-grabbing" />
						{#if pdfEngine.engine}
							<PageThumbnail {file} pageIndex={pageIndex} class="h-14 w-10 shrink-0" />
						{/if}
						<span class="w-8 text-xs font-medium text-muted-foreground">#{i + 1}</span>
						<span class="flex-1 text-sm">Page {pageIndex + 1}</span>
						<Button variant="ghost" size="icon-sm" disabled={i === 0} onclick={() => movePage(i, -1)} aria-label="Move up">
							<ChevronUp class="size-4" />
						</Button>
						<Button variant="ghost" size="icon-sm" disabled={i === pageOrder.length - 1} onclick={() => movePage(i, 1)} aria-label="Move down">
							<ChevronDown class="size-4" />
						</Button>
						<Button variant="ghost" size="icon-sm" disabled={pageOrder.length <= 1} onclick={() => removePage(i)} aria-label="Remove page" class="hover:text-destructive">
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
