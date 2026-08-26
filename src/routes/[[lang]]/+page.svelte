<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fly, fade } from 'svelte/transition';
	import ToolCard from '$lib/components/ToolCard.svelte';
	import SeoHead from '$lib/components/SeoHead.svelte';
	import HomeHeroDrop from '$lib/components/HomeHeroDrop.svelte';
	import { tools, type ToolCategory, type PdfTool } from '$lib/tools';
	import { getRecentToolSlugs } from '$lib/recent-tools';
	import { getFavoriteToolSlugs } from '$lib/favorite-tools';
	import {
		clearRecentFiles,
		getRecentFile,
		listRecentFiles,
		type RecentFileRecord
	} from '$lib/recent-files';
	import { setPendingFile } from '$lib/pending-file';
	import { workflows } from '$lib/workflows';
	import { formatFileSize } from '$lib/pdf/operations';
	import { site, websiteJsonLd } from '$lib/seo';
	import { msg, localizeTools } from '$lib/i18n';
	import { categoryLabel } from '$lib/i18n/messages';
	import { toolPath, localizedPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { PACER, useDebouncer } from '$lib/pacer/svelte';
	import {
		Search,
		Shield,
		Zap,
		Sparkles,
		FileText,
		Eye,
		Minimize2,
		X,
		Command,
		Workflow,
		ArrowRight
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const localizedTools = $derived(localizeTools(tools, locale));
	const categories = $derived(
		Object.keys(m.categories) as ToolCategory[]
	);

	let query = $state('');
	let debouncedQuery = $state('');
	let activeCategory = $state<ToolCategory | 'all'>('all');
	let searchInput = $state<HTMLInputElement | null>(null);
	let filterKey = $state(0);
	let recentSlugs = $state<string[]>([]);
	let favoriteSlugs = $state<string[]>([]);
	let recentFiles = $state<Omit<RecentFileRecord, 'bytes'>[]>([]);
	let heroDragging = $state(false);
	let droppedFile = $state<File | null>(null);

	function isPdfFile(file: File) {
		return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
	}

	function onHeroDragOver(e: DragEvent) {
		e.preventDefault();
		heroDragging = true;
	}

	function onHeroDragLeave() {
		heroDragging = false;
	}

	function onHeroDrop(e: DragEvent) {
		e.preventDefault();
		heroDragging = false;
		const file = Array.from(e.dataTransfer?.files ?? []).find(isPdfFile);
		if (file) droppedFile = file;
	}

	const searchDebouncer = useDebouncer((q: string) => {
		debouncedQuery = q;
	}, { wait: PACER.searchWait, trailing: true, leading: false, key: 'home-search' });

	$effect(() => {
		searchDebouncer.maybeExecute(query);
	});

	$effect(() => {
		if (!browser) return;
		const url = new URL($page.url);
		if (debouncedQuery) url.searchParams.set('q', debouncedQuery);
		else url.searchParams.delete('q');
		const next = `${url.pathname}${url.search}`;
		const current = `${$page.url.pathname}${$page.url.search}`;
		if (next !== current) {
			goto(next, { replaceState: true, keepFocus: true, noScroll: true });
		}
	});

	const recentTools = $derived(
		recentSlugs
			.map((slug) => localizedTools.find((t) => t.slug === slug))
			.filter((t): t is PdfTool => !!t)
	);

	const favoriteTools = $derived(
		favoriteSlugs
			.map((slug) => localizedTools.find((t) => t.slug === slug))
			.filter((t): t is PdfTool => !!t)
	);

	const workflowCards = $derived(
		workflows.map((w) => {
			const copy =
				w.slug === 'secure-pdf'
					? m.workflows.secure
					: w.slug === 'prepare-for-send'
						? m.workflows.prepareForSend
						: w.slug === 'scan-cleanup'
							? m.workflows.scanCleanup
							: m.workflows.archivePack;
			return { ...w, title: copy.title, subtitle: copy.subtitle };
		})
	);

	const filtered = $derived(
		localizedTools.filter((t) => {
			const matchesQuery =
				!debouncedQuery ||
				t.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
				t.description.toLowerCase().includes(debouncedQuery.toLowerCase());
			const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
			return matchesQuery && matchesCategory;
		})
	);

	const grouped = $derived(
		categories
			.map((cat) => ({
				category: cat,
				label: categoryLabel(cat, locale),
				tools: filtered.filter((t) => t.category === cat)
			}))
			.filter((g) => g.tools.length > 0)
	);

	function setCategory(cat: ToolCategory | 'all') {
		activeCategory = cat;
		filterKey++;
	}

	function clearSearch() {
		query = '';
		debouncedQuery = '';
		searchDebouncer.cancel();
		searchInput?.focus();
	}

	async function resumeRecentFile(id: string) {
		const file = await getRecentFile(id);
		if (!file) {
			recentFiles = await listRecentFiles();
			return;
		}
		setPendingFile(file);
		goto(toolPath('view-pdf', locale));
	}

	async function handleClearRecentFiles() {
		await clearRecentFiles();
		recentFiles = [];
	}

	onMount(() => {
		recentSlugs = getRecentToolSlugs();
		favoriteSlugs = getFavoriteToolSlugs();
		void listRecentFiles().then((files) => {
			recentFiles = files;
		});

		const q = $page.url.searchParams.get('q');
		if (q) {
			query = q;
			debouncedQuery = q;
			requestAnimationFrame(() => {
				document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' });
			});
		}

		function onKeydown(e: KeyboardEvent) {
			if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
				e.preventDefault();
				searchInput?.focus();
			}
			if (e.key === 'Escape' && document.activeElement === searchInput) {
				clearSearch();
				searchInput?.blur();
			}
		}
		window.addEventListener('keydown', onKeydown);
		return () => window.removeEventListener('keydown', onKeydown);
	});
</script>

<SeoHead
	meta={{
		title: m.hero.title,
		description: m.hero.subtitle,
		path: localizedPath('/', locale)
	}}
	jsonLd={websiteJsonLd()}
	{locale}
/>

{#if droppedFile}
	<HomeHeroDrop file={droppedFile} {locale} ondismiss={() => (droppedFile = null)} />
{/if}

<!-- Hero -->
<section
	class="relative overflow-hidden border-b border-border/60 {heroDragging ? 'ring-2 ring-inset ring-primary/40' : ''}"
	aria-label="Hero"
	ondragover={onHeroDragOver}
	ondragleave={onHeroDragLeave}
	ondrop={onHeroDrop}
>
	<div class="pointer-events-none absolute inset-0">
		<div class="hero-blob absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl"></div>
		<div
			class="hero-blob hero-blob-delay absolute -bottom-20 right-0 size-72 rounded-full bg-primary/5 blur-3xl"
		></div>
	</div>
	<div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
		<div class="mx-auto max-w-2xl text-center">
			<div in:fade={{ duration: 400, delay: 0 }}>
				<a href={localizedPath('/changelog', locale)}>
					<Badge variant="secondary" class="mb-4 gap-1.5 px-3 py-1 transition-colors hover:bg-primary/10 hover:text-primary">
						<Sparkles class="size-3 animate-pulse" />
						{localizedTools.length} {m.hero.badge}
					</Badge>
				</a>
			</div>
			<h1
				class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl"
				in:fly={{ y: 20, duration: 500, delay: 80 }}
			>
				{m.hero.title}
			</h1>
			<p
				class="mb-8 text-base text-muted-foreground sm:text-lg"
				in:fly={{ y: 20, duration: 500, delay: 160 }}
			>
				{m.hero.subtitle}
			</p>
			<div
				class="flex flex-wrap justify-center gap-2"
				in:fly={{ y: 20, duration: 500, delay: 240 }}
			>
				<Button href={toolPath('merge-pdf', locale)} size="lg" class="transition-transform hover:scale-105">
					<FileText class="size-4" />
					{m.hero.ctaMerge}
				</Button>
				<Button href={toolPath('view-pdf', locale)} variant="outline" size="lg" class="transition-transform hover:scale-105">
					<Eye class="size-4" />
					{m.hero.ctaView}
				</Button>
				<Button href={toolPath('compress-pdf', locale)} variant="outline" size="lg" class="transition-transform hover:scale-105">
					<Minimize2 class="size-4" />
					{m.hero.ctaCompress}
				</Button>
				<Button href={localizedPath('/changelog', locale)} variant="outline" size="lg" class="transition-transform hover:scale-105">
					<Sparkles class="size-4" />
					{m.hero.ctaWhatsNew}
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Tools section -->
<section id="tools" class="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
	{#if recentFiles.length}
		<div class="mb-10">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
				<h2 class="text-lg font-semibold">{m.home.recentFiles}</h2>
				<button
					type="button"
					class="text-xs text-muted-foreground underline-offset-2 hover:underline"
					onclick={handleClearRecentFiles}
				>
					{m.home.clearRecentFiles}
				</button>
			</div>
			<ul class="space-y-2">
				{#each recentFiles as rf (rf.id)}
					<li class="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2">
						<div class="min-w-0">
							<p class="truncate text-sm font-medium">{rf.name}</p>
							<p class="text-xs text-muted-foreground">{formatFileSize(rf.size)}</p>
						</div>
						<Button type="button" size="sm" variant="outline" onclick={() => resumeRecentFile(rf.id)}>
							{m.home.resumeFile}
							<ArrowRight class="size-3.5" />
						</Button>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<div class="mb-10">
		<div class="mb-4">
			<h2 class="text-lg font-semibold">{m.home.workflows}</h2>
			<p class="text-sm text-muted-foreground">{m.home.workflowsSubtitle}</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each workflowCards as wf (wf.slug)}
				<a
					href={localizedPath(wf.path, locale)}
					class="group flex items-start gap-3 rounded-xl border border-border/60 p-4 transition hover:border-primary/40 hover:bg-muted/40"
				>
					<div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<Workflow class="size-5" />
					</div>
					<div class="min-w-0">
						<p class="font-medium group-hover:text-primary">{wf.title}</p>
						<p class="text-xs text-muted-foreground">{wf.subtitle}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	{#if favoriteTools.length}
		<div class="mb-10">
			<h2 class="mb-4 text-lg font-semibold">{m.home.favorites}</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each favoriteTools as tool, i (tool.slug)}
					<ToolCard {tool} {locale} index={i} />
				{/each}
			</div>
		</div>
	{/if}

	{#if recentTools.length}
		<div class="mb-10">
			<h2 class="mb-4 text-lg font-semibold">{m.home.recent}</h2>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				{#each recentTools as tool, i (tool.slug)}
					<ToolCard {tool} {locale} index={i} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Sticky search + filter -->
	<div
		class="sticky top-14 z-40 -mx-4 mb-8 border-b border-border/40 bg-background/85 px-4 py-4 backdrop-blur-xl sm:-mx-6 sm:px-6"
	>
		<div class="space-y-4">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="relative max-w-md flex-1">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						bind:ref={searchInput}
						bind:value={query}
						placeholder={m.home.searchPlaceholder}
						class="pr-20 pl-9 transition-shadow focus:shadow-md focus:shadow-primary/5"
					/>
					<div class="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1">
						{#if query}
							<button
								type="button"
								class="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
								onclick={clearSearch}
								aria-label={m.home.clearSearch}
							>
								<X class="size-3.5" />
							</button>
						{:else}
							<kbd
								class="hidden items-center gap-0.5 rounded border border-border bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline-flex"
							>
								<Command class="size-2.5" />/
							</kbd>
						{/if}
					</div>
				</div>
				<p class="text-sm text-muted-foreground tabular-nums">
					{#key filtered.length}
						<span in:fade={{ duration: 200 }}>
							{filtered.length} {filtered.length === 1 ? m.home.toolsCountOne : m.home.toolsCount}
						</span>
					{/key}
				</p>
			</div>

			<div class="flex flex-wrap gap-2">
				{#each [{ id: 'all', label: `${m.home.all} (${localizedTools.length})` }, ...categories.map((c) => ({ id: c, label: `${categoryLabel(c, locale)} (${localizedTools.filter((t) => t.category === c).length})` }))] as pill}
					<button
						type="button"
						class="category-pill rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 {activeCategory === pill.id
							? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-105'
							: 'bg-secondary/80 text-secondary-foreground hover:bg-secondary'}"
						onclick={() => setCategory(pill.id as ToolCategory | 'all')}
					>
						{pill.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="py-16 text-center" in:fade={{ duration: 300 }}>
			<p class="text-lg font-medium text-muted-foreground">{m.home.noResults}</p>
			<p class="mt-1 text-sm text-muted-foreground">{m.home.noResultsHint}</p>
			<Button variant="link" class="mt-3" onclick={() => { query = ''; debouncedQuery = ''; activeCategory = 'all'; searchDebouncer.cancel(); filterKey++; }}>
				{m.home.resetFilters}
			</Button>
		</div>
	{:else if activeCategory === 'all'}
		{#key filterKey}
			{#each grouped as group, gi (group.category)}
				<div
					id={group.category}
					class="mb-12 scroll-mt-32 last:mb-0"
					in:fly={{ y: 16, duration: 350, delay: gi * 60 }}
				>
					<div class="mb-5 flex items-center gap-3">
						<h2 class="text-lg font-semibold">{group.label}</h2>
						<Separator class="flex-1" />
						<span class="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
							{group.tools.length}
						</span>
					</div>
					<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
						{#each group.tools as tool, i (tool.slug)}
							<ToolCard {tool} {locale} index={i + gi * 3} />
						{/each}
					</div>
				</div>
			{/each}
		{/key}
	{:else}
		{#key filterKey}
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" in:fade={{ duration: 250 }}>
				{#each filtered as tool, i (tool.slug)}
					<ToolCard {tool} {locale} index={i} />
				{/each}
			</div>
		{/key}
	{/if}
</section>

<!-- Features -->
<section class="border-t border-border/60 bg-muted/30">
	<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
		<h2 class="mb-8 text-center text-2xl font-bold">{m.home.whyTitle}</h2>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each [
				{ icon: Shield, title: m.home.featurePrivateTitle, desc: m.home.featurePrivateDesc },
				{ icon: Zap, title: m.home.featureFastTitle, desc: m.home.featureFastDesc },
				{ icon: Sparkles, title: m.home.featureDarkTitle, desc: m.home.featureDarkDesc }
			] as feature, i}
				<Card.Root
					class="border-border/60 bg-card/80 transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5 animate-fade-in-up"
					style="animation-delay: {i * 100}ms"
				>
					<Card.Content class="p-5 text-center">
						<div
							class="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110"
						>
							<feature.icon class="size-5" />
						</div>
						<Card.Title class="mb-1 text-base">{feature.title}</Card.Title>
						<Card.Description class="text-sm">{feature.desc}</Card.Description>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>
</section>

<style>
	.hero-blob {
		animation: blob-drift 8s ease-in-out infinite;
	}

	.hero-blob-delay {
		animation-delay: -4s;
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-blob {
			animation: none;
		}
	}
</style>
