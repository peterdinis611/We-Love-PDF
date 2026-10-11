<script lang="ts">
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';

	let { locale = 'en' }: { locale?: Locale } = $props();
</script>

<Badge variant="default" class="bg-primary px-1.5 py-0 text-[10px] font-medium normal-case tracking-normal" style="border-radius: 2px;">
	{msg(locale).tool.new}
</Badge>
