<script lang="ts">
	import { getAppLocale } from '$lib/i18n/context';
	import { msg } from '$lib/i18n';
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

	const locale = getAppLocale();
	const ws = $derived(msg(locale).workspace);

	const pdfEngine = usePdfEngineContext();

	let file = $state<File | null>(null);
	let password = $state('');
	let confirm = $state('');
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
	let outputName = $state('protected.pdf');
	let processing = $state(false);
	let scanning = $state(false);
	let encrypted = $state<boolean | null>(null);
	let error = $state('');
	let success = $state('');

	const strength = $derived(scorePasswordStrength(password));
	const allowedFlags = $derived(resolveAllowedFlags(preset, toggles));

	async function inspectFile(f: File) {
		file = f;
		encrypted = null;
		error = '';
		success = '';
		if (!pdfEngine.engine) return;

		scanning = true;
		try {
			const buffer = await f.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: `protect-scan-${Date.now()}`, content: buffer })
				.toPromise();
			encrypted = await pdfEngine.engine.isEncrypted(doc).toPromise();
			if (encrypted) {
				error = 'This PDF is already encrypted. Unlock it first or use Change PDF Password.';
			}
		} catch {
			encrypted = null;
		} finally {
			scanning = false;
		}
	}

	async function handleProtect() {
		if (!file || !pdfEngine.engine) return;

		const validationError = validatePasswordPair(password, confirm);
		if (validationError) {
			error = validationError;
			return;
		}
		if (separateOwner && ownerPassword.length < 4) {
			error = 'Owner password must be at least 4 characters.';
			return;
		}
		if (encrypted) {
			error = 'This PDF is already encrypted.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const buffer = await file.arrayBuffer();
			const doc = await pdfEngine.engine
				.openDocumentBuffer({ id: 'protect', content: buffer })
				.toPromise();

			const isAlreadyEncrypted = await pdfEngine.engine.isEncrypted(doc).toPromise();
			if (isAlreadyEncrypted) {
				error = 'This PDF is already encrypted.';
				return;
			}

			const owner = separateOwner ? ownerPassword : password;
			await pdfEngine.engine
				.setDocumentEncryption(doc, password, owner, allowedFlags)
				.toPromise();
			const result = await pdfEngine.engine.saveAsCopy(doc).toPromise();
			const name = ensurePdfFilename(outputName);
			downloadBlob(new Uint8Array(result), name);
			success = `Downloaded ${name} — AES-256 encrypted, ${formatFileSize(result.byteLength)}`;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to protect PDF.';
		} finally {
			processing = false;
		}
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone onfiles={(f) => inspectFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; encrypted = null; error = ''; }} />

		{#if scanning}
			<ToolPanel>
				<p class="text-center text-sm text-muted-foreground">Checking encryption status…</p>
			</ToolPanel>
		{:else if encrypted === false}
			<p class="text-sm text-green-600 dark:text-green-400">This PDF is not encrypted — ready to protect.</p>
		{/if}

		<ToolPanel>
			<div class="space-y-4">
				<PasswordInput id="password" label={ws.password.password} bind:value={password} />
				{#if strength}
					<p class="-mt-2 text-xs capitalize text-muted-foreground">
						Strength:
						<span class={strengthColor(strength)}>{strength}</span>
					</p>
				{/if}
				<PasswordInput id="confirm" label={ws.password.confirmPassword} bind:value={confirm} />

				<label class="flex cursor-pointer items-center gap-2 text-sm">
					<input type="checkbox" class="size-4 rounded border-input accent-primary" bind:checked={separateOwner} />
					Use separate owner password (for changing permissions later)
				</label>
				{#if separateOwner}
					<PasswordInput id="owner-password" label={ws.password.ownerPassword} bind:value={ownerPassword} />
				{/if}

				<PermissionControls bind:preset bind:toggles />
				<OutputFilename bind:value={outputName} />
			</div>
		</ToolPanel>
		<ToolAction
			disabled={processing || !password || encrypted === true || pdfEngine.isLoading || !pdfEngine.engine}
			loading={processing}
			loadingText="Encrypting…"
			onclick={handleProtect}
		>
			Protect PDF
		</ToolAction>
		<ToolSuccess message={success} />
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
