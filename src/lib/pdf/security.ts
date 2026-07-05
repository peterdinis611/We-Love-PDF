/** PDF permission flags (matches EmbedPDF PdfPermissionFlag). */
export const PdfPerm = {
	Print: 4,
	ModifyContents: 8,
	CopyContents: 16,
	ModifyAnnotations: 32,
	FillForms: 256,
	ExtractForAccessibility: 512,
	AssembleDocument: 1024,
	PrintHighQuality: 2048,
	AllowAll: 3900
} as const;

export function buildPermissions(...flags: number[]): number {
	let result = flags.reduce((acc, flag) => acc | flag, 0);
	if (result & PdfPerm.PrintHighQuality) {
		result |= PdfPerm.Print;
	}
	return result;
}

export type PasswordStrength = 'weak' | 'medium' | 'strong' | '';
export type PermissionPreset = 'full' | 'viewOnly' | 'noCopy' | 'noPrint' | 'custom';

export const MIN_PASSWORD_LENGTH = 4;

export const PERMISSION_PRESETS: Record<
	Exclude<PermissionPreset, 'custom'>,
	{ label: string; description: string; flags: number }
> = {
	full: {
		label: 'Full access',
		description: 'Print, copy, edit, and annotate',
		flags: PdfPerm.AllowAll
	},
	viewOnly: {
		label: 'View only',
		description: 'Open the document without other actions',
		flags: 0
	},
	noCopy: {
		label: 'No copying',
		description: 'Allow everything except copying text and graphics',
		flags: buildPermissions(
			PdfPerm.Print,
			PdfPerm.ModifyContents,
			PdfPerm.ModifyAnnotations,
			PdfPerm.FillForms,
			PdfPerm.ExtractForAccessibility,
			PdfPerm.AssembleDocument,
			PdfPerm.PrintHighQuality
		)
	},
	noPrint: {
		label: 'No printing',
		description: 'Allow everything except printing',
		flags: buildPermissions(
			PdfPerm.ModifyContents,
			PdfPerm.CopyContents,
			PdfPerm.ModifyAnnotations,
			PdfPerm.FillForms,
			PdfPerm.ExtractForAccessibility,
			PdfPerm.AssembleDocument
		)
	}
};

export const PERMISSION_TOGGLES = [
	{ key: 'print', flag: PdfPerm.Print, label: 'Allow printing' },
	{ key: 'copy', flag: PdfPerm.CopyContents, label: 'Allow copying text' },
	{ key: 'modify', flag: PdfPerm.ModifyContents, label: 'Allow editing' },
	{ key: 'annotate', flag: PdfPerm.ModifyAnnotations, label: 'Allow annotations' },
	{ key: 'forms', flag: PdfPerm.FillForms, label: 'Allow form filling' }
] as const;

export type PermissionToggleKey = (typeof PERMISSION_TOGGLES)[number]['key'];

export function scorePasswordStrength(password: string): PasswordStrength {
	if (!password) return '';
	if (password.length < MIN_PASSWORD_LENGTH) return 'weak';

	let score = 0;
	if (password.length >= 8) score++;
	if (password.length >= 12) score++;
	if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
	if (/\d/.test(password)) score++;
	if (/[^A-Za-z0-9]/.test(password)) score++;

	if (score <= 2) return 'weak';
	if (score <= 4) return 'medium';
	return 'strong';
}

export function validatePasswordPair(password: string, confirm: string): string | null {
	if (password.length < MIN_PASSWORD_LENGTH) {
		return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
	}
	if (password !== confirm) return 'Passwords do not match.';
	return null;
}

export function buildAllowedFlags(toggles: Record<PermissionToggleKey, boolean>): number {
	const flags = PERMISSION_TOGGLES.filter(({ key }) => toggles[key]).map(({ flag }) => flag);
	return buildPermissions(...flags);
}

export function resolveAllowedFlags(
	preset: PermissionPreset,
	toggles: Record<PermissionToggleKey, boolean>
): number {
	if (preset !== 'custom') return PERMISSION_PRESETS[preset].flags;
	return buildAllowedFlags(toggles);
}

export function togglesFromFlags(flags: number): Record<PermissionToggleKey, boolean> {
	return Object.fromEntries(
		PERMISSION_TOGGLES.map(({ key, flag }) => [key, (flags & flag) === flag])
	) as Record<PermissionToggleKey, boolean>;
}

export function presetFromFlags(flags: number): PermissionPreset {
	for (const [preset, { flags: presetFlags }] of Object.entries(PERMISSION_PRESETS)) {
		if (flags === presetFlags) return preset as Exclude<PermissionPreset, 'custom'>;
	}
	return 'custom';
}

export function describePermissions(flags: number): string[] {
	return PERMISSION_TOGGLES.filter(({ flag }) => (flags & flag) === flag).map(({ label }) =>
		label.replace(/^Allow /, '')
	);
}

export function strengthColor(strength: PasswordStrength): string {
	if (strength === 'strong') return 'text-green-600 dark:text-green-400';
	if (strength === 'medium') return 'text-amber-600 dark:text-amber-400';
	if (strength === 'weak') return 'text-red-600 dark:text-red-400';
	return '';
}
