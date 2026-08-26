<script lang="ts">
	import type { PdfTool } from '$lib/tools';
	import ToolIcon from './ToolIcon.svelte';
	import ShareLink from './ShareLink.svelte';
	import HowItWorks from './HowItWorks.svelte';
	import NewBadge from './NewBadge.svelte';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { categoryLabel } from '$lib/i18n/messages';
	import { setAppLocale } from '$lib/i18n/context';
	import { isNewTool } from '$lib/changelog';
	import type { Locale } from '$lib/i18n/locale';

	const WIDE_TOOLS = new Set(['view-pdf', 'compare-pdf', 'organize-pdf', 'redact-pdf']);

	let {
		tool,
		locale = 'en',
		width,
		children,
		after
	}: {
		tool: PdfTool;
		locale?: Locale;
		width?: 'default' | 'wide';
		children: import('svelte').Snippet;
		after?: import('svelte').Snippet;
	} = $props();

	const layoutWidth = $derived(
		width ?? (WIDE_TOOLS.has(tool.slug) ? 'wide' : 'default')
	);
	const maxWidth = $derived(layoutWidth === 'wide' ? 'max-w-5xl' : 'max-w-2xl');

	$effect(() => {
		setAppLocale(locale);
	});
</script>

<div class="min-h-[calc(100vh-3.5rem)] bg-muted/20">
	<div class="mx-auto px-4 py-10 sm:px-6 {maxWidth}">
		<div class="mb-8 text-center">
			<div
				class="{tool.color} mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-black/10"
			>
				<ToolIcon icon={tool.icon} />
			</div>
			<div class="mb-3 flex items-center justify-center gap-2">
				<Badge variant="secondary">{categoryLabel(tool.category, locale)}</Badge>
				{#if isNewTool(tool.slug)}
					<NewBadge {locale} />
				{/if}
			</div>
			<h1 class="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">{tool.name}</h1>
			<p class="mx-auto max-w-md text-sm text-muted-foreground">{tool.description}</p>
			<div class="mt-4">
				<ShareLink {locale} />
			</div>
		</div>

		{@render children()}

		<div class="mt-6">
			<HowItWorks {tool} {locale} />
		</div>

		{#if after}
			{@render after()}
		{/if}
	</div>
</div>
