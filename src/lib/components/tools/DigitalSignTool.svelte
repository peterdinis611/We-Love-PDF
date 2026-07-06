<script lang="ts">
	import FileDropzone from '$lib/components/FileDropzone.svelte';
	import FileListItem from '$lib/components/FileListItem.svelte';
	import ToolAction from '$lib/components/ToolAction.svelte';
	import ToolPanel from '$lib/components/ToolPanel.svelte';
	import OutputFilename from '$lib/components/OutputFilename.svelte';
	import ToolSuccess from '$lib/components/ToolSuccess.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import { downloadBlob, ensurePdfFilename, formatFileSize } from '$lib/pdf/operations';
	import { signPdfWithCertificate } from '$lib/pdf/digital-sign';
	import { Shield } from '@lucide/svelte';

	let pdfFile = $state<File | null>(null);
	let certFile = $state<File | null>(null);
	let password = $state('');
	let reason = $state('Document signed digitally');
	let signerName = $state('');
	let location = $state('');
	let contactInfo = $state('');
	let outputName = $state('signed.pdf');
	let processing = $state(false);
	let error = $state('');
	let success = $state('');

	async function handleSign() {
		if (!pdfFile || !certFile || !password) {
			error = 'PDF, certificate, and password are required.';
			return;
		}

		processing = true;
		error = '';
		success = '';
		try {
			const [pdfBytes, certBytes] = await Promise.all([
				pdfFile.arrayBuffer(),
				certFile.arrayBuffer()
			]);

			const result = await signPdfWithCertificate(
				new Uint8Array(pdfBytes),
				new Uint8Array(certBytes),
				password,
				{
					reason,
					name: signerName,
					location,
					contactInfo
				}
			);

			const name = ensurePdfFilename(outputName);
			downloadBlob(result, name);
			success = `Downloaded ${name} — PKCS#7 digital signature applied (${formatFileSize(result.length)})`;
		} catch (e) {
			error =
				e instanceof Error
					? e.message
					: 'Failed to sign PDF. Check your certificate password and file format (.p12 / .pfx).';
		} finally {
			processing = false;
			password = '';
		}
	}
</script>

<div class="space-y-4">
	<ToolPanel>
		<div class="mb-3 flex items-start gap-3">
			<Shield class="mt-0.5 size-5 text-primary" />
			<div class="text-sm text-muted-foreground">
				Sign with your PKCS#12 certificate (.p12 / .pfx). The private key stays in your browser and is cleared after signing. This creates a real detached PKCS#7 signature — not a text overlay.
			</div>
		</div>
	</ToolPanel>

	<div class="space-y-3">
		<p class="text-sm font-medium">PDF to sign</p>
		{#if pdfFile}
			<FileListItem name={pdfFile.name} size={pdfFile.size} onremove={() => (pdfFile = null)} />
		{:else}
			<FileDropzone label="Select PDF file" hint="document to sign" onfiles={(f) => (pdfFile = f[0])} />
		{/if}
	</div>

	<div class="space-y-3">
		<p class="text-sm font-medium">Certificate (.p12 / .pfx)</p>
		{#if certFile}
			<FileListItem name={certFile.name} size={certFile.size} onremove={() => (certFile = null)} />
		{:else}
			<FileDropzone
				label="Select certificate"
				hint="your .p12 or .pfx file"
				accept=".p12,.pfx,application/x-pkcs12"
				onfiles={(f) => (certFile = f[0])}
			/>
		{/if}
	</div>

	<ToolPanel>
		<div class="space-y-4">
			<div>
				<label for="cert-password" class="mb-1 block text-sm font-medium">Certificate password</label>
				<Input id="cert-password" type="password" bind:value={password} placeholder="PKCS#12 passphrase" />
			</div>
			<div>
				<label for="sign-reason" class="mb-1 block text-sm font-medium">Reason</label>
				<Input id="sign-reason" bind:value={reason} placeholder="Reason for signing" />
			</div>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="sign-name" class="mb-1 block text-sm font-medium">Signer name (optional)</label>
					<Input id="sign-name" bind:value={signerName} placeholder="Displayed in signature" />
				</div>
				<div>
					<label for="sign-location" class="mb-1 block text-sm font-medium">Location (optional)</label>
					<Input id="sign-location" bind:value={location} placeholder="City, country" />
				</div>
			</div>
			<div>
				<label for="sign-contact" class="mb-1 block text-sm font-medium">Contact info (optional)</label>
				<Input id="sign-contact" bind:value={contactInfo} placeholder="email@example.com" />
			</div>
			<OutputFilename bind:value={outputName} />
			<p class="text-xs text-muted-foreground">
				Verification depends on your certificate authority. Self-signed certificates show as signed but not trusted in Adobe Reader. For qualified signatures (eIDAS), use a certificate from your national trust provider.
			</p>
		</div>
	</ToolPanel>

	<ToolAction
		disabled={processing || !pdfFile || !certFile || !password}
		loading={processing}
		loadingText="Signing…"
		onclick={handleSign}
	>
		Sign with certificate
	</ToolAction>
	<ToolSuccess message={success} />
	<Alert message={error} />
</div>
