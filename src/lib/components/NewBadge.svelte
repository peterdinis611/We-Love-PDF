<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';

	let { locale = 'en' }: { locale?: Locale } = $props();
</script>

<Badge variant="default" class="bg-primary text-[10px] uppercase tracking-wide">
	{msg(locale).tool.new}
</Badge>
