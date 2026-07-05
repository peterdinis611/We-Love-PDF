<script lang="ts">
	import {
		PERMISSION_PRESETS,
		PERMISSION_TOGGLES,
		buildAllowedFlags,
		resolveAllowedFlags,
		presetFromFlags,
		type PermissionPreset,
		type PermissionToggleKey
	} from '$lib/pdf/security';

	let {
		preset = $bindable<PermissionPreset>('full'),
		toggles = $bindable<Record<PermissionToggleKey, boolean>>({
			print: true,
			copy: true,
			modify: true,
			annotate: true,
			forms: true
		})
	}: {
		preset?: PermissionPreset;
		toggles?: Record<PermissionToggleKey, boolean>;
	} = $props();

	const allowedFlags = $derived(resolveAllowedFlags(preset, toggles));

	function applyPreset(next: Exclude<PermissionPreset, 'custom'>) {
		preset = next;
		const { flags } = PERMISSION_PRESETS[next];
		toggles = Object.fromEntries(
			PERMISSION_TOGGLES.map(({ key, flag }) => [key, (flags & flag) === flag])
		) as Record<PermissionToggleKey, boolean>;
	}

	function onToggle(key: PermissionToggleKey, checked: boolean) {
		toggles = { ...toggles, [key]: checked };
		preset = presetFromFlags(buildAllowedFlags({ ...toggles, [key]: checked }));
	}
</script>

<div class="space-y-3">
	<div>
		<p class="mb-2 text-sm font-medium">Permissions</p>
		<div class="flex flex-wrap gap-2">
			{#each Object.entries(PERMISSION_PRESETS) as [key, { label }]}
				<button
					type="button"
					class="rounded-full border px-3 py-1 text-xs font-medium transition-colors {preset === key
						? 'border-primary bg-primary text-primary-foreground'
						: 'border-border bg-background hover:bg-muted'}"
					onclick={() => applyPreset(key as Exclude<PermissionPreset, 'custom'>)}
				>
					{label}
				</button>
			{/each}
			{#if preset === 'custom'}
				<span class="rounded-full border border-dashed px-3 py-1 text-xs text-muted-foreground">
					Custom
				</span>
			{/if}
		</div>
	</div>
	<div class="space-y-2 rounded-lg border border-border/60 bg-muted/30 p-3">
		{#each PERMISSION_TOGGLES as { key, label }}
			<label class="flex cursor-pointer items-center gap-2 text-sm">
				<input
					type="checkbox"
					class="size-4 rounded border-input accent-primary"
					checked={toggles[key]}
					onchange={(e) => onToggle(key, e.currentTarget.checked)}
				/>
				{label}
			</label>
		{/each}
	</div>
	<p class="text-xs text-muted-foreground">
		Allowed actions: {allowedFlags === 0 ? 'open only' : `${allowedFlags} (combined flags)`}
	</p>
</div>
