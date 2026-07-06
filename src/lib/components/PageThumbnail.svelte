<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';

	let {
		file,
		pageIndex = 0,
		scale = 0.35,
		class: className = ''
	}: {
		file: File;
		pageIndex?: number;
		scale?: number;
		class?: string;
	} = $props();

	const pdfEngine = usePdfEngineContext();
	let src = $state<string | null>(null);

	$effect(() => {
		const engine = pdfEngine.engine;
		const currentFile = file;
		const index = pageIndex;
		if (!engine || !currentFile) return;

		let cancelled = false;
		let objectUrl: string | null = null;

		(async () => {
			try {
				const buffer = await currentFile.arrayBuffer();
				const doc = await engine
					.openDocumentBuffer({ id: `thumb-${index}-${currentFile.name}`, content: buffer })
					.toPromise();
				const page = doc.pages[index];
				if (!page || cancelled) return;
				const blob = await engine.renderPage(doc, page, { scaleFactor: scale }).toPromise();
				if (cancelled) return;
				objectUrl = URL.createObjectURL(blob);
				src = objectUrl;
			} catch {
				if (!cancelled) src = null;
			}
		})();

		return () => {
			cancelled = true;
			if (objectUrl) URL.revokeObjectURL(objectUrl);
		};
	});
</script>

{#if src}
	<img {src} alt="Page {pageIndex + 1} preview" class="rounded border border-border object-cover {className}" />
{:else}
	<div class="animate-pulse rounded border border-border bg-muted {className}"></div>
{/if}
