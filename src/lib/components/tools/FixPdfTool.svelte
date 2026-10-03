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
		formatFileSize
	} from '$lib/pdf/operations';
	import { repairPdf, type RepairReport } from '$lib/pdf/repair';

	let file = $state<File | null>(null);
	let outputName = $state('repaired.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let report = $state<RepairReport | null>(null);
	let lastDownload = $state<{ bytes: Uint8Array; name: string } | null>(null);

	async function handleRepair() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		report = null;
		lastDownload = null;
		try {
			const result = await repairPdf(file);
			report = result;
			const name = ensurePdfFilename(outputName);
			downloadBlob(result.bytes, name);
			lastDownload = { bytes: result.bytes, name };
			const saved = compressionRatio(result.originalSize, result.repairedSize);
			success = `Downloaded ${name} — ${result.pageCount} pages rebuilt${saved !== 0 ? ` (${saved > 0 ? '−' : '+'}${Math.abs(saved)}% size)` : ''}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to repair PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem
			name={file.name}
			size={file.size}
			onremove={() => {
				file = null;
				report = null;
				success = '';
			}}
		/>
		<ToolPanel>
			<p class="mb-4 text-sm text-muted-foreground">
				Rebuilds the PDF structure by copying every page into a fresh document. Helps with broken
				xref tables, incremental updates, and many “cannot open” errors — when page content is still
				readable.
			</p>
			<OutputFilename bind:value={outputName} />
			{#if report}
				<ul class="mt-4 space-y-1 text-xs text-muted-foreground">
					{#each report.notes as note}
						<li>• {note}</li>
					{/each}
					<li>
						• Size: {formatFileSize(report.originalSize)} → {formatFileSize(report.repairedSize)}
					</li>
				</ul>
			{/if}
		</ToolPanel>
		<ToolAction
			disabled={processing}
			loading={processing}
			loadingText="Repairing…"
			onclick={handleRepair}
		>
			Fix PDF
		</ToolAction>
		<ToolSuccess
			message={success}
			onRedownload={lastDownload
				? () => downloadBlob(lastDownload!.bytes, lastDownload!.name)
				: undefined}
		/>
	{/if}
	<Alert message={error} />
</div>
