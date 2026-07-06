<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Link, Check } from '@lucide/svelte';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';

	let { locale = 'en' }: { locale?: Locale } = $props();

	let copied = $state(false);
	const m = $derived(msg(locale));

	async function copyLink() {
		await navigator.clipboard.writeText(window.location.href);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<div class="flex flex-col items-center gap-1">
	<div class="flex justify-center">
		<Button variant="outline" size="sm" onclick={copyLink}>
			{#if copied}
				<Check class="size-3.5" />
				{m.tool.linkCopied}
			{:else}
				<Link class="size-3.5" />
				{m.tool.copyShareLink}
			{/if}
		</Button>
	</div>
	<p class="text-xs text-muted-foreground">{m.tool.shareHint}</p>
</div>
