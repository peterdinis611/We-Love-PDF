<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import RecipeBar from '$lib/components/RecipeBar.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPageCount,
		parsePageIndexes
	} from '$lib/pdf/operations';
	import { cancelOcr, makeSearchablePdf, OcrCancelledError } from '$lib/pdf/ocr';
	import { getToolPreset, setToolPreset } from '$lib/tool-presets';
	import { readStringParam, syncToolParams } from '$lib/tool-params';
	import { resolveRecipe } from '$lib/recipes';
	import { onMount } from 'svelte';

	const pdfEngine = usePdfEngineContext();

	const LANG_OPTIONS = [
		{ value: 'eng', label: 'English' },
		{ value: 'slk', label: 'Slovak' },
		{ value: 'ces', label: 'Czech' },
		{ value: 'deu', label: 'German' },
		{ value: 'pol', label: 'Polish' },
		{ value: 'eng+slk+ces', label: 'Auto (EN+SK+CS)' },
		{ value: 'eng+deu+pol', label: 'Auto (EN+DE+PL)' }
	];

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let lang = $state(readStringParam('lang', getToolPreset('ocr-pdf', 'lang', 'eng+slk+ces')));
	let pageRange = $state(readStringParam('pages', getToolPreset('ocr-pdf', 'pages', '')));
	let outputName = $state('searchable.pdf');
	let processing = $state(false);
	let progressLabel = $state('');
	let progressCurrent = $state(0);
	let progressMax = $state(0);
	let error = $state('');
	let success = $state('');

	$effect(() => {
		syncToolParams({ lang, pages: pageRange || undefined });
		setToolPreset('ocr-pdf', 'lang', lang);
		setToolPreset('ocr-pdf', 'pages', pageRange);
	});

	onMount(() => {
		const recipeName = readStringParam('recipe');
		if (!recipeName) return;
		const recipe = resolveRecipe('ocr-pdf', recipeName);
		if (!recipe) return;
		applyRecipe(recipe.params);
	});

	function applyRecipe(params: Record<string, string | number | boolean>) {
		if (typeof params.lang === 'string') lang = params.lang;
		if (typeof params.pages === 'string') pageRange = params.pages;
	}

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			pageCount = await getPageCount(f);
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleOcr() {
		if (!file || !pdfEngine.engine) return;
		const indexes = parsePageIndexes(pageRange, pageCount);
		if (!indexes.length) {
			error = 'Invalid page range.';
			return;
		}
		processing = true;
		error = '';
		success = '';
		progressCurrent = 0;
		progressMax = indexes.length;
		try {
			const result = await makeSearchablePdf(file, pdfEngine.engine as never, {
				lang,
				scaleFactor: 2,
				pageIndexes: indexes,
				onProgress: ({ page, total, status }) => {
					progressCurrent = page;
					progressMax = total;
					progressLabel =
						status === 'ocr'
							? `OCR page ${page} of ${total}…`
							: `Rendering page ${page} of ${total}…`;
				}
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — searchable PDF, ${formatFileSize(result.length)}`;
		} catch (e) {
			if (e instanceof OcrCancelledError) {
				error = 'OCR cancelled.';
			} else {
				error = e instanceof Error ? e.message : 'OCR failed.';
			}
		} finally {
			processing = false;
			progressLabel = '';
			progressCurrent = 0;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Runs OCR in your browser and embeds an invisible text layer.
					{pageCount} page{pageCount === 1 ? '' : 's'} total.
				</p>
				<div>
					<label for="ocr-lang" class="mb-1 block text-sm font-medium">Language</label>
					<select
						id="ocr-lang"
						bind:value={lang}
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
					>
						{#each LANG_OPTIONS as opt}
							<option value={opt.value}>{opt.label}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="ocr-pages" class="mb-1 block text-sm font-medium">Pages (optional)</label>
					<input
						id="ocr-pages"
						class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						bind:value={pageRange}
						placeholder="e.g. 1-3, 5 — leave empty for all"
					/>
				</div>
				<OutputFilename bind:value={outputName} />
				<RecipeBar toolSlug="ocr-pdf" params={{ lang, pages: pageRange }} onApply={applyRecipe} />
			</div>
		</ToolPanel>

		{#if processing}
			<ProgressBar value={progressCurrent} max={progressMax || 1} label={progressLabel} />
		{/if}

		<div class="flex gap-2">
			{#if processing}
				<Button type="button" variant="outline" onclick={() => cancelOcr()}>Cancel</Button>
			{/if}
			<div class="flex-1">
				<ToolAction
					disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
					loading={processing || pdfEngine.isLoading}
					loadingText={processing ? progressLabel || 'Running OCR…' : 'Loading engine…'}
					onclick={handleOcr}
				>
					Make searchable PDF
				</ToolAction>
			</div>
		</div>
		<ToolSuccess message={success} />
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
