<script lang="ts">
	import { canonicalUrl, pageTitle, site, type SeoMeta } from '$lib/seo';
	import { alternatePaths } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';

	let {
		meta,
		jsonLd,
		locale = 'en'
	}: {
		meta: SeoMeta;
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
		locale?: Locale;
	} = $props();

	const title = $derived(pageTitle(meta.title));
	const path = $derived(meta.path ?? '');
	const url = $derived(canonicalUrl(path));
	const alternates = $derived(alternatePaths(path));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={meta.description} />
	{#if meta.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
		<link rel="canonical" href={url} />
		<link rel="alternate" hreflang="en" href={canonicalUrl(alternates.en)} />
		<link rel="alternate" hreflang="sk" href={canonicalUrl(alternates.sk)} />
		<link rel="alternate" hreflang="x-default" href={canonicalUrl(alternates.en)} />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content={locale === 'sk' ? 'sk_SK' : 'en_US'} />
	{#if locale === 'en'}
		<meta property="og:locale:alternate" content="sk_SK" />
	{:else}
		<meta property="og:locale:alternate" content="en_US" />
	{/if}

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={meta.description} />

	{#if jsonLd}
		{#if Array.isArray(jsonLd)}
			{#each jsonLd as item}
				<script type="application/ld+json">
					{JSON.stringify(item)}
				</script>
			{/each}
		{:else}
			<script type="application/ld+json">
				{JSON.stringify(jsonLd)}
			</script>
		{/if}
	{/if}
</svelte:head>
