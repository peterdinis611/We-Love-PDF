import { usePdfiumEngine } from '@embedpdf/engines/svelte';
import { getContext } from 'svelte';

const PDF_ENGINE_KEY = Symbol('pdf-engine');

export type PdfEngineContext = ReturnType<typeof usePdfiumEngine>;

export function initPdfEngineContext(): PdfEngineContext {
	const engine = usePdfiumEngine();
	return engine;
}

export function setPdfEngineContext(ctx: PdfEngineContext) {
	// Used by provider via setContext in component
	return ctx;
}

export function usePdfEngineContext(): PdfEngineContext {
	const ctx = getContext<PdfEngineContext>(PDF_ENGINE_KEY);
	if (!ctx) throw new Error('usePdfEngineContext must be used within PdfEngineProvider');
	return ctx;
}

export { PDF_ENGINE_KEY };
