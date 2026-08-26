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
	import { compressionRatio, downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { compressPdf as compressPdfHeavy } from '$lib/pdf/heavy';
	import { compressPdfRaster } from '$lib/pdf/compress-raster';
	import { getToolPreset, setToolPreset } from '$lib/tool-presets';
	import { readNumberParam, readStringParam, syncToolParams } from '$lib/tool-params';
	import { resolveRecipe } from '$lib/recipes';
	import { Button } from '$lib/components/ui/button/index.js';
	import { onMount } from 'svelte';

	const pdfEngine = usePdfEngineContext();

	type Mode = 'light' | 'strong';

	let file = $state<File | null>(null);
	let outputName = $state('compressed.pdf');
	let mode = $state<Mode>(
		(readStringParam('mode', getToolPreset('compress-pdf', 'mode', 'light')) as Mode) || 'light'
	);
	let quality = $state(
		readNumberParam('quality', getToolPreset<number>('compress-pdf', 'quality', 0.72))
	);
	let scaleFactor = $state(
		readNumberParam('scale', getToolPreset<number>('compress-pdf', 'scale', 1.5))
	);
	let processing = $state(false);
	let progressCurrent = $state(0);
	let progressMax = $state(0);
	let error = $state('');
	let success = $state('');
	let result = $state<{ original: number; compressed: number } | null>(null);
	let lastDownload = $state<{ bytes: Uint8Array; name: string } | null>(null);
	let abort: AbortController | null = null;

	$effect(() => {
		syncToolParams({
			mode,
			quality: mode === 'strong' ? quality : undefined,
			scale: mode === 'strong' ? scaleFactor : undefined
		});
		setToolPreset('compress-pdf', 'mode', mode);
		setToolPreset('compress-pdf', 'quality', quality);
		setToolPreset('compress-pdf', 'scale', scaleFactor);
	});

	onMount(() => {
		const recipeName = readStringParam('recipe');
		if (!recipeName) return;
		const recipe = resolveRecipe('compress-pdf', recipeName);
		if (!recipe) return;
		applyRecipe(recipe.params);
	});

	function applyRecipe(params: Record<string, string | number | boolean>) {
		if (typeof params.mode === 'string') mode = params.mode as Mode;
		if (typeof params.quality === 'number') quality = params.quality;
		if (typeof params.scale === 'number') scaleFactor = params.scale;
	}

	async function handleCompress() {
		if (!file) return;
		if (mode === 'strong' && !pdfEngine.engine) return;

		processing = true;
		error = '';
		success = '';
		result = null;
		lastDownload = null;
		progressCurrent = 0;
		progressMax = 0;
		abort = new AbortController();

		try {
			let bytes: Uint8Array;
			if (mode === 'light') {
				bytes = await compressPdfHeavy(file);
			} else {
				bytes = await compressPdfRaster(file, pdfEngine.engine as never, {
					quality,
					scaleFactor,
					signal: abort.signal,
					onProgress: ({ page, total }) => {
						progressCurrent = page;
						progressMax = total;
					}
				});
			}
			result = { original: file.size, compressed: bytes.length };
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastDownload = { bytes, name };
			const saved = compressionRatio(file.size, bytes.length);
			success = `Downloaded ${name} — saved ${saved}% (${formatFileSize(file.size)} → ${formatFileSize(bytes.length)})`;
		} catch (e) {
			if (e instanceof DOMException && e.name === 'AbortError') {
				error = 'Compression cancelled.';
			} else {
				error = e instanceof Error ? e.message : 'Failed to compress PDF.';
			}
		} finally {
			processing = false;
			abort = null;
			progressCurrent = 0;
		}
	}

	function handleCancel() {
		abort?.abort();
	}
</script>

<div class="space-y-6">
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
				<div>
					<p class="mb-2 text-sm font-medium">Mode</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['light', 'Light (structure)'],
							['strong', 'Strong (rasterize JPEG)']
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
					<p class="mt-2 text-xs text-muted-foreground">
						{#if mode === 'light'}
							Strips metadata and rebuilds object streams. Keeps text selectable.
						{:else}
							Re-renders pages as JPEG. Best for scans; removes text/forms/links.
						{/if}
					</p>
				</div>

				{#if mode === 'strong'}
					<div>
						<label for="cq" class="mb-1 block text-sm font-medium"
							>JPEG quality: {Math.round(quality * 100)}%</label
						>
						<input
							id="cq"
							type="range"
							min="0.4"
							max="0.92"
							step="0.02"
							bind:value={quality}
							class="w-full accent-primary"
						/>
					</div>
					<div>
						<label for="cs" class="mb-1 block text-sm font-medium"
							>Render scale: {scaleFactor.toFixed(2)}×</label
						>
						<input
							id="cs"
							type="range"
							min="1"
							max="2"
							step="0.25"
							bind:value={scaleFactor}
							class="w-full accent-primary"
						/>
					</div>
				{/if}

				<OutputFilename bind:value={outputName} />
				<RecipeBar
					toolSlug="compress-pdf"
					params={{ mode, quality, scale: scaleFactor }}
					onApply={applyRecipe}
				/>

				{#if result}
					<div class="grid grid-cols-3 gap-3 text-center">
						<div class="rounded-lg bg-muted/50 p-3">
							<p class="text-xs text-muted-foreground">Original</p>
							<p class="font-semibold">{formatFileSize(result.original)}</p>
						</div>
						<div class="rounded-lg bg-muted/50 p-3">
							<p class="text-xs text-muted-foreground">Compressed</p>
							<p class="font-semibold">{formatFileSize(result.compressed)}</p>
						</div>
						<div class="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
							<p class="text-xs text-green-600 dark:text-green-400">Saved</p>
							<p class="font-semibold text-green-700 dark:text-green-300">
								{compressionRatio(result.original, result.compressed)}%
							</p>
						</div>
					</div>
				{/if}
			</div>
		</ToolPanel>

		{#if processing && mode === 'strong' && progressMax > 0}
			<ProgressBar
				value={progressCurrent}
				max={progressMax}
				label="Page {progressCurrent} of {progressMax}…"
			/>
		{/if}

		<div class="flex gap-2">
			{#if processing && mode === 'strong'}
				<Button type="button" variant="outline" onclick={handleCancel}>Cancel</Button>
			{/if}
			<div class="flex-1">
				<ToolAction
					disabled={processing ||
						(mode === 'strong' && (pdfEngine.isLoading || !pdfEngine.engine))}
					loading={processing || (mode === 'strong' && pdfEngine.isLoading)}
					loadingText={processing ? 'Compressing…' : 'Loading engine…'}
					onclick={handleCompress}
				>
					Compress PDF
				</ToolAction>
			</div>
		</div>
		<ToolSuccess
			message={success}
			onRedownload={lastDownload
				? () => downloadBlob(lastDownload!.bytes, lastDownload!.name)
				: undefined}
		/>
	{/if}
	{#if pdfEngine.error && mode === 'strong'}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
