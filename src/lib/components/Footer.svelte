<script lang="ts">
	import { page } from '$app/stores';
	import { tools } from '$lib/tools';
	import { toolPath, localizedPath } from '$lib/i18n/locale';
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

<footer class="border-t border-border">
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
		<div class="flex flex-col gap-6 text-left sm:flex-row sm:items-end sm:justify-between">
			<div>
				<div class="mb-2 flex items-center gap-2.5">
					<div
						class="flex size-7 items-center justify-center bg-primary text-[0.6rem] font-bold text-primary-foreground"
						style="border-radius: 2px;"
					>
						PDF
					</div>
					<span class="font-display text-base font-bold tracking-tight">
						We<span class="text-primary">Love</span>PDF
					</span>
				</div>
				<p class="text-xs text-muted-foreground">
					{tools.filter((t) => t.available).length} {m.footer.tagline}
				</p>
			</div>

			<nav class="flex flex-wrap gap-x-4 gap-y-2">
				<a
					href={localizedPath('/changelog', locale)}
					class="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
				>
					{m.nav.whatsNew}
				</a>
				<a
					href={localizedPath('/guides', locale)}
					class="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
				>
					{m.nav.guides}
				</a>
				{#each popular as link}
					<a
						href={toolPath(link.slug, locale)}
						class="text-sm text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
					>
						{link.label}
					</a>
				{/each}
			</nav>
		</div>
	</div>
</footer>
