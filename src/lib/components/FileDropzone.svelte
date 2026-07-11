<script lang="ts">
	import { onMount } from 'svelte';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
	import { consumePendingFile } from '$lib/pending-file';
	import PdfFileStats from '$lib/components/PdfFileStats.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Upload } from '@lucide/svelte';

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
	const hintId = 'dropzone-hint';

	let dragging = $state(false);
	let inputEl: HTMLInputElement;

	function handleFiles(fileList: FileList | null) {
		if (!fileList?.length) return;
		const filtered = Array.from(fileList).filter(fileFilter);
		if (filtered.length) onfiles(filtered);
	}

	function openPicker() {
		inputEl?.click();
	}

	function onDrop(e: DragEvent) {
		e.preventDefault();
		dragging = false;
		handleFiles(e.dataTransfer?.files ?? null);
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			openPicker();
		}
	}

	onMount(() => {
		if (!loadPending) return;
		const pending = consumePendingFile();
		if (pending && fileFilter(pending)) onfiles([pending]);
	});
</script>

<Card.Root
	role="button"
	tabindex={0}
	aria-label={dropLabel}
	aria-describedby={hintId}
	aria-dropeffect={dragging ? 'copy' : 'none'}
	class="cursor-pointer border-2 border-dashed transition-colors {dragging
		? 'border-primary bg-primary/5'
		: 'border-border hover:border-primary/40 hover:bg-muted/30'}"
	ondrop={onDrop}
	ondragover={(e) => {
		e.preventDefault();
		dragging = true;
	}}
	ondragleave={() => (dragging = false)}
	onclick={openPicker}
	onkeydown={onKeydown}
>
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
	<Card.Content class="flex flex-col items-center px-8 py-12 text-center">
		<div
			class="mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary"
		>
			<Upload class="size-6" aria-hidden="true" />
		</div>
		<p class="mb-1 font-semibold">{dropLabel}</p>
		<p id={hintId} class="text-sm text-muted-foreground">{dropHint}</p>
		{#if previewFile}
			<div class="mt-3 rounded-lg bg-muted/50 px-3 py-2">
				<p class="truncate text-xs font-medium">{previewFile.name}</p>
				<PdfFileStats file={previewFile} />
			</div>
		{/if}
	</Card.Content>
</Card.Root>
