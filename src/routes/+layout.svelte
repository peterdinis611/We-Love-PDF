<script lang="ts">
	import Plausible from '$lib/components/Plausible.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import SwUpdateToast from '$lib/components/SwUpdateToast.svelte';
	import GlobalShortcuts from '$lib/components/GlobalShortcuts.svelte';
	import ShortcutHelp from '$lib/components/ShortcutHelp.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { globalUi } from '$lib/global-ui.svelte';
	import { precacheToolPages } from '$lib/precache-tools';
	import { theme } from '$lib/theme.svelte';
	import type { Locale } from '$lib/i18n/locale';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const locale = $derived(($page.data.locale as Locale | undefined) ?? 'en');

	onMount(() => {
		theme.init();
		// Idle precache of tool pages for offline use after first visit
		const idle = window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 3000));
		idle(() => void precacheToolPages());
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Plausible />
<GlobalShortcuts />
<ShortcutHelp />

<div class="flex min-h-screen flex-col bg-background">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
	<ScrollToTop />
</div>

<CommandPalette
	open={globalUi.paletteOpen}
	onOpenChange={(v) => globalUi.setPaletteOpen(v)}
	{locale}
/>
<SwUpdateToast />
