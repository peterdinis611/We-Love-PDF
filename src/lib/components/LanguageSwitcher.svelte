<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { alternatePaths, LOCALES, type Locale } from '$lib/i18n/locale';
	import { Check, ChevronDown } from '@lucide/svelte';

	let { locale = 'en' }: { locale?: Locale } = $props();

	const meta: Record<Locale, { code: string; name: string; native: string }> = {
		en: { code: 'EN', name: 'English', native: 'English' },
		sk: { code: 'SK', name: 'Slovak', native: 'Slovenčina' },
		cs: { code: 'CS', name: 'Czech', native: 'Čeština' },
		de: { code: 'DE', name: 'German', native: 'Deutsch' },
		pl: { code: 'PL', name: 'Polish', native: 'Polski' }
	};

	let open = $state(false);
	let rootEl = $state<HTMLDivElement | null>(null);
	let activeIndex = $state(0);

	const current = $derived(meta[locale]);

	function switchTo(target: Locale) {
		open = false;
		if (target === locale) return;
		const paths = alternatePaths($page.url.pathname);
		goto(paths[target]);
	}

	function toggle() {
		open = !open;
		if (open) activeIndex = Math.max(0, LOCALES.indexOf(locale));
	}

	function onKeydown(e: KeyboardEvent) {
		if (!open) {
			if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				open = true;
				activeIndex = Math.max(0, LOCALES.indexOf(locale));
			}
			return;
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			open = false;
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, LOCALES.length - 1);
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		}
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			switchTo(LOCALES[activeIndex]);
		}
	}

	onMount(() => {
		function onDocPointer(e: PointerEvent) {
			if (!rootEl?.contains(e.target as Node)) open = false;
		}
		document.addEventListener('pointerdown', onDocPointer);
		return () => document.removeEventListener('pointerdown', onDocPointer);
	});
</script>

{#snippet flag(loc: Locale, size = 16)}
	<svg
		width={size}
		height={size}
		viewBox="0 0 24 24"
		class="shrink-0 overflow-hidden rounded-[3px] ring-1 ring-black/10 dark:ring-white/15"
		aria-hidden="true"
	>
		{#if loc === 'en'}
			<rect width="24" height="24" fill="#012169" />
			<path d="M0 0l24 24M24 0L0 24" stroke="#fff" stroke-width="4" />
			<path d="M0 0l24 24M24 0L0 24" stroke="#C8102E" stroke-width="2" />
			<path d="M12 0v24M0 12h24" stroke="#fff" stroke-width="7" />
			<path d="M12 0v24M0 12h24" stroke="#C8102E" stroke-width="4" />
		{:else if loc === 'sk'}
			<!-- Slovakia: white / blue / red + patriarchal cross on three hills -->
			<rect width="24" height="8" y="0" fill="#fff" />
			<rect width="24" height="8" y="8" fill="#0B4EA2" />
			<rect width="24" height="8" y="16" fill="#EE1C25" />
			<!-- shield -->
			<path
				d="M3.2 5.2h6.2c0 0 0 5.8-0.2 7.4-0.15 1.2-1.1 2.6-2.9 3.6-1.8-1-2.75-2.4-2.9-3.6C3.2 11 3.2 5.2 3.2 5.2z"
				fill="#EE1C25"
				stroke="#fff"
				stroke-width="0.7"
			/>
			<!-- three hills -->
			<path
				d="M3.8 14.2c0.9-1.1 1.5-1.1 2.3 0 0.7-0.9 1.3-0.9 2 0v1.4H3.8z"
				fill="#0B4EA2"
			/>
			<!-- double (patriarchal) cross -->
			<path
				d="M6.3 6.4v6.2M5.1 7.4h2.4M5.25 9.1h2.1"
				stroke="#fff"
				stroke-width="1.05"
				stroke-linecap="square"
			/>
		{:else if loc === 'cs'}
			<path d="M0 0h24v12H0z" fill="#fff" />
			<path d="M0 12h24v12H0z" fill="#D7141A" />
			<path d="M0 0l12 12L0 24z" fill="#11457E" />
		{:else if loc === 'de'}
			<rect width="24" height="8" y="0" fill="#000" />
			<rect width="24" height="8" y="8" fill="#DD0000" />
			<rect width="24" height="8" y="16" fill="#FFCE00" />
		{:else}
			<rect width="24" height="12" y="0" fill="#fff" />
			<rect width="24" height="12" y="12" fill="#DC143C" />
		{/if}
	</svg>
{/snippet}

<div class="relative" bind:this={rootEl}>
	<button
		type="button"
		class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border/70 bg-background px-2 text-xs font-medium transition hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-label="Language: {current.native}"
		onclick={toggle}
		onkeydown={onKeydown}
	>
		{@render flag(locale, 16)}
		<span class="tabular-nums tracking-wide">{current.code}</span>
		<ChevronDown
			class="size-3.5 text-muted-foreground transition-transform duration-150 {open
				? 'rotate-180'
				: ''}"
		/>
	</button>

	{#if open}
		<ul
			class="absolute right-0 z-[60] mt-1.5 min-w-[12rem] overflow-hidden rounded-xl border border-border bg-popover p-1 shadow-lg"
			role="listbox"
			aria-label="Select language"
			tabindex="-1"
			transition:fly={{ y: -4, duration: 140 }}
		>
			{#each LOCALES as loc, i (loc)}
				<li role="option" aria-selected={locale === loc}>
					<button
						type="button"
						class="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition {i ===
							activeIndex
							? 'bg-primary/10 text-foreground'
							: 'hover:bg-muted/70'}"
						onmouseenter={() => (activeIndex = i)}
						onclick={() => switchTo(loc)}
					>
						{@render flag(loc, 18)}
						<span class="min-w-0 flex-1">
							<span class="block font-medium leading-tight">{meta[loc].native}</span>
							<span class="block text-[10px] uppercase tracking-wider text-muted-foreground"
								>{meta[loc].code}</span
							>
						</span>
						{#if locale === loc}
							<Check class="size-3.5 shrink-0 text-primary" />
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>
