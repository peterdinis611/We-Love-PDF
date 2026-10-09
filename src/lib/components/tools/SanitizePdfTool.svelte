<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { sanitizePdf } from '$lib/pdf/sanitize';
	import { getAppLocale } from '$lib/i18n/context';

	let file = $state<File | null>(null);
	let outputName = $state('sanitized.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let notes = $state<string[]>([]);
	let lastBytes = $state<Uint8Array | null>(null);
	const locale = getAppLocale();

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		notes = [];
		try {
			const result = await sanitizePdf(file);
			notes = result.notes;
			const name = ensurePdfFilename(outputName);
			downloadBlob(result.bytes, name);
			lastBytes = result.bytes;
			success = `Downloaded ${name} (${formatFileSize(result.bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to sanitize PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Removes OpenAction/JS hooks, annotations, AcroForm, and cleans metadata for safer sharing.
			</p>
			<OutputFilename bind:value={outputName} />
			{#if notes.length}
				<ul class="mt-3 space-y-1 text-xs text-muted-foreground">
					{#each notes as note}
						<li>• {note}</li>
					{/each}
				</ul>
			{/if}
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Sanitizing…" onclick={handle}>
			Sanitize PDF
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
