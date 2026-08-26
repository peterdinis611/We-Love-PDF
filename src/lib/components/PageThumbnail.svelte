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
	let rootEl = $state<HTMLDivElement | null>(null);
	let visible = $state(false);

	$effect(() => {
		const el = rootEl;
		if (!el || typeof IntersectionObserver === 'undefined') {
			visible = true;
			return;
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					visible = true;
					io.disconnect();
				}
			},
			{ rootMargin: '120px' }
		);
		io.observe(el);
		return () => io.disconnect();
	});

	$effect(() => {
		const engine = pdfEngine.engine;
		const currentFile = file;
		const index = pageIndex;
		if (!engine || !currentFile || !visible) return;

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

<div
	bind:this={rootEl}
	class="pdf-thumb-frame overflow-hidden rounded border border-border bg-muted/60 dark:bg-zinc-800/80 {className}"
	style="content-visibility: auto; contain-intrinsic-size: 120px 160px;"
>
	{#if src}
		<img {src} alt="Page {pageIndex + 1} preview" class="block h-full w-full object-cover" loading="lazy" decoding="async" />
	{:else}
		<div class="h-full min-h-24 w-full animate-pulse bg-muted dark:bg-zinc-800/60"></div>
	{/if}
</div>
