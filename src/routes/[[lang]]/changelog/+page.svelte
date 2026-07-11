<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import ChangelogItemCard from '$lib/components/ChangelogItemCard.svelte';
	import ChangelogFeaturedTools from '$lib/components/ChangelogFeaturedTools.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		CHANGELOG_UX_PREVIEW,
		getChangelogPage,
		getNewTools
	} from '$lib/changelog';
	import { msg } from '$lib/i18n';
	import { localizedPath } from '$lib/i18n/locale';
	import { Sparkles, ChevronDown, ChevronUp } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const page = $derived(getChangelogPage(locale));
	const newTools = $derived(getNewTools(locale));

	let uxExpanded = $state(false);

	function uxItems(sectionId: string) {
		const section = page.sections.find((s) => s.id === sectionId);
		if (!section) return [];
		if (sectionId !== 'ux' || uxExpanded) return section.items;
		return section.items.slice(0, CHANGELOG_UX_PREVIEW);
	}

	function scrollToSection(id: string) {
		document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}
</script>

<SeoHead
	meta={{
		title: page.title,
		description: page.subtitle,
		path: localizedPath('/changelog', locale)
	}}
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: page.title,
		description: page.subtitle,
		isPartOf: { '@type': 'WebSite', name: 'WeLovePDF' }
	}}
	{locale}
/>

<svelte:head>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="WeLovePDF Changelog"
		href="/changelog.xml"
	/>
</svelte:head>

<div class="min-h-[calc(100vh-3.5rem)] bg-muted/20">
	<div class="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
		<header class="mb-10 text-center">
			<div
				class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
			>
				<Sparkles class="size-7" />
			</div>
			<h1 class="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
			<p class="mx-auto max-w-xl text-muted-foreground">{page.subtitle}</p>
			<div class="mt-4 flex flex-wrap items-center justify-center gap-2">
				<span class="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
					{page.updated}
				</span>
				<span class="rounded-full border border-border/60 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
					{page.stats}
				</span>
				<span class="rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
					{page.newToolsCount} {page.newToolsBadge}
				</span>
			</div>
		</header>

		<nav
			class="sticky top-14 z-30 -mx-4 mb-10 border-b border-border/40 bg-background/85 px-4 py-3 backdrop-blur-xl sm:-mx-6 sm:px-6"
			aria-label={page.jumpTo}
		>
			<p class="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">{page.jumpTo}</p>
			<div class="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{#each page.sections as section (section.id)}
					<button
						type="button"
						class="shrink-0 rounded-full border border-border/60 bg-background px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
						onclick={() => scrollToSection(section.id)}
					>
						{section.title}
					</button>
				{/each}
			</div>
		</nav>

		<section class="mb-12">
			<div class="mb-5">
				<h2 class="text-xl font-semibold tracking-tight">{page.newToolsTitle}</h2>
				<p class="mt-1 text-sm text-muted-foreground">{page.newToolsSubtitle}</p>
			</div>
			<ChangelogFeaturedTools tools={newTools} {locale} />
		</section>

		<div class="space-y-12">
			{#each page.sections as section (section.id)}
				<section id="section-{section.id}" class="scroll-mt-32">
					<div class="mb-5">
						<h2 class="text-xl font-semibold tracking-tight">{section.title}</h2>
						{#if section.subtitle}
							<p class="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
						{/if}
					</div>

					<div class="space-y-3">
						{#each section.id === 'ux' ? uxItems(section.id) : section.items as item (item.id)}
							<ChangelogItemCard {item} {locale} />
						{/each}
					</div>

					{#if section.id === 'ux' && section.items.length > CHANGELOG_UX_PREVIEW}
						<Button
							variant="ghost"
							size="sm"
							class="mt-3 w-full"
							onclick={() => (uxExpanded = !uxExpanded)}
						>
							{#if uxExpanded}
								<ChevronUp class="size-4" />
								{page.showLess}
							{:else}
								<ChevronDown class="size-4" />
								{page.showAll} ({section.items.length - CHANGELOG_UX_PREVIEW})
							{/if}
						</Button>
					{/if}
				</section>
			{/each}
		</div>

		<div class="mt-12 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
			<Button href="{localizedPath('/', locale)}#tools">{page.exploreAll}</Button>
			<Button variant="outline" href={localizedPath('/', locale)}>{m.nav.allTools}</Button>
		</div>
	</div>
</div>
