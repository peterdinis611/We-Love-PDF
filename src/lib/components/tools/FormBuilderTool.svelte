<script lang="ts">
	import { PDFDocument, StandardFonts } from 'pdf-lib';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import {
		downloadBlob,
		ensurePdfFilename,
		formatFileSize,
		getPageCount
	} from '$lib/pdf/operations';
	import { Trash2 } from '@lucide/svelte';

	type FieldType = 'text' | 'checkbox';

	type FieldDraft = {
		id: string;
		name: string;
		type: FieldType;
		page: number; // 1-based
		x: number;
		y: number;
		width: number;
		height: number;
	};

	let file = $state<File | null>(null);
	let pageCount = $state(0);
	let fields = $state<FieldDraft[]>([]);
	let fieldName = $state('field1');
	let fieldType = $state<FieldType>('text');
	let page = $state(1);
	let x = $state(72);
	let y = $state(700);
	let width = $state(200);
	let height = $state(24);
	let outputName = $state('form.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function setFile(f: File) {
		file = f;
		error = '';
		success = '';
		fields = [];
		try {
			pageCount = await getPageCount(f);
			page = 1;
		} catch {
			error = 'Could not read PDF file.';
			file = null;
		}
	}

	function addField() {
		const name = fieldName.trim();
		if (!name) {
			error = 'Enter a field name.';
			return;
		}
		if (fields.some((f) => f.name === name)) {
			error = 'Field names must be unique.';
			return;
		}
		if (page < 1 || page > pageCount) {
			error = `Page must be between 1 and ${pageCount}.`;
			return;
		}
		error = '';
		fields = [
			...fields,
			{
				id: crypto.randomUUID(),
				name,
				type: fieldType,
				page,
				x,
				y,
				width: fieldType === 'checkbox' ? Math.min(width, 18) : width,
				height: fieldType === 'checkbox' ? Math.min(height, 18) : height
			}
		];
		fieldName = `field${fields.length + 1}`;
	}

	async function handleBuild() {
		if (!file || !fields.length) return;
		processing = true;
		error = '';
		success = '';
		try {
			const bytes = await file.arrayBuffer();
			const doc = await PDFDocument.load(bytes);
			const form = doc.getForm();
			const font = await doc.embedFont(StandardFonts.Helvetica);
			const pages = doc.getPages();

			for (const field of fields) {
				const pdfPage = pages[field.page - 1];
				if (!pdfPage) continue;
				if (field.type === 'text') {
					const tf = form.createTextField(field.name);
					tf.setFontSize(12);
					tf.addToPage(pdfPage, {
						x: field.x,
						y: field.y,
						width: field.width,
						height: field.height,
						borderWidth: 1
					});
					tf.updateAppearances(font);
				} else {
					const cb = form.createCheckBox(field.name);
					cb.addToPage(pdfPage, {
						x: field.x,
						y: field.y,
						width: field.width,
						height: field.height,
						borderWidth: 1
					});
				}
			}

			const result = await doc.save();
			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — ${fields.length} field${fields.length === 1 ? '' : 's'}, ${formatFileSize(result.length)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to create form fields.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => setFile(f[0])} />
		<p class="text-sm text-muted-foreground">
			Add AcroForm text fields and checkboxes. Coordinates use PDF space (origin bottom-left, points).
		</p>
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<p class="text-sm text-muted-foreground">
					Document has <strong class="text-foreground">{pageCount}</strong> page{pageCount === 1
						? ''
						: 's'}. Tip: A4 page is ~595×842 pt.
				</p>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="ff-name" class="mb-1 block text-sm font-medium">Field name</label>
						<Input id="ff-name" bind:value={fieldName} />
					</div>
					<div>
						<label for="ff-type" class="mb-1 block text-sm font-medium">Type</label>
						<select
							id="ff-type"
							bind:value={fieldType}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						>
							<option value="text">Text</option>
							<option value="checkbox">Checkbox</option>
						</select>
					</div>
					<div>
						<label for="ff-page" class="mb-1 block text-sm font-medium">Page</label>
						<input
							id="ff-page"
							type="number"
							min="1"
							max={pageCount}
							bind:value={page}
							class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
						/>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<div>
							<label for="ff-x" class="mb-1 block text-sm font-medium">X</label>
							<input id="ff-x" type="number" bind:value={x} class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
						</div>
						<div>
							<label for="ff-y" class="mb-1 block text-sm font-medium">Y</label>
							<input id="ff-y" type="number" bind:value={y} class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
						</div>
					</div>
					<div>
						<label for="ff-w" class="mb-1 block text-sm font-medium">Width</label>
						<input id="ff-w" type="number" bind:value={width} class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
					</div>
					<div>
						<label for="ff-h" class="mb-1 block text-sm font-medium">Height</label>
						<input id="ff-h" type="number" bind:value={height} class="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" />
					</div>
				</div>
				<button
					type="button"
					class="rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-muted"
					onclick={addField}
				>
					Add field
				</button>

				{#if fields.length}
					<ul class="space-y-1 border-t border-border/60 pt-3">
						{#each fields as field (field.id)}
							<li class="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/40">
								<span class="min-w-0 flex-1 truncate">
									<strong>{field.name}</strong>
									<span class="text-muted-foreground">
										· {field.type} · p{field.page} · ({field.x},{field.y}) {field.width}×{field.height}
									</span>
								</span>
								<button
									type="button"
									class="rounded p-1 text-muted-foreground hover:text-destructive"
									aria-label="Remove field"
									onclick={() => (fields = fields.filter((f) => f.id !== field.id))}
								>
									<Trash2 class="size-3.5" />
								</button>
							</li>
						{/each}
					</ul>
				{/if}

				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !fields.length}
			loading={processing}
			loadingText="Building form…"
			onclick={handleBuild}
		>
			Create form PDF ({fields.length} field{fields.length === 1 ? '' : 's'})
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
