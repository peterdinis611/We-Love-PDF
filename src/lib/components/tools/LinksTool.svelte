<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { linksToCsv, listPdfLinks, rewritePdfLinks, type PdfLinkRow } from '$lib/pdf/links';

	const pdfEngine = usePdfEngineContext();
	let file = $state<File | null>(null);
	let rows = $state<PdfLinkRow[]>([]);
	let find = $state('');
	let replace = $state('');
	let outputName = $state('links-updated.pdf');
	let processing = $state(false);
	let loading = $state(false);
	let error = $state('');
	let success = $state('');

	async function load(f: File) {
		if (!pdfEngine.engine) return;
		file = f;
		loading = true;
		error = '';
		success = '';
		try {
			rows = await listPdfLinks(f, pdfEngine.engine as never);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to list links.';
			rows = [];
		} finally {
			loading = false;
		}
	}

	async function exportCsv() {
		const csv = linksToCsv(rows);
		downloadBlob(new TextEncoder().encode(csv), 'pdf-links.csv', 'text/csv');
		success = `Exported ${rows.length} link${rows.length === 1 ? '' : 's'} to CSV.`;
	}

	async function applyReplace() {
		if (!file || !pdfEngine.engine || !find) {
			error = 'Enter text to find in URLs.';
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const { bytes, changed } = await rewritePdfLinks(file, pdfEngine.engine as never, {
				find,
				replace
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `Downloaded ${name} — ${changed} link${changed === 1 ? '' : 's'} updated, ${formatFileSize(bytes.length)}`;
			await load(new File([bytes.slice()], name, { type: 'application/pdf' }));
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to rewrite links.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => load(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; rows = []; }} />
		<ToolPanel>
			<div class="space-y-4">
				{#if loading}
					<p class="text-sm text-muted-foreground">Scanning links…</p>
				{:else if !rows.length}
					<p class="text-sm text-muted-foreground">No URI link annotations found.</p>
				{:else}
					<p class="text-sm font-medium">{rows.length} link{rows.length === 1 ? '' : 's'}</p>
					<ul class="max-h-48 space-y-1 overflow-auto text-xs">
						{#each rows.slice(0, 100) as row}
							<li class="truncate text-muted-foreground">
								p.{row.pageIndex + 1}: {row.uri}
							</li>
						{/each}
						{#if rows.length > 100}
							<li class="text-muted-foreground">…and {rows.length - 100} more</li>
						{/if}
					</ul>
					<ToolAction disabled={processing} onclick={exportCsv}>Export CSV</ToolAction>
				{/if}
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="find" class="mb-1 block text-sm font-medium">Find in URLs</label>
						<Input id="find" bind:value={find} placeholder="http://old.example" />
					</div>
					<div>
						<label for="replace" class="mb-1 block text-sm font-medium">Replace with</label>
						<Input id="replace" bind:value={replace} placeholder="https://new.example" />
					</div>
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !find || pdfEngine.isLoading}
			loading={processing}
			onclick={applyReplace}
		>
			Rewrite links
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
