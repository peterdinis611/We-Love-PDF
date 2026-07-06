<script lang="ts">
	import Plausible from '$lib/components/Plausible.svelte';
	import { onMount } from 'svelte';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import ScrollToTop from '$lib/components/ScrollToTop.svelte';
	import { theme } from '$lib/theme.svelte';
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();

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
