<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';

	let {
		value = $bindable(''),
		label = 'Output filename',
		placeholder = 'output.pdf'
	}: {
		value?: string;
		label?: string;
		placeholder?: string;
	} = $props();
</script>

<div>
	<label for="output-filename" class="mb-1.5 block text-sm font-medium">{label}</label>
	<Input id="output-filename" bind:value {placeholder} class="font-mono text-sm" />
</div>
