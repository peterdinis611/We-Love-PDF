<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { bookletPdf, nUpPdf, PAGE_TARGETS } from '$lib/pdf/layout-ops';
	import { getAppLocale } from '$lib/i18n/context';

	let file = $state<File | null>(null);
	let mode = $state<'2' | '4' | '9' | 'booklet'>('2');
	let target = $state<keyof typeof PAGE_TARGETS>('a4');
	let printPreset = $state<'none' | 'duplex-long' | 'duplex-short' | 'range'>('none');
	let pageRange = $state('');
	let outputName = $state('nup.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);
	const locale = getAppLocale();

	function applyPrintPreset(preset: typeof printPreset) {
		printPreset = preset;
		if (preset === 'duplex-long') {
			mode = '2';
			target = 'a4';
			outputName = 'print-duplex-long.pdf';
		} else if (preset === 'duplex-short') {
			mode = '2';
			target = 'letter';
			outputName = 'print-duplex-short.pdf';
		} else if (preset === 'range') {
			mode = 'booklet';
			outputName = 'print-booklet.pdf';
		}
	}

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes =
				mode === 'booklet'
					? await bookletPdf(file)
					: await nUpPdf(file, { n: Number(mode) as 2 | 4 | 9, target });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			const hint =
				printPreset === 'duplex-long'
					? ' Tip: in the print dialog choose duplex / long-edge.'
					: printPreset === 'duplex-short'
						? ' Tip: in the print dialog choose duplex / short-edge.'
						: printPreset === 'range' && pageRange.trim()
							? ` Tip: print pages ${pageRange.trim()} from the booklet.`
							: '';
			success = `Downloaded ${name} (${formatFileSize(bytes.length)}).${hint}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create N-up PDF.';
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
				<div>
					<p class="mb-2 text-sm font-medium">Print presets</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['none', 'Custom'],
							['duplex-long', 'Duplex long-edge'],
							['duplex-short', 'Duplex short-edge'],
							['range', 'Booklet pack']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {printPreset === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => applyPrintPreset(value as typeof printPreset)}
							>
								{label}
							</button>
						{/each}
					</div>
					{#if printPreset === 'range'}
						<input
							class="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							placeholder="Optional page range note e.g. 1-8"
							bind:value={pageRange}
						/>
					{/if}
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Layout</p>
					<div class="flex flex-wrap gap-2">
						{#each [['2', '2-up'], ['4', '4-up'], ['9', '9-up'], ['booklet', 'Booklet']] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {mode === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (mode = value as typeof mode)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				{#if mode !== 'booklet'}
					<div>
						<p class="mb-2 text-sm font-medium">Sheet size</p>
						<div class="flex flex-wrap gap-2">
							{#each Object.keys(PAGE_TARGETS) as key}
								<button
									type="button"
									class="rounded-full px-3 py-1.5 text-xs font-medium uppercase transition {target === key
										? 'bg-primary text-primary-foreground'
										: 'bg-secondary text-secondary-foreground'}"
									onclick={() => (target = key as typeof target)}
								>
									{key}
								</button>
							{/each}
						</div>
					</div>
				{/if}
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Building…" onclick={handle}>
			Create {mode === 'booklet' ? 'booklet' : `${mode}-up`}
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} suggestions={[{ slug: 'page-numbers', label: 'Page numbers' }, { slug: 'compress-pdf', label: 'Compress' }]} />
	{/if}
	<Alert message={error} />
</div>
