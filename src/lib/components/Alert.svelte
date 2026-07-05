<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';

	let { message, variant = 'error' }: { message: string; variant?: 'error' | 'success' | 'info' } =
		$props();

	const badgeVariant = {
		error: 'destructive' as const,
		success: 'secondary' as const,
		info: 'outline' as const
	};
</script>

{#if message}
	<div class="rounded-lg border border-border/60 bg-muted/30 px-4 py-3">
		<Badge variant={badgeVariant[variant]} class="font-normal whitespace-normal">{message}</Badge>
	</div>
{/if}
