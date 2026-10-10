<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { downloadBlob, ensurePdfFilename, formatFileSize, type PageNumberPosition } from '$lib/pdf/operations';
	import { addBatesNumbers } from '$lib/pdf/bates';

	const locale = getAppLocale();
	let file = $state<File | null>(null);
	let prefix = $state('CASE-');
	let suffix = $state('');
	let start = $state(1);
	let pad = $state(6);
	let position = $state<PageNumberPosition>('bottom-right');
	let outputName = $state('bates.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await addBatesNumbers(file, { prefix, suffix, start, pad, position });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to add Bates numbers.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="prefix" class="mb-1 block text-sm font-medium">Prefix</label>
						<Input id="prefix" bind:value={prefix} placeholder="CASE-" />
					</div>
					<div>
						<label for="suffix" class="mb-1 block text-sm font-medium">Suffix</label>
						<Input id="suffix" bind:value={suffix} placeholder="" />
					</div>
					<div>
						<label for="start" class="mb-1 block text-sm font-medium">Start number</label>
						<Input id="start" type="number" min="1" bind:value={start} />
					</div>
					<div>
						<label for="pad" class="mb-1 block text-sm font-medium">Zero-pad digits</label>
						<Input id="pad" type="number" min="1" max="12" bind:value={pad} />
					</div>
				</div>
				<p class="text-xs text-muted-foreground">
					Preview: {prefix}{String(start).padStart(pad, '0')}{suffix}
				</p>
				<div>
					<p class="mb-2 text-sm font-medium">Position</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['bottom-right', 'Bottom right'],
							['bottom-left', 'Bottom left'],
							['top-right', 'Top right'],
							['top-center', 'Top center']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {position === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (position = value as PageNumberPosition)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={handle}>Apply Bates numbers</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain
			bytes={lastBytes}
			filename={outputName}
			{locale}
			suggestions={[
				{ slug: 'stamp-pdf', label: 'Stamp' },
				{ slug: 'flatten-pdf', label: 'Flatten' },
				{ slug: 'protect-pdf', label: 'Protect' }
			]}
		/>
	{/if}
	<Alert message={error} />
</div>
