<script lang="ts">
	import { theme } from '$lib/theme.svelte';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Moon, Sun } from '@lucide/svelte';

	let { compact = false }: { compact?: boolean } = $props();

	const locale = getAppLocale();
	const t = $derived(msg(locale).theme);
</script>

<Button
	variant="ghost"
	size={compact ? 'icon-sm' : 'sm'}
	onclick={() => theme.toggle()}
	aria-label={theme.resolved === 'dark' ? t.switchToLight : t.switchToDark}
>
	{#if theme.resolved === 'dark'}
		<Sun class="size-4" />
	{:else}
		<Moon class="size-4" />
	{/if}
	{#if !compact}
		{theme.resolved === 'dark' ? t.light : t.dark}
	{/if}
</Button>
