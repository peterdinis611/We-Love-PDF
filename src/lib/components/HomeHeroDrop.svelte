<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { msg } from '$lib/i18n';
	import { setPendingFile, setPendingFiles } from '$lib/pending-file';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { suggestDropActions, type SmartDropAction } from '$lib/smart-drop';
	import { Button } from '$lib/components/ui/button/index.js';
	import { trapFocus } from '$lib/focus-trap';
	import {
		FileText,
		Eye,
		Minimize2,
		Scissors,
		X,
		ScanText,
		Layers,
		Shield,
		Wrench
	} from '@lucide/svelte';
	import type { Component } from 'svelte';

	let {
		files,
		locale = 'en' as Locale,
		ondismiss
	}: {
		files: File[];
		locale?: Locale;
		ondismiss: () => void;
	} = $props();

	const m = $derived(msg(locale));
	let actions = $state<SmartDropAction[]>([]);
	let loading = $state(true);
	let dialogEl = $state<HTMLDivElement | null>(null);

	const iconMap: Record<string, Component> = {
		'merge-pdf': FileText,
		'split-pdf': Scissors,
		'view-pdf': Eye,
		'compress-pdf': Minimize2,
		'ocr-pdf': ScanText,
		'batch-pdf': Layers,
		'protect-pdf': Shield,
		'fix-pdf': Wrench
	};

	$effect(() => {
		const list = files;
		const loc = locale;
		let cancelled = false;
		loading = true;
		void suggestDropActions(list, loc).then((result) => {
			if (!cancelled) {
				actions = result;
				loading = false;
			}
		});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!dialogEl || loading) return;
		const first = dialogEl.querySelector('button:not([aria-label])') as HTMLButtonElement | null;
		first?.focus();
		return trapFocus(dialogEl, ondismiss);
	});

	function goToTool(slug: string) {
		if (files.length > 1) setPendingFiles(files);
		else if (files[0]) setPendingFile(files[0]);
		void import('$lib/recent-files').then(({ saveRecentFile }) => {
			for (const f of files.slice(0, 3)) void saveRecentFile(f);
		});
		goto(toolPath(slug, locale));
		ondismiss();
	}

	const titleName = $derived(
		files.length > 1 ? `${files.length} PDF files` : (files[0]?.name ?? '')
	);
</script>

<div
	class="fixed inset-0 z-[90] flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm"
	role="presentation"
	transition:fade={{ duration: 150 }}
	onclick={(e) => e.target === e.currentTarget && ondismiss()}
>
	<div
		bind:this={dialogEl}
		class="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl"
		role="dialog"
		aria-modal="true"
		aria-label={m.homeDrop.title}
		tabindex="-1"
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
		<p class="mb-1 truncate text-sm text-muted-foreground">{titleName}</p>
		<p class="mb-5 text-sm text-muted-foreground">{m.homeDrop.subtitle}</p>

		{#if loading}
			<p class="py-6 text-center text-sm text-muted-foreground">Analyzing…</p>
		{:else}
			<div class="grid gap-2">
				{#each actions as action}
					{@const Icon = iconMap[action.slug] ?? FileText}
					<Button
						variant={action.primary ? 'default' : 'outline'}
						class="h-auto justify-start gap-3 py-3 text-left"
						onclick={() => goToTool(action.slug)}
					>
						<Icon class="size-4 shrink-0" />
						<span class="min-w-0">
							<span class="block font-medium">{action.label}</span>
							<span
								class="block text-xs font-normal {action.primary
									? 'text-primary-foreground/80'
									: 'text-muted-foreground'}">{action.reason}</span
							>
						</span>
					</Button>
				{/each}
			</div>
		{/if}
	</div>
</div>
