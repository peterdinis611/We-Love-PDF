<script lang="ts">
	import { goto } from '$app/navigation';
	import { setPendingFile } from '$lib/pending-file';
	import { toolPath, type Locale } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';

	let {
		bytes,
		filename = 'document.pdf',
		locale = 'en' as Locale,
		suggestions = [
			{ slug: 'compress-pdf', label: 'Compress' },
			{ slug: 'protect-pdf', label: 'Protect' },
			{ slug: 'pdf-to-pdfa', label: 'PDF/A' }
		]
	}: {
		bytes: Uint8Array | null;
		filename?: string;
		locale?: Locale;
		suggestions?: { slug: string; label: string }[];
	} = $props();

	function continueTo(slug: string) {
		if (!bytes) return;
		const file = new File([bytes.slice()], filename, { type: 'application/pdf' });
		setPendingFile(file);
		goto(toolPath(slug, locale));
	}
</script>

{#if bytes}
	<div class="rounded-xl border border-border/60 bg-muted/30 p-4">
		<p class="mb-2 text-sm font-medium">Continue with this file</p>
		<div class="flex flex-wrap gap-2">
			{#each suggestions as s}
				<Button type="button" size="sm" variant="outline" onclick={() => continueTo(s.slug)}>
					{s.label}
					<ArrowRight class="size-3.5" />
				</Button>
			{/each}
		</div>
	</div>
{/if}
