<script lang="ts">
	import { tools, categoryLabels, type ToolCategory } from '$lib/tools';

	const popular = [
		{ slug: 'merge-pdf', label: 'Merge' },
		{ slug: 'split-pdf', label: 'Split' },
		{ slug: 'compress-pdf', label: 'Compress' },
		{ slug: 'sign-pdf', label: 'Sign' },
		{ slug: 'protect-pdf', label: 'Protect' },
		{ slug: 'view-pdf', label: 'View' }
	];
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
						href="/tools/{link.slug}"
						class="rounded-full border border-border/60 bg-background/80 px-4 py-1.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:text-primary hover:shadow-sm"
					>
						{link.label}
					</a>
				{/each}
			</nav>

			<p class="text-xs text-muted-foreground">
				{tools.filter((t) => t.available).length} free tools · 100% in-browser · no uploads
			</p>
		</div>
	</div>
</footer>
