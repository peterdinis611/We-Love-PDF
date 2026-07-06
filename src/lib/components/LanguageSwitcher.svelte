<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { alternatePaths } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Languages } from '@lucide/svelte';

	let { locale = 'en' }: { locale?: Locale } = $props();

	function switchTo(target: Locale) {
		if (target === locale) return;
		const { en, sk } = alternatePaths($page.url.pathname);
		goto(target === 'sk' ? sk : en);
	}
</script>

<div class="flex items-center rounded-lg border border-border/60 p-0.5">
	<Button
		variant={locale === 'en' ? 'secondary' : 'ghost'}
		size="sm"
		class="h-7 px-2 text-xs"
		onclick={() => switchTo('en')}
		aria-label="English"
	>
		EN
	</Button>
	<Button
		variant={locale === 'sk' ? 'secondary' : 'ghost'}
		size="sm"
		class="h-7 px-2 text-xs"
		onclick={() => switchTo('sk')}
		aria-label="Slovenčina"
	>
		SK
	</Button>
	<Languages class="mx-1 size-3.5 text-muted-foreground" />
</div>
