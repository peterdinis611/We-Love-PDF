<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { downloadBlob, formatFileSize } from '$lib/pdf/operations';
	import {
		extractFormFields,
		fieldsToCsv,
		fieldsToJson,
		type ExtractedField
	} from '$lib/pdf/form-extract';

	let file = $state<File | null>(null);
	let fields = $state<ExtractedField[]>([]);
	let format = $state<'csv' | 'json'>('csv');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function load(f: File) {
		file = f;
		error = '';
		success = '';
		processing = true;
		try {
			fields = await extractFormFields(f);
			if (!fields.length) error = 'No AcroForm fields found in this PDF.';
		} catch (e) {
			fields = [];
			error = e instanceof Error ? e.message : 'Failed to read form fields.';
		} finally {
			processing = false;
		}
	}

	function download() {
		if (!fields.length) return;
		const body = format === 'csv' ? fieldsToCsv(fields) : fieldsToJson(fields);
		const name = format === 'csv' ? 'form-fields.csv' : 'form-fields.json';
		const mime = format === 'csv' ? 'text/csv' : 'application/json';
		const bytes = new TextEncoder().encode(body);
		downloadBlob(bytes, name, mime);
		success = `Downloaded ${name} (${fields.length} fields, ${formatFileSize(bytes.length)})`;
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => load(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; fields = []; }} />
		<ToolPanel>
			<div class="space-y-4">
				{#if fields.length}
					<p class="text-sm font-medium">{fields.length} field{fields.length === 1 ? '' : 's'}</p>
					<ul class="max-h-56 space-y-1 overflow-auto text-xs">
						{#each fields as f}
							<li class="flex gap-2 truncate">
								<span class="font-medium">{f.name}</span>
								<span class="text-muted-foreground">({f.type})</span>
								<span class="truncate text-muted-foreground">{f.value || '—'}</span>
							</li>
						{/each}
					</ul>
				{/if}
				<div class="flex flex-wrap gap-2">
					{#each [['csv', 'CSV'], ['json', 'JSON']] as [value, label]}
						<button
							type="button"
							class="rounded-full px-3 py-1.5 text-xs font-medium transition {format === value
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-secondary-foreground'}"
							onclick={() => (format = value as typeof format)}
						>
							{label}
						</button>
					{/each}
				</div>
			</div>
		</ToolPanel>
		<ToolAction disabled={processing || !fields.length} loading={processing} onclick={download}>
			Download {format.toUpperCase()}
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	<Alert message={error} />
</div>
