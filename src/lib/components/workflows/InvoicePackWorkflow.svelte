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
		type PdfFile
	} from '$lib/pdf/operations';
	import { mergePdfs } from '$lib/pdf/heavy';
	import { stampPdf } from '$lib/pdf/layout-ops';
	import { resolveAllowedFlags, validatePasswordPair, type PermissionPreset } from '$lib/pdf/security';
	import { Input } from '$lib/components/ui/input/index.js';

	const pdfEngine = usePdfEngineContext();
	let { locale = 'en' as Locale }: { locale?: Locale } = $props();
	$effect(() => setAppLocale(locale));
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.invoicePack);

	let step = $state(1);
	let files = $state<PdfFile[]>([]);
	let merged = $state<Uint8Array | null>(null);
	let stamped = $state<Uint8Array | null>(null);
	let password = $state('');
	let confirm = $state('');
	let outputName = $state('invoice-pack.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const steps = $derived([
		{ n: 1, label: copy.stepMerge },
		{ n: 2, label: copy.stepStamp },
		{ n: 3, label: copy.stepProtect }
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
	}

	async function runMerge() {
		if (!files.length) return;
		processing = true;
		error = '';
		try {
			merged =
				files.length === 1
					? new Uint8Array(await files[0].file.arrayBuffer())
					: await mergePdfs(files.map((f) => f.file));
			step = 2;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Merge failed.';
		} finally {
			processing = false;
		}
	}

	async function runStamp() {
		if (!merged) return;
		processing = true;
		error = '';
		try {
			const f = new File([merged.slice()], 'merged.pdf', { type: 'application/pdf' });
			stamped = await stampPdf(f, { text: 'PAID', color: 'green' });
			step = 3;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Stamp failed.';
		} finally {
			processing = false;
		}
	}

	async function runProtect() {
		if (!stamped || !pdfEngine.engine) return;
		const validationError = validatePasswordPair(password, confirm);
		if (validationError) {
			error = validationError;
			return;
		}
		processing = true;
		error = '';
		success = '';
		try {
			const pdfBytes = stamped.slice();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({
					id: 'invoice-protect',
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
			success = `${m.workflow.download}: ${name} (${formatFileSize(result.byteLength)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Protect failed.';
		} finally {
			processing = false;
		}
	}
</script>

<WorkflowShell {steps} {step}>
	{#if step === 1}
		<FileDropzone multiple onfiles={addFiles} />
		{#each files as file, i (file.id)}
			<div class="mt-2">
				<FileListItem
					name={file.name}
					size={file.size}
					index={i}
					onremove={() => (files = files.filter((f) => f.id !== file.id))}
				/>
			</div>
		{/each}
		<ToolAction disabled={processing || !files.length} loading={processing} onclick={runMerge}>
			{copy.stepMerge}
		</ToolAction>
	{:else if step === 2}
		<ToolPanel>
			<p class="text-sm text-muted-foreground">{copy.stampHint}</p>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={runStamp}>{copy.stepStamp}</ToolAction>
	{:else}
		<ToolPanel>
			<label for="pw" class="mb-1 block text-sm font-medium">{copy.password}</label>
			<Input id="pw" type="password" bind:value={password} autocomplete="new-password" class="mb-2" />
			<label for="pw2" class="mb-1 block text-sm font-medium">{copy.confirm}</label>
			<Input id="pw2" type="password" bind:value={confirm} autocomplete="new-password" />
			<div class="mt-3"><OutputFilename bind:value={outputName} /></div>
		</ToolPanel>
		<ToolAction
			disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing || pdfEngine.isLoading}
			onclick={runProtect}
		>
			{copy.stepProtect}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</WorkflowShell>
