<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';

	let {
		message,
		variant = 'error'
	}: { message: string; variant?: 'error' | 'success' | 'info' } = $props();

	let el = $state<HTMLDivElement | null>(null);

	const styles = {
		error:
			'border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive/50 dark:bg-destructive/15',
		success:
			'border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-300',
		info: 'border-border/60 bg-muted/30 text-foreground'
	} as const;

	const badgeVariant = {
		error: 'destructive' as const,
		success: 'secondary' as const,
		info: 'outline' as const
	};

	$effect(() => {
		if (!message || !el) return;
		el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
	});
</script>

{#if message}
	<div
		bind:this={el}
		class="rounded-lg border px-4 py-3 {styles[variant]}"
		role={variant === 'error' ? 'alert' : 'status'}
		aria-live={variant === 'error' ? 'assertive' : 'polite'}
	>
		<Badge variant={badgeVariant[variant]} class="font-normal whitespace-normal">{message}</Badge>
	</div>
{/if}
