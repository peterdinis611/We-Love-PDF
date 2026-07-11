import { describe, expect, it, beforeEach, vi } from 'vitest';
import { getMessages } from '$lib/i18n/messages';
import { getToolPreset, setToolPreset } from '$lib/tool-presets';

describe('i18n getMessages', () => {
	it('returns Slovak workspace strings', () => {
		expect(getMessages('sk').workspace.actions.merge).toBe('Spojiť PDF');
	});

	it('merges Czech overlay onto English base', () => {
		expect(getMessages('cs').nav.allTools).toBe('Všechny nástroje');
		expect(getMessages('cs').commandPalette.title).toBe('Přejít na nástroj');
	});
});

describe('tool presets', () => {
	const storage = new Map<string, string>();

	beforeEach(() => {
		storage.clear();
		vi.stubGlobal('localStorage', {
			getItem: (key: string) => storage.get(key) ?? null,
			setItem: (key: string, value: string) => storage.set(key, value)
		});
	});

	it('stores and reads presets per tool', () => {
		setToolPreset('pdf-to-png', 'scale', 3);
		expect(getToolPreset('pdf-to-png', 'scale', 2)).toBe(3);
	});
});
