<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		createFileId,
		downloadBlob,
		formatFileSize,
		type PdfFile
	} from '$lib/pdf/operations';
	import { buildInvoiceZipPack } from '$lib/pdf/invoice-zip';

	let files = $state<PdfFile[]>([]);
	let stampPaid = $state(true);
	let nameTemplate = $state('{title}-{index}.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	function addFiles(newFiles: File[]) {
		files = [
			...files,
			...newFiles.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
	}

	async function handle() {
		if (!files.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const { zip, names } = await buildInvoiceZipPack(
				files.map((f) => f.file),
				{ stampPaid, nameTemplate }
			);
			downloadBlob(zip, 'invoice-pack.zip', 'application/zip');
			success = `Downloaded invoice-pack.zip — ${names.length} file${names.length === 1 ? '' : 's'} (${names.slice(0, 3).join(', ')}${names.length > 3 ? '…' : ''}), ${formatFileSize(zip.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to build invoice ZIP.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	<FileDropzone multiple onfiles={addFiles} />
	{#each files as f (f.id)}
		<FileListItem
			name={f.name}
			size={f.size}
			onremove={() => (files = files.filter((x) => x.id !== f.id))}
		/>
	{/each}
	{#if files.length}
		<ToolPanel>
			<div class="space-y-3">
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={stampPaid} class="rounded border-border accent-primary" />
					Stamp PAID on each PDF
				</label>
				<div>
					<label for="tpl" class="mb-1 block text-sm font-medium">ZIP entry name template</label>
					<Input id="tpl" bind:value={nameTemplate} placeholder={'{title}-{index}.pdf'} />
					<p class="mt-1 text-xs text-muted-foreground">
						Tokens: {'{title}'} (PDF title or filename), {'{author}'}, {'{index}'}
					</p>
				</div>
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={handle}>Build ZIP pack</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
