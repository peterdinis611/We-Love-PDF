<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import ContinueChain from '$lib/components/ContinueChain.svelte';
	import { getAppLocale } from '$lib/i18n/context';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import {
		applyImageSignature,
		dataUrlToBytes,
		type DrawnSignPosition
	} from '$lib/pdf/drawn-sign';

	const locale = getAppLocale();

	let file = $state<File | null>(null);
	let mode = $state<'draw' | 'upload'>('draw');
	let position = $state<DrawnSignPosition>('bottom-left');
	let allPages = $state(false);
	let includeDate = $state(true);
	let outputName = $state('signed.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');
	let lastBytes = $state<Uint8Array | null>(null);
	let canvasEl = $state<HTMLCanvasElement | null>(null);
	let drawing = $state(false);
	let uploadFile = $state<File | null>(null);
	let hasInk = $state(false);

	$effect(() => {
		if (mode === 'draw' && canvasEl) {
			const ctx = canvasEl.getContext('2d');
			if (!ctx) return;
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
			ctx.strokeStyle = '#111827';
			ctx.lineWidth = 2.5;
			ctx.lineCap = 'round';
			ctx.lineJoin = 'round';
			hasInk = false;
		}
	});

	function pos(e: PointerEvent) {
		if (!canvasEl) return { x: 0, y: 0 };
		const r = canvasEl.getBoundingClientRect();
		return {
			x: ((e.clientX - r.left) / r.width) * canvasEl.width,
			y: ((e.clientY - r.top) / r.height) * canvasEl.height
		};
	}

	function onPointerDown(e: PointerEvent) {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		drawing = true;
		canvasEl.setPointerCapture(e.pointerId);
		const p = pos(e);
		ctx.beginPath();
		ctx.moveTo(p.x, p.y);
	}

	function onPointerMove(e: PointerEvent) {
		if (!drawing || !canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		const p = pos(e);
		ctx.lineTo(p.x, p.y);
		ctx.stroke();
		hasInk = true;
	}

	function onPointerUp() {
		drawing = false;
	}

	function clearCanvas() {
		if (!canvasEl) return;
		const ctx = canvasEl.getContext('2d');
		if (!ctx) return;
		ctx.fillStyle = '#ffffff';
		ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
		hasInk = false;
	}

	async function handle() {
		if (!file) return;
		processing = true;
		error = '';
		success = '';
		try {
			let imageBytes: Uint8Array;
			let mime = 'image/png';
			if (mode === 'draw') {
				if (!canvasEl || !hasInk) {
					error = 'Draw your signature first.';
					return;
				}
				imageBytes = dataUrlToBytes(canvasEl.toDataURL('image/png'));
			} else {
				if (!uploadFile) {
					error = 'Upload a PNG or JPEG signature image.';
					return;
				}
				imageBytes = new Uint8Array(await uploadFile.arrayBuffer());
				mime = uploadFile.type || 'image/png';
			}
			const bytes = await applyImageSignature(file, imageBytes, {
				mime,
				position,
				allPages,
				includeDate
			});
			const name = ensurePdfFilename(outputName);
			downloadBlob(bytes, name);
			lastBytes = bytes;
			success = `Downloaded ${name} (${formatFileSize(bytes.length)})`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to apply signature.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => (file = f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<div class="flex flex-wrap gap-2">
					{#each [['draw', 'Draw'], ['upload', 'Upload image']] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {mode === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (mode = value as typeof mode)}
						>
							{label}
						</button>
					{/each}
				</div>
				{#if mode === 'draw'}
					<canvas
						bind:this={canvasEl}
						width="480"
						height="160"
						class="w-full touch-none rounded-lg border border-border bg-white"
						onpointerdown={onPointerDown}
						onpointermove={onPointerMove}
						onpointerup={onPointerUp}
						onpointerleave={onPointerUp}
					></canvas>
					<button type="button" class="text-xs text-muted-foreground underline" onclick={clearCanvas}>
						Clear pad
					</button>
				{:else}
					<FileDropzone
						accept="image/png,image/jpeg,.png,.jpg,.jpeg"
						label="Signature image"
						hint="PNG or JPEG with transparent background works best"
						fileFilter={(f) => f.type.startsWith('image/') || /\.(png|jpe?g)$/i.test(f.name)}
						loadPending={false}
						onfiles={(f) => (uploadFile = f[0])}
					/>
					{#if uploadFile}
						<FileListItem name={uploadFile.name} size={uploadFile.size} onremove={() => (uploadFile = null)} />
					{/if}
				{/if}
				<div>
					<p class="mb-2 text-sm font-medium">Position</p>
					<div class="flex flex-wrap gap-2">
						{#each [
							['bottom-left', 'Bottom left'],
							['bottom-center', 'Bottom center'],
							['bottom-right', 'Bottom right']
						] as [value, label]}
							<button
								type="button"
								class="rounded-full px-3 py-1.5 text-xs font-medium transition {position === value
									? 'bg-primary text-primary-foreground'
									: 'bg-secondary text-secondary-foreground'}"
								onclick={() => (position = value as DrawnSignPosition)}
							>
								{label}
							</button>
						{/each}
					</div>
				</div>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={includeDate} class="rounded border-border accent-primary" />
					Include date
				</label>
				<label class="flex items-center gap-2 text-sm">
					<input type="checkbox" bind:checked={allPages} class="rounded border-border accent-primary" />
					Sign all pages
				</label>
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction disabled={processing} loading={processing} loadingText="Signing…" onclick={handle}>
			Apply signature
		</ToolAction>
		<ToolSuccess message={success} />
		<ContinueChain
			bytes={lastBytes}
			filename={outputName}
			{locale}
			suggestions={[
				{ slug: 'protect-pdf', label: 'Protect' },
				{ slug: 'flatten-pdf', label: 'Flatten' },
				{ slug: 'digital-sign-pdf', label: 'Digital cert' }
			]}
		/>
	{/if}
	<Alert message={error} />
</div>
