<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { exportPdfA, type PdfAResult } from '$lib/pdf/pdfa';

	const pdfEngine = usePdfEngineContext();

	type Conformance = 'PDF/A-1b' | 'PDF/A-2b';

	let file = $state<File | null>(null);
	let outputName = $state('archive-pdfa.pdf');
	let conformance = $state<Conformance>('PDF/A-2b');
	let flattenFirst = $state(true);
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let result = $state<PdfAResult | null>(null);
	let lastDownload = $state<{ bytes: Uint8Array; name: string } | null>(null);

	async function flattenBytes(input: File): Promise<Uint8Array> {
		if (!pdfEngine.engine) throw new Error('PDF engine not ready.');
		const buffer = await input.arrayBuffer();
		const doc = await pdfEngine.engine
			.openDocumentBuffer({ id: 'pdfa-flatten', content: buffer })
			.toPromise();
		for (const page of doc.pages) {
			await pdfEngine.engine.flattenPage(doc, page).toPromise();
		}
		return new Uint8Array(await pdfEngine.engine.saveAsCopy(doc).toPromise());
	}

	async function handleExport() {
		if (!file) return;
		if (flattenFirst && !pdfEngine.engine) return;

		processing = true;
		error = '';
		success = '';
		result = null;
		lastDownload = null;
		try {
			let preflattened: Uint8Array | undefined;
			if (flattenFirst) {
				preflattened = await flattenBytes(file);
			}
			const exported = await exportPdfA(file, { preflattened, conformance });
			result = exported;
			const name = ensurePdfFilename(outputName);
			downloadBlob(exported.bytes, name);
			lastDownload = { bytes: exported.bytes, name };
			success = `Downloaded ${name} — ${exported.conformance} ready (${exported.pageCount} pages, ${formatFileSize(exported.bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to export PDF/A.';
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
				result = null;
				success = '';
			}}
		/>
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Create an archival PDF/A-<em>ready</em> file: flatten forms, clean metadata, and embed a
					PDF/A identification packet. Best for long-term storage — run a preflight validator before
					official submission.
				</p>
				<div>
					<p class="mb-2 text-sm font-medium">Conformance target</p>
					<div class="flex flex-wrap gap-2">
						{#each ['PDF/A-2b', 'PDF/A-1b'] as value}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {conformance === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (conformance = value as Conformance)}
							>
								{value}
							</button>
						{/each}
					</div>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={flattenFirst} class="accent-primary" />
					Flatten forms &amp; annotations first (recommended)
				</label>
				<OutputFilename bind:value={outputName} />
				{#if result}
					<ul class="space-y-1 text-xs text-muted-foreground">
						{#each result.notes as note}
							<li>• {note}</li>
						{/each}
					</ul>
				{/if}
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || (flattenFirst && (pdfEngine.isLoading || !pdfEngine.engine))}
			loading={processing || (flattenFirst && pdfEngine.isLoading)}
			loadingText={processing ? 'Exporting PDF/A…' : 'Loading engine…'}
			onclick={handleExport}
		>
			Export PDF/A
		</ToolAction>
		<ToolSuccess
			message={success}
			onRedownload={lastDownload
				? () => downloadBlob(lastDownload!.bytes, lastDownload!.name)
				: undefined}
		/>
	{/if}
	{#if pdfEngine.error && flattenFirst}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
