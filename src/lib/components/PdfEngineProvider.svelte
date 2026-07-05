<script lang="ts">
	import { setContext } from 'svelte';
	import { initPdfEngineContext, PDF_ENGINE_KEY } from '$lib/pdf/engine-context';

	let { children }: { children: import('svelte').Snippet } = $props();

	const engine = initPdfEngineContext();
	setContext(PDF_ENGINE_KEY, engine);
</script>

{@render children()}
