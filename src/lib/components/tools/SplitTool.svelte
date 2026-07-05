<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, getPageCount, parsePageRanges, splitPdf } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let mode = $state<'all' | 'range' | 'every'>('all');
	let rangeInput = $state('1-3, 5');
	let everyN = $state(1);
	let processing = $state(false);
	let error = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		try {
			pageCount = await getPageCount(f);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleSplit() {
		if (!file) return;
		processing = true;
		error = '';

		try {
			let ranges: number[][];

			if (mode === 'all') {
				ranges = Array.from({ length: pageCount }, (_, i) => [i]);
			} else if (mode === 'every') {
				ranges = [];
				for (let i = 0; i < pageCount; i += everyN) {
					const end = Math.min(i + everyN, pageCount);
					ranges.push(Array.from({ length: end - i }, (_, j) => i + j));
				}
			} else {
				ranges = parsePageRanges(rangeInput, pageCount);
				if (!ranges.length) {
					error = 'Invalid page range. Use format like "1-3, 5, 7-9".';
					return;
				}
			}

			const results = await splitPdf(file, ranges);
			if (!results.length) {
				error = 'No pages matched your selection.';
				return;
			}
			results.forEach((bytes, i) => {
				downloadBlob(bytes, `split-${i + 1}.pdf`);
			});
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to split PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to split" onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />

		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				This PDF has <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1 ? '' : 's'}.
			</p>
			<div class="space-y-2">
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition hover:bg-muted/50">
					<input type="radio" bind:group={mode} value="all" class="accent-primary" />
					<span class="text-sm font-medium">Split into individual pages</span>
				</label>
				<label class="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 transition hover:bg-muted/50">
					<input type="radio" bind:group={mode} value="every" class="accent-primary" />
					<span class="text-sm font-medium">Split every</span>
					<Input type="number" bind:value={everyN} min={1} max={pageCount} class="h-8 w-16" />
					<span class="text-sm text-muted-foreground">pages</span>
				</label>
				<label class="flex cursor-pointer items-start gap-3 rounded-lg border border-border p-3 transition hover:bg-muted/50">
					<input type="radio" bind:group={mode} value="range" class="mt-1 accent-primary" />
					<div class="flex-1 space-y-2">
						<span class="text-sm font-medium">Custom ranges</span>
						<Input bind:value={rangeInput} placeholder="e.g. 1-3, 5, 7-9" />
					</div>
				</label>
			</div>
		</ToolPanel>

		<ToolAction disabled={processing} loading={processing} loadingText="Splitting…" onclick={handleSplit}>
			Split PDF
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
