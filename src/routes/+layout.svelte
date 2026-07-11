<script lang="ts">
	import Plausible from '$lib/components/Plausible.svelte';
	import CommandPalette from '$lib/components/CommandPalette.svelte';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { theme } from '$lib/theme.svelte';
	import type { Locale } from '$lib/i18n/locale';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

	let paletteOpen = $state(false);

	const locale = $derived(($page.data.locale as Locale | undefined) ?? 'en');

	onMount(() => {
		theme.init();
		if ('serviceWorker' in navigator) {
			navigator.serviceWorker.register('/sw.js').catch(() => {});
		}
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Plausible />

<div class="flex min-h-screen flex-col bg-background">
	<Header />
	<main class="flex-1">
		{@render children()}
	</main>
	<Footer />
	<ScrollToTop />
</div>

<CommandPalette bind:open={paletteOpen} {locale} />
