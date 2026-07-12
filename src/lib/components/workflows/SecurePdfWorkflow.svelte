<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { setAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import {
		compressPdf,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		mergePdfs,
		type PdfFile
	} from '$lib/pdf/operations';
	import { createFileId } from '$lib/pdf/operations';
	import { resolveAllowedFlags, validatePasswordPair, type PermissionPreset } from '$lib/pdf/security';
	import { Check } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	let { locale = 'en' as Locale }: { locale?: Locale } = $props();

	$effect(() => {
		setAppLocale(locale);
	});

	const m = $derived(msg(locale));
	const wf = $derived(m.workflow);

	let step = $state(1);
	let files = $state<PdfFile[]>([]);
	let mergedBytes = $state<Uint8Array | null>(null);
	let compressedBytes = $state<Uint8Array | null>(null);
	let password = $state('');
	let confirm = $state('');
	let outputName = $state('secure.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: wf.stepMerge },
		{ n: 2, label: wf.stepCompress },
		{ n: 3, label: wf.stepProtect }
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
			error = locale === 'sk' ? 'Pridajte aspoň jeden PDF súbor.' : 'Please add at least one PDF file.';
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

	async function runCompress() {
		if (!mergedBytes) return;
		processing = true;
		error = '';
		try {
			const mergedCopy = mergedBytes.slice();
			const blob = new Blob([mergedCopy], { type: 'application/pdf' });
			compressedBytes = await compressPdf(new File([blob], 'merged.pdf', { type: 'application/pdf' }));
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Compress failed.';
		} finally {
			processing = false;
		}
	}

	async function runProtect() {
		if (!compressedBytes || !pdfEngine.engine) return;
		const validationError = validatePasswordPair(password, confirm);
		if (validationError) {
			error = validationError;
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const pdfBytes = compressedBytes.slice();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({
					id: 'workflow-protect',
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

<div class="space-y-6">
	<ol class="flex flex-wrap gap-2">
		{#each steps as s}
			<li
				class="flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium {step >= s.n
					? 'border-primary bg-primary/10 text-primary'
					: 'border-border text-muted-foreground'}"
			>
				{#if step > s.n}
					<Check class="size-3.5" />
				{:else}
					<span class="tabular-nums">{s.n}</span>
				{/if}
				{s.label}
			</li>
		{/each}
	</ol>

	{#if step === 1}
		<FileDropzone multiple onfiles={addFiles} />
		{#if files.length}
			<p class="text-sm text-muted-foreground">{files.length} PDF{files.length === 1 ? '' : 's'} selected</p>
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
				{mergedBytes ? formatFileSize(mergedBytes.length) : ''} — ready to compress
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
				<ToolAction loading={processing} onclick={runCompress}>{wf.next}</ToolAction>
			</div>
		</div>
	{:else}
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					{compressedBytes ? formatFileSize(compressedBytes.length) : ''} — add password
				</p>
				<PasswordInput id="wf-password" label="Password" bind:value={password} />
				<PasswordInput id="wf-confirm" label="Confirm password" bind:value={confirm} />
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
</div>
