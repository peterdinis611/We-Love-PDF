<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
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
	import { workflowCardCopy, workflows } from '$lib/workflows';
	import { featuredGuides } from '$lib/guides';
	import { formatFileSize } from '$lib/pdf/operations';
	import { websiteJsonLd, organizationJsonLd } from '$lib/seo';
	import { msg, localizeTools } from '$lib/i18n';
	import { categoryLabel } from '$lib/i18n/messages';
	import { toolPath, localizedPath } from '$lib/i18n/locale';
	import type { PageData } from './$types';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { PACER, useDebouncer } from '$lib/pacer/svelte';
	import {
		Search,
		Shield,
		Zap,
		WifiOff,
		FileText,
		Eye,
		Minimize2,
		X,
		Command,
		Workflow,
		ArrowRight,
		BookOpen
	} from '@lucide/svelte';

	let { data }: { data: PageData } = $props();

	const locale = $derived(data.locale);
	const m = $derived(msg(locale));
	const localizedTools = $derived(localizeTools(tools, locale));
	const categories = $derived(Object.keys(m.categories) as ToolCategory[]);

	let query = $state('');
	let debouncedQuery = $state('');
	let activeCategory = $state<ToolCategory | 'all'>('all');
	let searchInput = $state<HTMLInputElement | null>(null);
	let filterKey = $state(0);
	let recentSlugs = $state<string[]>([]);
	let favoriteSlugs = $state<string[]>([]);
	let recentFiles = $state<Omit<RecentFileRecord, 'bytes'>[]>([]);
	let heroDragging = $state(false);
	let heroDragDepth = $state(0);
	let droppedFiles = $state<File[] | null>(null);
	let heroInput: HTMLInputElement | null = $state(null);

	function isPdfFile(file: File) {
		return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
	}

	function takePdfs(list: FileList | File[] | null) {
		const pdfs = Array.from(list ?? []).filter(isPdfFile);
		if (pdfs.length) droppedFiles = pdfs;
	}

	function onHeroDragEnter(e: DragEvent) {
		e.preventDefault();
		heroDragDepth += 1;
		heroDragging = true;
	}

	function onHeroDragOver(e: DragEvent) {
		e.preventDefault();
	}

	function onHeroDragLeave() {
		heroDragDepth = Math.max(0, heroDragDepth - 1);
		if (heroDragDepth === 0) heroDragging = false;
	}

	function onHeroDrop(e: DragEvent) {
		e.preventDefault();
		heroDragDepth = 0;
		heroDragging = false;
		takePdfs(e.dataTransfer?.files ?? null);
	}

	function openHeroPicker() {
		heroInput?.click();
	}

	function onHeroKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openHeroPicker();
		}
	}

	const searchDebouncer = useDebouncer(
		(q: string) => {
			debouncedQuery = q;
		},
		{ wait: PACER.searchWait, trailing: true, leading: false, key: 'home-search' }
	);

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
			const copy = workflowCardCopy(m.workflows, w.slug);
			return { ...w, title: copy.title, subtitle: copy.subtitle };
		})
	);

	const guideCards = $derived(featuredGuides(locale));

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
	jsonLd={[websiteJsonLd(), organizationJsonLd()]}
	{locale}
/>

{#if droppedFiles?.length}
	<HomeHeroDrop files={droppedFiles} {locale} ondismiss={() => (droppedFiles = null)} />
{/if}

<!-- Hero: brand + crop-marked drop sheet -->
<section
	class="hero-stage relative border-b border-border transition-colors duration-200 {heroDragging
		? 'hero-stage-active'
		: ''}"
	aria-label="Hero"
	ondragenter={onHeroDragEnter}
	ondragover={onHeroDragOver}
	ondragleave={onHeroDragLeave}
	ondrop={onHeroDrop}
>
	<input
		bind:this={heroInput}
		type="file"
		accept="application/pdf,.pdf"
		multiple
		class="hidden"
		tabindex={-1}
		aria-hidden="true"
		onchange={(e) => {
			takePdfs(e.currentTarget.files);
			e.currentTarget.value = '';
		}}
	/>
	<div class="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
		<div class="hero-copy grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
			<div class="min-w-0 text-left">
				<p class="mb-3 text-sm text-muted-foreground">
					<span class="tabular-nums text-foreground">{localizedTools.length}</span>
					{m.hero.badge}
				</p>
				<h1
					class="font-display mb-4 font-extrabold tracking-[-0.045em] text-foreground"
					style="font-size: clamp(2.6rem, 7vw, 4.75rem); line-height: 0.86;"
				>
					<span class="block">We<span class="text-primary">Love</span></span>
					<span class="block">PDF</span>
				</h1>
				<p class="mb-6 max-w-[34ch] text-base leading-relaxed text-muted-foreground sm:text-lg">
					{m.hero.subtitle}
				</p>
				<div class="flex flex-wrap gap-2">
					<Button href={toolPath('merge-pdf', locale)} size="lg" class="rounded-sm">
						<FileText class="size-4" />
						{m.hero.ctaMerge}
					</Button>
					<Button href={toolPath('view-pdf', locale)} variant="outline" size="lg" class="rounded-sm">
						<Eye class="size-4" />
						{m.hero.ctaView}
					</Button>
					<Button
						href={toolPath('compress-pdf', locale)}
						variant="outline"
						size="lg"
						class="rounded-sm"
					>
						<Minimize2 class="size-4" />
						{m.hero.ctaCompress}
					</Button>
				</div>
			</div>

			<div class="hero-visual relative mx-auto hidden w-[9.5rem] sm:block lg:mx-0" aria-hidden="true">
				<div class="pdf-page pdf-page-lg">
					<span class="pdf-page-fold"></span>
					<span class="pdf-page-lines">
						<span></span>
						<span></span>
						<span></span>
						<span></span>
						<span class="short"></span>
					</span>
					<span class="pdf-page-badge">PDF</span>
				</div>
				<div class="pdf-page pdf-page-back"></div>
			</div>
		</div>

		<button
			type="button"
			class="crop-sheet hero-sheet group relative mt-8 w-full cursor-pointer border-0 bg-transparent p-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-[var(--register)] focus-visible:ring-offset-4 focus-visible:ring-offset-background {heroDragging
				? 'hero-sheet-active'
				: ''}"
			onclick={openHeroPicker}
			onkeydown={onHeroKeydown}
			aria-label={m.homeDrop.title}
		>
			<span class="crop-mark crop-mark-tl" class:crop-live={heroDragging}></span>
			<span class="crop-mark crop-mark-tr" class:crop-live={heroDragging}></span>
			<span class="crop-mark crop-mark-bl" class:crop-live={heroDragging}></span>
			<span class="crop-mark crop-mark-br" class:crop-live={heroDragging}></span>

			<div class="hero-plate relative overflow-hidden bg-card px-5 py-6 sm:px-8 sm:py-7">
				<div
					class="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8"
				>
					<div class="min-w-0">
						<p class="text-xs font-medium text-[var(--register)]">
							{heroDragging ? m.homeDrop.releaseHint : m.homeDrop.ticketLabel}
						</p>
						<p
							class="font-display mt-1 text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]"
						>
							{#if heroDragging}
								{m.workspace.dropzone.releaseToLoad}
							{:else}
								{m.homeDrop.title}
							{/if}
						</p>
						<p class="mt-1.5 max-w-md text-sm leading-snug text-muted-foreground">
							{m.homeDrop.subtitle}
						</p>
					</div>

					<div class="flex shrink-0 items-center gap-4">
						<span
							class="hidden h-10 w-px bg-[repeating-linear-gradient(180deg,var(--register)_0_4px,transparent_4px_8px)] sm:block"
							aria-hidden="true"
						></span>
						<span
							class="inline-flex items-center gap-2 border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors group-hover:border-[var(--register)] group-hover:text-primary"
							style="border-radius: 2px;"
						>
							{m.homeDrop.browseCta}
						</span>
					</div>
				</div>

				<div
					class="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-[repeating-linear-gradient(90deg,var(--signal)_0_12px,transparent_12px_20px,var(--register)_20px_32px,transparent_32px_40px)] opacity-80"
					aria-hidden="true"
				></div>
			</div>
		</button>
	</div>
</section>

<!-- Tools section -->
<section id="tools" class="mx-auto max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14">
	{#if recentFiles.length}
		<div class="mb-10 border-b border-border pb-10">
			<div class="mb-4 flex flex-wrap items-center justify-between gap-2">
				<h2 class="font-display text-xl font-bold tracking-tight">{m.home.recentFiles}</h2>
				<button
					type="button"
					class="text-xs text-muted-foreground underline-offset-2 hover:underline"
					onclick={handleClearRecentFiles}
				>
					{m.home.clearRecentFiles}
				</button>
			</div>
			<ul class="divide-y divide-border border-y border-border">
				{#each recentFiles as rf (rf.id)}
					<li class="flex items-center justify-between gap-3 py-3">
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
			<h2 class="font-display text-xl font-bold tracking-tight">{m.home.workflows}</h2>
			<p class="text-sm text-muted-foreground">{m.home.workflowsSubtitle}</p>
		</div>
		<div class="grid gap-0 border-t border-border sm:grid-cols-2 sm:gap-x-8">
			{#each workflowCards as wf (wf.slug)}
				<a
					href={localizedPath(wf.path, locale)}
					class="group flex items-start gap-3 border-b border-border py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--register)_5%,transparent)]"
				>
					<div
						class="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary"
						style="border-radius: 2px;"
					>
						<Workflow class="size-4" />
					</div>
					<div class="min-w-0">
						<p class="font-medium group-hover:text-primary">{wf.title}</p>
						<p class="text-xs text-muted-foreground">{wf.subtitle}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	<div class="mb-10">
		<div class="mb-4 flex flex-wrap items-end justify-between gap-2">
			<div>
				<h2 class="font-display text-xl font-bold tracking-tight">{m.home.guides}</h2>
				<p class="text-sm text-muted-foreground">{m.home.guidesSubtitle}</p>
			</div>
			<Button href={localizedPath('/guides', locale)} variant="outline" size="sm">
				<BookOpen class="size-3.5" />
				{m.guides.title}
			</Button>
		</div>
		<div class="grid gap-0 border-t border-border sm:grid-cols-2 sm:gap-x-8 lg:grid-cols-3">
			{#each guideCards as guide (guide.url)}
				<a
					href={guide.url}
					class="group flex items-start gap-3 border-b border-border py-4 transition-colors hover:bg-[color-mix(in_oklab,var(--register)_5%,transparent)]"
				>
					<div
						class="flex size-9 shrink-0 items-center justify-center bg-primary/10 text-primary"
						style="border-radius: 2px;"
					>
						<BookOpen class="size-4" />
					</div>
					<div class="min-w-0">
						<p class="font-medium group-hover:text-primary">{guide.title}</p>
						<p class="line-clamp-2 text-xs text-muted-foreground">{guide.description}</p>
					</div>
				</a>
			{/each}
		</div>
	</div>

	{#if favoriteTools.length}
		<div class="mb-10">
			<h2 class="font-display mb-2 text-xl font-bold tracking-tight">{m.home.favorites}</h2>
			<div class="border-t border-border">
				{#each favoriteTools as tool (tool.slug)}
					<ToolCard {tool} {locale} />
				{/each}
			</div>
		</div>
	{/if}

	{#if recentTools.length}
		<div class="mb-10">
			<h2 class="font-display mb-2 text-xl font-bold tracking-tight">{m.home.recent}</h2>
			<div class="border-t border-border">
				{#each recentTools as tool (tool.slug)}
					<ToolCard {tool} {locale} />
				{/each}
			</div>
		</div>
	{/if}

	<!-- Sticky search + filter -->
	<div
		class="sticky top-14 z-40 -mx-4 mb-6 border-b border-border bg-background/90 px-4 py-4 backdrop-blur-md sm:-mx-6 sm:px-6"
	>
		<div class="space-y-3">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<div class="relative max-w-md flex-1">
					<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						bind:ref={searchInput}
						bind:value={query}
						placeholder={m.home.searchPlaceholder}
						class="pr-20 pl-9"
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

			<div class="flex flex-wrap gap-1.5">
				{#each [{ id: 'all', label: `${m.home.all} (${localizedTools.length})` }, ...categories.map((c) => ({ id: c, label: `${categoryLabel(c, locale)} (${localizedTools.filter((t) => t.category === c).length})` }))] as pill}
					<button
						type="button"
						class="px-3 py-1.5 text-xs font-medium transition-colors {activeCategory === pill.id
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
						style="border-radius: 2px;"
						onclick={() => setCategory(pill.id as ToolCategory | 'all')}
					>
						{pill.label}
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="py-16 text-left" in:fade={{ duration: 300 }}>
			<p class="font-display text-lg font-bold text-foreground">{m.home.noResults}</p>
			<p class="mt-1 text-sm text-muted-foreground">{m.home.noResultsHint}</p>
			<Button
				variant="link"
				class="mt-3 px-0"
				onclick={() => {
					query = '';
					debouncedQuery = '';
					activeCategory = 'all';
					searchDebouncer.cancel();
					filterKey++;
				}}
			>
				{m.home.resetFilters}
			</Button>
		</div>
	{:else if activeCategory === 'all'}
		{#key filterKey}
			{#each grouped as group (group.category)}
				<div id={group.category} class="mb-10 scroll-mt-32 last:mb-0">
					<div class="mb-1 flex items-baseline justify-between gap-3 border-b border-border pb-2">
						<h2 class="font-display text-lg font-bold tracking-tight">{group.label}</h2>
						<span class="text-xs tabular-nums text-muted-foreground">{group.tools.length}</span>
					</div>
					<div>
						{#each group.tools as tool (tool.slug)}
							<ToolCard {tool} {locale} />
						{/each}
					</div>
				</div>
			{/each}
		{/key}
	{:else}
		{#key filterKey}
			<div class="border-t border-border" in:fade={{ duration: 200 }}>
				{#each filtered as tool (tool.slug)}
					<ToolCard {tool} {locale} />
				{/each}
			</div>
		{/key}
	{/if}
</section>

<!-- Why — strip, not cards -->
<section class="border-t border-border">
	<div class="mx-auto max-w-6xl px-4 py-12 sm:px-6">
		<h2 class="font-display mb-6 text-2xl font-bold tracking-tight">{m.home.whyTitle}</h2>
		<ul class="grid gap-0 border-t border-border md:grid-cols-3">
			{#each [
				{ icon: Shield, title: m.home.featurePrivateTitle, desc: m.home.featurePrivateDesc },
				{ icon: Zap, title: m.home.featureFastTitle, desc: m.home.featureFastDesc },
				{ icon: WifiOff, title: m.home.featureDarkTitle, desc: m.home.featureDarkDesc }
			] as feature}
				<li class="flex gap-3 border-b border-border py-5 md:border-b-0 md:border-r md:px-5 md:first:pl-0 md:last:border-r-0 md:last:pr-0">
					<feature.icon class="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
					<div>
						<p class="font-display font-bold tracking-tight">{feature.title}</p>
						<p class="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
					</div>
				</li>
			{/each}
		</ul>
	</div>
</section>

<style>
	.hero-stage {
		overflow: hidden;
		background:
			radial-gradient(ellipse 55% 70% at 100% 0%, color-mix(in oklab, var(--register) 7%, transparent), transparent 70%),
			radial-gradient(ellipse 40% 50% at 0% 100%, color-mix(in oklab, var(--signal) 5%, transparent), transparent 65%);
	}
	.hero-stage-active {
		background:
			radial-gradient(ellipse 60% 80% at 85% 40%, color-mix(in oklab, var(--register) 14%, transparent), transparent 70%),
			var(--background);
	}

	.hero-copy {
		animation: press-in 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
	}

	.hero-sheet {
		animation: press-in 0.55s cubic-bezier(0.22, 1, 0.36, 1) 0.06s both;
	}

	.hero-plate {
		border-radius: 2px;
		box-shadow: 5px 7px 0 color-mix(in oklab, var(--ink) 11%, transparent);
		transition:
			transform 0.22s cubic-bezier(0.22, 1, 0.36, 1),
			box-shadow 0.22s ease,
			background-color 0.22s ease;
	}
	.hero-sheet:hover .hero-plate {
		background: color-mix(in oklab, var(--register) 5%, var(--card));
		transform: translate(-1px, -2px);
		box-shadow: 7px 10px 0 color-mix(in oklab, var(--ink) 14%, transparent);
	}
	.hero-sheet-active .hero-plate {
		background: color-mix(in oklab, var(--register) 12%, var(--card));
		transform: translate(-2px, -4px);
		box-shadow: 9px 12px 0 color-mix(in oklab, var(--register) 32%, transparent);
	}

	.hero-visual {
		height: 11.5rem;
		width: 9.5rem;
	}

	.pdf-page {
		position: relative;
		z-index: 1;
		width: 7.25rem;
		height: 9.5rem;
		margin-left: auto;
		border: 1px solid var(--border);
		border-radius: 2px;
		background: linear-gradient(
			165deg,
			var(--card) 0%,
			color-mix(in oklab, var(--muted) 45%, var(--card)) 100%
		);
		box-shadow:
			4px 5px 0 color-mix(in oklab, var(--ink) 10%, transparent),
			inset 0 0 0 1px color-mix(in oklab, var(--card) 60%, transparent);
		transform: rotate(4deg);
		animation: page-in-front 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.15s both;
	}

	.pdf-page-back {
		position: absolute;
		z-index: 0;
		right: 0.85rem;
		top: 0.35rem;
		width: 7.25rem;
		height: 9.5rem;
		border: 1px solid var(--border);
		border-radius: 2px;
		background: color-mix(in oklab, var(--muted) 70%, var(--card));
		transform: rotate(-6deg);
		box-shadow: 3px 3px 0 color-mix(in oklab, var(--ink) 7%, transparent);
		animation: page-in-back 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.05s both;
	}

	.pdf-page::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 5px;
		background: var(--signal);
	}

	.pdf-page-fold {
		position: absolute;
		top: 0;
		right: 0;
		width: 1.35rem;
		height: 1.35rem;
		background:
			linear-gradient(225deg, transparent 50%, color-mix(in oklab, var(--muted) 80%, var(--card)) 50%),
			linear-gradient(225deg, transparent 49.5%, var(--border) 49.5% 50.5%, transparent 50.5%);
		box-shadow: -1px 1px 0 color-mix(in oklab, var(--ink) 6%, transparent);
	}

	.pdf-page-lines {
		position: absolute;
		inset: 1.6rem 0.7rem 2rem 0.95rem;
		display: flex;
		flex-direction: column;
		gap: 0.42rem;
	}
	.pdf-page-lines span {
		display: block;
		height: 2px;
		background: color-mix(in oklab, var(--ink) 11%, transparent);
		border-radius: 1px;
	}
	.pdf-page-lines span.short {
		width: 52%;
	}

	.pdf-page-badge {
		position: absolute;
		right: 0.45rem;
		bottom: 0.45rem;
		font-family: var(--font-display);
		font-size: 0.65rem;
		font-weight: 800;
		letter-spacing: -0.02em;
		color: var(--signal);
	}

	@keyframes page-in-front {
		from {
			opacity: 0;
			transform: rotate(0deg) translateY(18px);
		}
		to {
			opacity: 1;
			transform: rotate(4deg) translateY(0);
		}
	}
	@keyframes page-in-back {
		from {
			opacity: 0;
			transform: rotate(0deg) translateY(18px);
		}
		to {
			opacity: 1;
			transform: rotate(-6deg) translateY(0);
		}
	}

	:global(.crop-live) {
		color: var(--signal);
		animation: crop-pulse 0.7s ease-in-out infinite alternate;
	}

	@keyframes press-in {
		from {
			opacity: 0;
			transform: translateY(12px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes crop-pulse {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.hero-copy,
		.hero-sheet {
			animation: none;
		}
		.hero-plate,
		.pdf-page {
			transition: none;
		}
		.hero-sheet:hover .hero-plate,
		.hero-sheet-active .hero-plate {
			transform: none;
		}
		.pdf-page,
		.pdf-page-back {
			animation: none;
		}
		:global(.crop-live) {
			animation: none;
		}
	}
</style>
