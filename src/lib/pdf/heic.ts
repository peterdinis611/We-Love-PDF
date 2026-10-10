import { heicTo, isHeic } from 'heic-to';
import { imagesToPdf } from './operations';

async function heicFileToPngFile(file: File): Promise<File> {
	const check = await isHeic(file);
	if (!check) {
		// Already a normal image — pass through
		return file;
	}
	const blob = (await heicTo({ blob: file, type: 'image/png' })) as Blob;
	const name = file.name.replace(/\.heic$/i, '.png').replace(/\.heif$/i, '.png');
	return new File([blob], name.endsWith('.png') ? name : `${name}.png`, { type: 'image/png' });
}

/** Convert one or more HEIC/HEIF (or mixed images) into a PDF. */
export async function heicImagesToPdf(
	files: File[],
	options: { pageSize?: 'fit' | 'a4' | 'letter'; margin?: number } = {}
): Promise<Uint8Array> {
	if (!files.length) throw new Error('No images selected.');
	const converted: File[] = [];
	for (const f of files) {
		const name = f.name.toLowerCase();
		const isHeicName =
			name.endsWith('.heic') ||
			name.endsWith('.heif') ||
			f.type === 'image/heic' ||
			f.type === 'image/heif';
		if (isHeicName) {
			converted.push(await heicFileToPngFile(f));
		} else if (f.type.startsWith('image/') || /\.(jpe?g|png|webp)$/i.test(name)) {
			converted.push(f);
		} else {
			throw new Error(`Unsupported file: ${f.name}`);
		}
	}
	return imagesToPdf(converted, options);
}
