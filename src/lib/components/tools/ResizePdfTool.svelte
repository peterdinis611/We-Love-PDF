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
	import { PAGE_TARGETS, resizePdfPages } from '$lib/pdf/layout-ops';
	import { getAppLocale } from '$lib/i18n/context';

	let file = $state<File | null>(null);
	let target = $state<keyof typeof PAGE_TARGETS>('a4');
	let mode = $state<'fit' | 'stretch'>('fit');
	let outputName = $state('resized.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);
	const locale = getAppLocale();

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await resizePdfPages(file, { target, mode });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to resize PDF.';
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
					<p class="mb-2 text-sm font-medium">Target size</p>
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
				<div>
					<p class="mb-2 text-sm font-medium">Mode</p>
					<div class="flex flex-wrap gap-2">
						{#each [['fit', 'Fit (keep aspect)'], ['stretch', 'Stretch']] as [value, label]}
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
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Resizing…" onclick={handle}>
			Resize PDF
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
