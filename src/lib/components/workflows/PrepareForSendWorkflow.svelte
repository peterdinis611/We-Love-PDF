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
	import WorkflowShell from '$lib/components/workflows/WorkflowShell.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { setAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import {
		addWatermark,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		type WatermarkPosition
	} from '$lib/pdf/operations';
	import { compressPdf } from '$lib/pdf/heavy';
	import { resolveAllowedFlags, validatePasswordPair, type PermissionPreset } from '$lib/pdf/security';

	const pdfEngine = usePdfEngineContext();

	let { locale = 'en' as Locale }: { locale?: Locale } = $props();

	$effect(() => {
		setAppLocale(locale);
	});

	const m = $derived(msg(locale));
	const wf = $derived(m.workflow);
	const copy = $derived(m.workflows.prepareForSend);

	let step = $state(1);
	let file = $state<File | null>(null);
	let compressedBytes = $state<Uint8Array | null>(null);
	let watermarkedBytes = $state<Uint8Array | null>(null);
	let watermarkText = $state('CONFIDENTIAL');
	let watermarkPosition = $state<WatermarkPosition>('diagonal');
	let password = $state('');
	let confirm = $state('');
	let outputName = $state('ready-to-send.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepCompress },
		{ n: 2, label: copy.stepWatermark },
		{ n: 3, label: copy.stepProtect }
	]);

	async function runCompress() {
		if (!file) {
			error = m.workspace.errors.addAtLeastOne;
			return;
		}
		processing = true;
		error = '';
		try {
			compressedBytes = await compressPdf(file);
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compress failed.';
		} finally {
			processing = false;
		}
	}

	async function runWatermark() {
		if (!compressedBytes || !watermarkText.trim()) return;
		processing = true;
		error = '';
		try {
			const blob = new Blob([compressedBytes.slice()], { type: 'application/pdf' });
			const f = new File([blob], 'compressed.pdf', { type: 'application/pdf' });
			watermarkedBytes = await addWatermark(f, watermarkText.trim(), {
				position: watermarkPosition,
				opacity: 0.25
			});
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Watermark failed.';
		} finally {
			processing = false;
		}
	}

	async function runProtect() {
		if (!watermarkedBytes || !pdfEngine.engine) return;
		const validationError = validatePasswordPair(password, confirm);
		if (validationError) {
			error = validationError;
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const pdfBytes = watermarkedBytes.slice();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({
					id: 'wf-prepare-protect',
					content: pdfBytes.buffer.slice(
						pdfBytes.byteOffset,
						pdfBytes.byteOffset + pdfBytes.byteLength
					)
				})
				.toPromise();
			const flags = resolveAllowedFlags('full' as PermissionPreset, {
				print: true,
				copy: true,
				modify: true,
				annotate: true,
				forms: true
			});
			await pdfEngine.engine.setDocumentEncryption(doc, password, password, flags).toPromise();
			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `${wf.download}: ${name} (${formatFileSize(result.byteLength)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Protect failed.';
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
		<ToolAction
			disabled={processing || !file}
			loading={processing}
			loadingText={m.workspace.actions.processing}
			onclick={runCompress}
		>
			{wf.next}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{compressedBytes ? formatFileSize(compressedBytes.length) : ''} — {copy.readyWatermark}
				</p>
				<div>
					<label for="wf-wm-text" class="mb-1 block text-sm font-medium">{copy.watermarkLabel}</label>
					<Input id="wf-wm-text" bind:value={watermarkText} />
				</div>
				<div class="flex flex-wrap gap-2">
					{#each [
						['diagonal', 'Diagonal'],
						['center', 'Center'],
						['top', 'Top'],
						['bottom', 'Bottom']
					] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {watermarkPosition ===
							value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (watermarkPosition = value as WatermarkPosition)}
						>
							{label}
						</button>
					{/each}
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
				<ToolAction
					disabled={!watermarkText.trim()}
					loading={processing}
					onclick={runWatermark}
				>
					{wf.next}
				</ToolAction>
			</div>
		</div>
	{:else}
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{watermarkedBytes ? formatFileSize(watermarkedBytes.length) : ''} — {copy.readyProtect}
				</p>
				<PasswordInput id="wf-prep-password" label={m.workspace.password.password} bind:value={password} />
				<PasswordInput
					id="wf-prep-confirm"
					label={m.workspace.password.confirmPassword}
					bind:value={confirm}
				/>
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
			<ToolAction
				loading={processing}
				disabled={!password || pdfEngine.isLoading}
				onclick={runProtect}
			>
				{wf.finish}
			</ToolAction>
		</div>
	{/if}

	{#if pdfEngine.error}
		<Alert message={m.workspace.errors.engineFailed} variant="info" />
	{/if}
	<ToolSuccess message={success} />
	<Alert message={error} />
</WorkflowShell>
