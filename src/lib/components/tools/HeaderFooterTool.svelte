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
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { addHeaderFooter } from '$lib/pdf/layout-ops';
	import { getAppLocale } from '$lib/i18n/context';

	let file = $state<File | null>(null);
	let header = $state('');
	let footer = $state('');
	let includePageNumber = $state(true);
	let fontSize = $state(10);
	let outputName = $state('header-footer.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);
	const locale = getAppLocale();

	async function handle() {
		if (!file) return;
		if (!header && !footer && !includePageNumber) {
			error = 'Enter a header, footer, or enable page numbers.';
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await addHeaderFooter(file, { header, footer, fontSize, includePageNumber });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add header/footer.';
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
				<div>
					<label for="hdr" class="mb-1 block text-sm font-medium">Header</label>
					<Input id="hdr" bind:value={header} placeholder="Company name / document title" />
				</div>
				<div>
					<label for="ftr" class="mb-1 block text-sm font-medium">Footer</label>
					<Input id="ftr" bind:value={footer} placeholder="Confidential · Draft" />
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={includePageNumber} class="accent-primary" />
					Include page numbers in footer
				</label>
				<div>
					<label for="fs" class="mb-1 block text-sm font-medium">Font size: {fontSize}</label>
					<input id="fs" type="range" min="8" max="16" bind:value={fontSize} class="w-full accent-primary" />
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Applying…" onclick={handle}>
			Apply header &amp; footer
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
