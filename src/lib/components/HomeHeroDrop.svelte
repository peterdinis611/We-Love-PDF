<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { msg } from '$lib/i18n';
	import { setPendingFile } from '$lib/pending-file';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { FileText, Eye, Minimize2, Scissors, X } from '@lucide/svelte';

	let {
		file,
		locale = 'en' as Locale,
		ondismiss
	}: {
		file: File;
		locale?: Locale;
		ondismiss: () => void;
	} = $props();

	const m = $derived(msg(locale));

	const actions = $derived([
		{ slug: 'merge-pdf', label: m.hero.ctaMerge, icon: FileText },
		{ slug: 'split-pdf', label: locale === 'sk' ? 'Rozdeliť PDF' : 'Split PDF', icon: Scissors },
		{ slug: 'view-pdf', label: m.hero.ctaView, icon: Eye },
		{ slug: 'compress-pdf', label: m.hero.ctaCompress, icon: Minimize2 }
	]);

	function isPdf(f: File) {
		return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
	}

	function goToTool(slug: string) {
		if (!isPdf(file)) return;
		setPendingFile(file);
		goto(toolPath(slug, locale));
		ondismiss();
	}
</script>

<div
	class="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
	role="dialog"
	aria-modal="true"
	aria-label={m.homeDrop.title}
	tabindex="-1"
	transition:fade={{ duration: 150 }}
	onclick={(e) => e.target === e.currentTarget && ondismiss()}
	onkeydown={(e) => e.key === 'Escape' && ondismiss()}
>
	<div
		class="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
		in:fly={{ y: 12, duration: 200 }}
	>
		<button
			type="button"
			class="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
			onclick={ondismiss}
			aria-label={m.homeDrop.dismiss}
		>
			<X class="size-4" />
		</button>
		<h2 class="mb-1 text-lg font-semibold">{m.homeDrop.title}</h2>
		<p class="mb-1 truncate text-sm text-muted-foreground">{file.name}</p>
		<p class="mb-5 text-sm text-muted-foreground">{m.homeDrop.subtitle}</p>
		<div class="grid gap-2 sm:grid-cols-2">
			{#each actions as action}
				<Button variant="outline" class="h-auto justify-start gap-2 py-3" onclick={() => goToTool(action.slug)}>
					<action.icon class="size-4 shrink-0" />
					{action.label}
				</Button>
			{/each}
		</div>
	</div>
</div>
