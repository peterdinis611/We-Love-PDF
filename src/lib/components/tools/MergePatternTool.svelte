<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import {
		createFileId,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		type PdfFile
	} from '$lib/pdf/operations';
	import { matchFilenamePattern, mergeByFilenamePattern } from '$lib/pdf/merge-pattern';

	const locale = getAppLocale();
	let files = $state<PdfFile[]>([]);
	let pattern = $state('*_invoice.pdf');
	let outputName = $state('merged.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);

	const matchedNames = $derived(
		files
			.filter((f) => matchFilenamePattern(f.name, pattern))
			.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
			.map((f) => f.name)
	);

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
	}

	async function handle() {
		if (!files.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const { bytes, matched } = await mergeByFilenamePattern(
				files.map((f) => f.file),
				pattern
			);
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} — merged ${matched.length} file${matched.length === 1 ? '' : 's'}, ${formatFileSize(bytes.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Merge failed.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	<FileDropzone multiple onfiles={addFiles} />
	{#each files as f (f.id)}
		<FileListItem
			name={f.name}
			size={f.size}
			onremove={() => (files = files.filter((x) => x.id !== f.id))}
		/>
	{/each}
	{#if files.length}
		<ToolPanel>
			<div class="space-y-3">
				<div>
					<label for="pattern" class="mb-1 block text-sm font-medium">Filename pattern</label>
					<Input id="pattern" bind:value={pattern} placeholder="*_invoice.pdf" />
					<p class="mt-1 text-xs text-muted-foreground">Use * and ? wildcards. Matched files merge A→Z.</p>
				</div>
				{#if matchedNames.length}
					<p class="text-sm text-muted-foreground">
						Will merge ({matchedNames.length}): {matchedNames.join(', ')}
					</p>
				{:else}
					<p class="text-sm text-amber-600 dark:text-amber-400">No files match this pattern yet.</p>
				{/if}
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !matchedNames.length}
			loading={processing}
			onclick={handle}
		>
			Merge matched
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
