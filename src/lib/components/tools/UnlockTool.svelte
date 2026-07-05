<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let password = $state('');
	let processing = $state(false);
	let error = $state('');

	async function handleUnlock() {
		if (!file || !pdfEngine.engine || !password) return;
		processing = true;
		error = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'unlock', content: buffer }, { password })
				.toPromise();
			await pdfEngine.engine.removeEncryption(doc).toPromise();
			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			downloadBlob(new Uint8Array(result), 'unlocked.pdf');
		} catch {
			error = 'Wrong password or unable to unlock this PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select protected PDF" hint="or drop a PDF here" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<label for="unlock-password" class="mb-1 block text-sm font-medium">Current password</label>
			<Input id="unlock-password" type="password" bind:value={password} />
		</ToolPanel>
		<ToolAction
			disabled={processing || !password || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing}
			loadingText="Unlocking…"
			onclick={handleUnlock}
		>
			Unlock PDF
		</ToolAction>
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
