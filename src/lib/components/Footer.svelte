<script lang="ts">
	import { Separator } from '$lib/components/ui/separator/index.js';
</script>

<footer class="border-t border-border/60 bg-background">
	<div class="mx-auto max-w-6xl px-4 py-10 sm:px-6">
		<div class="flex flex-col items-center gap-4 text-center">
			<div class="flex items-center gap-2">
				<div
					class="flex size-7 items-center justify-center rounded-md bg-primary text-[10px] font-bold text-primary-foreground"
				>
					PDF
				</div>
				<span class="font-bold">
					We<span class="text-primary">Love</span>PDF
				</span>
			</div>
			<p class="max-w-sm text-sm text-muted-foreground">
				15+ PDF tools. Merge, split, rotate, watermark, encrypt, and more — all in your browser.
			</p>
			<Separator class="max-w-xs" />
			<p class="text-xs text-muted-foreground">
				Powered by
				<a href="https://www.embedpdf.com" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline"
					>EmbedPDF</a
				>
				· SvelteKit · shadcn-svelte
			</p>
		</div>
	</div>
</footer>
