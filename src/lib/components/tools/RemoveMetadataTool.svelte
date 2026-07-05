<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import {
		compressionRatio,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPdfInfo,
		removeAllMetadata,
		type PdfInfo
	} from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let info = $state<PdfInfo | null>(null);
	let outputName = $state('metadata-removed.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			info = await getPdfInfo(f);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
			info = null;
		}
	}

	async function handleRemove() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await removeAllMetadata(file);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			const saved = compressionRatio(file.size, result.length);
			success = `Downloaded ${name} — title, author, subject, keywords, creator, and producer removed${saved > 0 ? ` (${saved}% smaller)` : ''}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove metadata.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to strip metadata" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; info = null; }} />
		{#if info}
			<ToolPanel>
				<p class="mb-3 text-sm font-medium">Current metadata</p>
				<dl class="divide-y divide-border text-sm">
					{#each [
						['Title', info.title],
						['Author', info.author],
						['Subject', info.subject],
						['Creator', info.creator],
						['Producer', info.producer]
					] as [label, value]}
						<div class="flex justify-between gap-4 py-2">
							<dt class="text-muted-foreground">{label}</dt>
							<dd class="text-right font-medium">{value || '—'}</dd>
						</div>
					{/each}
				</dl>
			</ToolPanel>
		{/if}
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Removes document properties for privacy before sharing. Page content is unchanged.
			</p>
			<OutputFilename bind:value={outputName} />
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Removing metadata…" onclick={handleRemove}>
			Remove metadata
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
