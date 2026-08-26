import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	resolve: {
		alias: {
			buffer: 'buffer'
		}
	},
	build: {
		rolldownOptions: {
			output: {
				codeSplitting: {
					groups: [
						{ name: 'vendor-pdf-lib', test: /node_modules[\\/]pdf-lib/ },
						{ name: 'vendor-mammoth', test: /node_modules[\\/]mammoth/ },
						{ name: 'vendor-xlsx', test: /node_modules[\\/]xlsx/ },
						{ name: 'vendor-docx', test: /node_modules[\\/]docx/ },
						{ name: 'vendor-embedpdf', test: /node_modules[\\/]@embedpdf/ }
					]
				}
			}
		}
	},
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: ['src/__tests__/unit/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/__tests__/e2e/**']
				}
			}
		]
	}
});
