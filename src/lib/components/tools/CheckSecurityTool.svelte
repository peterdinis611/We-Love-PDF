<script lang="ts">
	import { usePdfEngineContext } from '$lib/pdf/engine-context';
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { describePermissions } from '$lib/pdf/security';
	import { Shield, ShieldOff } from '@lucide/svelte';

	const pdfEngine = usePdfEngineContext();

	type SecurityInfo = {
		encrypted: boolean;
		needsPassword: boolean;
		permissions: number | null;
		userPermissions: number | null;
	};

	let file = $state<File | null>(null);
	let password = $state('');
	let info = $state<SecurityInfo | null>(null);
	let loading = $state(false);
	let error = $state('');

	const allowedActions = $derived(
		info?.permissions != null ? describePermissions(info.permissions) : []
	);

	async function analyze(withPassword?: string) {
		if (!file || !pdfEngine.engine) return;
		loading = true;
		error = '';
		info = null;

		try {
			const buffer = await file.arrayBuffer();
			let doc;
			let needsPassword = false;

			try {
				doc = await pdfEngine.engine
					.openDocumentBuffer({ id: `security-check-${Date.now()}`, content: buffer })
					.toPromise();
			} catch {
				if (!withPassword) {
					info = { encrypted: true, needsPassword: true, permissions: null, userPermissions: null };
					return;
				}
				doc = await pdfEngine.engine
					.openDocumentBuffer(
						{ id: `security-check-${Date.now()}`, content: buffer },
						{ password: withPassword }
					)
					.toPromise();
				needsPassword = true;
			}

			const encrypted = await pdfEngine.engine.isEncrypted(doc).toPromise();
			const permissions = await pdfEngine.engine.getDocPermissions(doc).toPromise();
			const userPermissions = await pdfEngine.engine.getDocUserPermissions(doc).toPromise();

			info = { encrypted, needsPassword, permissions, userPermissions };
		} catch {
			error = withPassword
				? 'Wrong password or unable to read security info.'
				: 'Unable to read PDF security info.';
		} finally {
			loading = false;
		}
	}

	async function setFile(f: File) {
		file = f;
		password = '';
		error = '';
		info = null;
		await analyze();
	}

	async function checkWithPassword() {
		if (!password) return;
		await analyze(password);
	}
</script>

<div class="space-y-4">
	{#if !file}
		<FileDropzone label="Select PDF file" hint="or drop a PDF to inspect security" onfiles={(f) => setFile(f[0])} />
	{:else}
		<FileListItem name={file.name} size={file.size} onremove={() => { file = null; info = null; error = ''; }} />

		{#if loading}
			<ToolPanel>
				<p class="text-center text-sm text-muted-foreground">Analyzing security settings…</p>
			</ToolPanel>
		{:else if info}
			<ToolPanel>
				<div class="space-y-4">
					<div class="flex items-start gap-3">
						{#if info.encrypted}
							<Shield class="mt-0.5 size-5 text-amber-600" />
						{:else}
							<ShieldOff class="mt-0.5 size-5 text-green-600" />
						{/if}
						<div>
							<p class="font-medium">
								{info.encrypted ? 'Password protected' : 'Not encrypted'}
							</p>
							<p class="text-sm text-muted-foreground">
								{#if info.needsPassword && info.permissions == null}
									Enter the password below to view permission details.
								{:else if info.encrypted}
									This document uses PDF encryption.
								{:else}
									Anyone can open and modify this PDF without a password.
								{/if}
							</p>
						</div>
					</div>

					{#if info.permissions != null}
						<dl class="divide-y divide-border rounded-lg border border-border/60">
							<div class="flex justify-between px-4 py-3">
								<dt class="text-sm text-muted-foreground">Document permissions</dt>
								<dd class="text-sm font-medium">{info.permissions}</dd>
							</div>
							<div class="flex justify-between px-4 py-3">
								<dt class="text-sm text-muted-foreground">User permissions</dt>
								<dd class="text-sm font-medium">{info.userPermissions ?? '—'}</dd>
							</div>
							<div class="px-4 py-3">
								<dt class="mb-2 text-sm text-muted-foreground">Allowed actions</dt>
								<dd class="flex flex-wrap gap-2">
									{#if allowedActions.length === 0}
										<span class="rounded-full bg-muted px-2.5 py-0.5 text-xs">Open only</span>
									{:else}
										{#each allowedActions as action}
											<span class="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary">
												{action}
											</span>
										{/each}
									{/if}
								</dd>
							</div>
						</dl>
					{/if}
				</div>
			</ToolPanel>
		{/if}

		{#if info?.needsPassword && info.permissions == null}
			<ToolPanel>
				<div class="space-y-3">
					<PasswordInput id="check-password" label="Password" bind:value={password} />
					<ToolAction
						disabled={loading || !password || pdfEngine.isLoading || !pdfEngine.engine}
						loading={loading}
						loadingText="Checking…"
						onclick={checkWithPassword}
					>
						Check with password
					</ToolAction>
				</div>
			</ToolPanel>
		{/if}
	{/if}
	{#if pdfEngine.error}
		<Alert message="Failed to load PDF engine. Please refresh the page." />
	{/if}
	<Alert message={error} />
</div>
