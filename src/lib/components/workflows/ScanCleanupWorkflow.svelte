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
	import {
		cropPdf,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		rotateAllPages
	} from '$lib/pdf/operations';
	import { compressPdf } from '$lib/pdf/heavy';

	let { locale = 'en' as Locale }: { locale?: Locale } = $props();

	$effect(() => {
		setAppLocale(locale);
	});

	const m = $derived(msg(locale));
	const wf = $derived(m.workflow);
	const copy = $derived(m.workflows.scanCleanup);

	let step = $state(1);
	let file = $state<File | null>(null);
	let rotatedBytes = $state<Uint8Array | null>(null);
	let croppedBytes = $state<Uint8Array | null>(null);
	let angle = $state<90 | 180 | 270>(90);
	let top = $state(36);
	let right = $state(36);
	let bottom = $state(36);
	let left = $state(36);
	let outputName = $state('scan-cleaned.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepRotate },
		{ n: 2, label: copy.stepCrop },
		{ n: 3, label: copy.stepCompress }
	]);

	function asFile(bytes: Uint8Array, name: string) {
		return new File([bytes.slice()], name, { type: 'application/pdf' });
	}

	async function runRotate() {
		if (!file) {
			error = m.workspace.errors.addAtLeastOne;
			return;
		}
		processing = true;
		error = '';
		try {
			rotatedBytes = await rotateAllPages(file, angle);
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Rotate failed.';
		} finally {
			processing = false;
		}
	}

	async function runCrop() {
		if (!rotatedBytes) return;
		processing = true;
		error = '';
		try {
			croppedBytes = await cropPdf(asFile(rotatedBytes, 'rotated.pdf'), {
				top,
				right,
				bottom,
				left
			});
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Crop failed.';
		} finally {
			processing = false;
		}
	}

	async function runCompress() {
		if (!croppedBytes) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await compressPdf(asFile(croppedBytes, 'cropped.pdf'));
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `${wf.download}: ${name} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compress failed.';
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
			<div class="space-y-3">
				<p class="text-sm font-medium">{copy.angleLabel}</p>
				<div class="flex flex-wrap gap-2">
					{#each [90, 180, 270] as a}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {angle === a
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (angle = a as 90 | 180 | 270)}
						>
							{a}°
						</button>
					{/each}
				</div>
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || !file} loading={processing} onclick={runRotate}>
			{wf.next}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{rotatedBytes ? formatFileSize(rotatedBytes.length) : ''} — {copy.readyCrop}
				</p>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="scan-top" class="mb-1 block text-sm font-medium">Top: {top}pt</label>
						<input id="scan-top" type="range" min="0" max="144" step="4" bind:value={top} class="w-full accent-primary" />
					</div>
					<div>
						<label for="scan-bottom" class="mb-1 block text-sm font-medium">Bottom: {bottom}pt</label>
						<input id="scan-bottom" type="range" min="0" max="144" step="4" bind:value={bottom} class="w-full accent-primary" />
					</div>
					<div>
						<label for="scan-left" class="mb-1 block text-sm font-medium">Left: {left}pt</label>
						<input id="scan-left" type="range" min="0" max="144" step="4" bind:value={left} class="w-full accent-primary" />
					</div>
					<div>
						<label for="scan-right" class="mb-1 block text-sm font-medium">Right: {right}pt</label>
						<input id="scan-right" type="range" min="0" max="144" step="4" bind:value={right} class="w-full accent-primary" />
					</div>
				</div>
			</div>
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
				<ToolAction loading={processing} onclick={runCrop}>{wf.next}</ToolAction>
			</div>
		</div>
	{:else}
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{croppedBytes ? formatFileSize(croppedBytes.length) : ''} — {copy.readyCompress}
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
			<ToolAction loading={processing} onclick={runCompress}>{wf.finish}</ToolAction>
		</div>
	{/if}

	<ToolSuccess message={success} />
	<Alert message={error} />
</WorkflowShell>
