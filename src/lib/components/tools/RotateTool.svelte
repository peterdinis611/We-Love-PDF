<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import PageSelector from '$lib/components/PageSelector.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize, getPageCount, rotateAllPages, rotatePdf } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let mode = $state<'all' | 'pages'>('all');
	let angle = $state<90 | 180 | 270>(90);
	let selectedPages = $state<Set<number>>(new Set());
	let outputName = $state('rotated.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
			selectedPages = new Set(Array.from({ length: pageCount }, (_, i) => i));
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleRotate() {
		if (!file) return;
		if (mode === 'pages' && selectedPages.size === 0) {
			error = 'Select at least one page.';
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const result =
				mode === 'all'
					? await rotateAllPages(file, angle)
					: await rotatePdf(
							file,
							new Map([...selectedPages].map((p) => [p, angle] as const))
						);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			const count = mode === 'all' ? pageCount : selectedPages.size;
			success = `Downloaded ${name} — rotated ${count} page${count === 1 ? '' : 's'} by ${angle}°, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to rotate PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to rotate" onfiles={(files) => setFile(files[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-3 text-sm font-medium">Rotation angle</p>
			<div class="mb-4 flex gap-2">
				{#each [90, 180, 270] as a}
					<Button
						variant={angle === a ? 'default' : 'outline'}
						class="flex-1"
						onclick={() => (angle = a as 90 | 180 | 270)}
					>
						{a}°
					</Button>
				{/each}
			</div>
			<p class="mb-2 text-sm font-medium">Apply to</p>
			<div class="mb-3 space-y-2">
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="radio" bind:group={mode} value="all" class="accent-primary" />
					All pages ({pageCount})
				</label>
				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="radio" bind:group={mode} value="pages" class="accent-primary" />
					Selected pages only
				</label>
			</div>
			{#if mode === 'pages'}
				<PageSelector {pageCount} selected={selectedPages} onchange={(s) => (selectedPages = s)} />
			{/if}
			<div class="mt-4">
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Rotating…" onclick={handleRotate}>
			Rotate PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
