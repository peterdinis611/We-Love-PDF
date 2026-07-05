<script lang="ts">
	import ToolLayout from '$lib/components/ToolLayout.svelte';
	import PdfEngineProvider from '$lib/components/PdfEngineProvider.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { toolComponents } from '$lib/tool-components';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const ToolComponent = $derived(toolComponents[data.tool.slug]);
	const needsEngine = $derived(
		['pdf-to-jpg', 'protect-pdf', 'unlock-pdf'].includes(data.tool.slug)
	);
</script>

<svelte:head>
	<title>{data.tool.name} — WeLovePDF</title>
	<meta name="description" content={data.tool.description} />
</svelte:head>

<ToolLayout tool={data.tool}>
	{#if ToolComponent}
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
