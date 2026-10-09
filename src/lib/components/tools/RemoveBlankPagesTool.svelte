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
	import { removeBlankPages } from '$lib/pdf/layout-ops';
	import { getAppLocale } from '$lib/i18n/context';

	let file = $state<File | null>(null);
	let outputName = $state('no-blanks.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);
	const locale = getAppLocale();

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await removeBlankPages(file);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result.bytes, name);
			lastBytes = result.bytes;
			success = `Downloaded ${name} — removed ${result.removed}, kept ${result.kept} (${formatFileSize(result.bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove blank pages.';
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
				Drops pages with little or no content stream data (typical blank leftovers after scans or
				exports).
			</p>
			<OutputFilename bind:value={outputName} />
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Scanning…" onclick={handle}>
			Remove blank pages
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
