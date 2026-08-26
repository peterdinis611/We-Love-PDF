import { browser } from '$app/environment';
import {
	compressPdf as compressPdfMain,
	mergePdfs as mergePdfsMain,
	organizePdf as organizePdfMain,
	splitPdf as splitPdfMain
} from './operations';

type OpName = 'mergePdfs' | 'compressPdf' | 'organizePdf' | 'splitPdf';

type Pending = {
	resolve: (value: unknown) => void;
	reject: (reason?: unknown) => void;
};

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, Pending>();

function getWorker(): Worker | null {
	if (!browser || typeof Worker === 'undefined') return null;
	if (worker) return worker;
	try {
		worker = new Worker(new URL('./ops.worker.ts', import.meta.url), { type: 'module' });
		worker.onmessage = (event: MessageEvent<{ id: number; ok: boolean; result?: unknown; error?: string }>) => {
			const job = pending.get(event.data.id);
			if (!job) return;
			pending.delete(event.data.id);
			if (event.data.ok) job.resolve(event.data.result);
			else job.reject(new Error(event.data.error ?? 'Worker failed'));
		};
		worker.onerror = (err) => {
			for (const [, job] of pending) job.reject(err);
			pending.clear();
			worker?.terminate();
			worker = null;
		};
		return worker;
	} catch {
		return null;
	}
}

function callWorker<T>(op: OpName, payload: unknown): Promise<T> {
	const w = getWorker();
	if (!w) {
		return Promise.reject(new Error('Worker unavailable'));
	}
	const id = ++seq;
	return new Promise<T>((resolve, reject) => {
		pending.set(id, {
			resolve: (v) => resolve(v as T),
			reject
		});
		w.postMessage({ id, op, payload });
	});
}

/** Merge PDFs off the main thread when a Worker is available. */
export async function mergePdfs(
	files: File[],
	options: { blankBetween?: boolean } = {}
): Promise<Uint8Array> {
	try {
		return await callWorker<Uint8Array>('mergePdfs', { files, options });
	} catch {
		return mergePdfsMain(files, options);
	}
}

/** Compress PDF off the main thread when a Worker is available. */
export async function compressPdf(file: File): Promise<Uint8Array> {
	try {
		return await callWorker<Uint8Array>('compressPdf', { file });
	} catch {
		return compressPdfMain(file);
	}
}

export async function organizePdf(file: File, pageOrder: number[]): Promise<Uint8Array> {
	try {
		return await callWorker<Uint8Array>('organizePdf', { file, pageOrder });
	} catch {
		return organizePdfMain(file, pageOrder);
	}
}

export async function splitPdf(file: File, ranges: number[][]): Promise<Uint8Array[]> {
	try {
		return await callWorker<Uint8Array[]>('splitPdf', { file, ranges });
	} catch {
		return splitPdfMain(file, ranges);
	}
}
