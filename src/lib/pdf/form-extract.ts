import { PDFDocument, PDFTextField, PDFCheckBox, PDFDropdown, PDFOptionList, PDFRadioGroup } from 'pdf-lib';

export type ExtractedField = {
	name: string;
	type: string;
	value: string;
};

async function loadPdf(file: File) {
	const bytes = await file.arrayBuffer();
	try {
		return await PDFDocument.load(bytes);
	} catch {
		return await PDFDocument.load(bytes, { ignoreEncryption: true });
	}
}

/** Extract AcroForm field names and values via pdf-lib. */
export async function extractFormFields(file: File): Promise<ExtractedField[]> {
	const doc = await loadPdf(file);
	const form = doc.getForm();
	const fields = form.getFields();
	const out: ExtractedField[] = [];

	for (const field of fields) {
		const name = field.getName();
		let value = '';
		let type = 'unknown';
		try {
			if (field instanceof PDFTextField) {
				type = 'text';
				value = field.getText() ?? '';
			} else if (field instanceof PDFCheckBox) {
				type = 'checkbox';
				value = field.isChecked() ? 'true' : 'false';
			} else if (field instanceof PDFDropdown || field instanceof PDFOptionList) {
				type = 'select';
				const sel = field.getSelected();
				value = Array.isArray(sel) ? sel.join('; ') : String(sel ?? '');
			} else if (field instanceof PDFRadioGroup) {
				type = 'radio';
				value = field.getSelected() ?? '';
			} else {
				type = field.constructor.name.replace(/^PDF/, '');
			}
		} catch {
			value = '';
		}
		out.push({ name, type, value });
	}

	return out;
}

export function fieldsToCsv(fields: ExtractedField[]): string {
	const header = 'name,type,value';
	const lines = fields.map(
		(f) =>
			`"${f.name.replace(/"/g, '""')}","${f.type}","${String(f.value).replace(/"/g, '""')}"`
	);
	return [header, ...lines].join('\n');
}

export function fieldsToJson(fields: ExtractedField[]): string {
	return JSON.stringify(fields, null, 2);
}
