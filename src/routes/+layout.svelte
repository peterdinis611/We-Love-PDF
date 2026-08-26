<script lang="ts">
	import Plausible from '$lib/components/Plausible.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import SwUpdateToast from '$lib/components/SwUpdateToast.svelte';
	import GlobalShortcuts from '$lib/components/GlobalShortcuts.svelte';
	import ShortcutHelp from '$lib/components/ShortcutHelp.svelte';
	import NavigationProgress from '$lib/components/NavigationProgress.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { globalUi } from '$lib/global-ui.svelte';
	import { precacheToolPages } from '$lib/precache-tools';
	import { theme } from '$lib/theme.svelte';
	import { initWebVitals } from '$lib/analytics';
	import type { Locale } from '$lib/i18n/locale';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	const locale = $derived(($page.data.locale as Locale | undefined) ?? 'en');

	function hidePreload() {
		const el = document.getElementById('app-preload');
		if (!el) return;
		el.setAttribute('data-hide', 'true');
		window.setTimeout(() => el.remove(), 260);
	}

	onMount(() => {
		theme.init();
		initWebVitals();
		// Wait one frame so first paint of the app is ready
		requestAnimationFrame(() => requestAnimationFrame(hidePreload));
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
<NavigationProgress />

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
