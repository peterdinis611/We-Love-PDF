import { tools } from '$lib/tools';
import { expect, test } from '@playwright/test';
import { ensureFixtures, fixturePath } from '../helpers/create-pdf';

const slugs = tools.filter((t) => t.available).map((t) => t.slug);
const securityTools = tools.filter((t) => t.available && t.category === 'security');

test.beforeAll(async () => {
	await ensureFixtures();
});

test.describe('All tool pages load', () => {
	for (const slug of slugs) {
		test(`/tools/${slug} renders`, async ({ page }) => {
			await page.goto(`/tools/${slug}`);
			await expect(page.locator('h1')).toBeVisible();
			await expect(page.getByRole('button', { name: /select|drop|upload/i }).first()).toBeVisible();
		});
	}
});

test.describe('Homepage', () => {
	test('loads all tool cards', async ({ page }) => {
		await page.goto('/');
		await expect(page.locator('h1')).toContainText(/Every PDF tool|Všetky PDF nástroje/);
		const toolsSection = page.locator('#tools');
		for (const tool of tools.filter((t) => t.available)) {
			await expect(toolsSection.locator(`a[href="/tools/${tool.slug}"]`)).toBeVisible();
		}
	});

	test('Slovak homepage loads', async ({ page }) => {
		await page.goto('/sk');
		await expect(page.locator('h1')).toContainText('Všetky PDF nástroje');
	});

	test('search filters tools', async ({ page }) => {
		await page.goto('/');
		await page.getByPlaceholder('Search tools…').fill('merge');
		const toolsSection = page.locator('#tools');
		await expect(toolsSection.getByRole('link', { name: 'Merge PDF' })).toBeVisible();
		await expect(toolsSection.getByRole('link', { name: 'Split PDF' })).not.toBeVisible();
	});

	test('category filter shows only matching tools', async ({ page }) => {
		await page.goto('/');
		await page.getByRole('button', { name: `PDF Security (${securityTools.length})` }).click();
		const toolsSection = page.locator('#tools');
		await expect.poll(async () => toolsSection.getByRole('link').count()).toBe(securityTools.length);
		for (const tool of securityTools) {
			await expect(toolsSection.getByRole('link', { name: tool.name })).toBeVisible();
		}
	});

	test('scroll to top button appears and works', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByRole('button', { name: 'Scroll to top' })).not.toBeVisible();
		await page.evaluate(() => window.scrollTo(0, 800));
		await expect(page.getByRole('button', { name: 'Scroll to top' })).toBeVisible();
		await page.getByRole('button', { name: 'Scroll to top' }).click();
		await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(50);
	});
});

test('Unknown tool returns 404', async ({ page }) => {
	const response = await page.goto('/tools/not-a-real-tool');
	expect(response?.status()).toBe(404);
});

test.describe('PDF tool workflows', () => {
	test('merge PDF downloads merged file', async ({ page }) => {
		await page.goto('/tools/merge-pdf');
		await page.locator('input[type="file"]').setInputFiles([
			fixturePath('sample-1pg.pdf'),
			fixturePath('sample-b.pdf')
		]);
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Merge PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('merged.pdf');
	});

	test('split PDF downloads parts', async ({ page }) => {
		await page.goto('/tools/split-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		await expect(page.locator('strong')).toContainText('3');
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Split PDF' }).click()
		]);
		expect(download.suggestedFilename()).toMatch(/split-\d+\.pdf/);
	});

	test('rotate PDF downloads rotated file', async ({ page }) => {
		await page.goto('/tools/rotate-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Rotate PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('rotated.pdf');
	});

	test('compress PDF downloads compressed file', async ({ page }) => {
		await page.goto('/tools/compress-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /compress/i }).click()
		]);
		expect(download.suggestedFilename()).toMatch(/\.pdf$/);
	});

	test('watermark PDF downloads watermarked file', async ({ page }) => {
		await page.goto('/tools/watermark-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /watermark/i }).click()
		]);
		expect(download.suggestedFilename()).toBe('watermarked.pdf');
	});

	test('sign PDF downloads signed file', async ({ page }) => {
		await page.goto('/tools/sign-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await page.getByPlaceholder('Your name').fill('Test User');
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Sign PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('signed.pdf');
	});

	test('edit metadata downloads updated file', async ({ page }) => {
		await page.goto('/tools/edit-metadata');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await page.getByLabel('Title').fill('Updated Title');
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /save metadata/i }).click()
		]);
		expect(download.suggestedFilename()).toBe('metadata-updated.pdf');
	});

	test('duplicate pages downloads duplicated file', async ({ page }) => {
		await page.goto('/tools/duplicate-pages');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		await expect(page.getByText(/1 of 3 selected/i)).toBeVisible({ timeout: 5000 });
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Duplicate pages' }).click()
		]);
		expect(download.suggestedFilename()).toBe('duplicated.pdf');
	});

	test('extract pages downloads extracted file', async ({ page }) => {
		await page.goto('/tools/extract-pages');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		await expect(page.getByText(/selected/i)).toBeVisible({ timeout: 5000 });
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /extract/i }).click()
		]);
		expect(download.suggestedFilename()).toBe('extracted.pdf');
	});

	test('delete pages downloads cleaned file', async ({ page }) => {
		await page.goto('/tools/delete-pages');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		await page.getByRole('button', { name: '2', exact: true }).click();
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Delete selected pages' }).click()
		]);
		expect(download.suggestedFilename()).toBe('cleaned.pdf');
	});

	test('page numbers downloads numbered file', async ({ page }) => {
		await page.goto('/tools/page-numbers');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /add page numbers/i }).click()
		]);
		expect(download.suggestedFilename()).toBe('numbered.pdf');
	});

	test('pdf info displays document metadata', async ({ page }) => {
		await page.goto('/tools/pdf-info');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-3pg.pdf'));
		await expect(page.getByText('Test Document')).toBeVisible({ timeout: 5000 });
		await expect(page.getByText('WeLovePDF Test')).toBeVisible();
		await expect(page.locator('dd').filter({ hasText: '3' }).first()).toBeVisible();
	});

	test('images to PDF downloads converted file', async ({ page }) => {
		await page.goto('/tools/images-to-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample.png'));
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /Create PDF/i }).click()
		]);
		expect(download.suggestedFilename()).toBe('images.pdf');
	});
});

test.describe('Engine-dependent tools', () => {
	test('pdf-to-jpg loads engine and accepts file', async ({ page }) => {
		await page.goto('/tools/pdf-to-jpg');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByText(/1-page PDF/i)).toBeVisible({ timeout: 10000 });
		await expect(page.getByRole('button', { name: /convert/i })).toBeEnabled({ timeout: 15000 });
	});

	test('pdf-to-text loads engine and accepts file', async ({ page }) => {
		await page.goto('/tools/pdf-to-text');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByRole('button', { name: /extract/i })).toBeEnabled({ timeout: 15000 });
	});

	test('flatten PDF loads engine and accepts file', async ({ page }) => {
		await page.goto('/tools/flatten-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByRole('button', { name: /flatten/i })).toBeEnabled({ timeout: 15000 });
	});

	test('protect PDF loads engine and accepts file', async ({ page }) => {
		await page.goto('/tools/protect-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await page.locator('#password').fill('test1234');
		await page.locator('#confirm').fill('test1234');
		await expect(page.getByRole('button', { name: /protect/i })).toBeEnabled({ timeout: 15000 });
	});

	test('change PDF password loads engine and accepts file', async ({ page }) => {
		await page.goto('/tools/change-pdf-password');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await page.locator('#current-password').fill('oldpass');
		await page.locator('#new-password').fill('newpass1234');
		await page.locator('#confirm-new-password').fill('newpass1234');
		await expect(page.getByRole('button', { name: /change password/i })).toBeEnabled({ timeout: 15000 });
	});

	test('pdf security check loads engine and analyzes file', async ({ page }) => {
		await page.goto('/tools/pdf-security-check');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByText(/not encrypted|password protected/i)).toBeVisible({ timeout: 15000 });
	});

	test('pdf to html loads engine and accepts file', async ({ page }) => {
		await page.goto('/tools/pdf-to-html');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByRole('button', { name: /convert to html/i })).toBeEnabled({ timeout: 15000 });
	});

	test('text to pdf creates downloadable file', async ({ page }) => {
		await page.goto('/tools/txt-to-pdf');
		await page.locator('#txt-content').fill('Hello from text to PDF');
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Create PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('document.pdf');
	});

	test('html to pdf creates downloadable file', async ({ page }) => {
		await page.goto('/tools/html-to-pdf');
		await page.locator('#html-content').fill('<h1>Hello</h1><p>HTML to PDF</p>');
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Convert to PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('document.pdf');
	});

	test('markdown to pdf creates downloadable file', async ({ page }) => {
		await page.goto('/tools/markdown-to-pdf');
		await page.locator('#md-content').fill('# Hello\n\nMarkdown **works**.');
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Convert to PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('document.pdf');
	});

	test('remove metadata downloads cleaned file', async ({ page }) => {
		await page.goto('/tools/remove-metadata');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByText('Single Page')).toBeVisible({ timeout: 5000 });
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Remove metadata' }).click()
		]);
		expect(download.suggestedFilename()).toBe('metadata-removed.pdf');
	});

	test('crop pdf downloads cropped file', async ({ page }) => {
		await page.goto('/tools/crop-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: 'Crop PDF' }).click()
		]);
		expect(download.suggestedFilename()).toBe('cropped.pdf');
	});

	test('batch pdf downloads zip archive', async ({ page }) => {
		await page.goto('/tools/batch-pdf');
		await page.locator('input[type="file"]').setInputFiles([
			fixturePath('sample-1pg.pdf'),
			fixturePath('sample-b.pdf')
		]);
		const [download] = await Promise.all([
			page.waitForEvent('download'),
			page.getByRole('button', { name: /run batch/i }).click()
		]);
		expect(download.suggestedFilename()).toBe('batch-compress.zip');
	});

	test('view PDF accepts file and shows viewer shell', async ({ page }) => {
		await page.goto('/tools/view-pdf');
		await page.locator('input[type="file"]').setInputFiles(fixturePath('sample-1pg.pdf'));
		await expect(page.getByText('sample-1pg.pdf')).toBeVisible();
		await expect(page.locator('.overflow-hidden.rounded-xl.border')).toBeVisible();
	});
});
