<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';

	let {
		value = $bindable(''),
		label,
		placeholder = 'output.pdf'
	}: {
		value?: string;
		label?: string;
		placeholder?: string;
	} = $props();

	const ws = $derived(msg(getAppLocale()).workspace);
	const outputLabel = $derived(label ?? ws.output.filename);
	const fieldId = `output-filename-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
</script>

<div>
	<label for={fieldId} class="mb-1.5 block text-sm font-medium">{outputLabel}</label>
	<Input id={fieldId} bind:value {placeholder} class="font-mono text-sm" />
	<p class="mt-1 text-xs text-muted-foreground">{ws.output.extensionHint}</p>
</div>
