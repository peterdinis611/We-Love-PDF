<script lang="ts">
	import type { Locale } from '$lib/i18n/locale';
	import { getToolSeo } from '$lib/tool-seo';
	import { msg } from '$lib/i18n';
	import ToolPanel from '$lib/components/ToolPanel.svelte';

	let {
		slug,
		name,
		locale = 'en'
	}: {
		slug: string;
		name: string;
		locale?: Locale;
	} = $props();

	const content = $derived(getToolSeo(slug, name, locale));
	const m = $derived(msg(locale));
</script>

<section class="mt-10 space-y-6 border-t border-border/60 pt-8">
	<div>
		<h2 class="mb-2 text-lg font-semibold">{m.landing.aboutTitle}</h2>
		<p class="text-sm leading-relaxed text-muted-foreground">{content.intro}</p>
	</div>

	<ToolPanel>
		<h3 class="mb-3 text-sm font-semibold">{m.landing.benefitsTitle}</h3>
		<ul class="space-y-2">
			{#each content.benefits as benefit}
				<li class="flex gap-2 text-sm text-muted-foreground">
					<span class="text-primary">✓</span>
					<span>{benefit}</span>
				</li>
			{/each}
		</ul>
	</ToolPanel>

	<ToolPanel>
		<h3 class="mb-3 text-sm font-semibold">{m.landing.faqTitle}</h3>
		<div class="space-y-4">
			{#each content.faq as item}
				<div>
					<p class="text-sm font-medium">{item.question}</p>
					<p class="mt-1 text-sm text-muted-foreground">{item.answer}</p>
				</div>
			{/each}
		</div>
	</ToolPanel>
</section>
