<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Link, Check } from '@lucide/svelte';

	let copied = $state(false);

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex justify-center">
	<Button variant="outline" size="sm" onclick={copyLink}>
		{#if copied}
			<Check class="size-3.5" />
			Link copied
		{:else}
			<Link class="size-3.5" />
			Copy share link
		{/if}
	</Button>
</div>
