import { PDFDocument, StandardFonts } from 'pdf-lib';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const FIXTURES_DIR = join(__dirname, '../fixtures');

const PNG_1X1 = Buffer.from(
	'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
	'base64'
);

export async function ensureFixtures() {
	mkdirSync(FIXTURES_DIR, { recursive: true });

	if (!existsSync(join(FIXTURES_DIR, 'sample-3pg.pdf'))) {
		const doc = await PDFDocument.create();
		doc.setTitle('Test Document');
		doc.setAuthor('WeLovePDF Test');
		doc.setSubject('E2E testing');
		const font = await doc.embedFont(StandardFonts.Helvetica);

		for (let i = 0; i < 3; i++) {
			const page = doc.addPage();
			page.drawText(`Test Page ${i + 1}`, { x: 50, y: 700, size: 24, font });
		}

		writeFileSync(join(FIXTURES_DIR, 'sample-3pg.pdf'), await doc.save());
	}

	if (!existsSync(join(FIXTURES_DIR, 'sample-1pg.pdf'))) {
		const doc = await PDFDocument.create();
		doc.setTitle('Single Page');
		doc.addPage();
		writeFileSync(join(FIXTURES_DIR, 'sample-1pg.pdf'), await doc.save());
	}

	if (!existsSync(join(FIXTURES_DIR, 'sample-b.pdf'))) {
		const doc = await PDFDocument.create();
		doc.setTitle('Second PDF');
		doc.addPage();
		writeFileSync(join(FIXTURES_DIR, 'sample-b.pdf'), await doc.save());
	}

	if (!existsSync(join(FIXTURES_DIR, 'sample.png'))) {
		writeFileSync(join(FIXTURES_DIR, 'sample.png'), PNG_1X1);
	}
}

export function fixturePath(name: string) {
	return join(FIXTURES_DIR, name);
}
