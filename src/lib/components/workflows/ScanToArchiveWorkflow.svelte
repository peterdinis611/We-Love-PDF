<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import WorkflowShell from '$lib/components/workflows/WorkflowShell.svelte';
	import { setAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { deskewPdf } from '$lib/pdf/deskew';
	import { compressPdfRaster } from '$lib/pdf/compress-raster';
	import { exportPdfA } from '$lib/pdf/pdfa';

	const pdfEngine = usePdfEngineContext();
	let { locale = 'en' as Locale }: { locale?: Locale } = $props();
	$effect(() => setAppLocale(locale));
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.scanToArchive);

	let step = $state(1);
	let file = $state<File | null>(null);
	let deskewed = $state<Uint8Array | null>(null);
	let compressed = $state<Uint8Array | null>(null);
	let outputName = $state('scan-archive.pdf');
	let processing = $state(false);
	let progress = $state({ page: 0, total: 0 });
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepDeskew },
		{ n: 2, label: copy.stepCompress },
		{ n: 3, label: copy.stepPdfa }
	]);

	async function runDeskew() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		try {
			deskewed = await deskewPdf(file, pdfEngine.engine as never, {
				angleDeg: 0,
				contrast: 1.15,
				onProgress: (p) => (progress = p)
			});
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Deskew failed.';
		} finally {
			processing = false;
			progress = { page: 0, total: 0 };
		}
	}

	async function runCompress() {
		if (!deskewed || !pdfEngine.engine) return;
		processing = true;
		error = '';
		try {
			const f = new File([deskewed.slice()], 'deskewed.pdf', { type: 'application/pdf' });
			compressed = await compressPdfRaster(f, pdfEngine.engine as never, {
				quality: 0.7,
				scaleFactor: 1.25,
				onProgress: (p) => (progress = p)
			});
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compress failed.';
		} finally {
			processing = false;
			progress = { page: 0, total: 0 };
		}
	}

	async function runPdfa() {
		if (!compressed) return;
		processing = true;
		error = '';
		success = '';
		try {
			const f = new File([compressed.slice()], 'compressed.pdf', { type: 'application/pdf' });
			const { bytes } = await exportPdfA(f, { preflattened: compressed, conformance: 'PDF/A-2b' });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `${m.workflow.download}: ${name} — PDF/A-ready (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'PDF/A export failed.';
		} finally {
			processing = false;
		}
	}
</script>

<WorkflowShell {steps} {step}>
	{#if step === 1}
		{#if !file}
			<FileDropzone onfiles={(f) => (file = f[0])} />
		{:else}
			<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		{/if}
		<ToolPanel>
			<p class="text-sm text-muted-foreground">{copy.deskewHint}</p>
		</ToolPanel>
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Page {progress.page}/{progress.total}" />
		{/if}
		<ToolAction
			disabled={processing || !file || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			onclick={runDeskew}
		>
			{copy.stepDeskew}
		</ToolAction>
	{:else if step === 2}
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Page {progress.page}/{progress.total}" />
		{/if}
		<ToolAction disabled={processing} loading={processing} onclick={runCompress}>
			{copy.stepCompress}
		</ToolAction>
	{:else}
		<OutputFilename bind:value={outputName} />
		<ToolAction disabled={processing} loading={processing} onclick={runPdfa}>{copy.stepPdfa}</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</WorkflowShell>
