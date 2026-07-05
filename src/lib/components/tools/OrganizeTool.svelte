<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { downloadBlob, getPageCount, organizePdf } from '$lib/pdf/operations';
	import { ChevronDown, ChevronUp, X } from '@lucide/svelte';

	let file = $state<File | null>(null);
	let pageOrder = $state<number[]>([]);
	let processing = $state(false);
	let error = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
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

	async function handleOrganize() {
		if (!file || !pageOrder.length) return;
		processing = true;
		error = '';
		try {
			const result = await organizePdf(file, pageOrder);
			downloadBlob(result, 'organized.pdf');
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
			<p class="mb-3 text-sm text-muted-foreground">Reorder or remove pages, then download.</p>
			<div class="space-y-2">
				{#each pageOrder as pageIndex, i (i)}
					<div class="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
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
		</ToolPanel>
		<ToolAction disabled={processing || pageOrder.length === 0} loading={processing} loadingText="Saving…" onclick={handleOrganize}>
			Download organized PDF
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
