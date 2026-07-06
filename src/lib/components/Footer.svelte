<script lang="ts">
	import { page } from '$app/stores';
	import { tools } from '$lib/tools';
	import { toolPath } from '$lib/i18n/locale';
	import { msg, localizeTool } from '$lib/i18n';

	const locale = $derived($page.data.locale ?? 'en');
	const m = $derived(msg(locale));

	const popularSlugs = [
		'merge-pdf',
		'split-pdf',
		'compress-pdf',
		'sign-pdf',
		'protect-pdf',
		'view-pdf'
	] as const;

	const popular = $derived(
		popularSlugs.map((slug) => {
			const tool = tools.find((t) => t.slug === slug);
			const localized = tool ? localizeTool(tool, locale) : null;
			return { slug, label: localized?.name ?? slug };
		})
	);
</script>

<footer class="border-t border-border/60 bg-muted/20">
	<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
		<div class="flex flex-col items-center gap-8 text-center">
			<div class="flex items-center gap-2.5">
				<div
					class="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm"
				>
					PDF
				</div>
				<span class="text-lg font-bold tracking-tight">
					We<span class="text-primary">Love</span>PDF
				</span>
			</div>

			<nav class="flex flex-wrap justify-center gap-2">
				{#each popular as link}
					<a
						href={toolPath(link.slug, locale)}
						class="rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<p class="text-xs text-muted-foreground">
				{tools.filter((t) => t.available).length} {m.footer.tagline}
			</p>
		</div>
	</div>
</footer>
