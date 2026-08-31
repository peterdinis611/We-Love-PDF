<script lang="ts">
	import { canonicalUrl, defaultOgImage, pageTitle, site, type SeoMeta } from '$lib/seo';
	import { alternatePaths, localeHreflang, ogLocale } from '$lib/i18n/locale';
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
	const ogImage = $derived(meta.ogImage ?? defaultOgImage());
	const ogType = $derived(meta.ogType ?? 'website');
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={meta.description} />
	<meta name="author" content={site.name} />
	<meta name="application-name" content={site.name} />
	{#if meta.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
		<link rel="canonical" href={url} />
		{#each Object.entries(alternates) as [loc, altPath]}
			<link rel="alternate" hreflang={localeHreflang(loc as Locale)} href={canonicalUrl(altPath)} />
		{/each}
		<link rel="alternate" hreflang="x-default" href={canonicalUrl(alternates.en)} />
	{/if}

	<meta property="og:type" content={ogType} />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content={ogLocale(locale)} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:image:alt" content="{site.name} — {meta.title}" />
	{#each Object.entries(alternates) as [loc, altPath]}
		{#if loc !== locale}
			<meta property="og:locale:alternate" content={ogLocale(loc as Locale)} />
		{/if}
	{/each}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content={site.twitter} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={meta.description} />
	<meta name="twitter:image" content={ogImage} />
	<meta name="twitter:image:alt" content="{site.name} — {meta.title}" />

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
