import { describe, expect, it } from 'vitest';
import { getMessages, toolTranslation } from '$lib/i18n/messages';
import { tools } from '$lib/tools';
import type { Locale } from '$lib/i18n/locale';
import { workspaceEn } from '$lib/i18n/workspace';

const locales: Locale[] = ['sk', 'cs', 'de', 'pl'];

describe('i18n getMessages', () => {
	it('returns Slovak workspace strings', () => {
		expect(getMessages('sk').workspace.actions.merge).toBe('Spojiť PDF');
	});

	it('merges Czech overlay onto English base', () => {
		expect(getMessages('cs').nav.allTools).toBe('Všechny nástroje');
		expect(getMessages('cs').commandPalette.title).toBe('Přejít na nástroj');
		expect(getMessages('cs').nav.guides).toBe('Návody');
	});

	it('localizes DE backToTools without English Tools label', () => {
		expect(getMessages('de').nav.backToTools).toBe('← Werkzeuge');
	});
});

describe('tool translations', () => {
	for (const locale of locales) {
		it(`has name+description for every tool slug (${locale})`, () => {
			for (const tool of tools) {
				const tr = toolTranslation(tool.slug, locale);
				expect(tr, `${locale}:${tool.slug}`).toBeDefined();
				expect(tr!.name.length).toBeGreaterThan(0);
				expect(tr!.description.length).toBeGreaterThan(0);
			}
		});
	}
});

describe('workspace locale parity', () => {
	for (const locale of locales) {
		it(`${locale} dropzone differs from English`, () => {
			const ws = getMessages(locale).workspace;
			expect(ws.dropzone.selectPdf).not.toBe(workspaceEn.dropzone.selectPdf);
			expect(ws.dropzone.orDropPdf).not.toBe(workspaceEn.dropzone.orDropPdf);
			expect(ws.view.loadingViewer).not.toBe(workspaceEn.view.loadingViewer);
			expect(ws.password.password).not.toBe(workspaceEn.password.password);
		});
	}
});
