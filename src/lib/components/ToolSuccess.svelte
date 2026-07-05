<script lang="ts">
	import { CheckCircle2 } from '@lucide/svelte';

	let { message }: { message: string } = $props();
</script>

{#if message}
	<div
		class="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300"
		role="status"
	>
		<CheckCircle2 class="size-4 shrink-0" />
		<span>{message}</span>
	</div>
{/if}
