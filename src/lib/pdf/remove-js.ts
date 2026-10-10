import { PDFDocument, PDFName, PDFArray, PDFDict } from 'pdf-lib';

export type RemoveJsReport = {
	bytes: Uint8Array;
	notes: string[];
};

/**
 * Explicitly strip JavaScript, OpenAction, Launch actions, and page AA —
 * without wiping forms/outlines/annotations like full sanitize.
 */
export async function removeJavascriptAndActions(file: File): Promise<RemoveJsReport> {
	const notes: string[] = [];
	const input = await file.arrayBuffer();
	const doc = await PDFDocument.load(input, { ignoreEncryption: true, updateMetadata: false });
	const catalog = doc.catalog;

	const stripCatalog = (key: string, label: string) => {
		const name = PDFName.of(key);
		if (catalog.has(name)) {
			catalog.delete(name);
			notes.push(`Removed /${key} (${label}).`);
		}
	};

	stripCatalog('OpenAction', 'auto-open action');
	stripCatalog('AA', 'document additional actions');

	// Names tree may hold JavaScript name tree
	if (catalog.has(PDFName.of('Names'))) {
		const names = catalog.lookup(PDFName.of('Names'));
		if (names instanceof PDFDict && names.has(PDFName.of('JavaScript'))) {
			names.delete(PDFName.of('JavaScript'));
			notes.push('Removed /Names/JavaScript tree.');
		}
	}

	for (const page of doc.getPages()) {
		const node = page.node;
		if (node.has(PDFName.of('AA'))) {
			node.delete(PDFName.of('AA'));
			notes.push('Removed page /AA.');
		}
		if (node.has(PDFName.of('Annots'))) {
			const annots = node.lookup(PDFName.of('Annots'));
			if (annots instanceof PDFArray) {
				const keep: ReturnType<typeof annots.get>[] = [];
				for (let i = 0; i < annots.size(); i++) {
					const ref = annots.get(i);
					let drop = false;
					try {
						const dict = doc.context.lookup(ref);
						if (dict instanceof PDFDict) {
							const subtype = dict.get(PDFName.of('Subtype'))?.toString();
							const a = dict.lookup(PDFName.of('A'));
							const actionType =
								a instanceof PDFDict ? a.get(PDFName.of('S'))?.toString() : '';
							if (
								actionType === '/JavaScript' ||
								actionType === '/Launch' ||
								subtype === '/Screen'
							) {
								notes.push(`Removed ${actionType || subtype} annotation action.`);
								drop = true;
							}
						}
					} catch {
						/* keep */
					}
					if (!drop) keep.push(ref);
				}
				if (keep.length !== annots.size()) {
					if (!keep.length) node.delete(PDFName.of('Annots'));
					else {
						const next = doc.context.obj([]) as PDFArray;
						for (const ref of keep) next.push(ref);
						node.set(PDFName.of('Annots'), next);
					}
				}
			}
		}
	}

	const bytes = await doc.save({ useObjectStreams: true });
	if (!notes.length) notes.push('No JavaScript or Launch/OpenAction entries found.');
	return { bytes, notes };
}
