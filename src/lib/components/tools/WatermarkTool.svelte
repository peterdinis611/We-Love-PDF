<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import RecipeBar from '$lib/components/RecipeBar.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import {
		addWatermark,
		addImageWatermark,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		type WatermarkPosition
	} from '$lib/pdf/operations';
	import { getAppLocale } from '$lib/i18n/context';
	import { getToolPreset, setToolPreset } from '$lib/tool-presets';

	const locale = getAppLocale();
	let file = $state<File | null>(null);
	let mode = $state<'text' | 'image'>(getToolPreset('watermark-pdf', 'mode', 'text' as 'text' | 'image'));
	let text = $state(getToolPreset('watermark-pdf', 'text', 'CONFIDENTIAL'));
	let imageFile = $state<File | null>(null);
	let opacity = $state(getToolPreset('watermark-pdf', 'opacity', 0.25));
	let fontSize = $state(getToolPreset('watermark-pdf', 'fontSize', 48));
	let imageScale = $state(getToolPreset('watermark-pdf', 'imageScale', 0.35));
	let position = $state<WatermarkPosition>(
		getToolPreset('watermark-pdf', 'position', 'diagonal' as WatermarkPosition)
	);
	let outputName = $state('watermarked.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);

	$effect(() => {
		setToolPreset('watermark-pdf', 'mode', mode);
		setToolPreset('watermark-pdf', 'text', text);
		setToolPreset('watermark-pdf', 'opacity', opacity);
		setToolPreset('watermark-pdf', 'fontSize', fontSize);
		setToolPreset('watermark-pdf', 'imageScale', imageScale);
		setToolPreset('watermark-pdf', 'position', position);
	});

	const recipeParams = $derived({ mode, text, opacity, fontSize, imageScale, position });
	const canRun = $derived(
		!!file && !processing && (mode === 'text' ? !!text.trim() : !!imageFile)
	);

	function onImagePick(files: FileList | null) {
		const f = files?.[0];
		if (!f) return;
		imageFile = f;
	}

	async function handleWatermark() {
		if (!file) return;
		if (mode === 'text' && !text.trim()) return;
		if (mode === 'image' && !imageFile) return;
		processing = true;
		error = '';
		success = '';
		try {
			let result: Uint8Array;
			if (mode === 'image' && imageFile) {
				const bytes = new Uint8Array(await imageFile.arrayBuffer());
				result = await addImageWatermark(file, bytes, {
					mime: imageFile.type || 'image/png',
					opacity,
					scale: imageScale,
					position
				});
			} else {
				result = await addWatermark(file, text.trim(), { opacity, fontSize, position });
			}
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			lastBytes = result;
			success = `Downloaded ${name} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add watermark.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<p class="mb-2 text-sm font-medium">Watermark type</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['text', 'Text'],
							['image', 'Image / logo']
						] as [value, label]}
							<button
								type="button"
								class="rounded-sm px-3 py-1.5 text-xs font-medium transition {mode === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (mode = value as 'text' | 'image')}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>

				{#if mode === 'text'}
					<div>
						<label for="watermark-text" class="mb-1 block text-sm font-medium">Watermark text</label>
						<Input id="watermark-text" bind:value={text} placeholder="CONFIDENTIAL" />
					</div>
					<div>
						<label for="fontSize" class="mb-1 block text-sm font-medium">Font size: {fontSize}px</label>
						<input
							id="fontSize"
							type="range"
							min="24"
							max="96"
							step="4"
							bind:value={fontSize}
							class="w-full accent-primary"
						/>
					</div>
				{:else}
					<div>
						<label for="wm-image" class="mb-1 block text-sm font-medium">Logo or image</label>
						<input
							id="wm-image"
							type="file"
							accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp"
							class="block w-full text-sm text-muted-foreground file:mr-3 file:rounded-sm file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-sm file:font-medium"
							onchange={(e) => onImagePick(e.currentTarget.files)}
						/>
						{#if imageFile}
							<p class="mt-1 truncate text-xs text-muted-foreground">{imageFile.name}</p>
						{/if}
					</div>
					<div>
						<label for="imageScale" class="mb-1 block text-sm font-medium"
							>Size: {Math.round(imageScale * 100)}% of page</label
						>
						<input
							id="imageScale"
							type="range"
							min="0.1"
							max="0.7"
							step="0.05"
							bind:value={imageScale}
							class="w-full accent-primary"
						/>
					</div>
				{/if}

				<div>
					<p class="mb-2 text-sm font-medium">Position</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['diagonal', 'Diagonal'],
							['center', 'Center'],
							['top', 'Top'],
							['bottom', 'Bottom']
						] as [value, label]}
							<button
								type="button"
								class="rounded-sm px-3 py-1.5 text-xs font-medium transition {position === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (position = value as WatermarkPosition)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<div>
					<label for="opacity" class="mb-1 block text-sm font-medium"
						>Opacity: {Math.round(opacity * 100)}%</label
					>
					<input
						id="opacity"
						type="range"
						min="0.1"
						max="0.8"
						step="0.05"
						bind:value={opacity}
						class="w-full accent-primary"
					/>
				</div>
				<OutputFilename bind:value={outputName} />
				<RecipeBar
					toolSlug="watermark-pdf"
					params={recipeParams}
					onApply={(p) => {
						if (p.mode === 'text' || p.mode === 'image') mode = p.mode;
						if (typeof p.text === 'string') text = p.text;
						if (typeof p.opacity === 'number') opacity = p.opacity;
						if (typeof p.fontSize === 'number') fontSize = p.fontSize;
						if (typeof p.imageScale === 'number') imageScale = p.imageScale;
						if (typeof p.position === 'string') position = p.position as WatermarkPosition;
					}}
				/>
			</div>
		</ToolPanel>
		<ToolAction disabled={!canRun} loading={processing} loadingText="Adding watermark…" onclick={handleWatermark}>
			Add watermark
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
