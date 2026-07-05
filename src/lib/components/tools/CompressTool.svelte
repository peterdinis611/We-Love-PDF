<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { compressPdf, compressionRatio, downloadBlob, formatFileSize } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let processing = $state(false);
	let error = $state('');
	let result = $state<{ original: number; compressed: number } | null>(null);

	async function handleCompress() {
		if (!file) return;
		processing = true;
		error = '';
		result = null;
		try {
			const bytes = await compressPdf(file);
			result = { original: file.size, compressed: bytes.length };
			downloadBlob(bytes, 'compressed.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compress PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here to compress" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; result = null; }} />
		<ToolPanel>
			<p class="text-sm text-gray-600 dark:text-gray-400">
				Optimizes the PDF structure and removes metadata. Results vary depending on the original file.
			</p>
			{#if result}
				<div class="mt-4 grid grid-cols-3 gap-3 text-center">
					<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
						<p class="text-xs text-gray-500 dark:text-gray-400">Original</p>
						<p class="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(result.original)}</p>
					</div>
					<div class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
						<p class="text-xs text-gray-500 dark:text-gray-400">Compressed</p>
						<p class="font-semibold text-gray-900 dark:text-gray-100">{formatFileSize(result.compressed)}</p>
					</div>
					<div class="rounded-lg bg-green-50 p-3 dark:bg-green-950/30">
						<p class="text-xs text-green-600 dark:text-green-400">Saved</p>
						<p class="font-semibold text-green-700 dark:text-green-300">
							{compressionRatio(result.original, result.compressed)}%
						</p>
					</div>
				</div>
			{/if}
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Compressing…" onclick={handleCompress}>
			Compress PDF
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
