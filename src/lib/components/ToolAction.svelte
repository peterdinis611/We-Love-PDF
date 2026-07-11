<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';

	interface Props {
		disabled?: boolean;
		loading?: boolean;
		loadingText?: string;
		onclick?: () => void;
		children: import('svelte').Snippet;
	}

	let {
		disabled = false,
		loading = false,
		loadingText,
		onclick,
		children
	}: Props = $props();

	const defaultLoading = $derived(msg(getAppLocale()).workspace.actions.processing);
	const displayLoading = $derived(loadingText ?? defaultLoading);
</script>

<Button class="w-full" size="lg" {disabled} {onclick}>
	{#if loading}
		{displayLoading}
	{:else}
		{@render children()}
	{/if}
</Button>
