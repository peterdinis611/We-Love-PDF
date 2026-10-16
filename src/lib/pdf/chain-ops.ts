import { compressPdf } from '$lib/pdf/heavy';
import { addWatermark, addPageNumbers, signPdf } from '$lib/pdf/operations';
import { sanitizePdf } from '$lib/pdf/sanitize';
import { stampPdf } from '$lib/pdf/layout-ops';
import { addBatesNumbers } from '$lib/pdf/bates';
import { resolveAllowedFlags, type PermissionPreset } from '$lib/pdf/security';
import { BATCH_CHAINS } from '$lib/workflows';

export type ChainOptions = {
	password?: string;
	ownerPassword?: string;
	signature?: string;
	watermarkText?: string;
	stampText?: string;
	batesPrefix?: string;
	/** EmbedPDF engine instance when protect/flatten are in the chain */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	engine?: any;
};

export function getBatchChain(id: string) {
	return BATCH_CHAINS.find((c) => c.id === id);
}

export function chainNeedsEngine(slugs: string[]): boolean {
	return slugs.some((s) => s === 'protect-pdf' || s === 'flatten-pdf' || s === 'compress-pdf');
}

async function fileFromBytes(bytes: Uint8Array, name: string): Promise<File> {
	return new File([new Uint8Array(bytes)], name, { type: 'application/pdf' });
}

async function runProtect(file: File, options: ChainOptions): Promise<Uint8Array> {
	const engine = options.engine;
	if (!engine) throw new Error('PDF engine required to protect.');
	if (!options.password?.trim()) throw new Error('Enter a password for Protect.');
	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: 'chain-protect', content: buffer }).toPromise();
	const encrypted = await engine.isEncrypted(doc).toPromise();
	if (encrypted) throw new Error('PDF is already encrypted — unlock it first.');
	const owner = options.ownerPassword?.trim() || options.password;
	const flags = resolveAllowedFlags('full' as PermissionPreset, {
		print: true,
		copy: true,
		modify: true,
		annotate: true,
		forms: true
	});
	await engine.setDocumentEncryption(doc, options.password, owner, flags).toPromise();
	const result = await engine.saveAsCopy(doc).toPromise();
	return result instanceof Uint8Array ? result : new Uint8Array(result);
}

async function runFlatten(file: File, options: ChainOptions): Promise<Uint8Array> {
	const engine = options.engine;
	if (!engine) throw new Error('PDF engine required to flatten.');
	const buffer = await file.arrayBuffer();
	const doc = await engine.openDocumentBuffer({ id: 'chain-flatten', content: buffer }).toPromise();
	const pages = doc.pages ?? [];
	for (const page of pages) {
		await engine.flattenPage(doc, page).toPromise();
	}
	const result = await engine.saveAsCopy(doc).toPromise();
	return result instanceof Uint8Array ? result : new Uint8Array(result);
}

export async function runChainStep(
	slug: string,
	file: File,
	options: ChainOptions = {}
): Promise<Uint8Array> {
	switch (slug) {
		case 'compress-pdf':
			return compressPdf(file);
		case 'page-numbers':
			return addPageNumbers(file, { position: 'bottom-center' });
		case 'sign-pdf':
			return signPdf(file, options.signature?.trim() || 'Signed', {
				includeDate: true,
				position: 'bottom-right'
			});
		case 'watermark-pdf':
			return addWatermark(file, options.watermarkText?.trim() || 'CONFIDENTIAL', {
				opacity: 0.25,
				position: 'diagonal'
			});
		case 'sanitize-pdf': {
			const report = await sanitizePdf(file);
			return report.bytes;
		}
		case 'stamp-pdf':
			return stampPdf(file, {
				text: options.stampText?.trim() || 'CONFIDENTIAL',
				color: 'red',
				allPages: true
			});
		case 'bates-pdf':
			return addBatesNumbers(file, {
				prefix: options.batesPrefix?.trim() || 'DOC-',
				start: 1,
				pad: 6
			});
		case 'protect-pdf':
			return runProtect(file, options);
		case 'flatten-pdf':
			return runFlatten(file, options);
		default:
			throw new Error(`Chain step not supported: ${slug}`);
	}
}

export type ChainProgress = {
	slug: string;
	index: number;
	total: number;
};

/** Run every slug in order; returns the final PDF bytes. */
export async function runBatchChain(
	file: File,
	slugs: string[],
	options: ChainOptions = {},
	onStep?: (progress: ChainProgress) => void
): Promise<Uint8Array> {
	if (!slugs.length) throw new Error('Empty chain.');
	let current = file;
	let last: Uint8Array | null = null;

	for (let i = 0; i < slugs.length; i++) {
		const slug = slugs[i];
		onStep?.({ slug, index: i, total: slugs.length });
		last = await runChainStep(slug, current, options);
		current = await fileFromBytes(last, file.name);
	}

	if (!last) throw new Error('Chain produced no output.');
	return last;
}
