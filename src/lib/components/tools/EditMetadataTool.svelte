<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, editMetadata, ensurePdfFilename, formatFileSize, getPdfInfo } from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let title = $state('');
	let author = $state('');
	let subject = $state('');
	let keywords = $state('');
	let creator = $state('');
	let outputName = $state('metadata-updated.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		try {
			const info = await getPdfInfo(f);
			title = info.title ?? '';
			author = info.author ?? '';
			subject = info.subject ?? '';
			creator = info.creator ?? '';
			keywords = '';
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function handleSave() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await editMetadata(file, { title, author, subject, keywords, creator });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to update metadata.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-3">
				<div>
					<label for="title" class="mb-1 block text-sm font-medium">Title</label>
					<Input id="title" bind:value={title} placeholder="Document title" />
				</div>
				<div>
					<label for="author" class="mb-1 block text-sm font-medium">Author</label>
					<Input id="author" bind:value={author} placeholder="Author name" />
				</div>
				<div>
					<label for="subject" class="mb-1 block text-sm font-medium">Subject</label>
					<Input id="subject" bind:value={subject} placeholder="Document subject" />
				</div>
				<div>
					<label for="creator" class="mb-1 block text-sm font-medium">Creator</label>
					<Input id="creator" bind:value={creator} placeholder="Creating application" />
				</div>
				<div>
					<label for="keywords" class="mb-1 block text-sm font-medium">Keywords</label>
					<Input id="keywords" bind:value={keywords} placeholder="keyword1, keyword2" />
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Saving…" onclick={handleSave}>
			Save metadata
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
