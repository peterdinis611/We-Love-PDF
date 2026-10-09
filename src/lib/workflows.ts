import type { Messages } from '$lib/i18n/messages';

export type WorkflowSlug =
	| 'secure-pdf'
	| 'prepare-for-send'
	| 'scan-cleanup'
	| 'archive-pack'
	| 'invoice-pack'
	| 'scan-to-archive'
	| 'print-prep';

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
	{ slug: 'print-prep', path: '/workflows/print-prep', needsEngine: false }
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
	}
}
