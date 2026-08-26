import { usePdfiumEngine } from '@embedpdf/engines/svelte';
import { getContext } from 'svelte';
import { PDFIUM_WASM_URL } from './wasm';

const PDF_ENGINE_KEY = Symbol('pdf-engine');

export type PdfEngineContext = ReturnType<typeof usePdfiumEngine>;

export function initPdfEngineContext(): PdfEngineContext {
	return usePdfiumEngine({
		wasmUrl: PDFIUM_WASM_URL,
		worker: true,
		fontFallback: null
	});
}

export function setPdfEngineContext(ctx: PdfEngineContext) {
	return ctx;
}

export function usePdfEngineContext(): PdfEngineContext {
	const ctx = getContext<PdfEngineContext>(PDF_ENGINE_KEY);
	if (!ctx) throw new Error('usePdfEngineContext must be used within PdfEngineProvider');
	return ctx;
}

export { PDF_ENGINE_KEY };
