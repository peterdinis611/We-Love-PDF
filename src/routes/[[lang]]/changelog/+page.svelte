<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import NewBadge from '$lib/components/NewBadge.svelte';
	import { getChangelogPage } from '$lib/changelog-page';
	import { msg, localizeTool } from '$lib/i18n';
	import { toolPath } from '$lib/i18n/locale';
	import { tools } from '$lib/tools';
	import { ArrowUpRight, Sparkles } from '@lucide/svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const page = $derived(getChangelogPage(locale));

	function toolLink(slug: string) {
		const tool = tools.find((t) => t.slug === slug);
		if (!tool) return { href: toolPath(slug, locale), label: slug };
		const localized = localizeTool(tool, locale);
		return { href: toolPath(slug, locale), label: localized.name };
	}
</script>

<SeoHead
	meta={{
		title: page.title,
		description: page.subtitle,
		path: locale === 'sk' ? '/sk/changelog' : '/changelog'
	}}
	{locale}
/>

<div class="min-h-[calc(100vh-3.5rem)] bg-muted/20">
	<div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
		<header class="mb-12 text-center">
			<div
				class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary"
			>
				<Sparkles class="size-7" />
			</div>
			<h1 class="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">{page.title}</h1>
			<p class="mx-auto max-w-xl text-muted-foreground">{page.subtitle}</p>
			<p class="mt-3 text-xs text-muted-foreground">
				{page.updated} · {page.stats}
			</p>
		</header>

		<div class="space-y-12">
			{#each page.sections as section (section.id)}
				<section>
					<div class="mb-5">
						<h2 class="text-xl font-semibold tracking-tight">{section.title}</h2>
						{#if section.subtitle}
							<p class="mt-1 text-sm text-muted-foreground">{section.subtitle}</p>
						{/if}
					</div>

					<ul class="space-y-3">
						{#each section.items as item}
							<li
								class="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-colors hover:border-primary/20"
							>
								<div class="flex flex-wrap items-start justify-between gap-2">
									<div class="min-w-0 flex-1">
										<div class="mb-1 flex flex-wrap items-center gap-2">
											<h3 class="font-medium">{item.title}</h3>
											{#if item.highlight}
												<NewBadge {locale} />
											{/if}
										</div>
										<p class="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
									</div>
									{#if item.toolSlug}
										{@const link = toolLink(item.toolSlug)}
										<a
											href={link.href}
											class="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary"
										>
											{link.label}
											<ArrowUpRight class="size-3" />
										</a>
									{/if}
								</div>
							</li>
						{/each}
					</ul>
				</section>
			{/each}
		</div>

		<p class="mt-12 text-center text-sm text-muted-foreground">
			<a href={locale === 'sk' ? '/sk#tools' : '/#tools'} class="font-medium text-primary hover:underline">
				{m.nav.allTools}
			</a>
		</p>
	</div>
</div>
