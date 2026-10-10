<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import {
		createFileId,
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		type PdfFile
	} from '$lib/pdf/operations';
	import { heicImagesToPdf } from '$lib/pdf/heic';

	let files = $state<PdfFile[]>([]);
	let pageSize = $state<'fit' | 'a4' | 'letter'>('a4');
	let outputName = $state('photos.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	function addFiles(newFiles: File[]) {
		const ok = newFiles.filter(
			(f) =>
				f.type.startsWith('image/') ||
				/\.(heic|heif|jpe?g|png|webp)$/i.test(f.name)
		);
		if (!ok.length) {
			error = 'Select HEIC/HEIF, JPG, PNG, or WebP images.';
			return;
		}
		files = [
			...files,
			...ok.map((file) => ({
				id: createFileId(),
				file,
				name: file.name,
				size: file.size
			}))
		];
		error = '';
	}

	async function handle() {
		if (!files.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await heicImagesToPdf(
				files.map((f) => f.file),
				{ pageSize }
			);
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `Downloaded ${name} — ${files.length} image${files.length === 1 ? '' : 's'}, ${formatFileSize(bytes.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to convert HEIC to PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	<FileDropzone
		multiple
		accept="image/heic,image/heif,image/jpeg,image/png,image/webp,.heic,.heif,.jpg,.jpeg,.png,.webp"
		label="Select HEIC / photos"
		hint="HEIC from iPhone + JPG/PNG/WebP"
		fileFilter={(f) =>
			f.type.startsWith('image/') || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name)}
		onfiles={addFiles}
	/>
	{#each files as f (f.id)}
		<FileListItem
			name={f.name}
			size={f.size}
			onremove={() => (files = files.filter((x) => x.id !== f.id))}
		/>
	{/each}
	{#if files.length}
		<ToolPanel>
			<div class="space-y-3">
				<div class="flex flex-wrap gap-2">
					{#each [['fit', 'Fit'], ['a4', 'A4'], ['letter', 'Letter']] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {pageSize === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (pageSize = value as typeof pageSize)}
						>
							{label}
						</button>
					{/each}
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Converting…" onclick={handle}>
			Create PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
