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
	import { Input } from '$lib/components/ui/input/index.js';
	import { setAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { addWatermark, downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { compressPdfRaster } from '$lib/pdf/compress-raster';
	import { sanitizePdf } from '$lib/pdf/sanitize';

	const pdfEngine = usePdfEngineContext();
	let { locale = 'en' as Locale }: { locale?: Locale } = $props();
	$effect(() => setAppLocale(locale));
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.sharePack);

	let step = $state(1);
	let file = $state<File | null>(null);
	let compressed = $state<Uint8Array | null>(null);
	let sanitized = $state<Uint8Array | null>(null);
	let watermark = $state('CONFIDENTIAL');
	let outputName = $state('share-pack.pdf');
	let processing = $state(false);
	let progress = $state({ page: 0, total: 0 });
	let error = $state('');
	let success = $state('');
	let securityNote = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepCompress },
		{ n: 2, label: copy.stepSanitize },
		{ n: 3, label: copy.stepWatermark },
		{ n: 4, label: copy.stepCheck }
	]);

	async function runCompress() {
		if (!file || !pdfEngine.engine) return;
		processing = true;
		error = '';
		try {
			compressed = await compressPdfRaster(file, pdfEngine.engine as never, {
				quality: 0.75,
				scaleFactor: 1.5,
				onProgress: (p) => (progress = p)
			});
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compress failed.';
		} finally {
			processing = false;
			progress = { page: 0, total: 0 };
		}
	}

	async function runSanitize() {
		if (!compressed) return;
		processing = true;
		error = '';
		try {
			const f = new File([compressed.slice()], 'c.pdf', { type: 'application/pdf' });
			const result = await sanitizePdf(f);
			sanitized = result.bytes;
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Sanitize failed.';
		} finally {
			processing = false;
		}
	}

	async function runWatermark() {
		if (!sanitized || !watermark.trim()) return;
		processing = true;
		error = '';
		try {
			const f = new File([sanitized.slice()], 's.pdf', { type: 'application/pdf' });
			sanitized = await addWatermark(f, watermark.trim(), {
				opacity: 0.2,
				position: 'diagonal'
			});
			step = 4;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Watermark failed.';
		} finally {
			processing = false;
		}
	}

	async function runCheckAndDownload() {
		if (!sanitized || !pdfEngine.engine) return;
		processing = true;
		error = '';
		success = '';
		try {
			const pdfBytes = sanitized.slice();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({
					id: 'share-check',
					content: pdfBytes.buffer.slice(
						pdfBytes.byteOffset,
						pdfBytes.byteOffset + pdfBytes.byteLength
					)
				})
				.toPromise();
			const encrypted = await pdfEngine.engine.isEncrypted(doc).toPromise();
			securityNote = encrypted
				? copy.stillEncrypted
				: copy.notEncrypted;
			const name = ensurePdfFilename(outputName);
			downloadBlob(pdfBytes, name);
			success = `${m.workflow.download}: ${name} (${formatFileSize(pdfBytes.length)}). ${securityNote}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Final check failed.';
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
		{#if processing && progress.total}
			<ProgressBar value={progress.page} max={progress.total} label="Page {progress.page}/{progress.total}" />
		{/if}
		<ToolAction
			disabled={processing || !file || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			onclick={runCompress}
		>
			{copy.stepCompress}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel><p class="text-sm text-muted-foreground">{copy.sanitizeHint}</p></ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={runSanitize}>{copy.stepSanitize}</ToolAction>
	{:else if step === 3}
		<ToolPanel>
			<label for="wm" class="mb-1 block text-sm font-medium">{copy.watermarkLabel}</label>
			<Input id="wm" bind:value={watermark} />
		</ToolPanel>
		<ToolAction disabled={processing || !watermark.trim()} loading={processing} onclick={runWatermark}>
			{copy.stepWatermark}
		</ToolAction>
	{:else}
		<OutputFilename bind:value={outputName} />
		<ToolAction disabled={processing} loading={processing} onclick={runCheckAndDownload}>
			{copy.stepCheck}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</WorkflowShell>
