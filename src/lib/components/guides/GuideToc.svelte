<script lang="ts">
	import { onMount } from 'svelte';
	import { msg } from '$lib/i18n';
	import type { Locale } from '$lib/i18n/locale';

	let {
		root,
		locale = 'en'
	}: {
		root: HTMLElement | null;
		locale?: Locale;
	} = $props();

	type TocItem = { id: string; text: string; level: 2 | 3 };

	let items = $state<TocItem[]>([]);
	const m = $derived(msg(locale));

	function refresh() {
		if (!root) {
			items = [];
			return;
		}
		const headings = root.querySelectorAll('h2, h3');
		items = Array.from(headings)
			.map((el) => {
				const level = el.tagName === 'H2' ? 2 : 3;
				const text = el.textContent?.trim() ?? '';
				if (!text) return null;
				let id = el.id;
				if (!id) {
					id = text
						.toLowerCase()
						.replace(/[^\w\s-]/g, '')
						.replace(/\s+/g, '-');
					el.id = id;
				}
				return { id, text, level };
			})
			.filter((item): item is TocItem => !!item);
	}

	onMount(() => {
		refresh();
		const observer = new MutationObserver(refresh);
		if (root) observer.observe(root, { childList: true, subtree: true });
		return () => observer.disconnect();
	});

	$effect(() => {
		root;
		refresh();
	});
</script>

{#if items.length >= 2}
	<nav class="hidden xl:block" aria-label={m.guides.onThisPage}>
		<p class="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
			{m.guides.onThisPage}
		</p>
		<ul class="space-y-2 border-l border-border/60 text-sm">
			{#each items as item (item.id)}
				<li>
					<a
						href="#{item.id}"
						class="block border-l-2 py-0.5 pl-3 leading-snug text-muted-foreground transition hover:border-primary hover:text-primary {item.level === 3
							? 'ml-2 text-xs'
							: '-ml-px border-transparent'}"
					>
						{item.text}
					</a>
				</li>
			{/each}
		</ul>
	</nav>
{/if}
