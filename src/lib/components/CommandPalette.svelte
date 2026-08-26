<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fly, fade } from 'svelte/transition';
	import { trapFocus } from '$lib/focus-trap';
	import ToolIcon from '$lib/components/ToolIcon.svelte';
	import { tools, type PdfTool } from '$lib/tools';
	import { workflows } from '$lib/workflows';
	import { msg, localizeTools } from '$lib/i18n';
	import { toolPath, localizedPath } from '$lib/i18n/locale';
	import type { Locale } from '$lib/i18n/locale';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Search, Command, Workflow } from '@lucide/svelte';

	type PaletteItem =
		| { kind: 'tool'; tool: PdfTool }
		| { kind: 'workflow'; slug: string; title: string; subtitle: string; path: string };

	let {
		open = false,
		onOpenChange,
		locale = 'en' as Locale
	}: {
		open?: boolean;
		onOpenChange?: (open: boolean) => void;
		locale?: Locale;
	} = $props();

	const m = $derived(msg(locale));
	const localizedTools = $derived(localizeTools(tools.filter((t) => t.available), locale));

	const workflowItems = $derived(
		workflows.map((w) => {
			const copy =
				w.slug === 'secure-pdf'
					? m.workflows.secure
					: w.slug === 'prepare-for-send'
						? m.workflows.prepareForSend
						: w.slug === 'scan-cleanup'
							? m.workflows.scanCleanup
							: m.workflows.archivePack;
			return {
				kind: 'workflow' as const,
				slug: w.slug,
				title: copy.title,
				subtitle: copy.subtitle,
				path: w.path
			};
		})
	);

	let query = $state('');
	let activeIndex = $state(0);
	let inputEl = $state<HTMLInputElement | null>(null);
	let dialogEl = $state<HTMLDivElement | null>(null);

	const filtered = $derived.by(() => {
		const q = query.toLowerCase();
		const toolItems: PaletteItem[] = localizedTools
			.filter(
				(t) =>
					!q ||
					t.name.toLowerCase().includes(q) ||
					t.description.toLowerCase().includes(q) ||
					t.slug.includes(q)
			)
			.map((tool) => ({ kind: 'tool' as const, tool }));
		const wfs: PaletteItem[] = workflowItems.filter(
			(w) =>
				!q ||
				w.title.toLowerCase().includes(q) ||
				w.subtitle.toLowerCase().includes(q) ||
				w.slug.includes(q)
		);
		return [...wfs, ...toolItems];
	});

	$effect(() => {
		if (open) {
			query = '';
			activeIndex = 0;
			requestAnimationFrame(() => inputEl?.focus());
		}
	});

	$effect(() => {
		if (activeIndex >= filtered.length) activeIndex = Math.max(0, filtered.length - 1);
	});

	$effect(() => {
		if (!open || !dialogEl) return;
		return trapFocus(dialogEl, close);
	});

	function close() {
		onOpenChange?.(false);
	}

	function pick(item: PaletteItem) {
		close();
		if (item.kind === 'tool') goto(toolPath(item.tool.slug, locale));
		else goto(localizedPath(item.path, locale));
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.preventDefault();
			close();
			return;
		}
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			activeIndex = Math.min(activeIndex + 1, filtered.length - 1);
		}
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			activeIndex = Math.max(activeIndex - 1, 0);
		}
		if (e.key === 'Enter' && filtered[activeIndex]) {
			e.preventDefault();
			pick(filtered[activeIndex]);
		}
	}

	onMount(() => {
		function globalKey(e: KeyboardEvent) {
			if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
				e.preventDefault();
				onOpenChange?.(!open);
			}
		}
		window.addEventListener('keydown', globalKey);
		return () => window.removeEventListener('keydown', globalKey);
	});
</script>

{#if open}
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={dialogEl}
		class="fixed inset-0 z-[100] flex items-start justify-center bg-background/70 p-4 pt-[12vh] backdrop-blur-sm"
		role="dialog"
		aria-modal="true"
		aria-label={m.commandPalette.title}
		tabindex="-1"
		onkeydown={onKeydown}
		onclick={(e) => e.target === e.currentTarget && close()}
		transition:fade={{ duration: 150 }}
	>
		<div
			class="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-popover shadow-2xl"
			in:fly={{ y: -8, duration: 180 }}
		>
			<div class="flex items-center gap-2 border-b border-border px-3">
				<Search class="size-4 shrink-0 text-muted-foreground" />
				<Input
					bind:ref={inputEl}
					bind:value={query}
					placeholder={m.commandPalette.placeholder}
					class="border-0 bg-transparent shadow-none focus-visible:ring-0"
				/>
				<kbd
					class="hidden shrink-0 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline"
				>
					esc
				</kbd>
			</div>
			<ul class="max-h-72 overflow-y-auto p-2" role="listbox">
				{#if filtered.length === 0}
					<li class="px-3 py-6 text-center text-sm text-muted-foreground">{m.commandPalette.noResults}</li>
				{:else}
					{#each filtered as item, i (item.kind === 'tool' ? item.tool.slug : item.slug)}
						<li role="option" aria-selected={i === activeIndex}>
							<button
								type="button"
								class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition {i ===
								activeIndex
									? 'bg-primary/10 text-foreground'
									: 'hover:bg-muted/60'}"
								onmouseenter={() => (activeIndex = i)}
								onclick={() => pick(item)}
							>
								{#if item.kind === 'tool'}
									<div
										class="{item.tool.color} flex size-8 shrink-0 items-center justify-center rounded-lg text-white"
									>
										<ToolIcon icon={item.tool.icon} />
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate font-medium">{item.tool.name}</p>
										<p class="truncate text-xs text-muted-foreground">{item.tool.description}</p>
									</div>
								{:else}
									<div
										class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary"
									>
										<Workflow class="size-4" />
									</div>
									<div class="min-w-0 flex-1">
										<p class="truncate font-medium">{item.title}</p>
										<p class="truncate text-xs text-muted-foreground">{item.subtitle}</p>
									</div>
								{/if}
							</button>
						</li>
					{/each}
				{/if}
			</ul>
			<p class="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
				<Command class="mr-1 inline size-3" />
				{m.commandPalette.hint}
			</p>
		</div>
	</div>
{/if}
