<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { guidePath } from '$lib/guides';
	import { msg } from '$lib/i18n';
	import { localizedPath, toolPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const guide = $derived(data.guide);
	const m = $derived(msg(locale));
</script>

<SeoHead
	meta={{
		title: guide.title[locale],
		description: guide.description[locale],
		path: guidePath(guide.slug, locale)
	}}
	{locale}
/>

<article class="mx-auto max-w-2xl px-4 py-10 sm:px-6">
	<p class="mb-6">
		<a href={localizedPath('/guides', locale)} class="text-sm text-muted-foreground hover:text-primary">
			{m.guides.backToGuides}
		</a>
	</p>
	<h1 class="mb-3 text-2xl font-bold tracking-tight sm:text-3xl">{guide.title[locale]}</h1>
	<p class="mb-8 text-muted-foreground">{guide.description[locale]}</p>

	<ol class="mb-10 list-decimal space-y-3 pl-5 text-sm leading-relaxed">
		{#each guide.body[locale] as step}
			<li>{step}</li>
		{/each}
	</ol>

	{#if guide.relatedTool}
		<Button href={toolPath(guide.relatedTool, locale)} size="lg">
			{m.changelog.openTool}
		</Button>
	{/if}
</article>
