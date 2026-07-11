<script lang="ts">
	import SeoHead from '$lib/components/SeoHead.svelte';
	import { guides, guidePath } from '$lib/guides';
	import { msg } from '$lib/i18n';
	import { localizedPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { BookOpen } from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
</script>

<SeoHead
	meta={{
		title: m.guides.title,
		description: m.guides.subtitle,
		path: localizedPath('/guides', locale)
	}}
	{locale}
/>

<div class="mx-auto max-w-3xl px-4 py-10 sm:px-6">
	<div class="mb-10 text-center">
		<div class="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
			<BookOpen class="size-7" />
		</div>
		<h1 class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">{m.guides.title}</h1>
		<p class="text-sm text-muted-foreground">{m.guides.subtitle}</p>
	</div>

	<div class="space-y-4">
		{#each guides as guide (guide.slug)}
			<Card.Root class="border-border/60 transition hover:border-primary/30">
				<Card.Content class="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<Card.Title class="text-base">{guide.title[locale]}</Card.Title>
						<Card.Description class="mt-1">{guide.description[locale]}</Card.Description>
					</div>
					<Button href={guidePath(guide.slug, locale)} variant="outline" size="sm" class="shrink-0">
						{m.guides.readGuide}
					</Button>
				</Card.Content>
			</Card.Root>
		{/each}
	</div>
</div>
