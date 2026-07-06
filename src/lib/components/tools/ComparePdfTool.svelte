<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { comparePageTexts, type PageComparison } from '$lib/pdf/compare';

	const pdfEngine = usePdfEngineContext();

	let leftFile = $state<File | null>(null);
	let rightFile = $state<File | null>(null);
	let comparisons = $state<PageComparison[] | null>(null);
	let loading = $state(false);
	let error = $state('');

	async function extractAllPages(file: File): Promise<string[]> {
		if (!pdfEngine.engine) throw new Error('PDF engine not ready.');
		const buffer = await file.arrayBuffer();
		const doc = await pdfEngine.engine
			.openDocumentBuffer({ id: `compare-${file.name}`, content: buffer })
			.toPromise();
		const pages: string[] = [];
		for (let i = 0; i < doc.pages.length; i++) {
			pages.push(await pdfEngine.engine.extractText(doc, [i]).toPromise());
		}
		return pages;
	}

	async function compare() {
		if (!leftFile || !rightFile || !pdfEngine.engine) return;
		loading = true;
		error = '';
		comparisons = null;
		try {
			const [leftPages, rightPages] = await Promise.all([
				extractAllPages(leftFile),
				extractAllPages(rightFile)
			]);
			comparisons = comparePageTexts(leftPages, rightPages);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compare PDFs.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="space-y-2">
			<p class="text-sm font-medium">Original PDF</p>
			{#if leftFile}
				<FileListItem name={leftFile.name} size={leftFile.size} onremove={() => { leftFile = null; comparisons = null; }} />
			{:else}
				<FileDropzone label="Select first PDF" hint="original version" onfiles={(f) => { leftFile = f[0]; comparisons = null; }} />
			{/if}
		</div>
		<div class="space-y-2">
			<p class="text-sm font-medium">Revised PDF</p>
			{#if rightFile}
				<FileListItem name={rightFile.name} size={rightFile.size} onremove={() => { rightFile = null; comparisons = null; }} />
			{:else}
				<FileDropzone label="Select second PDF" hint="revised version" onfiles={(f) => { rightFile = f[0]; comparisons = null; }} />
			{/if}
		</div>
	</div>

	{#if leftFile && rightFile}
		<ToolAction
			disabled={loading || pdfEngine.isLoading || !pdfEngine.engine}
			loading={loading || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Comparing…'}
			onclick={compare}
		>
			Compare PDFs
		</ToolAction>
	{/if}

	{#if comparisons}
		{@const changed = comparisons.filter((c) => !c.equal).length}
		<ToolPanel>
			<p class="mb-4 text-sm">
				<strong class="text-foreground">{changed}</strong> of
				<strong class="text-foreground">{comparisons.length}</strong> page{comparisons.length === 1 ? '' : 's'} differ by text content.
			</p>
			<div class="space-y-4">
				{#each comparisons as item}
					<div class="rounded-lg border border-border/60 p-3">
						<div class="mb-2 flex items-center justify-between">
							<p class="text-sm font-medium">Page {item.page}</p>
							<span class="rounded-full px-2 py-0.5 text-xs font-medium {item.equal ? 'bg-green-500/10 text-green-700' : 'bg-amber-500/10 text-amber-700'}">
								{item.equal ? 'Identical' : 'Different'}
							</span>
						</div>
						{#if !item.equal}
							<div class="max-h-40 space-y-1 overflow-auto rounded bg-muted/40 p-2 font-mono text-xs">
								{#each item.lines as line}
									<div class={line.type === 'add'
										? 'text-green-700'
										: line.type === 'remove'
											? 'text-red-700 line-through'
											: 'text-muted-foreground'}>
										{line.type === 'add' ? '+ ' : line.type === 'remove' ? '− ' : '  '}{line.text}
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</ToolPanel>
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
