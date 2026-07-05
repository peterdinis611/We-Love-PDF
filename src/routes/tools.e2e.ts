import { tools } from '$lib/tools';
import { expect, test } from '@playwright/test';

const slugs = tools.filter((t) => t.available).map((t) => t.slug);

test.describe('All tool pages load', () => {
	for (const slug of slugs) {
		test(`/tools/${slug} renders`, async ({ page }) => {
			await page.goto(`/tools/${slug}`);
			await expect(page.locator('h1')).toBeVisible();
			await expect(page.getByRole('button', { name: /select|drop|upload/i }).first()).toBeVisible();
		});
	}
});

test('Homepage loads all tool cards', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toContainText('Every PDF tool');
	const toolsSection = page.locator('#tools');
	for (const tool of tools.filter((t) => t.available)) {
		await expect(toolsSection.getByRole('link', { name: tool.name })).toBeVisible();
	}
});

test('Unknown tool returns 404', async ({ page }) => {
	const response = await page.goto('/tools/not-a-real-tool');
	expect(response?.status()).toBe(404);
});
