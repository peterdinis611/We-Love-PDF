<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		addWatermark,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		type WatermarkPosition
	} from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(0.25);
	let fontSize = $state(48);
	let position = $state<WatermarkPosition>('diagonal');
	let outputName = $state('watermarked.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleWatermark() {
		if (!file || !text.trim()) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await addWatermark(file, text.trim(), { opacity, fontSize, position });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
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
					<label for="watermark-text" class="mb-1 block text-sm font-medium">Watermark text</label>
					<Input id="watermark-text" bind:value={text} placeholder="CONFIDENTIAL" />
				</div>
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
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {position === value
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
					<label for="opacity" class="mb-1 block text-sm font-medium">Opacity: {Math.round(opacity * 100)}%</label>
					<input id="opacity" type="range" min="0.1" max="0.8" step="0.05" bind:value={opacity} class="w-full accent-primary" />
				</div>
				<div>
					<label for="fontSize" class="mb-1 block text-sm font-medium">Font size: {fontSize}px</label>
					<input id="fontSize" type="range" min="24" max="96" step="4" bind:value={fontSize} class="w-full accent-primary" />
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || !text.trim()} loading={processing} loadingText="Adding watermark…" onclick={handleWatermark}>
			Add watermark
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
