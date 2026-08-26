<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import PdfViewer from '$lib/components/PdfViewer.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { consumePendingFile } from '$lib/pending-file';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Highlighter, X } from '@lucide/svelte';

	let file = $state<File | null>(null);
	let pdfUrl = $state<string | null>(null);
	let outputName = $state('annotated.pdf');
	let viewer = $state<{
		exportAnnotatedPdf: () => Promise<Uint8Array>;
		isViewerReady: () => boolean;
	} | null>(null);
	let saving = $state(false);
	let error = $state('');
	let success = $state('');

	function isPdf(f: File) {
		return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
	}

	async function setFile(f: File) {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = f;
		pdfUrl = URL.createObjectURL(f);
		outputName = f.name.replace(/\.pdf$/i, '') + '-annotated.pdf';
		error = '';
		success = '';
	}

	function clear() {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
		file = null;
		pdfUrl = null;
		viewer = null;
		success = '';
	}

	async function handleDownload() {
		if (!viewer?.isViewerReady()) {
			error = 'Viewer is still loading.';
			return;
		}
		saving = true;
		error = '';
		success = '';
		try {
			const bytes = await viewer.exportAnnotatedPdf();
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			success = `Downloaded ${name} — ${formatFileSize(bytes.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to export annotated PDF.';
		} finally {
			saving = false;
		}
	}

	onMount(() => {
		const pending = consumePendingFile();
		if (pending && isPdf(pending)) void setFile(pending);
	});

	onDestroy(() => {
		if (pdfUrl) URL.revokeObjectURL(pdfUrl);
	});
</script>

<div class="space-y-4">
	{#if !file || !pdfUrl}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
		<p class="text-sm text-muted-foreground">
			Highlight, underline, comments, ink, and stamps stay in your browser.
		</p>
	{:else}
		<div class="flex flex-wrap items-center gap-2">
			<FileListItem name={file.name} size={file.size} onremove={clear} />
			<Button type="button" variant="outline" size="sm" onclick={clear}>
				<X class="size-3.5" />
				Close
			</Button>
		</div>
		<div
			class="flex items-start gap-2 rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-sm text-muted-foreground"
		>
			<Highlighter class="mt-0.5 size-4 shrink-0 text-primary" />
			<span>
				Use the viewer toolbar to annotate, then click <strong class="text-foreground">Download annotated PDF</strong> below.
			</span>
		</div>
		<div class="min-h-[70vh] overflow-hidden rounded-xl border border-border">
			<PdfViewer bind:this={viewer} src={pdfUrl} class="h-[70vh] w-full" />
		</div>
		<OutputFilename bind:value={outputName} />
		<ToolAction loading={saving} disabled={saving} loadingText="Exporting…" onclick={handleDownload}>
			Download annotated PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
