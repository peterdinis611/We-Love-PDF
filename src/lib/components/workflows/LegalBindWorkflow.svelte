<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import WorkflowShell from '$lib/components/workflows/WorkflowShell.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { setAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { addBatesNumbers } from '$lib/pdf/bates';
	import { stampPdf } from '$lib/pdf/layout-ops';
	import { PDFDocument } from 'pdf-lib';

	let { locale = 'en' as Locale }: { locale?: Locale } = $props();
	$effect(() => setAppLocale(locale));
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.legalBind);

	let step = $state(1);
	let file = $state<File | null>(null);
	let bates = $state<Uint8Array | null>(null);
	let stamped = $state<Uint8Array | null>(null);
	let prefix = $state('LEGAL-');
	let outputName = $state('legal-bound.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepBates },
		{ n: 2, label: copy.stepStamp },
		{ n: 3, label: copy.stepFlatten }
	]);

	async function runBates() {
		if (!file) return;
		processing = true;
		error = '';
		try {
			bates = await addBatesNumbers(file, { prefix, pad: 6, position: 'bottom-right' });
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Bates failed.';
		} finally {
			processing = false;
		}
	}

	async function runStamp() {
		if (!bates) return;
		processing = true;
		error = '';
		try {
			const f = new File([bates.slice()], 'bates.pdf', { type: 'application/pdf' });
			stamped = await stampPdf(f, { text: 'CONFIDENTIAL', color: 'red' });
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Stamp failed.';
		} finally {
			processing = false;
		}
	}

	async function runFlatten() {
		if (!stamped) return;
		processing = true;
		error = '';
		success = '';
		try {
			// Flatten AcroForm if present via pdf-lib
			const doc = await PDFDocument.load(stamped.slice(), { ignoreEncryption: true });
			try {
				doc.getForm().flatten();
			} catch {
				/* no form */
			}
			const bytes = await doc.save({ useObjectStreams: true });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `${m.workflow.download}: ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Flatten failed.';
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
			<label for="prefix" class="mb-1 block text-sm font-medium">{copy.prefixLabel}</label>
			<Input id="prefix" bind:value={prefix} />
		</ToolPanel>
		<ToolAction disabled={processing || !file} loading={processing} onclick={runBates}>
			{copy.stepBates}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel><p class="text-sm text-muted-foreground">{copy.stampHint}</p></ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={runStamp}>{copy.stepStamp}</ToolAction>
	{:else}
		<OutputFilename bind:value={outputName} />
		<ToolAction disabled={processing} loading={processing} onclick={runFlatten}>{copy.stepFlatten}</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</WorkflowShell>
