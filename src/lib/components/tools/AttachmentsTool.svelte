<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { attachFilesToPdf, listAttachments, stripAttachments } from '$lib/pdf/attachments';

	let file = $state<File | null>(null);
	let attachments = $state<File[]>([]);
	let listed = $state<{ name: string }[]>([]);
	let mode = $state<'attach' | 'strip'>('attach');
	let outputName = $state('with-attachments.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setPdf(f: File) {
		file = f;
		error = '';
		try {
			listed = await listAttachments(f);
		} catch {
			listed = [];
		}
	}

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			if (mode === 'attach' && !attachments.length) {
				error = 'Add at least one file to attach.';
				return;
			}
			const bytes =
				mode === 'strip'
					? await stripAttachments(file)
					: await attachFilesToPdf(file, attachments);
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update attachments.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => setPdf(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				{#if listed.length}
					<p class="text-sm text-muted-foreground">Current attachments: {listed.map((a) => a.name).join(', ')}</p>
				{:else}
					<p class="text-sm text-muted-foreground">No embedded attachments detected.</p>
				{/if}
				<div class="flex flex-wrap gap-2">
					{#each [['attach', 'Add files'], ['strip', 'Remove all']] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {mode === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (mode = value as typeof mode)}
						>
							{label}
						</button>
					{/each}
				</div>
				{#if mode === 'attach'}
					<FileDropzone
						multiple
						accept="*/*"
						label="Add attachment files"
						hint="Any file type"
						fileFilter={() => true}
						loadPending={false}
						onfiles={(f) => (attachments = [...attachments, ...f])}
					/>
					{#each attachments as att, i}
						<FileListItem
							name={att.name}
							size={att.size}
							onremove={() => (attachments = attachments.filter((_, j) => j !== i))}
						/>
					{/each}
				{/if}
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Updating…" onclick={handle}>
			{mode === 'strip' ? 'Strip attachments' : 'Attach files'}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
