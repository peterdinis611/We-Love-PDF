<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { PageTree } from 'fumadocs-svelte';
	import { Sidebar } from 'fumadocs-svelte';
	import { localizedPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { Menu, X } from '@lucide/svelte';

	let {
		tree,
		title = 'Guides',
		locale = 'en' as Locale,
		children
	}: {
		tree: PageTree;
		title?: string;
		locale?: Locale;
		children: Snippet;
	} = $props();

	let mobileOpen = $state(false);
	const homeHref = $derived(localizedPath('/guides', locale));
</script>

<div class="border-b border-border/60 bg-background md:border-b-0">
	<!-- Mobile bar (below site header) -->
	<div class="sticky top-14 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur md:hidden">
		<button
			type="button"
			class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
			aria-label="Toggle guides menu"
			aria-expanded={mobileOpen}
			onclick={() => (mobileOpen = !mobileOpen)}
		>
			{#if mobileOpen}
				<X class="size-5" />
			{:else}
				<Menu class="size-5" />
			{/if}
		</button>
		<a href={homeHref} class="text-sm font-semibold">{title}</a>
	</div>

	{#if mobileOpen}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="fixed inset-0 z-40 bg-foreground/40 md:hidden" onclick={() => (mobileOpen = false)}></div>
		<aside
			class="fixed bottom-0 left-0 top-14 z-50 w-72 overflow-y-auto border-r border-border bg-sidebar p-4 shadow-xl md:hidden"
		>
			<a href={homeHref} class="mb-4 block text-sm font-semibold text-sidebar-foreground">{title}</a>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div onclick={() => (mobileOpen = false)}>
				<Sidebar {tree} />
			</div>
		</aside>
	{/if}

	<div class="mx-auto flex max-w-6xl">
		<aside
			class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border/60 bg-sidebar/40 px-3 py-6 md:block"
		>
			<a
				href={homeHref}
				class="mb-4 block px-3 text-sm font-semibold text-sidebar-foreground hover:text-primary"
			>
				{title}
			</a>
			<Sidebar {tree} />
		</aside>

		<div class="min-w-0 flex-1 px-4 py-8 sm:px-6 lg:px-10">
			{@render children()}
		</div>
	</div>
</div>
