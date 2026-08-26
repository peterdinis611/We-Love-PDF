<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import WorkflowShell from '$lib/components/workflows/WorkflowShell.svelte';
	import { setAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import {
		createFileId,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		removeAllMetadata,
		type PdfFile
	} from '$lib/pdf/operations';
	import { mergePdfs } from '$lib/pdf/heavy';

	const pdfEngine = usePdfEngineContext();

	let { locale = 'en' as Locale }: { locale?: Locale } = $props();

	$effect(() => {
		setAppLocale(locale);
	});

	const m = $derived(msg(locale));
	const wf = $derived(m.workflow);
	const copy = $derived(m.workflows.archivePack);

	let step = $state(1);
	let files = $state<PdfFile[]>([]);
	let mergedBytes = $state<Uint8Array | null>(null);
	let flattenedBytes = $state<Uint8Array | null>(null);
	let outputName = $state('archive.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepMerge },
		{ n: 2, label: copy.stepFlatten },
		{ n: 3, label: copy.stepClean }
	]);

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
		error = '';
	}

	async function runMerge() {
		if (files.length < 1) {
			error = m.workspace.errors.addAtLeastOne;
			return;
		}
		processing = true;
		error = '';
		try {
			if (files.length === 1) {
				mergedBytes = new Uint8Array(await files[0].file.arrayBuffer());
			} else {
				mergedBytes = await mergePdfs(files.map((f) => f.file));
			}
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Merge failed.';
		} finally {
			processing = false;
		}
	}

	async function runFlatten() {
		if (!mergedBytes || !pdfEngine.engine) return;
		processing = true;
		error = '';
		try {
			const pdfBytes = mergedBytes.slice();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({
					id: 'wf-archive-flatten',
					content: pdfBytes.buffer.slice(
						pdfBytes.byteOffset,
						pdfBytes.byteOffset + pdfBytes.byteLength
					)
				})
				.toPromise();
			for (const page of doc.pages) {
				await pdfEngine.engine.flattenPage(doc, page).toPromise();
			}
			flattenedBytes = new Uint8Array(await pdfEngine.engine.saveAsCopy(doc).toPromise());
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Flatten failed.';
		} finally {
			processing = false;
		}
	}

	async function runClean() {
		if (!flattenedBytes) return;
		processing = true;
		error = '';
		success = '';
		try {
			const blob = new Blob([flattenedBytes.slice()], { type: 'application/pdf' });
			const f = new File([blob], 'flattened.pdf', { type: 'application/pdf' });
			const result = await removeAllMetadata(f);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `${wf.download}: ${name} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Cleanup failed.';
		} finally {
			processing = false;
		}
	}
</script>

<WorkflowShell {steps} {step}>
	{#if step === 1}
		<FileDropzone multiple onfiles={addFiles} />
		{#if files.length}
			<div class="mt-3 space-y-2">
				{#each files as file, i (file.id)}
					<FileListItem
						name={file.name}
						size={file.size}
						index={i}
						onremove={() => (files = files.filter((f) => f.id !== file.id))}
					/>
				{/each}
			</div>
		{/if}
		<ToolAction
			disabled={processing || files.length < 1}
			loading={processing}
			loadingText={m.workspace.actions.merging}
			onclick={runMerge}
		>
			{wf.next}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel>
			<p class="text-sm text-muted-foreground">
				{mergedBytes ? formatFileSize(mergedBytes.length) : ''} — {copy.readyFlatten}
			</p>
		</ToolPanel>
		<div class="flex gap-2">
			<button
				type="button"
				class="inline-flex h-11 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium"
				onclick={() => (step = 1)}
			>
				{wf.back}
			</button>
			<div class="flex-1">
				<ToolAction
					loading={processing || pdfEngine.isLoading}
					disabled={!pdfEngine.engine}
					onclick={runFlatten}
				>
					{wf.next}
				</ToolAction>
			</div>
		</div>
	{:else}
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{flattenedBytes ? formatFileSize(flattenedBytes.length) : ''} — {copy.readyClean}
				</p>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<div class="flex gap-2">
			<button
				type="button"
				class="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium"
				onclick={() => (step = 2)}
			>
				{wf.back}
			</button>
			<ToolAction loading={processing} onclick={runClean}>{wf.finish}</ToolAction>
		</div>
	{/if}

	{#if pdfEngine.error}
		<Alert message={m.workspace.errors.engineFailed} variant="info" />
	{/if}
	<ToolSuccess message={success} />
	<Alert message={error} />
</WorkflowShell>
