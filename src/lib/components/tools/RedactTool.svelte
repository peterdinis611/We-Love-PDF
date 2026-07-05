<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import { MatchFlag, type Rect } from '@embedpdf/models';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let keywords = $state('');
	let caseSensitive = $state(false);
	let outputName = $state('redacted.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleRedact() {
		if (!file || !pdfEngine.engine) return;
		const terms = keywords
			.split('\n')
			.map((k) => k.trim())
			.filter(Boolean);
		if (!terms.length) {
			error = 'Enter at least one word or phrase to redact.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'redact', content: buffer })
				.toPromise();

			const flags = caseSensitive ? [MatchFlag.MatchCase] : [];
			const rectsByPage = new Map<number, Rect[]>();

			for (const term of terms) {
				const { results } = await pdfEngine.engine
					.searchAllPages(doc, term, { flags })
					.toPromise();
				for (const hit of results) {
					const existing = rectsByPage.get(hit.pageIndex) ?? [];
					existing.push(...hit.rects);
					rectsByPage.set(hit.pageIndex, existing);
				}
			}

			let redactionCount = 0;
			for (const [pageIndex, rects] of rectsByPage) {
				const page = doc.pages[pageIndex];
				if (!page || !rects.length) continue;
				await pdfEngine.engine
					.redactTextInRects(doc, page, rects, { drawBlackBoxes: true })
					.toPromise();
				await pdfEngine.engine.applyAllRedactions(doc, page).toPromise();
				redactionCount += rects.length;
			}

			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `Downloaded ${name} — ${redactionCount} area${redactionCount === 1 ? '' : 's'} redacted, ${formatFileSize(result.byteLength)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to redact PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to redact sensitive text" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<label for="redact-keywords" class="mb-1 block text-sm font-medium">Words or phrases to redact</label>
					<textarea
						id="redact-keywords"
						bind:value={keywords}
						rows="6"
						class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
						placeholder="One term per line&#10;CONFIDENTIAL&#10;john@example.com"
					></textarea>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" class="size-4 rounded border-input accent-primary" bind:checked={caseSensitive} />
					Case-sensitive search
				</label>
				<p class="text-xs text-muted-foreground">
					Matched text is permanently removed and replaced with black boxes.
				</p>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !keywords.trim() || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			loadingText={pdfEngine.isLoading ? 'Loading engine…' : 'Redacting…'}
			onclick={handleRedact}
		>
			Redact PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
