<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		signPdf,
		type SignPosition
	} from '$lib/pdf/operations';

	let file = $state<File | null>(null);
	let signature = $state('');
	let includeDate = $state(true);
	let allPages = $state(false);
	let position = $state<SignPosition>('bottom-left');
	let outputName = $state('signed.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleSign() {
		if (!file || !signature.trim()) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await signPdf(file, signature.trim(), { includeDate, allPages, position });
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to sign PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-6">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF here" onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<label for="signature" class="mb-1 block text-sm font-medium">Signature text</label>
					<Input id="signature" bind:value={signature} placeholder="Your name" />
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Position</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['bottom-left', 'Bottom left'],
							['bottom-center', 'Bottom center'],
							['bottom-right', 'Bottom right']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {position === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (position = value as SignPosition)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={includeDate} class="rounded border-border accent-primary" />
					Include date
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={allPages} class="rounded border-border accent-primary" />
					Sign all pages (default: last page only)
				</label>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !signature.trim()}
			loading={processing}
			loadingText="Signing…"
			onclick={handleSign}
		>
			Sign PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
