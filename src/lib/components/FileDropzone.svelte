<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import { consumePendingFiles } from '$lib/pending-file';
	import PdfFileStats from '$lib/components/PdfFileStats.svelte';
	import { FileUp } from '@lucide/svelte';

	interface Props {
		multiple?: boolean;
		accept?: string;
		label?: string;
		hint?: string;
		onfiles: (files: File[]) => void;
		fileFilter?: (file: File) => boolean;
		loadPending?: boolean;
		/** Show size + page count preview before processing */
		previewFile?: File | null;
	}

	let {
		multiple = false,
		accept = 'application/pdf,.pdf',
		label,
		hint,
		onfiles,
		fileFilter = (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf'),
		loadPending = true,
		previewFile = null
	}: Props = $props();

	const locale = getAppLocale();
	const ws = $derived(msg(locale).workspace);
	const dropLabel = $derived(label ?? (multiple ? ws.dropzone.selectPdfs : ws.dropzone.selectPdf));
	const dropHint = $derived(hint ?? (multiple ? ws.dropzone.orDropPdfs : ws.dropzone.orDropPdf));
	const hintId = $derived(`dropzone-hint-${locale}`);
	const rejectId = $derived(`dropzone-reject-${locale}`);

	let dragging = $state(false);
	let rejectMessage = $state('');
	let rejectTimer: ReturnType<typeof setTimeout> | undefined;
	let inputEl: HTMLInputElement;
	let dragDepth = 0;

	function showReject() {
		rejectMessage = ws.dropzone.rejectInvalid;
		clearTimeout(rejectTimer);
		rejectTimer = setTimeout(() => (rejectMessage = ''), 4000);
	}

	function handleFiles(fileList: FileList | null) {
		if (!fileList?.length) return;
		const filtered = Array.from(fileList).filter(fileFilter);
		if (filtered.length) {
			rejectMessage = '';
			onfiles(filtered);
			void import('$lib/recent-files').then(({ saveRecentFile }) => {
				for (const f of filtered.slice(0, 3)) {
					void saveRecentFile(f);
				}
			});
		} else {
			showReject();
		}
	}

	function openPicker() {
		inputEl?.click();
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragDepth = 0;
		dragging = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function onDragEnter(e: DragEvent) {
		e.preventDefault();
		dragDepth += 1;
		dragging = true;
	}

	function onDragLeave() {
		dragDepth = Math.max(0, dragDepth - 1);
		if (dragDepth === 0) dragging = false;
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openPicker();
		}
	}

	onMount(() => {
		if (!loadPending) return;
		const pending = consumePendingFiles().filter(fileFilter);
		if (pending.length) {
			onfiles(multiple ? pending : pending.slice(0, 1));
		}
		return () => clearTimeout(rejectTimer);
	});
</script>

<div class="space-y-2">
	<div
		role="button"
		tabindex={0}
		aria-label={dropLabel}
		aria-describedby={rejectMessage ? `${hintId} ${rejectId}` : hintId}
		aria-dropeffect={dragging ? 'copy' : 'none'}
		class="drop-plate crop-sheet relative cursor-pointer bg-card outline-none transition-[transform,box-shadow,background-color] duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[var(--register)] focus-visible:ring-offset-2 focus-visible:ring-offset-background {dragging
			? 'drop-plate-active'
			: rejectMessage
				? 'drop-plate-reject'
				: 'hover:bg-[color-mix(in_oklab,var(--register)_4%,var(--card))]'}"
		ondrop={onDrop}
		ondragenter={onDragEnter}
		ondragover={(e) => e.preventDefault()}
		ondragleave={onDragLeave}
		onclick={openPicker}
		onkeydown={onKeydown}
	>
		<span class="crop-mark crop-mark-tl" class:crop-live={dragging}></span>
		<span class="crop-mark crop-mark-tr" class:crop-live={dragging}></span>
		<span class="crop-mark crop-mark-bl" class:crop-live={dragging}></span>
		<span class="crop-mark crop-mark-br" class:crop-live={dragging}></span>

		<input
			bind:this={inputEl}
			type="file"
			{accept}
			{multiple}
			class="hidden"
			tabindex={-1}
			aria-hidden="true"
			onchange={(e) => handleFiles(e.currentTarget.files)}
		/>

		<div class="relative z-10 flex flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:gap-6 sm:px-8 sm:py-9">
			<div
				class="drop-glyph relative flex size-14 shrink-0 items-center justify-center text-primary {dragging
					? 'text-[var(--register)]'
					: ''}"
				aria-hidden="true"
			>
				<span class="paper-stack"></span>
				<span class="paper-stack paper-stack-2"></span>
				<span
					class="relative z-[1] flex size-12 items-center justify-center border border-border bg-card text-current shadow-[2px_3px_0_color-mix(in_oklab,var(--ink)_10%,transparent)]"
					style="border-radius: 2px;"
				>
					<FileUp class="size-5" />
				</span>
			</div>

			<div class="min-w-0 flex-1 text-left">
				<p class="font-display text-lg font-bold tracking-tight">
					{#if dragging}
						{multiple ? ws.dropzone.releaseToAdd : ws.dropzone.releaseToLoad}
					{:else}
						{dropLabel}
					{/if}
				</p>
				<p id={hintId} class="mt-1 text-sm leading-relaxed text-muted-foreground">
					{dropHint}
				</p>
				{#if previewFile}
					<div
						class="ticket mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 border-y border-dashed border-border py-2.5"
					>
						<p class="min-w-0 truncate text-sm font-medium">{previewFile.name}</p>
						<PdfFileStats file={previewFile} />
					</div>
				{:else}
					<div
						class="mt-4 h-px w-full max-w-xs bg-[repeating-linear-gradient(90deg,var(--register)_0_5px,transparent_5px_10px)] opacity-50 transition-opacity {dragging
							? 'opacity-100'
							: ''}"
					></div>
				{/if}
			</div>
		</div>
	</div>

	{#if rejectMessage}
		<p id={rejectId} class="text-sm text-destructive" role="alert" aria-live="assertive">
			{rejectMessage}
		</p>
	{/if}
</div>

<style>
	.drop-plate {
		box-shadow: 3px 4px 0 color-mix(in oklab, var(--ink) 10%, transparent);
	}
	.drop-plate-active {
		transform: translate(-1px, -2px);
		background: color-mix(in oklab, var(--register) 10%, var(--card));
		box-shadow: 5px 7px 0 color-mix(in oklab, var(--register) 28%, transparent);
	}
	.drop-plate-reject {
		box-shadow: 3px 4px 0 color-mix(in oklab, var(--signal) 35%, transparent);
	}

	.crop-live {
		color: var(--signal);
		animation: crop-pulse 0.7s ease-in-out infinite alternate;
	}

	.paper-stack,
	.paper-stack-2 {
		position: absolute;
		inset: 6px 2px 2px 6px;
		border: 1px solid var(--border);
		background: color-mix(in oklab, var(--card) 85%, var(--muted));
		border-radius: 2px;
		transform: rotate(-4deg);
		transition: transform 0.2s ease;
	}
	.paper-stack-2 {
		inset: 4px 4px 4px 4px;
		transform: rotate(3deg);
		opacity: 0.7;
	}
	.drop-plate-active .paper-stack {
		transform: rotate(-8deg) translate(-2px, -2px);
	}
	.drop-plate-active .paper-stack-2 {
		transform: rotate(7deg) translate(2px, -1px);
	}

	@keyframes crop-pulse {
		from {
			opacity: 0.55;
		}
		to {
			opacity: 1;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.drop-plate,
		.paper-stack,
		.paper-stack-2 {
			transition: none;
		}
		.drop-plate-active {
			transform: none;
		}
		.crop-live {
			animation: none;
		}
	}
</style>
