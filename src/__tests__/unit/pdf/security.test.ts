import { describe, expect, it } from 'vitest';
import {
	PERMISSION_PRESETS,
	PdfPerm,
	buildAllowedFlags,
	resolveAllowedFlags,
	describePermissions,
	presetFromFlags,
	scorePasswordStrength,
	togglesFromFlags,
	validatePasswordPair
} from '$lib/pdf/security';

describe('scorePasswordStrength', () => {
	it('returns empty for blank password', () => {
		expect(scorePasswordStrength('')).toBe('');
	});

	it('marks short passwords as weak', () => {
		expect(scorePasswordStrength('abc')).toBe('weak');
	});

	it('marks strong passwords', () => {
		expect(scorePasswordStrength('MySecurePass123!')).toBe('strong');
	});
});

describe('validatePasswordPair', () => {
	it('requires minimum length', () => {
		expect(validatePasswordPair('abc', 'abc')).toMatch(/at least/i);
	});

	it('requires matching passwords', () => {
		expect(validatePasswordPair('abcd', 'abce')).toMatch(/do not match/i);
	});

	it('accepts valid pairs', () => {
		expect(validatePasswordPair('abcd', 'abcd')).toBeNull();
	});
});

describe('permission helpers', () => {
	it('builds flags from toggles', () => {
		const flags = buildAllowedFlags({
			print: true,
			copy: false,
			modify: true,
			annotate: false,
			forms: false
		});
		expect(flags & PdfPerm.Print).toBeTruthy();
		expect(flags & PdfPerm.CopyContents).toBeFalsy();
	});

	it('uses preset flags for non-custom presets', () => {
		expect(resolveAllowedFlags('full', togglesFromFlags(0))).toBe(PdfPerm.AllowAll);
	});

	it('detects known presets', () => {
		expect(presetFromFlags(PERMISSION_PRESETS.full.flags)).toBe('full');
		expect(presetFromFlags(PERMISSION_PRESETS.viewOnly.flags)).toBe('viewOnly');
	});

	it('describes allowed actions', () => {
		const labels = describePermissions(PERMISSION_PRESETS.full.flags);
		expect(labels.length).toBeGreaterThan(0);
		expect(labels).toContain('printing');
	});
});
