<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { addWatermark, downloadBlob } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let text = $state('CONFIDENTIAL');
	let opacity = $state(0.25);
	let fontSize = $state(48);
	let processing = $state(false);
	let error = $state('');

	async function handleWatermark() {
		if (!file || !text.trim()) return;
		processing = true;
		error = '';
		try {
			const result = await addWatermark(file, text.trim(), { opacity, fontSize });
			downloadBlob(result, 'watermarked.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add watermark.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<label for="watermark-text" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Watermark text
					</label>
					<input
						id="watermark-text"
						type="text"
						bind:value={text}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
					/>
				</div>
				<div>
					<label for="opacity" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Opacity: {Math.round(opacity * 100)}%
					</label>
					<input id="opacity" type="range" min="0.1" max="0.8" step="0.05" bind:value={opacity} class="w-full" />
				</div>
				<div>
					<label for="fontSize" class="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
						Font size: {fontSize}px
					</label>
					<input id="fontSize" type="range" min="24" max="96" step="4" bind:value={fontSize} class="w-full" />
				</div>
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || !text.trim()} loading={processing} loadingText="Adding watermark…" onclick={handleWatermark}>
			Add watermark
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
