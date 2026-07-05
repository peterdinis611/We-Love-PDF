<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import {
		PDF_FORM_FIELD_TYPE,
		type PdfDocumentObject,
		type PdfPageObject,
		type PdfWidgetAnnoObject
	} from '@embedpdf/models';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	type FormFieldUi = {
		id: string;
		label: string;
		page: PdfPageObject;
		widget: PdfWidgetAnnoObject;
		kind: 'text' | 'checkbox' | 'select';
		value: string;
		checked: boolean;
		options: { label: string; index: number }[];
		selectedIndex: number;
	};

	let file = $state<File | null>(null);
	let docRef = $state<PdfDocumentObject | null>(null);
	let fields = $state<FormFieldUi[]>([]);
	let loading = $state(false);
	let outputName = $state('filled.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function loadForm(f: File) {
		if (!pdfEngine.engine) return;
		file = f;
		fields = [];
		docRef = null;
		error = '';
		success = '';
		loading = true;

		try {
			const buffer = await f.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'fill-form', content: buffer })
				.toPromise();
			docRef = doc;

			const loaded: FormFieldUi[] = [];
			for (const page of doc.pages) {
				const widgets = await pdfEngine.engine.getPageAnnoWidgets(doc, page).toPromise();
				for (const widget of widgets) {
					const { field } = widget;
					if (
						field.type === PDF_FORM_FIELD_TYPE.PUSHBUTTON ||
						field.type === PDF_FORM_FIELD_TYPE.SIGNATURE
					) {
						continue;
					}

					const label = field.alternateName || field.name || `Field ${loaded.length + 1}`;
					const base = {
						id: widget.id,
						label,
						page,
						widget,
						value: field.value ?? '',
						checked: field.value !== '' && field.value !== 'Off',
						options: [] as { label: string; index: number }[],
						selectedIndex: 0
					};

					if (field.type === PDF_FORM_FIELD_TYPE.TEXTFIELD) {
						loaded.push({ ...base, kind: 'text' });
					} else if (field.type === PDF_FORM_FIELD_TYPE.CHECKBOX) {
						loaded.push({ ...base, kind: 'checkbox' });
					} else if (
						field.type === PDF_FORM_FIELD_TYPE.COMBOBOX ||
						field.type === PDF_FORM_FIELD_TYPE.LISTBOX ||
						field.type === PDF_FORM_FIELD_TYPE.RADIOBUTTON
					) {
						const options = field.options.map((option, index) => ({
							label: option.label,
							index
						}));
						const selectedIndex = Math.max(
							0,
							field.options.findIndex((option) => option.isSelected)
						);
						loaded.push({ ...base, kind: 'select', options, selectedIndex });
					}
				}
			}

			fields = loaded;
			if (!loaded.length) {
				error = 'No fillable form fields found in this PDF.';
			}
		} catch {
			error = 'Could not read form fields from this PDF.';
			file = null;
		} finally {
			loading = false;
		}
	}

	async function handleFill() {
		if (!file || !pdfEngine.engine || !docRef || !fields.length) return;
		processing = true;
		error = '';
		success = '';

		try {
			for (const field of fields) {
				if (field.kind === 'text') {
					await pdfEngine.engine
						.setFormFieldValue(docRef, field.page, field.widget, {
							kind: 'text',
							text: field.value
						})
						.toPromise();
				} else if (field.kind === 'checkbox') {
					await pdfEngine.engine
						.setFormFieldValue(docRef, field.page, field.widget, {
							kind: 'checked',
							checked: field.checked
						})
						.toPromise();
				} else {
					await pdfEngine.engine
						.setFormFieldValue(docRef, field.page, field.widget, {
							kind: 'selection',
							index: field.selectedIndex,
							isSelected: true
						})
						.toPromise();
				}
			}

			const result = await pdfEngine.engine.saveAsCopy(docRef).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `Downloaded ${name} — ${fields.length} field${fields.length === 1 ? '' : 's'} filled, ${formatFileSize(result.byteLength)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to fill PDF form.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF form" hint="or drop a PDF with fillable fields" onfiles={(f) => loadForm(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; fields = []; docRef = null; error = ''; }} />

		{#if loading}
			<ToolPanel>
				<p class="text-center text-sm text-muted-foreground">Loading form fields…</p>
			</ToolPanel>
		{:else if fields.length}
			<ToolPanel>
				<p class="mb-4 text-sm text-muted-foreground">
					{fields.length} fillable field{fields.length === 1 ? '' : 's'} found.
				</p>
				<div class="space-y-4">
					{#each fields as field (field.id)}
						<div class="rounded-lg border border-border/60 p-3">
							<label class="mb-2 block text-sm font-medium" for={field.id}>{field.label}</label>
							{#if field.kind === 'text'}
								<Input id={field.id} bind:value={field.value} />
							{:else if field.kind === 'checkbox'}
								<label class="flex items-center gap-2 text-sm">
									<input
										id={field.id}
										type="checkbox"
										class="size-4 rounded border-input accent-primary"
										bind:checked={field.checked}
									/>
									Checked
								</label>
							{:else}
								<select
									id={field.id}
									class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
									bind:value={field.selectedIndex}
								>
									{#each field.options as option}
										<option value={option.index}>{option.label}</option>
									{/each}
								</select>
							{/if}
						</div>
					{/each}
				</div>
			</ToolPanel>
			<ToolPanel>
				<OutputFilename bind:value={outputName} />
			</ToolPanel>
			<ToolAction
				disabled={processing || pdfEngine.isLoading || !pdfEngine.engine}
				loading={processing}
				loadingText="Saving form…"
				onclick={handleFill}
			>
				Save filled PDF
			</ToolAction>
		{/if}
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
