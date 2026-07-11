<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PdfEngineProvider from '$lib/components/PdfEngineProvider.svelte';
	import SecurePdfWorkflow from '$lib/components/workflows/SecurePdfWorkflow.svelte';
	import { msg } from '$lib/i18n';
	import { localizedPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
</script>

<SeoHead
	meta={{
		title: m.workflow.title,
		description: m.workflow.subtitle,
		path: localizedPath('/workflows/secure-pdf', locale)
	}}
	{locale}
/>

<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">{m.workflow.title}</h1>
		<p class="text-sm text-muted-foreground">{m.workflow.subtitle}</p>
	</div>
	<PdfEngineProvider>
		<SecurePdfWorkflow {locale} />
	</PdfEngineProvider>
</div>
