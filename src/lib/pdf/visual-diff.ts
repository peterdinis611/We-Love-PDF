/** Visual page diff via canvas pixel comparison. */

export type VisualPageDiff = {
	page: number;
	diffRatio: number;
	equal: boolean;
	leftUrl: string;
	rightUrl: string;
	diffUrl: string | null;
};

async function blobToImageData(blob: Blob, width: number, height: number): Promise<ImageData> {
	const bitmap = await createImageBitmap(blob);
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d', { willReadFrequently: true });
	if (!ctx) throw new Error('Could not create canvas context.');
	ctx.drawImage(bitmap, 0, 0, width, height);
	bitmap.close();
	return ctx.getImageData(0, 0, width, height);
}

function imageDataToUrl(data: ImageData): string {
	const canvas = document.createElement('canvas');
	canvas.width = data.width;
	canvas.height = data.height;
	const ctx = canvas.getContext('2d');
	if (!ctx) throw new Error('Could not create canvas context.');
	ctx.putImageData(data, 0, 0);
	return canvas.toDataURL('image/png');
}

/**
 * Compare two page image blobs. Returns diff ratio (0–1) and optional heatmap URL.
 */
export async function diffPageImages(
	leftBlob: Blob,
	rightBlob: Blob,
	options: { threshold?: number; maxWidth?: number } = {}
): Promise<{ diffRatio: number; equal: boolean; leftUrl: string; rightUrl: string; diffUrl: string | null }> {
	const { threshold = 28, maxWidth = 720 } = options;

	const leftBmp = await createImageBitmap(leftBlob);
	const rightBmp = await createImageBitmap(rightBlob);
	const scale = Math.min(1, maxWidth / Math.max(leftBmp.width, rightBmp.width, 1));
	const width = Math.max(1, Math.round(Math.max(leftBmp.width, rightBmp.width) * scale));
	const height = Math.max(1, Math.round(Math.max(leftBmp.height, rightBmp.height) * scale));
	leftBmp.close();
	rightBmp.close();

	const left = await blobToImageData(leftBlob, width, height);
	const right = await blobToImageData(rightBlob, width, height);
	const diff = new ImageData(width, height);

	let changed = 0;
	const total = width * height;
	for (let i = 0; i < left.data.length; i += 4) {
		const dr = Math.abs(left.data[i] - right.data[i]);
		const dg = Math.abs(left.data[i + 1] - right.data[i + 1]);
		const db = Math.abs(left.data[i + 2] - right.data[i + 2]);
		const delta = (dr + dg + db) / 3;
		if (delta > threshold) {
			changed++;
			diff.data[i] = 220;
			diff.data[i + 1] = 40;
			diff.data[i + 2] = 40;
			diff.data[i + 3] = Math.min(255, 80 + delta);
		} else {
			const gray = (left.data[i] + left.data[i + 1] + left.data[i + 2]) / 3;
			diff.data[i] = gray;
			diff.data[i + 1] = gray;
			diff.data[i + 2] = gray;
			diff.data[i + 3] = 90;
		}
	}

	const diffRatio = changed / total;
	const equal = diffRatio < 0.002;
	return {
		diffRatio,
		equal,
		leftUrl: imageDataToUrl(left),
		rightUrl: imageDataToUrl(right),
		diffUrl: equal ? null : imageDataToUrl(diff)
	};
}
