<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { RefreshCw } from '@lucide/svelte';

	let visible = $state(false);
	let waitingWorker = $state<ServiceWorker | null>(null);

	const locale = $derived(($page.data.locale as Locale | undefined) ?? 'en');
	const sc = $derived(msg(locale).shortcuts);

	function refresh() {
		waitingWorker?.postMessage({ type: 'SKIP_WAITING' });
	}

	onMount(() => {
		if (!('serviceWorker' in navigator)) return;

		let refreshing = false;
		navigator.serviceWorker.addEventListener('controllerchange', () => {
			if (refreshing) return;
			refreshing = true;
			window.location.reload();
		});

		navigator.serviceWorker.register('/sw.js').then((reg) => {
			if (reg.waiting) {
				waitingWorker = reg.waiting;
				visible = true;
			}

			reg.addEventListener('updatefound', () => {
				const worker = reg.installing;
				if (!worker) return;
				worker.addEventListener('statechange', () => {
					if (worker.state === 'installed' && navigator.serviceWorker.controller) {
						waitingWorker = worker;
						visible = true;
					}
				});
			});
		});
	});
</script>

{#if visible}
	<div
		class="fixed bottom-4 left-1/2 z-[110] flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-xl"
		role="status"
		aria-live="polite"
	>
		<p class="text-sm">{sc.swUpdate}</p>
		<Button size="sm" onclick={refresh}>
			<RefreshCw class="size-3.5" />
			{sc.swRefresh}
		</Button>
	</div>
{/if}
