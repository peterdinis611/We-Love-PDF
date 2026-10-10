<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import LegalBindWorkflow from '$lib/components/workflows/LegalBindWorkflow.svelte';
	import { breadcrumbJsonLd, site, workflowJsonLd } from '$lib/seo';
	import { msg } from '$lib/i18n';
	import { localizedPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const copy = $derived(m.workflows.legalBind);
	const path = $derived(localizedPath('/workflows/legal-bind', locale));
</script>

<SeoHead
	meta={{ title: copy.title, description: copy.subtitle, path }}
	jsonLd={[
		workflowJsonLd(copy.title, copy.subtitle, 'legal-bind', locale),
		breadcrumbJsonLd([
			{ name: site.name, path: localizedPath('/', locale) },
			{ name: m.home.workflows, path: localizedPath('/', locale) + '#workflows' },
			{ name: copy.title, path }
		])
	]}
	{locale}
/>

<div class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
	<div class="mb-8 text-center">
		<h1 class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">{copy.title}</h1>
		<p class="text-sm text-muted-foreground">{copy.subtitle}</p>
	</div>
	<LegalBindWorkflow {locale} />
</div>
