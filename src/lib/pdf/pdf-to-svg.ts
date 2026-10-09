/** Rasterize a PDF page and wrap it in a simple SVG (embedded PNG data URL). */
export async function pageToSvg(
	renderBlob: Blob,
	size: { width: number; height: number }
): Promise<string> {
	const dataUrl = await new Promise<string>((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(String(reader.result));
		reader.onerror = () => reject(new Error('Failed to encode page'));
		reader.readAsDataURL(renderBlob);
	});

	const w = size.width.toFixed(2);
	const h = size.height.toFixed(2);
	return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <image width="${w}" height="${h}" xlink:href="${dataUrl}" />
</svg>
`;
}
