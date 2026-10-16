<script lang="ts">
	import { page } from '$app/stores';
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import {
		chainNeedsEngine,
		getBatchChain,
		runBatchChain,
		type ChainProgress
	} from '$lib/pdf/chain-ops';
	import { BATCH_CHAINS } from '$lib/workflows';
	import { getTool } from '$lib/tools';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let chainId = $state(BATCH_CHAINS[0]?.id ?? 'batch-secure');
	let password = $state('');
	let signature = $state('Signed');
	let watermarkText = $state('CONFIDENTIAL');
	let stampText = $state('CONFIDENTIAL');
	let batesPrefix = $state('DOC-');
	let outputName = $state('chain-result.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let progress = $state<ChainProgress | null>(null);

	const chain = $derived(getBatchChain(chainId) ?? BATCH_CHAINS[0]);
	const needsEngine = $derived(chainNeedsEngine(chain?.slugs ?? []));
	const needsPassword = $derived((chain?.slugs ?? []).includes('protect-pdf'));
	const needsSign = $derived((chain?.slugs ?? []).includes('sign-pdf'));
	const needsWatermark = $derived((chain?.slugs ?? []).includes('watermark-pdf'));
	const needsStamp = $derived((chain?.slugs ?? []).includes('stamp-pdf'));
	const needsBates = $derived((chain?.slugs ?? []).includes('bates-pdf'));

	$effect(() => {
		const q = $page.url.searchParams.get('chain');
		if (q && getBatchChain(q)) chainId = q;
	});

	function stepLabel(slug: string) {
		return getTool(slug)?.name ?? slug;
	}

	async function handleRun() {
		if (!file || !chain) return;
		if (needsPassword && !password.trim()) {
			error = 'Enter a password for the Protect step.';
			return;
		}
		if (needsEngine && !pdfEngine.engine) {
			error = 'PDF engine is still loading.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		progress = null;
		try {
			const result = await runBatchChain(
				file,
				chain.slugs,
				{
					password,
					signature,
					watermarkText,
					stampText,
					batesPrefix,
					engine: pdfEngine.engine ?? undefined
				},
				(p) => (progress = p)
			);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} after ${chain.slugs.length} steps (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Chain failed.';
		} finally {
			processing = false;
			progress = null;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
		<p class="text-sm text-muted-foreground">
			Pick a chain, drop one PDF, and run every step in order — one download at the end.
		</p>
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div>
					<p class="mb-2 text-sm font-medium">Pipeline</p>
					<div class="space-y-2">
						{#each BATCH_CHAINS as c}
							<label
								class="flex cursor-pointer items-start gap-3 rounded-sm border border-border p-3 transition hover:bg-muted/50 {chainId ===
								c.id
									? 'border-primary/40 bg-primary/5'
									: ''}"
							>
								<input type="radio" bind:group={chainId} value={c.id} class="mt-1 accent-primary" />
								<span class="min-w-0">
									<span class="block text-sm font-medium">{c.title.replace(/^Batch:\s*/i, '')}</span>
									<span class="block text-xs text-muted-foreground">
										{c.slugs.map(stepLabel).join(' → ')}
									</span>
								</span>
							</label>
						{/each}
					</div>
				</div>

				{#if needsPassword}
					<div>
						<label for="chain-pw" class="mb-1 block text-sm font-medium">Password (Protect)</label>
						<Input id="chain-pw" type="password" bind:value={password} autocomplete="new-password" />
					</div>
				{/if}
				{#if needsSign}
					<div>
						<label for="chain-sign" class="mb-1 block text-sm font-medium">Signature text</label>
						<Input id="chain-sign" bind:value={signature} />
					</div>
				{/if}
				{#if needsWatermark}
					<div>
						<label for="chain-wm" class="mb-1 block text-sm font-medium">Watermark text</label>
						<Input id="chain-wm" bind:value={watermarkText} />
					</div>
				{/if}
				{#if needsStamp}
					<div>
						<label for="chain-stamp" class="mb-1 block text-sm font-medium">Stamp text</label>
						<Input id="chain-stamp" bind:value={stampText} />
					</div>
				{/if}
				{#if needsBates}
					<div>
						<label for="chain-bates" class="mb-1 block text-sm font-medium">Bates prefix</label>
						<Input id="chain-bates" bind:value={batesPrefix} />
					</div>
				{/if}

				<OutputFilename bind:value={outputName} />

				{#if progress}
					<p class="text-sm text-muted-foreground">
						Step {progress.index + 1}/{progress.total}: {stepLabel(progress.slug)}…
					</p>
				{/if}
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || (needsEngine && (pdfEngine.isLoading || !pdfEngine.engine))}
			loading={processing || (needsEngine && pdfEngine.isLoading)}
			loadingText={pdfEngine.isLoading
				? 'Loading engine…'
				: progress
					? `Running ${stepLabel(progress.slug)}…`
					: 'Running chain…'}
			onclick={handleRun}
		>
			Run full chain
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error && needsEngine}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
