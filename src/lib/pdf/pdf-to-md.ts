type EngineLike = {
	openDocumentBuffer: (opts: { id: string; content: ArrayBuffer }) => {
		toPromise: () => Promise<{ pages: unknown[] }>;
	};
	extractText: (doc: unknown, indexes: number[]) => { toPromise: () => Promise<string> };
};

export async function pdfToMarkdown(
	file: File,
	engine: EngineLike,
	options: { title?: string } = {}
): Promise<string> {
	const buffer = await file.arrayBuffer();
	const doc = await engine
		.openDocumentBuffer({ id: `md-${Date.now()}`, content: buffer })
		.toPromise();
	const title = options.title ?? file.name.replace(/\.pdf$/i, '');
	const parts: string[] = [`# ${title}`, ''];

	for (let i = 0; i < doc.pages.length; i++) {
		const text = (await engine.extractText(doc, [i]).toPromise()).trim();
		parts.push(`## Page ${i + 1}`, '');
		parts.push(text || '_No extractable text on this page._', '');
	}

	return parts.join('\n');
}
