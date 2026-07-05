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
	let confirm = $state('');
	let processing = $state(false);
	let error = $state('');

	async function handleProtect() {
		if (!file || !pdfEngine.engine) return;
		if (password.length < 4) {
			error = 'Password must be at least 4 characters.';
			return;
		}
		if (password !== confirm) {
			error = 'Passwords do not match.';
			return;
		}
		processing = true;
		error = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'protect', content: buffer })
				.toPromise();
			await pdfEngine.engine.setDocumentEncryption(doc, password, password, 3900).toPromise();
			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			downloadBlob(new Uint8Array(result), 'protected.pdf');
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to protect PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to encrypt" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-3">
				<div>
					<label for="password" class="mb-1 block text-sm font-medium">Password</label>
					<Input id="password" type="password" bind:value={password} />
				</div>
				<div>
					<label for="confirm" class="mb-1 block text-sm font-medium">Confirm password</label>
					<Input id="confirm" type="password" bind:value={confirm} />
				</div>
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !password || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing}
			loadingText="Encrypting…"
			onclick={handleProtect}
		>
			Protect PDF
		</ToolAction>
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
