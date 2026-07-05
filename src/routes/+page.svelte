<script lang="ts">
	import ToolCard from '$lib/components/ToolCard.svelte';
	import { tools, categoryLabels, type ToolCategory } from '$lib/tools';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Search, Shield, Zap, Sparkles, FileText, Eye, Minimize2 } from '@lucide/svelte';

	const categories = Object.keys(categoryLabels) as ToolCategory[];

	let query = $state('');
	let activeCategory = $state<ToolCategory | 'all'>('all');

	const filtered = $derived(
		tools.filter((t) => {
			const matchesQuery =
				!query ||
				t.name.toLowerCase().includes(query.toLowerCase()) ||
				t.description.toLowerCase().includes(query.toLowerCase());
			const matchesCategory = activeCategory === 'all' || t.category === activeCategory;
			return matchesQuery && matchesCategory;
		})
	);

	const grouped = $derived(
		categories
			.map((cat) => ({
				category: cat,
				label: categoryLabels[cat],
				tools: filtered.filter((t) => t.category === cat)
			}))
			.filter((g) => g.tools.length > 0)
	);
</script>

<svelte:head>
	<title>WeLovePDF — Every tool you need to work with PDFs</title>
	<meta
		name="description"
		content="Merge, split, rotate, organize, watermark, encrypt and view PDF files online for free."
	/>
</svelte:head>

<!-- Hero -->
<section class="relative overflow-hidden border-b border-border/60">
	<div class="pointer-events-none absolute inset-0">
		<div class="absolute -left-32 -top-32 size-96 rounded-full bg-primary/10 blur-3xl"></div>
		<div class="absolute -bottom-20 right-0 size-72 rounded-full bg-primary/5 blur-3xl"></div>
	</div>
	<div class="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
		<div class="mx-auto max-w-2xl text-center">
			<Badge variant="secondary" class="mb-4 gap-1.5 px-3 py-1">
				<Sparkles class="size-3" />
				{tools.length} free tools · 100% in-browser
			</Badge>
			<h1 class="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
				Every PDF tool you need
			</h1>
			<p class="mb-8 text-base text-muted-foreground sm:text-lg">
				Merge, split, compress, watermark, encrypt — fast, private, and completely free. Your
				files never leave your device.
			</p>
			<div class="flex flex-wrap justify-center gap-2">
				<Button href="/tools/merge-pdf" size="lg">
					<FileText class="size-4" />
					Merge PDF
				</Button>
				<Button href="/tools/view-pdf" variant="outline" size="lg">
					<Eye class="size-4" />
					View PDF
				</Button>
				<Button href="/tools/compress-pdf" variant="outline" size="lg">
					<Minimize2 class="size-4" />
					Compress
				</Button>
			</div>
		</div>
	</div>
</section>

<!-- Tools section -->
<section id="tools" class="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
	<!-- Search + filter -->
	<div class="mb-8 space-y-4">
		<div class="relative max-w-md">
			<Search class="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input bind:value={query} placeholder="Search tools…" class="pl-9" />
		</div>
		<div class="flex flex-wrap gap-2">
			<button
				type="button"
				class="rounded-full px-3.5 py-1.5 text-xs font-medium transition {activeCategory === 'all'
					? 'bg-primary text-primary-foreground shadow-sm'
					: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
				onclick={() => (activeCategory = 'all')}
			>
				All ({tools.length})
			</button>
			{#each categories as cat}
				<button
					type="button"
					class="rounded-full px-3.5 py-1.5 text-xs font-medium transition {activeCategory === cat
						? 'bg-primary text-primary-foreground shadow-sm'
						: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}"
					onclick={() => (activeCategory = cat)}
				>
					{categoryLabels[cat]} ({tools.filter((t) => t.category === cat).length})
				</button>
			{/each}
		</div>
	</div>

	{#if filtered.length === 0}
		<div class="py-16 text-center">
			<p class="text-muted-foreground">No tools match your search.</p>
			<Button variant="link" class="mt-2" onclick={() => (query = '')}>Clear search</Button>
		</div>
	{:else if activeCategory === 'all'}
		{#each grouped as group (group.category)}
			<div id={group.category} class="mb-10 scroll-mt-24">
				<div class="mb-4 flex items-center gap-3">
					<h2 class="text-lg font-semibold">{group.label}</h2>
					<Separator class="flex-1" />
					<span class="text-xs text-muted-foreground">{group.tools.length} tools</span>
				</div>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each group.tools as tool (tool.slug)}
						<ToolCard {tool} />
					{/each}
				</div>
			</div>
		{/each}
	{:else}
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each filtered as tool (tool.slug)}
				<ToolCard {tool} />
			{/each}
		</div>
	{/if}
</section>

<!-- Features -->
<section class="border-t border-border/60 bg-muted/30">
	<div class="mx-auto max-w-6xl px-4 py-14 sm:px-6">
		<h2 class="mb-8 text-center text-2xl font-bold">Why WeLovePDF?</h2>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each [
				{ icon: Shield, title: '100% Private', desc: 'All processing happens locally. No uploads, no servers.' },
				{ icon: Zap, title: 'Lightning Fast', desc: 'Powered by EmbedPDF PDFium engine for instant results.' },
				{ icon: Sparkles, title: 'Dark Mode', desc: 'Comfortable viewing day or night with theme switching.' }
			] as feature}
				<Card.Root class="border-border/60 bg-card/80">
					<Card.Content class="p-5 text-center">
						<div
							class="mx-auto mb-3 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary"
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
