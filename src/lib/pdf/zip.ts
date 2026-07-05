import { zipSync } from 'fflate';
import { downloadBlob } from './operations';

export type ZipEntry = { name: string; data: Uint8Array | Blob };

export async function buildZip(entries: ZipEntry[]): Promise<Uint8Array> {
	const files: Record<string, Uint8Array> = {};
	for (const entry of entries) {
		const data =
			entry.data instanceof Blob
				? new Uint8Array(await entry.data.arrayBuffer())
				: entry.data;
		files[entry.name] = data;
	}
	return zipSync(files);
}

export async function downloadZip(entries: ZipEntry[], zipName: string): Promise<number> {
	const zipped = await buildZip(entries);
	downloadBlob(zipped, zipName.endsWith('.zip') ? zipName : `${zipName}.zip`, 'application/zip');
	return zipped.length;
}

export function uniqueZipName(base: string, used: Set<string>): string {
	let name = base;
	let counter = 2;
	while (used.has(name)) {
		const dot = base.lastIndexOf('.');
		name = dot > 0 ? `${base.slice(0, dot)}-${counter}${base.slice(dot)}` : `${base}-${counter}`;
		counter++;
	}
	used.add(name);
	return name;
}
