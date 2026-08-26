<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import { comparePageTexts, type PageComparison } from '$lib/pdf/compare';
	import { diffPageImages, type VisualPageDiff } from '$lib/pdf/visual-diff';

	const pdfEngine = usePdfEngineContext();

	type Mode = 'text' | 'visual' | 'both';

	let leftFile = $state<File | null>(null);
	let rightFile = $state<File | null>(null);
	let mode = $state<Mode>('both');
	let comparisons = $state<PageComparison[] | null>(null);
	let visuals = $state<VisualPageDiff[] | null>(null);
	let loading = $state(false);
	let progress = $state(0);
	let progressMax = $state(0);
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
		visuals = null;
		progress = 0;
		progressMax = 0;
		try {
			if (mode === 'text' || mode === 'both') {
				const [leftPages, rightPages] = await Promise.all([
					extractAllPages(leftFile),
					extractAllPages(rightFile)
				]);
				comparisons = comparePageTexts(leftPages, rightPages);
			}

			if (mode === 'visual' || mode === 'both') {
				const leftBuf = await leftFile.arrayBuffer();
				const rightBuf = await rightFile.arrayBuffer();
				const leftDoc = await pdfEngine.engine
					.openDocumentBuffer({ id: 'compare-vis-l', content: leftBuf })
					.toPromise();
				const rightDoc = await pdfEngine.engine
					.openDocumentBuffer({ id: 'compare-vis-r', content: rightBuf })
					.toPromise();
				const count = Math.max(leftDoc.pages.length, rightDoc.pages.length);
				progressMax = count;
				const results: VisualPageDiff[] = [];

				for (let i = 0; i < count; i++) {
					progress = i + 1;
					const lp = leftDoc.pages[i];
					const rp = rightDoc.pages[i];
					if (!lp || !rp) {
						results.push({
							page: i + 1,
							diffRatio: 1,
							equal: false,
							leftUrl: '',
							rightUrl: '',
							diffUrl: null
						});
						continue;
					}
					const [leftBlob, rightBlob] = await Promise.all([
						pdfEngine.engine.renderPage(leftDoc, lp, { scaleFactor: 1.25 }).toPromise(),
						pdfEngine.engine.renderPage(rightDoc, rp, { scaleFactor: 1.25 }).toPromise()
					]);
					const diff = await diffPageImages(leftBlob, rightBlob);
					results.push({ page: i + 1, ...diff });
				}
				visuals = results;
			}
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compare PDFs.';
		} finally {
			loading = false;
			progress = 0;
		}
	}
</script>

<div class="space-y-4">
	<div class="grid gap-4 sm:grid-cols-2">
		<div class="space-y-2">
			<p class="text-sm font-medium">Original PDF</p>
			{#if leftFile}
				<FileListItem
					name={leftFile.name}
					size={leftFile.size}
					onremove={() => {
						leftFile = null;
						comparisons = null;
						visuals = null;
					}}
				/>
			{:else}
				<FileDropzone
					onfiles={(f) => {
						leftFile = f[0];
						comparisons = null;
						visuals = null;
					}}
				/>
			{/if}
		</div>
		<div class="space-y-2">
			<p class="text-sm font-medium">Revised PDF</p>
			{#if rightFile}
				<FileListItem
					name={rightFile.name}
					size={rightFile.size}
					onremove={() => {
						rightFile = null;
						comparisons = null;
						visuals = null;
					}}
				/>
			{:else}
				<FileDropzone
					onfiles={(f) => {
						rightFile = f[0];
						comparisons = null;
						visuals = null;
					}}
				/>
			{/if}
		</div>
	</div>

	{#if leftFile && rightFile}
		<ToolPanel>
			<div class="flex flex-wrap gap-2">
				{#each [
					['both', 'Text + visual'],
					['text', 'Text only'],
					['visual', 'Visual only']
				] as [value, label]}
					<button
						type="button"
						class="rounded-full px-3 py-1.5 text-xs font-medium transition {mode === value
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary text-secondary-foreground'}"
						onclick={() => (mode = value as Mode)}
					>
						{label}
					</button>
				{/each}
			</div>
		</ToolPanel>
		{#if loading && progressMax > 0}
			<ProgressBar value={progress} max={progressMax} label="Comparing page {progress} of {progressMax}…" />
		{/if}
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
				<strong class="text-foreground">{comparisons.length}</strong> page{comparisons.length === 1
					? ''
					: 's'} differ by text.
			</p>
			<div class="space-y-4">
				{#each comparisons as item}
					<div class="rounded-lg border border-border/60 p-3">
						<div class="mb-2 flex items-center justify-between">
							<p class="text-sm font-medium">Page {item.page}</p>
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium {item.equal
									? 'bg-green-500/10 text-green-700'
									: 'bg-amber-500/10 text-amber-700'}"
							>
								{item.equal ? 'Identical' : 'Different'}
							</span>
						</div>
						{#if !item.equal}
							<div class="max-h-40 space-y-1 overflow-auto rounded bg-muted/40 p-2 font-mono text-xs">
								{#each item.lines as line}
									<div
										class={line.type === 'add'
											? 'text-green-700'
											: line.type === 'remove'
												? 'text-red-700 line-through'
												: 'text-muted-foreground'}
									>
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

	{#if visuals}
		{@const changed = visuals.filter((v) => !v.equal).length}
		<ToolPanel>
			<p class="mb-4 text-sm">
				<strong class="text-foreground">{changed}</strong> of
				<strong class="text-foreground">{visuals.length}</strong> page{visuals.length === 1
					? ''
					: 's'} differ visually.
			</p>
			<div class="space-y-6">
				{#each visuals as item}
					<div class="rounded-lg border border-border/60 p-3">
						<div class="mb-3 flex items-center justify-between">
							<p class="text-sm font-medium">Page {item.page}</p>
							<span
								class="rounded-full px-2 py-0.5 text-xs font-medium {item.equal
									? 'bg-green-500/10 text-green-700'
									: 'bg-amber-500/10 text-amber-700'}"
							>
								{item.equal ? 'Identical' : `${(item.diffRatio * 100).toFixed(1)}% pixels differ`}
							</span>
						</div>
						{#if !item.equal && item.leftUrl}
							<div class="grid gap-2 sm:grid-cols-3">
								<figure>
									<img src={item.leftUrl} alt="Original page {item.page}" class="w-full rounded border" />
									<figcaption class="mt-1 text-center text-xs text-muted-foreground">Original</figcaption>
								</figure>
								<figure>
									<img src={item.rightUrl} alt="Revised page {item.page}" class="w-full rounded border" />
									<figcaption class="mt-1 text-center text-xs text-muted-foreground">Revised</figcaption>
								</figure>
								{#if item.diffUrl}
									<figure>
										<img src={item.diffUrl} alt="Diff page {item.page}" class="w-full rounded border" />
										<figcaption class="mt-1 text-center text-xs text-muted-foreground">Diff</figcaption>
									</figure>
								{/if}
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
