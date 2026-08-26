<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuidesDocsLayout from '$lib/components/guides/GuidesDocsLayout.svelte';
	import { msg } from '$lib/i18n';
	import { toolPath } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const Content = $derived(data.page.code);
	const relatedTool = $derived((data.page.data as { relatedTool?: string }).relatedTool);
</script>

<SeoHead
	meta={{
		title: data.page.data.title,
		description: data.page.data.description ?? m.guides.subtitle,
		path: data.page.url
	}}
	{locale}
/>

<GuidesDocsLayout tree={data.pageTree} title={data.guidesTitle} {locale}>
	<article>
		<header class="mb-8 border-b border-border/60 pb-6">
			<h1 class="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
				{data.page.data.title}
			</h1>
			{#if data.page.data.description}
				<p class="text-lg text-muted-foreground">{data.page.data.description}</p>
			{/if}
		</header>

		<div
			class="prose prose-neutral max-w-none dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary prose-pre:border prose-pre:border-border prose-pre:bg-secondary"
		>
			<Content />
		</div>

		{#if relatedTool}
			<div class="mt-10">
				<Button href={toolPath(relatedTool, locale)} size="lg">
					{m.changelog.openTool}
				</Button>
			</div>
		{/if}
	</article>
</GuidesDocsLayout>
