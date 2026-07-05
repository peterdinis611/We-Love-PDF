<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';

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
		loadingText = 'Processing…',
		onclick,
		children
	}: Props = $props();
</script>

<Button class="w-full" size="lg" {disabled} {onclick}>
	{#if loading}
		{loadingText}
	{:else}
		{@render children()}
	{/if}
</Button>
