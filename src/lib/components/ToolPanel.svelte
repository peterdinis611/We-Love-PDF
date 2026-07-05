<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';

	let { children }: { children: import('svelte').Snippet } = $props();
</script>

<Card.Root class="border-border/60">
	<Card.Content class="p-5">
		{@render children()}
	</Card.Content>
</Card.Root>
