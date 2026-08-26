import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const destDir = join(root, 'static', 'wasm');
const dest = join(destDir, 'pdfium.wasm');

mkdirSync(destDir, { recursive: true });

let src;
try {
	src = require.resolve('@embedpdf/pdfium/dist/pdfium.wasm');
} catch {
	src = join(root, 'node_modules', '@embedpdf', 'pdfium', 'dist', 'pdfium.wasm');
}

if (!existsSync(src)) {
	console.warn('[copy-wasm] pdfium.wasm not found — skip');
	process.exit(0);
}

copyFileSync(src, dest);
console.log('[copy-wasm] → static/wasm/pdfium.wasm');
