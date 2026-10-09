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
	import { stampPdf } from '$lib/pdf/layout-ops';
	import { getAppLocale } from '$lib/i18n/context';

	const PRESETS = ['CONFIDENTIAL', 'DRAFT', 'APPROVED', 'PAID', 'COPY', 'VOID'] as const;

	let file = $state<File | null>(null);
	let text = $state<string>('CONFIDENTIAL');
	let color = $state<'red' | 'blue' | 'gray' | 'green'>('red');
	let outputName = $state('stamped.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);
	const locale = getAppLocale();

	async function handle() {
		if (!file || !text.trim()) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await stampPdf(file, { text: text.trim().toUpperCase(), color });
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to stamp PDF.';
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
					<p class="mb-2 text-sm font-medium">Preset</p>
					<div class="flex flex-wrap gap-2">
						{#each PRESETS as preset}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {text === preset
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (text = preset)}
							>
								{preset}
							</button>
						{/each}
					</div>
				</div>
				<div>
					<p class="mb-2 text-sm font-medium">Color</p>
					<div class="flex flex-wrap gap-2">
						{#each ['red', 'blue', 'gray', 'green'] as c}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium capitalize transition {color === c
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (color = c as typeof color)}
							>
								{c}
							</button>
						{/each}
					</div>
				</div>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Stamping…" onclick={handle}>
			Apply stamp
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain
			bytes={lastBytes}
			filename={outputName}
			{locale}
			suggestions={[
				{ slug: 'protect-pdf', label: 'Protect' },
				{ slug: 'compress-pdf', label: 'Compress' }
			]}
		/>
	{/if}
	<Alert message={error} />
</div>
