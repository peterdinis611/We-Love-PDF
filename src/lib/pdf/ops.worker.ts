/// <reference lib="webworker" />
import { compressPdf, mergePdfs, organizePdf, splitPdf } from './operations';

type OpName = 'mergePdfs' | 'compressPdf' | 'organizePdf' | 'splitPdf';

type RequestMessage = {
	id: number;
	op: OpName;
	payload: unknown;
};

type ResponseMessage =
	| { id: number; ok: true; result: unknown }
	| { id: number; ok: false; error: string };

async function run(op: OpName, payload: unknown): Promise<unknown> {
	switch (op) {
		case 'mergePdfs': {
			const { files, options } = payload as {
				files: File[];
				options?: { blankBetween?: boolean };
			};
			return mergePdfs(files, options);
		}
		case 'compressPdf': {
			const { file } = payload as { file: File };
			return compressPdf(file);
		}
		case 'organizePdf': {
			const { file, pageOrder } = payload as { file: File; pageOrder: number[] };
			return organizePdf(file, pageOrder);
		}
		case 'splitPdf': {
			const { file, ranges } = payload as { file: File; ranges: number[][] };
			return splitPdf(file, ranges);
		}
		default:
			throw new Error(`Unknown op: ${op}`);
	}
}

self.onmessage = async (event: MessageEvent<RequestMessage>) => {
	const { id, op, payload } = event.data;
	try {
		const result = await run(op, payload);
		const message: ResponseMessage = { id, ok: true, result };
		self.postMessage(message);
	} catch (e) {
		const message: ResponseMessage = {
			id,
			ok: false,
			error: e instanceof Error ? e.message : String(e)
		};
		self.postMessage(message);
	}
};
