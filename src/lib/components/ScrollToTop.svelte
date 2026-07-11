<script lang="ts">
	import { onMount } from 'svelte';
	import { ArrowUp } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { PACER, useThrottler } from '$lib/pacer/svelte';

	const SHOW_AFTER = 400;

	let visible = $state(false);

	const scrollThrottler = useThrottler(
		() => {
			visible = window.scrollY > SHOW_AFTER;
		},
		{ wait: PACER.scrollWait, leading: true, trailing: true, key: 'scroll-top' }
	);

	onMount(() => {
		scrollThrottler.maybeExecute();
		function onScroll() {
			scrollThrottler.maybeExecute();
		}
		window.addEventListener('scroll', onScroll, { passive: true });
		return () => window.removeEventListener('scroll', onScroll);
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}
</script>

{#if visible}
	<Button
		type="button"
		size="icon"
		aria-label="Scroll to top"
		class="scroll-top-btn fixed bottom-6 right-6 z-50 size-11 rounded-full shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-primary/30"
		onclick={scrollToTop}
	>
		<ArrowUp class="size-5" />
	</Button>
{/if}
