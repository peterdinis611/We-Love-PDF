<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { formatFileSize, getPdfInfo, type PdfInfo } from '$lib/pdf/operations';
	import { Copy, Download } from '@lucide/svelte';

	let file = $state<File | null>(null);
	let info = $state<PdfInfo | null>(null);
	let loading = $state(false);
	let error = $state('');
	let copied = $state(false);

	const fields: { key: keyof PdfInfo; label: string }[] = [
		{ key: 'pageCount', label: 'Pages' },
		{ key: 'title', label: 'Title' },
		{ key: 'author', label: 'Author' },
		{ key: 'subject', label: 'Subject' },
		{ key: 'creator', label: 'Creator' },
		{ key: 'producer', label: 'Producer' }
	];

	async function setFile(f: File) {
		file = f;
		loading = true;
		error = '';
		info = null;
		copied = false;
		try {
			info = await getPdfInfo(f);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Could not read PDF info.';
			file = null;
		} finally {
			loading = false;
		}
	}

	function exportJson() {
		if (!info) return;
		const blob = new Blob([JSON.stringify(info, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'pdf-info.json';
		a.click();
		URL.revokeObjectURL(url);
	}

	async function copyJson() {
		if (!info) return;
		await navigator.clipboard.writeText(JSON.stringify(info, null, 2));
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to inspect" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; info = null; }} />

		{#if loading}
			<ToolPanel>
				<p class="text-center text-sm text-muted-foreground">Reading document info…</p>
			</ToolPanel>
		{:else if info}
			<ToolPanel>
				<dl class="divide-y divide-border">
					<div class="flex justify-between py-3">
						<dt class="text-sm text-muted-foreground">File size</dt>
						<dd class="text-sm font-medium">{formatFileSize(info.fileSize)}</dd>
					</div>
					{#each fields as { key, label }}
						<div class="flex justify-between py-3">
							<dt class="text-sm text-muted-foreground">{label}</dt>
							<dd class="text-sm font-medium">{info[key] ?? '—'}</dd>
						</div>
					{/each}
					{#if info.creationDate}
						<div class="flex justify-between py-3">
							<dt class="text-sm text-muted-foreground">Created</dt>
							<dd class="text-sm font-medium">{info.creationDate.toLocaleString()}</dd>
						</div>
					{/if}
				</dl>
				<div class="mt-4 flex gap-2">
					<Button variant="outline" size="sm" onclick={copyJson}>
						<Copy class="size-3.5" />
						{copied ? 'Copied!' : 'Copy JSON'}
					</Button>
					<Button variant="outline" size="sm" onclick={exportJson}>
						<Download class="size-3.5" />
						Download JSON
					</Button>
				</div>
			</ToolPanel>
		{/if}
	{/if}
	<Alert message={error} />
</div>
