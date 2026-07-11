<script lang="ts">
	import { fly, fade } from 'svelte/transition';
	import { globalUi } from '$lib/global-ui.svelte';
	import { trapFocus } from '$lib/focus-trap';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import { X } from '@lucide/svelte';

	const locale = $derived(($page.data.locale as Locale | undefined) ?? 'en');
	const sc = $derived(msg(locale).shortcuts);

	let dialogEl = $state<HTMLDivElement | null>(null);

	$effect(() => {
		if (!globalUi.helpOpen || !dialogEl) return;
		return trapFocus(dialogEl, () => (globalUi.helpOpen = false));
	});

	const rows = $derived([
		{ keys: ['/'], desc: sc.search },
		{ keys: ['⌘', 'K'], desc: sc.commandPalette },
		{ keys: ['?'], desc: sc.help },
		{ keys: ['g', 'm'], desc: sc.goMerge }
	]);
</script>

{#if globalUi.helpOpen}
	<div
		class="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
		role="presentation"
		transition:fade={{ duration: 150 }}
		onclick={(e) => e.target === e.currentTarget && (globalUi.helpOpen = false)}
	>
		<div
			bind:this={dialogEl}
			class="relative w-full max-w-md rounded-xl border border-border bg-card p-5 shadow-2xl"
			role="dialog"
			aria-modal="true"
			aria-label={sc.title}
			tabindex="-1"
			in:fly={{ y: 8, duration: 180 }}
		>
			<button
				type="button"
				class="absolute top-3 right-3 rounded-md p-1 text-muted-foreground hover:bg-muted"
				onclick={() => (globalUi.helpOpen = false)}
				aria-label="Close"
			>
				<X class="size-4" />
			</button>
			<h2 class="mb-4 text-lg font-semibold">{sc.title}</h2>
			<dl class="space-y-2 text-sm">
				{#each rows as row}
					<div class="flex items-center justify-between gap-4">
						<dt class="text-muted-foreground">{row.desc}</dt>
						<dd class="flex shrink-0 gap-1">
							{#each row.keys as key}
								<kbd class="rounded border border-border bg-muted px-1.5 py-0.5 text-xs">{key}</kbd>
							{/each}
						</dd>
					</div>
				{/each}
			</dl>
			<div class="mt-4 flex justify-end">
				<Button variant="outline" size="sm" onclick={() => (globalUi.helpOpen = false)}>Close</Button>
			</div>
		</div>
	</div>
{/if}
