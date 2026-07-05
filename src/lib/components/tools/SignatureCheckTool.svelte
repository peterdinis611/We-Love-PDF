<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { ShieldCheck, ShieldOff } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	type SignatureInfo = {
		reason: string;
		time: string;
		docMDP: number;
	};

	let file = $state<File | null>(null);
	let signatures = $state<SignatureInfo[] | null>(null);
	let loading = $state(false);
	let error = $state('');

	async function analyze(f: File) {
		if (!pdfEngine.engine) return;
		file = f;
		signatures = null;
		error = '';
		loading = true;

		try {
			const buffer = await f.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'signature-check', content: buffer })
				.toPromise();
			const result = await pdfEngine.engine.getSignatures(doc).toPromise();
			signatures = result.map((sig) => ({
				reason: sig.reason || '—',
				time: sig.time || '—',
				docMDP: sig.docMDP
			}));
		} catch {
			error = 'Could not read digital signatures from this PDF.';
			file = null;
		} finally {
			loading = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to inspect signatures" onfiles={(f) => analyze(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; signatures = null; error = ''; }} />

		{#if loading}
			<ToolPanel>
				<p class="text-center text-sm text-muted-foreground">Checking digital signatures…</p>
			</ToolPanel>
		{:else if signatures}
			<ToolPanel>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						{#if signatures.length}
							<ShieldCheck class="mt-0.5 size-5 text-green-600" />
						{:else}
							<ShieldOff class="mt-0.5 size-5 text-muted-foreground" />
						{/if}
						<div>
							<p class="font-medium">
								{signatures.length
									? `${signatures.length} digital signature${signatures.length === 1 ? '' : 's'} found`
									: 'No digital signatures'}
							</p>
							<p class="text-sm text-muted-foreground">
								{signatures.length
									? 'This document contains embedded signature fields.'
									: 'This PDF does not contain detectable digital signatures.'}
							</p>
						</div>
					</div>

					{#if signatures.length}
						<div class="space-y-3">
							{#each signatures as sig, i}
								<dl class="divide-y divide-border rounded-lg border border-border/60">
									<div class="px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
										Signature {i + 1}
									</div>
									<div class="flex justify-between px-4 py-3">
										<dt class="text-sm text-muted-foreground">Reason</dt>
										<dd class="text-sm font-medium">{sig.reason}</dd>
									</div>
									<div class="flex justify-between px-4 py-3">
										<dt class="text-sm text-muted-foreground">Signed at</dt>
										<dd class="text-sm font-medium">{sig.time}</dd>
									</div>
									<div class="flex justify-between px-4 py-3">
										<dt class="text-sm text-muted-foreground">DocMDP</dt>
										<dd class="text-sm font-medium">{sig.docMDP}</dd>
									</div>
								</dl>
							{/each}
						</div>
					{/if}
				</div>
			</ToolPanel>
		{/if}
	{/if}

	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
