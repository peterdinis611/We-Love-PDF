<script lang="ts">
	import type { Component } from 'svelte';
	import { browser } from '$app/environment';
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import ToolLanding from '$lib/components/ToolLanding.svelte';
	import PdfEngineProvider from '$lib/components/PdfEngineProvider.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { loadToolComponent, engineTools } from '$lib/tool-components';
	import { recordToolVisit } from '$lib/recent-tools';
	import { toolJsonLd } from '$lib/seo';
	import { localizeTool } from '$lib/i18n';
	import { getToolSeo, faqJsonLd } from '$lib/tool-seo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let ToolComponent = $state<Component | null>(null);
	let loading = $state(true);

	const locale = $derived(data.locale);
	const tool = $derived(localizeTool(data.tool, locale));
	const seo = $derived(getToolSeo(tool.slug, tool.name, locale));
	const needsEngine = $derived(engineTools.has(tool.slug));

	$effect(() => {
		if (browser) recordToolVisit(tool.slug);
	});

	$effect(() => {
		const slug = tool.slug;
		loading = true;
		ToolComponent = null;
		loadToolComponent(slug).then((component) => {
			ToolComponent = component;
			loading = false;
		});
	});
</script>

<SeoHead
	meta={{
		title: seo.title,
		description: seo.description,
		path: locale === 'sk' ? `/sk/tools/${tool.slug}` : `/tools/${tool.slug}`
	}}
	jsonLd={[
		toolJsonLd(tool.name, seo.description, tool.slug, locale),
		faqJsonLd(seo.faq)
	]}
	{locale}
/>

<ToolLayout {tool} {locale}>
	{#if loading}
		<div class="flex items-center justify-center py-16">
			<div class="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
		</div>
	{:else if ToolComponent}
		{#if needsEngine}
			<PdfEngineProvider>
				<ToolComponent />
			</PdfEngineProvider>
		{:else}
			<ToolComponent />
		{/if}
		<ToolLanding slug={tool.slug} name={tool.name} {locale} />
	{:else}
		<Alert message="This tool is not available yet." variant="info" />
	{/if}
</ToolLayout>
