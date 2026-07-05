<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Eye, EyeOff } from '@lucide/svelte';

	let {
		id,
		label,
		value = $bindable(''),
		placeholder = ''
	}: {
		id: string;
		label: string;
		value?: string;
		placeholder?: string;
	} = $props();

	let visible = $state(false);
</script>

<div>
	<label for={id} class="mb-1 block text-sm font-medium">{label}</label>
	<div class="relative">
		<Input
			{id}
			type={visible ? 'text' : 'password'}
			bind:value
			{placeholder}
			class="pr-10"
			autocomplete="off"
		/>
		<Button
			type="button"
			variant="ghost"
			size="icon"
			class="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
			onclick={() => (visible = !visible)}
			aria-label={visible ? 'Hide password' : 'Show password'}
		>
			{#if visible}
				<EyeOff class="size-4 text-muted-foreground" />
			{:else}
				<Eye class="size-4 text-muted-foreground" />
			{/if}
		</Button>
	</div>
</div>
