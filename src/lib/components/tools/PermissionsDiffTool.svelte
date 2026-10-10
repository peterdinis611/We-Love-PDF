<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import {
		diffPermissions,
		inspectPermissions,
		type PermissionDiffRow,
		type PermissionSnapshot
	} from '$lib/pdf/permissions-diff';

	const pdfEngine = usePdfEngineContext();
	let beforeFile = $state<File | null>(null);
	let afterFile = $state<File | null>(null);
	let beforePw = $state('');
	let afterPw = $state('');
	let beforeSnap = $state<PermissionSnapshot | null>(null);
	let afterSnap = $state<PermissionSnapshot | null>(null);
	let rows = $state<PermissionDiffRow[]>([]);
	let processing = $state(false);
	let error = $state('');

	async function compare() {
		if (!beforeFile || !afterFile || !pdfEngine.engine) return;
		processing = true;
		error = '';
		try {
			beforeSnap = await inspectPermissions(beforeFile, pdfEngine.engine as never, beforePw);
			afterSnap = await inspectPermissions(afterFile, pdfEngine.engine as never, afterPw);
			rows = diffPermissions(beforeSnap, afterSnap);
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to compare permissions.';
			rows = [];
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	<ToolPanel>
		<p class="mb-3 text-sm text-muted-foreground">
			Compare permission flags before vs after unlock / password change. Drop the original encrypted PDF and the
			unlocked copy.
		</p>
		<div class="grid gap-4 sm:grid-cols-2">
			<div class="space-y-2">
				<p class="text-sm font-medium">Before</p>
				{#if !beforeFile}
					<FileDropzone onfiles={(f) => (beforeFile = f[0])} />
				{:else}
					<FileListItem name={beforeFile.name} size={beforeFile.size} onremove={() => (beforeFile = null)} />
					<PasswordInput id="perm-before-pw" bind:value={beforePw} label="Password (if needed)" />
				{/if}
			</div>
			<div class="space-y-2">
				<p class="text-sm font-medium">After</p>
				{#if !afterFile}
					<FileDropzone onfiles={(f) => (afterFile = f[0])} />
				{:else}
					<FileListItem name={afterFile.name} size={afterFile.size} onremove={() => (afterFile = null)} />
					<PasswordInput id="perm-after-pw" bind:value={afterPw} label="Password (if needed)" />
				{/if}
			</div>
		</div>
	</ToolPanel>
	<ToolAction
		disabled={processing || !beforeFile || !afterFile || pdfEngine.isLoading || !pdfEngine.engine}
		loading={processing || pdfEngine.isLoading}
		onclick={compare}
	>
		Compare permissions
	</ToolAction>
	{#if beforeSnap && afterSnap}
		<div class="overflow-x-auto rounded-lg border border-border">
			<table class="w-full text-left text-sm">
				<thead class="bg-muted/50 text-xs uppercase text-muted-foreground">
					<tr>
						<th class="px-3 py-2">Permission</th>
						<th class="px-3 py-2">Before</th>
						<th class="px-3 py-2">After</th>
					</tr>
				</thead>
				<tbody>
					<tr class="border-t border-border">
						<td class="px-3 py-2">Encrypted</td>
						<td class="px-3 py-2">{beforeSnap.encrypted ? 'yes' : 'no'}</td>
						<td class="px-3 py-2 {beforeSnap.encrypted !== afterSnap.encrypted ? 'font-semibold text-amber-600' : ''}">
							{afterSnap.encrypted ? 'yes' : 'no'}
						</td>
					</tr>
					{#each rows as row}
						<tr class="border-t border-border {row.changed ? 'bg-amber-500/5' : ''}">
							<td class="px-3 py-2">{row.label}</td>
							<td class="px-3 py-2">{row.before == null ? '—' : row.before ? 'allow' : 'deny'}</td>
							<td class="px-3 py-2 {row.changed ? 'font-semibold' : ''}">
								{row.after == null ? '—' : row.after ? 'allow' : 'deny'}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		{#if beforeSnap.note}
			<p class="text-xs text-muted-foreground">{beforeSnap.note}</p>
		{/if}
		{#if afterSnap.note}
			<p class="text-xs text-muted-foreground">{afterSnap.note}</p>
		{/if}
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine." />
	{/if}
	<Alert message={error} />
</div>
