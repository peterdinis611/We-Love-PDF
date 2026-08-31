<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import GuidesDocsLayout from '$lib/components/guides/GuidesDocsLayout.svelte';
	import { articleJsonLd, breadcrumbJsonLd, site } from '$lib/seo';
	import { msg } from '$lib/i18n';
	import { localizedPath, toolPath } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { BookOpen, ChevronLeft } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const Content = $derived(data.page.code);
	const relatedTool = $derived((data.page.data as { relatedTool?: string }).relatedTool);
	const guidePath = $derived(data.page.url);
	const guidesBase = $derived(localizedPath('/guides', locale));
	const isIndex = $derived(guidePath === guidesBase || guidePath === `${guidesBase}/`);
	let contentRoot = $state<HTMLElement | null>(null);
</script>

<SeoHead
	meta={{
		title: data.page.data.title,
		description: data.page.data.description ?? m.guides.subtitle,
		path: guidePath,
		ogType: isIndex ? 'website' : 'article'
	}}
	jsonLd={[
		...(isIndex
			? []
			: [
					articleJsonLd(
						data.page.data.title,
						data.page.data.description ?? m.guides.subtitle,
						guidePath,
						locale
					)
				]),
		breadcrumbJsonLd([
			{ name: site.name, path: localizedPath('/', locale) },
			{ name: m.guides.title, path: localizedPath('/guides', locale) },
			...(isIndex ? [] : [{ name: data.page.data.title, path: guidePath }])
		])
	]}
	{locale}
/>

<GuidesDocsLayout
	tree={data.pageTree}
	title={data.guidesTitle}
	{locale}
	breadcrumbs={data.breadcrumbs}
	prev={data.prev}
	next={data.next}
	bind:contentRoot
>
	<article>
		{#if !isIndex}
			<a
				href={guidesBase}
				class="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
			>
				<ChevronLeft class="size-4" />
				{m.guides.backToGuides}
			</a>
		{/if}

		<header class="mb-8 border-b border-border/60 pb-6">
			<div class="mb-3 flex items-center gap-2 text-primary">
				<BookOpen class="size-5" />
				<span class="text-xs font-semibold uppercase tracking-wider">{m.guides.title}</span>
			</div>
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
			<div class="not-prose mt-10 flex flex-wrap gap-3">
				<Button href={toolPath(relatedTool, locale)} size="lg">
					{m.changelog.openTool}
				</Button>
			</div>
		{/if}
	</article>
</GuidesDocsLayout>
