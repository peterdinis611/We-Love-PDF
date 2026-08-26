<script lang="ts">
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';

	const busy = $derived(!!$navigating);
</script>

{#if busy}
	<div
		class="pointer-events-none fixed inset-x-0 top-0 z-[200]"
		transition:fade={{ duration: 120 }}
		aria-hidden="true"
	>
		<div class="nav-progress h-0.5 origin-left bg-primary shadow-[0_0_8px_color-mix(in_oklab,var(--primary)_55%,transparent)]"></div>
	</div>
	<div
		class="pointer-events-none fixed bottom-4 right-4 z-[200] flex items-center gap-2 rounded-full border border-border/60 bg-background/90 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-lg backdrop-blur-md"
		transition:fade={{ duration: 120 }}
		role="status"
		aria-live="polite"
	>
		<span
			class="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"
		></span>
		Loading…
	</div>
{/if}

<style>
	.nav-progress {
		animation: nav-progress 1.1s ease-in-out infinite;
	}

	@keyframes nav-progress {
		0% {
			transform: scaleX(0.08);
			opacity: 0.7;
		}
		50% {
			transform: scaleX(0.65);
			opacity: 1;
		}
		100% {
			transform: scaleX(0.92);
			opacity: 0.85;
		}
	}
</style>
