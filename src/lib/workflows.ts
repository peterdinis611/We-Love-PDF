import type { Messages } from '$lib/i18n/messages';

export type WorkflowSlug =
	| 'secure-pdf'
	| 'prepare-for-send'
	| 'scan-cleanup'
	| 'archive-pack'
	| 'invoice-pack'
	| 'scan-to-archive'
	| 'print-prep'
	| 'contract-ready'
	| 'share-pack'
	| 'legal-bind';

export type WorkflowMeta = {
	slug: WorkflowSlug;
	path: string;
	needsEngine: boolean;
};

export type WorkflowCardCopy = { title: string; subtitle: string };

export const workflows: WorkflowMeta[] = [
	{ slug: 'secure-pdf', path: '/workflows/secure-pdf', needsEngine: true },
	{ slug: 'prepare-for-send', path: '/workflows/prepare-for-send', needsEngine: true },
	{ slug: 'scan-cleanup', path: '/workflows/scan-cleanup', needsEngine: false },
	{ slug: 'archive-pack', path: '/workflows/archive-pack', needsEngine: true },
	{ slug: 'invoice-pack', path: '/workflows/invoice-pack', needsEngine: true },
	{ slug: 'scan-to-archive', path: '/workflows/scan-to-archive', needsEngine: true },
	{ slug: 'print-prep', path: '/workflows/print-prep', needsEngine: false },
	{ slug: 'contract-ready', path: '/workflows/contract-ready', needsEngine: true },
	{ slug: 'share-pack', path: '/workflows/share-pack', needsEngine: true },
	{ slug: 'legal-bind', path: '/workflows/legal-bind', needsEngine: false }
];

export function getWorkflow(slug: string): WorkflowMeta | undefined {
	return workflows.find((w) => w.slug === slug);
}

export function workflowCardCopy(m: Messages['workflows'], slug: WorkflowSlug): WorkflowCardCopy {
	switch (slug) {
		case 'secure-pdf':
			return m.secure;
		case 'prepare-for-send':
			return m.prepareForSend;
		case 'scan-cleanup':
			return m.scanCleanup;
		case 'archive-pack':
			return m.archivePack;
		case 'invoice-pack':
			return m.invoicePack;
		case 'scan-to-archive':
			return m.scanToArchive;
		case 'print-prep':
			return m.printPrep;
		case 'contract-ready':
			return m.contractReady;
		case 'share-pack':
			return m.sharePack;
		case 'legal-bind':
			return m.legalBind;
	}
}

/** Keyboard-first batch chains suggested in the command palette. */
export const BATCH_CHAINS: { id: string; title: string; subtitle: string; slugs: string[] }[] = [
	{
		id: 'batch-secure',
		title: 'Batch: compress → protect',
		subtitle: 'Open compress, then continue to protect',
		slugs: ['compress-pdf', 'protect-pdf']
	},
	{
		id: 'batch-sign',
		title: 'Batch: page numbers → sign → protect',
		subtitle: 'Contract-style chain',
		slugs: ['page-numbers', 'sign-pdf', 'protect-pdf']
	},
	{
		id: 'batch-share',
		title: 'Batch: sanitize → watermark',
		subtitle: 'Prep a file for sharing',
		slugs: ['sanitize-pdf', 'watermark-pdf']
	},
	{
		id: 'batch-legal',
		title: 'Batch: Bates → stamp → flatten',
		subtitle: 'Legal bind chain',
		slugs: ['bates-pdf', 'stamp-pdf', 'flatten-pdf']
	}
];
