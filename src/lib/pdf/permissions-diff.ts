import { PERMISSION_TOGGLES, type PermissionToggleKey } from './security';

export type PermissionSnapshot = {
	encrypted: boolean;
	flags: number | null;
	userFlags: number | null;
	toggles: Record<PermissionToggleKey, boolean> | null;
	note?: string;
};

export type PermissionDiffRow = {
	key: PermissionToggleKey;
	label: string;
	before: boolean | null;
	after: boolean | null;
	changed: boolean;
};

type EngineLike = {
	openDocumentBuffer: (
		opts: { id: string; content: ArrayBuffer },
		extra?: { password?: string }
	) => { toPromise: () => Promise<{ id: string }> };
	isEncrypted: (doc: { id: string }) => { toPromise: () => Promise<boolean> };
	getDocPermissions: (doc: { id: string }) => { toPromise: () => Promise<number> };
	getDocUserPermissions: (doc: { id: string }) => { toPromise: () => Promise<number> };
};

function togglesFrom(flags: number): Record<PermissionToggleKey, boolean> {
	return Object.fromEntries(
		PERMISSION_TOGGLES.map(({ key, flag }) => [key, (flags & flag) === flag])
	) as Record<PermissionToggleKey, boolean>;
}

export async function inspectPermissions(
	file: File,
	engine: EngineLike,
	password = ''
): Promise<PermissionSnapshot> {
	const buffer = await file.arrayBuffer();
	let doc: { id: string };
	try {
		doc = await engine
			.openDocumentBuffer(
				{ id: `perm-${Date.now()}`, content: buffer },
				password ? { password } : undefined
			)
			.toPromise();
	} catch {
		if (!password) {
			return {
				encrypted: true,
				flags: null,
				userFlags: null,
				toggles: null,
				note: 'Password required to read permission flags.'
			};
		}
		throw new Error('Wrong password or unable to open PDF.');
	}

	const encrypted = await engine.isEncrypted(doc).toPromise();
	const flags = await engine.getDocPermissions(doc).toPromise();
	const userFlags = await engine.getDocUserPermissions(doc).toPromise();
	return {
		encrypted,
		flags,
		userFlags,
		toggles: togglesFrom(flags)
	};
}

export function diffPermissions(
	before: PermissionSnapshot,
	after: PermissionSnapshot
): PermissionDiffRow[] {
	return PERMISSION_TOGGLES.map(({ key, label }) => {
		const b = before.toggles?.[key] ?? null;
		const a = after.toggles?.[key] ?? null;
		return { key, label, before: b, after: a, changed: b !== a };
	});
}
