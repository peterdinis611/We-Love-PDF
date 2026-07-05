<script lang="ts">
	import { page } from '$app/stores';
	import ThemeToggle from './ThemeToggle.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FileText, Layers, Eye } from '@lucide/svelte';
</script>

<header class="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
		<a href="/" class="flex shrink-0 items-center gap-2.5">
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
			<Button variant="ghost" size="sm" href="/#tools">
				<Layers class="size-4" />
				All Tools
			</Button>
			<Button variant="ghost" size="sm" href="/tools/view-pdf">
				<Eye class="size-4" />
				View
			</Button>
			<Button variant="ghost" size="sm" href="/tools/merge-pdf">
				<FileText class="size-4" />
				Merge
			</Button>
		</nav>

		<div class="flex items-center gap-1.5">
			<ThemeToggle compact />
			{#if $page.url.pathname.startsWith('/tools/')}
				<Button variant="outline" size="sm" href="/">← Tools</Button>
			{/if}
		</div>
	</div>
</header>
