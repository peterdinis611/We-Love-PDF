<script lang="ts">
	import type { Component } from 'svelte';
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import PdfEngineProvider from '$lib/components/PdfEngineProvider.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { loadToolComponent, engineTools } from '$lib/tool-components';
	import { toolJsonLd } from '$lib/seo';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let ToolComponent = $state<Component | null>(null);
	let loading = $state(true);

	const needsEngine = $derived(engineTools.has(data.tool.slug));

	$effect(() => {
		const slug = data.tool.slug;
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
		title: data.tool.name,
		description: data.tool.description,
		path: `/tools/${data.tool.slug}`
	}}
	jsonLd={toolJsonLd(data.tool.name, data.tool.description, data.tool.slug)}
/>

<ToolLayout tool={data.tool}>
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
	{:else}
		<Alert message="This tool is not available yet." variant="info" />
	{/if}
</ToolLayout>
