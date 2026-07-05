<script lang="ts">
	import { canonicalUrl, pageTitle, site, type SeoMeta } from '$lib/seo';

	let {
		meta,
		jsonLd
	}: {
		meta: SeoMeta;
		jsonLd?: Record<string, unknown> | Record<string, unknown>[];
	} = $props();

	const title = $derived(pageTitle(meta.title));
	const url = $derived(canonicalUrl(meta.path ?? ''));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={meta.description} />
	{#if meta.noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
		<link rel="canonical" href={url} />
	{/if}

	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={site.name} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={meta.description} />
	<meta property="og:url" content={url} />
	<meta property="og:locale" content={site.locale} />

	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={meta.description} />

	{#if jsonLd}
		<script type="application/ld+json">
			{JSON.stringify(jsonLd)}
		</script>
	{/if}
</svelte:head>
