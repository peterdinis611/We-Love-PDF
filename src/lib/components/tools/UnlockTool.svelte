<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let password = $state('');
	let outputName = $state('unlocked.pdf');
	let processing = $state(false);
	let scanning = $state(false);
	let encrypted = $state<boolean | null>(null);
	let error = $state('');
	let success = $state('');

	async function inspectFile(f: File) {
		file = f;
		password = '';
		encrypted = null;
		error = '';
		success = '';
		if (!pdfEngine.engine) return;

		scanning = true;
		try {
			const buffer = await f.arrayBuffer();
			try {
				const doc = await pdfEngine.engine
					.openDocumentBuffer({ id: `unlock-scan-${Date.now()}`, content: buffer })
					.toPromise();
				encrypted = await pdfEngine.engine.isEncrypted(doc).toPromise();
			} catch {
				encrypted = true;
			}
		} finally {
			scanning = false;
		}
	}

	async function handleUnlock() {
		if (!file || !pdfEngine.engine || !password) return;
		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'unlock', content: buffer }, { password })
				.toPromise();
			await pdfEngine.engine.removeEncryption(doc).toPromise();
			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `Downloaded ${name} — encryption removed, ${formatFileSize(result.byteLength)}`;
		} catch {
			error = 'Wrong password or unable to unlock this PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select protected PDF" hint="or drop a PDF here" onfiles={(f) => inspectFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; encrypted = null; error = ''; }} />

		{#if scanning}
			<ToolPanel>
				<p class="text-center text-sm text-muted-foreground">Checking encryption status…</p>
			</ToolPanel>
		{:else if encrypted === false}
			<p class="text-sm text-muted-foreground">This PDF does not appear to be password protected.</p>
		{:else if encrypted === true}
			<p class="text-sm text-amber-600 dark:text-amber-400">Password required to unlock this PDF.</p>
		{/if}

		<ToolPanel>
			<div class="space-y-3">
				<PasswordInput id="unlock-password" label="Current password" bind:value={password} />
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !password || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing}
			loadingText="Unlocking…"
			onclick={handleUnlock}
		>
			Remove password protection
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
