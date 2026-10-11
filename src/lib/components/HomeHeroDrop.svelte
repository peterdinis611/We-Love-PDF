<script lang="ts">
	import { goto } from '$app/navigation';
	import { fly, fade } from 'svelte/transition';
	import { msg } from '$lib/i18n';
	import { setPendingFile, setPendingFiles } from '$lib/pending-file';
	import { toolPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { suggestDropActions, type SmartDropAction } from '$lib/smart-drop';
	import { formatFileSize } from '$lib/pdf/operations';
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
		Wrench,
		ArrowRight
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
		const first = dialogEl.querySelector('[data-drop-action]') as HTMLButtonElement | null;
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
	const sizeLabel = $derived(
		files.length === 1 && files[0]
			? formatFileSize(files[0].size)
			: files.length > 1
				? formatFileSize(files.reduce((n, f) => n + f.size, 0))
				: ''
	);
</script>

<div
	class="fixed inset-0 z-[90] flex items-center justify-center bg-[color-mix(in_oklab,var(--ink)_45%,transparent)] p-4 backdrop-blur-[2px]"
	role="presentation"
	transition:fade={{ duration: 150 }}
	onclick={(e) => e.target === e.currentTarget && ondismiss()}
>
	<div
		bind:this={dialogEl}
		class="crop-sheet job-ticket relative w-full max-w-md bg-card outline-none"
		role="dialog"
		aria-modal="true"
		aria-label={m.homeDrop.title}
		tabindex="-1"
		in:fly={{ y: 14, duration: 220 }}
	>
		<span class="crop-mark crop-mark-tl"></span>
		<span class="crop-mark crop-mark-tr"></span>
		<span class="crop-mark crop-mark-bl"></span>
		<span class="crop-mark crop-mark-br"></span>

		<button
			type="button"
			class="absolute top-3 right-3 z-20 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
			style="border-radius: 2px;"
			onclick={ondismiss}
			aria-label={m.homeDrop.dismiss}
		>
			<X class="size-4" />
		</button>

		<div class="relative z-10 p-6 sm:p-7">
			<p class="text-xs font-medium tracking-wide text-[var(--register)]">{m.homeDrop.ticketLabel}</p>
			<h2 class="font-display mt-1 text-2xl font-bold tracking-tight">{m.homeDrop.title}</h2>
			<p class="mt-1 text-sm text-muted-foreground">{m.homeDrop.subtitle}</p>

			<div
				class="mt-5 flex items-start gap-3 border-y border-dashed border-border py-3"
			>
				<div
					class="flex size-10 shrink-0 items-center justify-center bg-primary text-[0.65rem] font-bold text-primary-foreground"
					style="border-radius: 2px;"
					aria-hidden="true"
				>
					PDF
				</div>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">{titleName}</p>
					{#if sizeLabel}
						<p class="text-xs tabular-nums text-muted-foreground">{sizeLabel}</p>
					{/if}
				</div>
			</div>

			{#if loading}
				<div class="flex items-center gap-3 py-8" aria-live="polite">
					<span class="reg-spin" aria-hidden="true"></span>
					<p class="text-sm text-muted-foreground">{m.homeDrop.analyzing}</p>
				</div>
			{:else}
				<ul class="mt-1 divide-y divide-border border-b border-border">
					{#each actions as action, i}
						{@const Icon = iconMap[action.slug] ?? FileText}
						<li>
							<button
								type="button"
								data-drop-action
								class="group flex w-full items-start gap-3 py-3.5 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--register)_6%,transparent)] focus-visible:bg-[color-mix(in_oklab,var(--register)_8%,transparent)] {action.primary
									? 'pl-0'
									: ''}"
								onclick={() => goToTool(action.slug)}
								style="animation-delay: {i * 40}ms"
							>
								{#if action.primary}
									<span
										class="mt-0.5 w-1 shrink-0 self-stretch bg-primary"
										aria-hidden="true"
									></span>
								{:else}
									<span class="mt-0.5 w-1 shrink-0 self-stretch bg-transparent" aria-hidden="true"
									></span>
								{/if}
								<span
									class="mt-0.5 flex size-8 shrink-0 items-center justify-center {action.primary
										? 'bg-primary text-primary-foreground'
										: 'bg-muted text-foreground'}"
									style="border-radius: 2px;"
								>
									<Icon class="size-3.5" />
								</span>
								<span class="min-w-0 flex-1">
									<span class="font-display block text-sm font-bold tracking-tight group-hover:text-primary">
										{action.label}
									</span>
									<span class="mt-0.5 block text-xs leading-snug text-muted-foreground">
										{action.reason}
									</span>
								</span>
								<ArrowRight
									class="mt-1 size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
								/>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</div>

<style>
	.job-ticket {
		box-shadow: 6px 8px 0 color-mix(in oklab, var(--ink) 18%, transparent);
	}

	.reg-spin {
		width: 1.1rem;
		height: 1.1rem;
		border: 2px solid color-mix(in oklab, var(--register) 25%, transparent);
		border-top-color: var(--register);
		border-radius: 999px;
		animation: reg-spin 0.65s linear infinite;
	}

	@keyframes reg-spin {
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reg-spin {
			animation: none;
			border-top-color: color-mix(in oklab, var(--register) 55%, transparent);
		}
	}
</style>
