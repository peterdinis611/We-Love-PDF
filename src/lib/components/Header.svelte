<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';
	import LanguageSwitcher from './LanguageSwitcher.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FileText, Layers, Eye, Sparkles, BookOpen } from '@lucide/svelte';
	import { msg } from '$lib/i18n';
	import { toolPath, localizedPath } from '$lib/i18n/locale';

	const locale = $derived($page.data.locale ?? 'en');
	const m = $derived(msg(locale));
	const homeHref = $derived(localizedPath('/', locale));
</script>

<header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href={homeHref} class="flex shrink-0 items-center gap-2.5">
			<div
				class="flex size-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm"
			>
				PDF
			</div>
			<span class="text-lg font-bold tracking-tight">
				We<span class="text-primary">Love</span>PDF
			</span>
		</a>

		<nav class="hidden items-center gap-0.5 md:flex">
			<Button variant="ghost" size="sm" href="{homeHref}#tools">
				<Layers class="size-4" />
				{m.nav.allTools}
			</Button>
			<Button variant="ghost" size="sm" href={toolPath('view-pdf', locale)}>
				<Eye class="size-4" />
				{m.nav.view}
			</Button>
			<Button variant="ghost" size="sm" href={localizedPath('/guides', locale)}>
				<BookOpen class="size-4" />
				Guides
			</Button>
			<Button variant="ghost" size="sm" href={localizedPath('/changelog', locale)}>
				<Sparkles class="size-4" />
				{m.nav.whatsNew}
			</Button>
			<Button variant="ghost" size="sm" href={toolPath('merge-pdf', locale)}>
				<FileText class="size-4" />
				{m.nav.merge}
			</Button>
		</nav>

		<div class="flex items-center gap-1.5">
			<LanguageSwitcher {locale} />
			<ThemeToggle compact />
			{#if $page.url.pathname.includes('/tools/')}
				<Button variant="outline" size="sm" href={homeHref}>{m.nav.backToTools}</Button>
			{/if}
		</div>
	</div>
</header>
