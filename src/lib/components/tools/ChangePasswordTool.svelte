<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import PermissionControls from '$lib/components/PermissionControls.svelte';
	import {
		resolveAllowedFlags,
		scorePasswordStrength,
		strengthColor,
		validatePasswordPair,
		type PermissionPreset,
		type PermissionToggleKey
	} from '$lib/pdf/security';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let separateOwner = $state(false);
	let ownerPassword = $state('');
	let preset = $state<PermissionPreset>('full');
	let toggles = $state<Record<PermissionToggleKey, boolean>>({
		print: true,
		copy: true,
		modify: true,
		annotate: true,
		forms: true
	});
	let outputName = $state('password-changed.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	const strength = $derived(scorePasswordStrength(newPassword));
	const allowedFlags = $derived(resolveAllowedFlags(preset, toggles));

	async function handleChangePassword() {
		if (!file || !pdfEngine.engine || !currentPassword) return;

		const validationError = validatePasswordPair(newPassword, confirmPassword);
		if (validationError) {
			error = validationError;
			return;
		}
		if (separateOwner && ownerPassword.length < 4) {
			error = 'Owner password must be at least 4 characters.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'change-pwd', content: buffer }, { password: currentPassword })
				.toPromise();

			await pdfEngine.engine.removeEncryption(doc).toPromise();
			const owner = separateOwner ? ownerPassword : newPassword;
			await pdfEngine.engine
				.setDocumentEncryption(doc, newPassword, owner, allowedFlags)
				.toPromise();

			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `Downloaded ${name} — password updated, ${formatFileSize(result.byteLength)}`;
		} catch {
			error = 'Wrong current password or unable to change password for this PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone
			label="Select protected PDF"
			hint="or drop an encrypted PDF here"
			onfiles={(f) => { file = f[0]; error = ''; success = ''; }}
		/>
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => (file = null)} />
		<ToolPanel>
			<div class="space-y-4">
				<PasswordInput id="current-password" label="Current password" bind:value={currentPassword} />
				<PasswordInput id="new-password" label="New password" bind:value={newPassword} />
				{#if strength}
					<p class="-mt-2 text-xs capitalize text-muted-foreground">
						Strength:
						<span class={strengthColor(strength)}>{strength}</span>
					</p>
				{/if}
				<PasswordInput id="confirm-new-password" label="Confirm new password" bind:value={confirmPassword} />

				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" class="size-4 rounded border-input accent-primary" bind:checked={separateOwner} />
					Use separate owner password
				</label>
				{#if separateOwner}
					<PasswordInput id="change-owner-password" label="Owner password" bind:value={ownerPassword} />
				{/if}

				<PermissionControls bind:preset bind:toggles />
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !currentPassword || !newPassword || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing}
			loadingText="Updating password…"
			onclick={handleChangePassword}
		>
			Change password
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
