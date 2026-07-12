import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: { command: 'bun run build && bun run preview', port: 4173 },
	testMatch: 'src/__tests__/e2e/**/*.e2e.{ts,js}'
});
