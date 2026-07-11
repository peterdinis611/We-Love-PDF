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

	const outputLabel = $derived(label ?? msg(getAppLocale()).workspace.output.filename);
</script>

<div>
	<label for="output-filename" class="mb-1.5 block text-sm font-medium">{outputLabel}</label>
	<Input id="output-filename" bind:value {placeholder} class="font-mono text-sm" />
</div>
