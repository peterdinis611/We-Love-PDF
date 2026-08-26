<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		addWatermark,
		createFileId,
		formatFileSize,
		outputNameFromInput,
		removeAllMetadata,
		rotateAllPages,
		type PdfFile,
		type WatermarkPosition
	} from '$lib/pdf/operations';
	import { compressPdf } from '$lib/pdf/heavy';
	import { downloadZip, uniqueZipName } from '$lib/pdf/zip';
	import { resolveAllowedFlags, validatePasswordPair, type PermissionPreset } from '$lib/pdf/security';
	import { readStringParam, syncToolParams } from '$lib/tool-params';

	const pdfEngine = usePdfEngineContext();

	type BatchOperation =
		| 'compress'
		| 'rotate-90'
		| 'rotate-180'
		| 'rotate-270'
		| 'remove-metadata'
		| 'flatten'
		| 'watermark'
		| 'protect';

	const OPS: { value: BatchOperation; label: string }[] = [
		{ value: 'compress', label: 'Compress' },
		{ value: 'rotate-90', label: 'Rotate 90°' },
		{ value: 'rotate-180', label: 'Rotate 180°' },
		{ value: 'rotate-270', label: 'Rotate 270°' },
		{ value: 'watermark', label: 'Watermark' },
		{ value: 'protect', label: 'Protect' },
		{ value: 'remove-metadata', label: 'Remove metadata' },
		{ value: 'flatten', label: 'Flatten forms' }
	];

	const needsEngine = (op: BatchOperation) => op === 'flatten' || op === 'protect';

	let files = $state<PdfFile[]>([]);
	let operation = $state<BatchOperation>(
		(readStringParam('op', 'compress') as BatchOperation) || 'compress'
	);
	let watermarkText = $state('CONFIDENTIAL');
	let watermarkOpacity = $state(0.25);
	let watermarkPosition = $state<WatermarkPosition>('diagonal');
	let password = $state('');
	let confirm = $state('');
	let processing = $state(false);
	let progressCurrent = $state(0);
	let error = $state('');
	let success = $state('');

	$effect(() => {
		syncToolParams({ op: operation });
	});

	function addFiles(newFiles: File[]) {
		const pdfs = newFiles.filter(
			(f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
		);
		if (!pdfs.length) {
			error = 'Please select PDF files.';
			return;
		}
		files = [
			...files,
			...pdfs.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
		error = '';
		success = '';
	}

	async function protectFile(file: File): Promise<Uint8Array> {
		if (!pdfEngine.engine) throw new Error('PDF engine not ready.');
		const buffer = await file.arrayBuffer();
		const doc = await pdfEngine.engine
			.openDocumentBuffer({ id: `batch-protect-${file.name}`, content: buffer })
			.toPromise();
		const encrypted = await pdfEngine.engine.isEncrypted(doc).toPromise();
		if (encrypted) throw new Error(`${file.name} is already encrypted.`);
		const flags = resolveAllowedFlags('full' as PermissionPreset, {
			print: true,
			copy: true,
			modify: true,
			annotate: true,
			forms: true
		});
		await pdfEngine.engine.setDocumentEncryption(doc, password, password, flags).toPromise();
		return new Uint8Array(await pdfEngine.engine.saveAsCopy(doc).toPromise());
	}

	async function processFile(file: File, op: BatchOperation): Promise<Uint8Array> {
		switch (op) {
			case 'compress':
				return compressPdf(file);
			case 'rotate-90':
				return rotateAllPages(file, 90);
			case 'rotate-180':
				return rotateAllPages(file, 180);
			case 'rotate-270':
				return rotateAllPages(file, 270);
			case 'remove-metadata':
				return removeAllMetadata(file);
			case 'watermark':
				return addWatermark(file, watermarkText.trim(), {
					opacity: watermarkOpacity,
					position: watermarkPosition
				});
			case 'protect':
				return protectFile(file);
			case 'flatten': {
				if (!pdfEngine.engine) throw new Error('PDF engine not ready.');
				const buffer = await file.arrayBuffer();
				const doc = await pdfEngine.engine
					.openDocumentBuffer({ id: `batch-${file.name}`, content: buffer })
					.toPromise();
				for (const page of doc.pages) {
					await pdfEngine.engine.flattenPage(doc, page).toPromise();
				}
				return new Uint8Array(await pdfEngine.engine.saveAsCopy(doc).toPromise());
			}
		}
	}

	function suffixFor(op: BatchOperation): string {
		switch (op) {
			case 'compress':
				return '-compressed';
			case 'rotate-90':
				return '-rotated-90';
			case 'rotate-180':
				return '-rotated-180';
			case 'rotate-270':
				return '-rotated-270';
			case 'remove-metadata':
				return '-clean';
			case 'flatten':
				return '-flattened';
			case 'watermark':
				return '-watermarked';
			case 'protect':
				return '-protected';
		}
	}

	async function handleBatch() {
		if (!files.length) return;
		if (needsEngine(operation) && !pdfEngine.engine) return;

		if (operation === 'watermark' && !watermarkText.trim()) {
			error = 'Enter watermark text.';
			return;
		}
		if (operation === 'protect') {
			const validationError = validatePasswordPair(password, confirm);
			if (validationError) {
				error = validationError;
				return;
			}
		}

		processing = true;
		error = '';
		success = '';
		progressCurrent = 0;

		try {
			const used = new Set<string>();
			const entries: { name: string; data: Uint8Array }[] = [];

			for (let i = 0; i < files.length; i++) {
				progressCurrent = i + 1;
				const item = files[i];
				const result = await processFile(item.file, operation);
				const outName = uniqueZipName(outputNameFromInput(item.name, suffixFor(operation)), used);
				entries.push({ name: outName, data: result });
			}

			const zipSize = await downloadZip(entries, `batch-${operation}.zip`);
			success = `Downloaded batch-${operation}.zip — ${entries.length} file${entries.length === 1 ? '' : 's'} (${formatFileSize(zipSize)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Batch processing failed.';
		} finally {
			processing = false;
			progressCurrent = 0;
		}
	}
</script>

<div class="space-y-4">
	<FileDropzone multiple onfiles={addFiles} />

	{#if files.length > 0}
		<p class="text-sm text-muted-foreground">
			{files.length} file{files.length === 1 ? '' : 's'} queued
		</p>
		<div class="space-y-2">
			{#each files as file, i (file.id)}
				<FileListItem
					name={file.name}
					size={file.size}
					index={i}
					onremove={() => (files = files.filter((f) => f.id !== file.id))}
				/>
			{/each}
		</div>

		<ToolPanel>
			<div class="space-y-3">
				<p class="text-sm font-medium">Operation</p>
				<div class="flex flex-wrap gap-2">
					{#each OPS as { value, label }}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {operation === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
							onclick={() => (operation = value)}
						>
							{label}
						</button>
					{/each}
				</div>

				{#if operation === 'watermark'}
					<div class="space-y-3 border-t border-border/60 pt-3">
						<div>
							<label for="batch-wm-text" class="mb-1 block text-sm font-medium">Watermark text</label>
							<Input id="batch-wm-text" bind:value={watermarkText} placeholder="CONFIDENTIAL" />
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
						<label for="batch-wm-opacity" class="block text-sm font-medium">
							Opacity: {Math.round(watermarkOpacity * 100)}%
						</label>
						<input
							id="batch-wm-opacity"
							type="range"
							min="0.1"
							max="0.8"
							step="0.05"
							bind:value={watermarkOpacity}
							class="w-full accent-primary"
						/>
					</div>
				{/if}

				{#if operation === 'protect'}
					<div class="space-y-3 border-t border-border/60 pt-3">
						<p class="text-xs text-muted-foreground">
							Same password is applied to every file in the batch.
						</p>
						<PasswordInput id="batch-password" label="Password" bind:value={password} />
						<PasswordInput id="batch-confirm" label="Confirm password" bind:value={confirm} />
					</div>
				{/if}

				<p class="text-xs text-muted-foreground">
					All files are processed with the same operation and downloaded as a single ZIP archive.
				</p>
			</div>
		</ToolPanel>

		{#if processing && files.length > 1}
			<ProgressBar
				value={progressCurrent}
				max={files.length}
				label="Processing {progressCurrent} of {files.length}…"
			/>
		{/if}

		<ToolAction
			disabled={processing ||
				(needsEngine(operation) && (pdfEngine.isLoading || !pdfEngine.engine))}
			loading={processing || (needsEngine(operation) && pdfEngine.isLoading)}
			loadingText={processing ? 'Processing…' : 'Loading engine…'}
			onclick={handleBatch}
		>
			Run batch ({files.length} file{files.length === 1 ? '' : 's'})
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
