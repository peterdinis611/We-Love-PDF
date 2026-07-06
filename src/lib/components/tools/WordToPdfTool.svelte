<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { docxToPdf } from '$lib/pdf/office';
	import type { ConvertPageSize } from '$lib/pdf/convert';

	let file = $state<File | null>(null);
	let title = $state('');
	let pageSize = $state<ConvertPageSize>('a4');
	let outputName = $state('document.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	function setFile(f: File) {
		file = f;
		error = '';
		success = '';
	}

	async function handleConvert() {
		if (!file) return;

		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const result = await docxToPdf(buffer, {
				pageSize,
				title: title.trim() || file.name.replace(/\.docx$/i, '')
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert Word to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select Word file"
			hint="or drop a .docx file (Office Open XML)"
			accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
			onfiles={(f) => setFile(f[0])}
		/>
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Converts .docx to PDF via HTML. Headings, lists, and basic formatting are preserved; complex layout, images, and legacy .doc files are not fully supported.
				</p>
				<div>
					<label for="word-title" class="mb-1 block text-sm font-medium">Document title (optional)</label>
					<Input id="word-title" bind:value={title} placeholder="Report title" />
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Page size</p>
					<div class="flex flex-wrap gap-2">
						{#each [['a4', 'A4'], ['letter', 'Letter']] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {pageSize === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
								onclick={() => (pageSize = value as ConvertPageSize)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Converting…" onclick={handleConvert}>
			Convert to PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
