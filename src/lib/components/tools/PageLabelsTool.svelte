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
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { setPageLabels, setRomanThenDecimal, type PageLabelStyle } from '$lib/pdf/page-labels';

	const locale = getAppLocale();
	let file = $state<File | null>(null);
	let preset = $state<'roman-body' | 'decimal' | 'custom'>('roman-body');
	let bodyStart = $state(3);
	let style = $state<PageLabelStyle>('D');
	let prefix = $state('');
	let startAt = $state(1);
	let outputName = $state('page-labels.pdf');
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
			const bytes =
				preset === 'roman-body'
					? await setRomanThenDecimal(file, bodyStart)
					: preset === 'decimal'
						? await setPageLabels(file, [{ startPage: 0, style: 'D', startAt: 1 }])
						: await setPageLabels(file, [
								{ startPage: 0, style, prefix: prefix || undefined, startAt }
							]);
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to set page labels.';
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
				<p class="text-sm text-muted-foreground">
					Sets PDF page labels (viewer chrome: i, ii, 1…) — not stamped text on the page.
				</p>
				<div class="flex flex-wrap gap-2">
					{#each [
						['roman-body', 'Roman front → decimal'],
						['decimal', 'Decimal only'],
						['custom', 'Custom']
					] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {preset === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (preset = value as typeof preset)}
						>
							{label}
						</button>
					{/each}
				</div>
				{#if preset === 'roman-body'}
					<div>
						<label for="body" class="mb-1 block text-sm font-medium">Body starts at page</label>
						<Input id="body" type="number" min="1" bind:value={bodyStart} />
					</div>
				{:else if preset === 'custom'}
					<div class="grid gap-3 sm:grid-cols-3">
						<div>
							<label for="style" class="mb-1 block text-sm font-medium">Style</label>
							<select
								id="style"
								bind:value={style}
								class="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
							>
								<option value="D">1, 2, 3…</option>
								<option value="r">i, ii, iii…</option>
								<option value="R">I, II, III…</option>
								<option value="a">a, b, c…</option>
								<option value="A">A, B, C…</option>
							</select>
						</div>
						<div>
							<label for="prefix" class="mb-1 block text-sm font-medium">Prefix</label>
							<Input id="prefix" bind:value={prefix} placeholder="App-" />
						</div>
						<div>
							<label for="startAt" class="mb-1 block text-sm font-medium">Start at</label>
							<Input id="startAt" type="number" min="1" bind:value={startAt} />
						</div>
					</div>
				{/if}
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} onclick={handle}>Apply page labels</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
	{/if}
	<Alert message={error} />
</div>
