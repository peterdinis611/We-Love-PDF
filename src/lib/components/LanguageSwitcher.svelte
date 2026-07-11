<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { alternatePaths, LOCALES, type Locale } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Languages } from '@lucide/svelte';

	let { locale = 'en' }: { locale?: Locale } = $props();

	const labels: Record<Locale, string> = {
		en: 'EN',
		sk: 'SK',
		cs: 'CS',
		de: 'DE',
		pl: 'PL'
	};

	function switchTo(target: Locale) {
		if (target === locale) return;
		const paths = alternatePaths($page.url.pathname);
		goto(paths[target]);
	}
</script>

<div class="flex max-w-[11rem] flex-wrap items-center justify-end gap-0.5 rounded-lg border border-border/60 p-0.5 sm:max-w-none">
	{#each LOCALES as loc (loc)}
		<Button
			variant={locale === loc ? 'secondary' : 'ghost'}
			size="sm"
			class="h-7 min-w-0 px-1.5 text-[10px] sm:px-2 sm:text-xs"
			onclick={() => switchTo(loc)}
			aria-label={labels[loc]}
		>
			{labels[loc]}
		</Button>
	{/each}
	<Languages class="mx-0.5 hidden size-3.5 text-muted-foreground sm:block" />
</div>
