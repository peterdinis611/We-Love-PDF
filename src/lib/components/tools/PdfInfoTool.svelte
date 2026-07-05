<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { formatFileSize, getPdfInfo, type PdfInfo } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let info = $state<PdfInfo | null>(null);
	let loading = $state(false);
	let error = $state('');

	async function setFile(f: File) {
		file = f;
		loading = true;
		error = '';
		info = null;
		try {
			info = await getPdfInfo(f);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not read PDF info.';
			file = null;
		} finally {
			loading = false;
		}
	}

	const fields: { key: keyof PdfInfo; label: string }[] = [
		{ key: 'pageCount', label: 'Pages' },
		{ key: 'title', label: 'Title' },
		{ key: 'author', label: 'Author' },
		{ key: 'subject', label: 'Subject' },
		{ key: 'creator', label: 'Creator' },
		{ key: 'producer', label: 'Producer' }
	];
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to inspect" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; info = null; }} />

		{#if loading}
			<ToolPanel>
				<p class="text-center text-sm text-gray-500 dark:text-gray-400">Reading document info…</p>
			</ToolPanel>
		{:else if info}
			<ToolPanel>
				<dl class="divide-y divide-gray-100 dark:divide-gray-800">
					<div class="flex justify-between py-3">
						<dt class="text-sm text-gray-500 dark:text-gray-400">File size</dt>
						<dd class="text-sm font-medium text-gray-900 dark:text-gray-100">{formatFileSize(info.fileSize)}</dd>
					</div>
					{#each fields as { key, label }}
						<div class="flex justify-between py-3">
							<dt class="text-sm text-gray-500 dark:text-gray-400">{label}</dt>
							<dd class="text-sm font-medium text-gray-900 dark:text-gray-100">
								{info[key] ?? '—'}
							</dd>
						</div>
					{/each}
					{#if info.creationDate}
						<div class="flex justify-between py-3">
							<dt class="text-sm text-gray-500 dark:text-gray-400">Created</dt>
							<dd class="text-sm font-medium text-gray-900 dark:text-gray-100">
								{info.creationDate.toLocaleString()}
							</dd>
						</div>
					{/if}
				</dl>
			</ToolPanel>
		{/if}
	{/if}
	<Alert message={error} />
</div>
