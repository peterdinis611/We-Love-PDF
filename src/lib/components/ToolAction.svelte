<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import { LoaderCircle } from '@lucide/svelte';
	import { trackToolStart } from '$lib/analytics';

	interface Props {
		disabled?: boolean;
		loading?: boolean;
		loadingText?: string;
		sticky?: boolean;
		onclick?: () => void;
		children: import('svelte').Snippet;
	}

	let {
		disabled = false,
		loading = false,
		loadingText,
		sticky = true,
		onclick,
		children
	}: Props = $props();

	const defaultLoading = $derived(msg(getAppLocale()).workspace.actions.processing);
	const displayLoading = $derived(loadingText ?? defaultLoading);
	const isDisabled = $derived(disabled || loading);

	function handleClick() {
		trackToolStart();
		onclick?.();
	}
</script>

<div
	class={sticky
		? 'sticky bottom-0 z-30 -mx-4 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur-md sm:-mx-6 sm:px-6'
		: ''}
>
	<Button
		class="w-full"
		size="lg"
		disabled={isDisabled}
		aria-busy={loading}
		onclick={handleClick}
	>
		{#if loading}
			<span class="inline-flex items-center gap-2">
				<LoaderCircle class="size-4 animate-spin" aria-hidden="true" />
				{displayLoading}
			</span>
		{:else}
			{@render children()}
		{/if}
	</Button>
	{#if loading}
		<div
			class="mt-2 h-1 overflow-hidden rounded-full bg-muted"
			role="progressbar"
			aria-valuetext={displayLoading}
		>
			<div class="tool-action-indeterminate h-full w-1/3 rounded-full bg-primary"></div>
		</div>
	{/if}
</div>

<style>
	.tool-action-indeterminate {
		animation: tool-action-indeterminate 1.2s ease-in-out infinite;
	}
	@keyframes tool-action-indeterminate {
		0% {
			transform: translateX(-100%);
		}
		100% {
			transform: translateX(400%);
		}
	}
</style>
