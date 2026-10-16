<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize, getPageCount } from '$lib/pdf/operations';
	import { applyEditOverlays, rgb, type EditOverlay } from '$lib/pdf/edit-pdf';
	import { getAppLocale } from '$lib/i18n/context';
	import { Plus, Trash2 } from '@lucide/svelte';

	const locale = getAppLocale();
	const pdfEngine = usePdfEngineContext();

	type DraftKind = 'text' | 'image' | 'rect' | 'line';

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let pageIndex = $state(0);
	let kind = $state<DraftKind>('text');
	let text = $state('Sample text');
	let fontSize = $state(16);
	let x = $state(72);
	let y = $state(720);
	let width = $state(160);
	let height = $state(40);
	let x2 = $state(300);
	let y2 = $state(720);
	let imageFile = $state<File | null>(null);
	let previewUrl = $state<string | null>(null);
	let overlays = $state<EditOverlay[]>([]);
	let outputName = $state('edited.pdf');
	let processing = $state(false);
	let previewing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		overlays = [];
		pageIndex = 0;
		try {
			pageCount = await getPageCount(f);
			await refreshPreview();
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	async function refreshPreview() {
		if (!file || !pdfEngine.engine) return;
		previewing = true;
		try {
			if (previewUrl) URL.revokeObjectURL(previewUrl);
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: `edit-preview-${pageIndex}`, content: buffer })
				.toPromise();
			const page = doc.pages[pageIndex];
			if (!page) return;
			const blob = await pdfEngine.engine.renderPage(doc, page, { scaleFactor: 1.25 }).toPromise();
			previewUrl = URL.createObjectURL(blob);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Preview failed.';
		} finally {
			previewing = false;
		}
	}

	$effect(() => {
		const f = file;
		const eng = pdfEngine.engine;
		const idx = pageIndex;
		if (f && eng && idx >= 0) {
			void refreshPreview();
		}
	});

	function onPreviewClick(e: MouseEvent) {
		const el = e.currentTarget as HTMLElement;
		const img = el.querySelector('img');
		if (!img) return;
		const rect = img.getBoundingClientRect();
		const relX = (e.clientX - rect.left) / rect.width;
		const relY = (e.clientY - rect.top) / rect.height;
		// PDF origin is bottom-left; assume letter-ish from image aspect
		const pageW = img.naturalWidth || 612;
		const pageH = img.naturalHeight || 792;
		x = Math.round(relX * pageW);
		y = Math.round((1 - relY) * pageH);
		if (kind === 'line') {
			x2 = x + 120;
			y2 = y;
		}
	}

	async function addOverlay() {
		error = '';
		if (kind === 'text') {
			if (!text.trim()) {
				error = 'Enter text to place.';
				return;
			}
			overlays = [
				...overlays,
				{
					kind: 'text',
					page: pageIndex,
					x,
					y,
					text: text.trim(),
					fontSize,
					color: rgb(0.1, 0.1, 0.1)
				}
			];
		} else if (kind === 'rect') {
			overlays = [
				...overlays,
				{
					kind: 'rect',
					page: pageIndex,
					x,
					y: y - height,
					width,
					height,
					stroke: rgb(0.82, 0.07, 0.18),
					strokeWidth: 2,
					opacity: 0.9
				}
			];
		} else if (kind === 'line') {
			overlays = [
				...overlays,
				{
					kind: 'line',
					page: pageIndex,
					x1: x,
					y1: y,
					x2,
					y2,
					color: rgb(0.1, 0.1, 0.1),
					thickness: 1.5
				}
			];
		} else if (kind === 'image') {
			if (!imageFile) {
				error = 'Choose an image to place.';
				return;
			}
			const bytes = new Uint8Array(await imageFile.arrayBuffer());
			overlays = [
				...overlays,
				{
					kind: 'image',
					page: pageIndex,
					x,
					y: y - height,
					width,
					height,
					bytes,
					mime: imageFile.type || 'image/png'
				}
			];
		}
	}

	function removeOverlay(i: number) {
		overlays = overlays.filter((_, idx) => idx !== i);
	}

	async function handleApply() {
		if (!file || !overlays.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const result = await applyEditOverlays(file, overlays);
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			lastBytes = result;
			success = `Downloaded ${name} with ${overlays.length} edit${overlays.length === 1 ? '' : 's'} (${formatFileSize(result.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to edit PDF.';
		} finally {
			processing = false;
		}
	}

	function overlayLabel(o: EditOverlay, i: number) {
		const page = `p.${o.page + 1}`;
		if (o.kind === 'text') return `${i + 1}. Text “${o.text.slice(0, 24)}” (${page})`;
		if (o.kind === 'image') return `${i + 1}. Image (${page})`;
		if (o.kind === 'rect') return `${i + 1}. Rectangle (${page})`;
		return `${i + 1}. Line (${page})`;
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
		<p class="text-sm text-muted-foreground">
			Place text, images, rectangles, and lines onto pages. Edits are burned into the PDF (not annotations).
		</p>
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />

		<div class="grid gap-4 lg:grid-cols-[1fr_20rem]">
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-2">
					<label class="text-sm font-medium" for="edit-page">Page</label>
					<Input
						id="edit-page"
						type="number"
						class="h-8 w-20"
						min={1}
						max={pageCount}
						value={pageIndex + 1}
						oninput={(e) => {
							const n = Number(e.currentTarget.value);
							if (n >= 1 && n <= pageCount) pageIndex = n - 1;
						}}
					/>
					<span class="text-xs text-muted-foreground">of {pageCount}</span>
					{#if previewing}
						<span class="text-xs text-muted-foreground">Rendering…</span>
					{/if}
				</div>
				<button
					type="button"
					class="block w-full overflow-hidden rounded-sm border border-border bg-muted/30 text-left"
					onclick={onPreviewClick}
					title="Click to set position"
				>
					{#if previewUrl}
						<img src={previewUrl} alt="Page {pageIndex + 1} preview" class="mx-auto max-h-[70vh] w-auto" />
					{:else}
						<div class="flex h-64 items-center justify-center text-sm text-muted-foreground">
							{pdfEngine.isLoading ? 'Loading engine…' : 'Preview unavailable'}
						</div>
					{/if}
				</button>
				<p class="text-xs text-muted-foreground">Click the preview to set X/Y (PDF coordinates, origin bottom-left).</p>
			</div>

			<div class="space-y-4">
				<ToolPanel>
					<div class="space-y-3">
						<p class="text-sm font-medium">Add element</p>
						<div class="flex flex-wrap gap-1.5">
							{#each [
								['text', 'Text'],
								['image', 'Image'],
								['rect', 'Rect'],
								['line', 'Line']
							] as [value, label]}
								<button
									type="button"
									class="rounded-sm px-2.5 py-1 text-xs font-medium {kind === value
										? 'bg-primary text-primary-foreground'
										: 'bg-secondary text-secondary-foreground'}"
									onclick={() => (kind = value as DraftKind)}
								>
									{label}
								</button>
							{/each}
						</div>

						{#if kind === 'text'}
							<Input bind:value={text} placeholder="Text to place" />
							<label class="block text-xs text-muted-foreground"
								>Size
								<input type="range" min="10" max="48" bind:value={fontSize} class="mt-1 w-full accent-primary" />
							</label>
						{:else if kind === 'image'}
							<input
								type="file"
								accept="image/png,image/jpeg,.png,.jpg,.jpeg"
								class="block w-full text-xs"
								onchange={(e) => (imageFile = e.currentTarget.files?.[0] ?? null)}
							/>
							<div class="grid grid-cols-2 gap-2">
								<label class="text-xs">W <Input type="number" bind:value={width} class="h-8" /></label>
								<label class="text-xs">H <Input type="number" bind:value={height} class="h-8" /></label>
							</div>
						{:else if kind === 'rect'}
							<div class="grid grid-cols-2 gap-2">
								<label class="text-xs">W <Input type="number" bind:value={width} class="h-8" /></label>
								<label class="text-xs">H <Input type="number" bind:value={height} class="h-8" /></label>
							</div>
						{:else}
							<div class="grid grid-cols-2 gap-2">
								<label class="text-xs">X2 <Input type="number" bind:value={x2} class="h-8" /></label>
								<label class="text-xs">Y2 <Input type="number" bind:value={y2} class="h-8" /></label>
							</div>
						{/if}

						<div class="grid grid-cols-2 gap-2">
							<label class="text-xs">X <Input type="number" bind:value={x} class="h-8" /></label>
							<label class="text-xs">Y <Input type="number" bind:value={y} class="h-8" /></label>
						</div>

						<Button type="button" size="sm" class="w-full" onclick={addOverlay}>
							<Plus class="size-3.5" />
							Add to page {pageIndex + 1}
						</Button>
					</div>
				</ToolPanel>

				{#if overlays.length}
					<ul class="divide-y divide-border border border-border text-sm">
						{#each overlays as o, i}
							<li class="flex items-center gap-2 px-2 py-2">
								<span class="min-w-0 flex-1 truncate">{overlayLabel(o, i)}</span>
								<button
									type="button"
									class="p-1 text-muted-foreground hover:text-destructive"
									onclick={() => removeOverlay(i)}
									aria-label="Remove"
								>
									<Trash2 class="size-3.5" />
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<OutputFilename bind:value={outputName} />
				<ToolAction
					disabled={processing || !overlays.length}
					loading={processing}
					loadingText="Applying edits…"
					onclick={handleApply}
				>
					Download edited PDF
				</ToolAction>
				<ToolSuccess message={success} />
				<ContinueChain bytes={lastBytes} filename={outputName} {locale} />
			</div>
		</div>
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
