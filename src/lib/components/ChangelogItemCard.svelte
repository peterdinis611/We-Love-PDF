<script lang="ts">
	import type { ChangelogItem } from '$lib/changelog';
	import NewBadge from '$lib/components/NewBadge.svelte';
	import type { Locale } from '$lib/i18n/locale';
	import { toolPath } from '$lib/i18n/locale';
	import { msg } from '$lib/i18n';
	import { ArrowUpRight } from '@lucide/svelte';

	let {
		item,
		locale = 'en'
	}: {
		item: ChangelogItem;
		locale?: Locale;
	} = $props();

	const openLabel = $derived(msg(locale).changelog.openTool);
</script>

<article
	class="rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm backdrop-blur-sm transition-[border-color,box-shadow] hover:border-primary/25 hover:shadow-md hover:shadow-primary/5"
>
	<div class="flex flex-wrap items-start justify-between gap-3">
		<div class="min-w-0 flex-1">
			<div class="mb-1 flex flex-wrap items-center gap-2">
				<h3 class="font-medium leading-snug">{item.title}</h3>
				{#if item.highlight}
					<NewBadge {locale} />
				{/if}
			</div>
			<p class="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
		</div>
		{#if item.toolSlug}
			<a
				href={toolPath(item.toolSlug, locale)}
				class="inline-flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
			>
				{openLabel}
				<ArrowUpRight class="size-3" />
			</a>
		{/if}
	</div>
</article>
