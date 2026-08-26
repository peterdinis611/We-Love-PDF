export type WorkflowSlug =
	| 'secure-pdf'
	| 'prepare-for-send'
	| 'scan-cleanup'
	| 'archive-pack';

export type WorkflowMeta = {
	slug: WorkflowSlug;
	path: string;
	needsEngine: boolean;
};

export const workflows: WorkflowMeta[] = [
	{ slug: 'secure-pdf', path: '/workflows/secure-pdf', needsEngine: true },
	{ slug: 'prepare-for-send', path: '/workflows/prepare-for-send', needsEngine: true },
	{ slug: 'scan-cleanup', path: '/workflows/scan-cleanup', needsEngine: false },
	{ slug: 'archive-pack', path: '/workflows/archive-pack', needsEngine: true }
];

export function getWorkflow(slug: string): WorkflowMeta | undefined {
	return workflows.find((w) => w.slug === slug);
}
