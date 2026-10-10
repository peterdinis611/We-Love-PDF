<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { getAppLocale } from '$lib/i18n/context';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { removeJavascriptAndActions } from '$lib/pdf/remove-js';

	const locale = getAppLocale();
	let file = $state<File | null>(null);
	let notes = $state<string[]>([]);
	let outputName = $state('no-js.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		notes = [];
		try {
			const result = await removeJavascriptAndActions(file);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result.bytes, name);
			lastBytes = result.bytes;
			notes = result.notes;
			success = `Downloaded ${name} (${formatFileSize(result.bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to remove JavaScript.';
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
			<div class="space-y-3">
				<p class="text-sm text-muted-foreground">
					Removes OpenAction, document/page AA, JavaScript name trees, and Launch/JS annotation actions —
					keeps forms, outlines, and normal links.
				</p>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={handle}>Remove JS & actions</ToolAction>
		{#if notes.length}
			<ul class="space-y-1 text-xs text-muted-foreground">
				{#each notes as n}
					<li>• {n}</li>
				{/each}
			</ul>
		{/if}
		<ToolSuccess message={success} />
		<ContinueChain
			bytes={lastBytes}
			filename={outputName}
			{locale}
			suggestions={[
				{ slug: 'sanitize-pdf', label: 'Full sanitize' },
				{ slug: 'protect-pdf', label: 'Protect' }
			]}
		/>
	{/if}
	<Alert message={error} />
</div>
