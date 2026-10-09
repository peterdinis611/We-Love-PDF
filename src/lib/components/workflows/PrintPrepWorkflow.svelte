<script lang="ts">
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
	import { addPageNumbers, downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { nUpPdf, removeBlankPages, resizePdfPages } from '$lib/pdf/layout-ops';

	let { locale = 'en' as Locale }: { locale?: Locale } = $props();
	$effect(() => setAppLocale(locale));
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.printPrep);

	let step = $state(1);
	let file = $state<File | null>(null);
	let cleaned = $state<Uint8Array | null>(null);
	let nupped = $state<Uint8Array | null>(null);
	let outputName = $state('print-ready.pdf');
	let n = $state<2 | 4>(2);
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepClean },
		{ n: 2, label: copy.stepNup },
		{ n: 3, label: copy.stepNumbers }
	]);

	async function runClean() {
		if (!file) return;
		processing = true;
		error = '';
		try {
			const resized = await resizePdfPages(file, { target: 'a4', mode: 'fit' });
			const f = new File([resized.slice()], 'resized.pdf', { type: 'application/pdf' });
			try {
				const blank = await removeBlankPages(f);
				cleaned = blank.bytes;
			} catch {
				cleaned = resized;
			}
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Cleanup failed.';
		} finally {
			processing = false;
		}
	}

	async function runNup() {
		if (!cleaned) return;
		processing = true;
		error = '';
		try {
			const f = new File([cleaned.slice()], 'clean.pdf', { type: 'application/pdf' });
			nupped = await nUpPdf(f, { n, target: 'a4' });
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'N-up failed.';
		} finally {
			processing = false;
		}
	}

	async function runNumbers() {
		if (!nupped) return;
		processing = true;
		error = '';
		success = '';
		try {
			const f = new File([nupped.slice()], 'nup.pdf', { type: 'application/pdf' });
			const bytes = await addPageNumbers(f, { position: 'bottom-center', format: 'fraction' });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `${m.workflow.download}: ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Page numbers failed.';
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
			<p class="text-sm text-muted-foreground">{copy.cleanHint}</p>
		</ToolPanel>
		<ToolAction disabled={processing || !file} loading={processing} onclick={runClean}>
			{copy.stepClean}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel>
			<p class="mb-2 text-sm font-medium">{copy.nupLabel}</p>
			<div class="flex gap-2">
				{#each [2, 4] as value}
					<button
						type="button"
						class="rounded-full px-3 py-1.5 text-xs font-medium {n === value
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary'}"
						onclick={() => (n = value as 2 | 4)}
					>
						{value}-up
					</button>
				{/each}
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={runNup}>{copy.stepNup}</ToolAction>
	{:else}
		<OutputFilename bind:value={outputName} />
		<ToolAction disabled={processing} loading={processing} onclick={runNumbers}>
			{copy.stepNumbers}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</WorkflowShell>
