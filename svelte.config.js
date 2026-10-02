import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';

/**
 * mdsvex 0.12.x still emits `<script context="module">` for frontmatter.
 * Svelte 5 wants `<script module>` — rewrite until mdsvex ships svelte5 mode.
 * @see https://github.com/pngwn/MDsveX/issues/649
 */
const mdsvexPreprocess = mdsvex({ extensions: ['.svx'] });
const mdsvexSvelte5 = {
	name: 'mdsvex-svelte5',
	async markup(options) {
		const result = await mdsvexPreprocess.markup(options);
		if (!result?.code) return result;
		return {
			...result,
			code: result.code.replaceAll('<script context="module">', '<script module>')
		};
	}
};

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.svx'],
	preprocess: [vitePreprocess(), mdsvexSvelte5],
	compilerOptions: {
		runes: true
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
