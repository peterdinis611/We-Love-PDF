<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { addPageNumbers, downloadBlob } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let position = $state<'bottom-center' | 'bottom-right'>('bottom-center');
	let processing = $state(false);
	let error = $state('');

	async function handleAdd() {
		if (!file) return;
		processing = true;
		error = '';
		try {
			const result = await addPageNumbers(file, position);
			downloadBlob(result, 'numbered.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add page numbers.';
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
			<p class="mb-3 text-sm font-medium text-gray-700 dark:text-gray-300">Position</p>
			<div class="flex gap-2">
				{#each [['bottom-center', 'Bottom center'], ['bottom-right', 'Bottom right']] as [value, label]}
					<button
						type="button"
						class="flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition {position === value
							? 'border-red-500 bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400'
							: 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'}"
						onclick={() => (position = value as typeof position)}
					>
						{label}
					</button>
				{/each}
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Adding numbers…" onclick={handleAdd}>
			Add page numbers
		</ToolAction>
	{/if}
	<Alert message={error} />
</div>
