<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import PdfEngineProvider from '$lib/components/PdfEngineProvider.svelte';
	import PrepareForSendWorkflow from '$lib/components/workflows/PrepareForSendWorkflow.svelte';
	import { msg } from '$lib/i18n';
	import { localizedPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.prepareForSend);
</script>

<SeoHead
	meta={{
		title: copy.title,
		description: copy.subtitle,
		path: localizedPath('/workflows/prepare-for-send', locale)
	}}
	{locale}
/>

<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
		<p class="text-sm text-muted-foreground">{copy.subtitle}</p>
	</div>
	<PdfEngineProvider>
		<PrepareForSendWorkflow {locale} />
	</PdfEngineProvider>
</div>
