<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Moon, Sun } from '@lucide/svelte';

	let { compact = false }: { compact?: boolean } = $props();
</script>

<Button
	variant="ghost"
	size={compact ? 'icon-sm' : 'sm'}
	onclick={() => theme.toggle()}
	aria-label={theme.resolved === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
>
	{#if theme.resolved === 'dark'}
		<Sun class="size-4" />
	{:else}
		<Moon class="size-4" />
	{/if}
	{#if !compact}
		{theme.resolved === 'dark' ? 'Light' : 'Dark'}
	{/if}
</Button>
