<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PageSelector from '$lib/components/PageSelector.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		downloadBlob,
		ensurePdfFilename,
		extractPages,
		formatFileSize,
		getPageCount,
		parsePageRanges
	} from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let selected = $state<Set<number>>(new Set());
	let rangeInput = $state('');
	let outputName = $state('extracted.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
			selected = new Set(Array.from({ length: pageCount }, (_, i) => i));
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	function applyRangeInput() {
		if (!rangeInput.trim()) return;
		const ranges = parsePageRanges(rangeInput, pageCount);
		selected = new Set(ranges.flat());
	}

	async function handleExtract() {
		if (!file || selected.size === 0) return;
		processing = true;
		error = '';
		success = '';
		try {
			const indices = [...selected].sort((a, b) => a - b);
			const result = await extractPages(file, indices);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${indices.length} page${indices.length === 1 ? '' : 's'}, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to extract pages.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Select pages to extract ({selected.size} of {pageCount} selected)
			</p>
			<div class="mb-4 flex gap-2">
				<Input bind:value={rangeInput} placeholder="Quick select: 1-3, 5" class="flex-1" />
				<button
					type="button"
					class="rounded-md border border-border px-3 text-sm font-medium hover:bg-muted"
					onclick={applyRangeInput}
				>
					Apply
				</button>
			</div>
			<PageSelector {pageCount} {selected} onchange={(s) => (selected = s)} />
			<div class="mt-4">
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || selected.size === 0} loading={processing} loadingText="Extracting…" onclick={handleExtract}>
			Extract pages
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
