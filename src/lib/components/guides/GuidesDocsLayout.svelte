<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { Page, PageTree, TreeNode } from 'fumadocs-svelte';
	import { Sidebar } from 'fumadocs-svelte';
	import GuideToc from '$lib/components/guides/GuideToc.svelte';
	import { msg } from '$lib/i18n';
	import { localizedPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { ChevronLeft, ChevronRight, Menu, X } from '@lucide/svelte';

	let {
		tree,
		title = 'Guides',
		locale = 'en' as Locale,
		breadcrumbs = [],
		prev,
		next,
		contentRoot = $bindable(null),
		children
	}: {
		tree: PageTree;
		title?: string;
		locale?: Locale;
		breadcrumbs?: TreeNode[];
		prev?: Page;
		next?: Page;
		contentRoot?: HTMLElement | null;
		children: Snippet;
	} = $props();

	let mobileOpen = $state(false);
	const homeHref = $derived(localizedPath('/guides', locale));
	const m = $derived(msg(locale));
</script>

<div class="border-b border-border/60 bg-background md:border-b-0">
	<div
		class="sticky top-14 z-30 flex h-12 items-center gap-2 border-b border-border/60 bg-background/95 px-4 backdrop-blur md:hidden"
	>
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
		<a href={homeHref} class="truncate text-sm font-semibold">{title}</a>
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

	<div class="mx-auto flex max-w-7xl">
		<aside
			class="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-60 shrink-0 overflow-y-auto border-r border-border/60 bg-sidebar/40 px-3 py-6 lg:block"
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
			{#if breadcrumbs.length > 1}
				<nav aria-label="Breadcrumb" class="mb-6">
					<ol class="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
						{#each breadcrumbs as crumb, i}
							{#if i > 0}
								<li aria-hidden="true" class="opacity-40">/</li>
							{/if}
							<li>
								{#if i < breadcrumbs.length - 1}
									<a href={crumb.url} class="hover:text-primary">{crumb.name}</a>
								{:else}
									<span class="font-medium text-foreground">{crumb.name}</span>
								{/if}
							</li>
						{/each}
					</ol>
				</nav>
			{/if}

			<div class="flex gap-10">
				<div class="min-w-0 flex-1">
					<div bind:this={contentRoot}>
						{@render children()}
					</div>

					{#if prev || next}
						<nav
							class="mt-12 grid gap-3 border-t border-border/60 pt-8 sm:grid-cols-2"
							aria-label="Guide pagination"
						>
							{#if prev}
								<a
									href={prev.url}
									class="group rounded-xl border border-border/60 p-4 transition hover:border-primary/40 hover:bg-muted/40"
								>
									<p class="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
										<ChevronLeft class="size-3.5" />
										{m.guides.previous}
									</p>
									<p class="font-medium group-hover:text-primary">{prev.data.title}</p>
								</a>
							{:else}
								<div></div>
							{/if}
							{#if next}
								<a
									href={next.url}
									class="group rounded-xl border border-border/60 p-4 text-right transition hover:border-primary/40 hover:bg-muted/40 sm:col-start-2"
								>
									<p class="mb-1 flex items-center justify-end gap-1 text-xs text-muted-foreground">
										{m.guides.next}
										<ChevronRight class="size-3.5" />
									</p>
									<p class="font-medium group-hover:text-primary">{next.data.title}</p>
								</a>
							{/if}
						</nav>
					{/if}
				</div>

				<aside class="hidden w-52 shrink-0 xl:block">
					<div class="sticky top-24">
						<GuideToc root={contentRoot} {locale} />
					</div>
				</aside>
			</div>
		</div>
	</div>
</div>
