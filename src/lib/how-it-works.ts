import type { PdfTool } from '$lib/tools';

const stepsBySlug: Record<string, string[]> = {
	'merge-pdf': [
		'Add two or more PDF files and drag to reorder them.',
		'Optionally insert a blank page between each file.',
		'Click Merge PDF and download the combined document.'
	],
	'compare-pdf': [
		'Upload the original PDF and the revised PDF.',
		'We extract text from each page in both files.',
		'Review per-page differences highlighted in the comparison view.'
	],
	'pdf-to-docx': [
		'Upload a PDF — text is extracted page by page.',
		'Each page becomes a heading with paragraphs in the Word file.',
		'Download the .docx — layout and images are not preserved.'
	],
	'excel-to-pdf': [
		'Upload an .xlsx or .xls spreadsheet.',
		'The first sheet is rendered as a table in the PDF.',
		'Adjust page size and font size, then download.'
	],
	'word-to-pdf': [
		'Upload a .docx Word file.',
		'Content is converted to HTML, then laid out as PDF.',
		'Download the PDF — complex layout and images may differ from Word.'
	],
	'powerpoint-to-pdf': [
		'Upload a .pptx presentation.',
		'Slide text is extracted and formatted as a PDF document.',
		'Download the PDF — images and animations are not included.'
	],
	'digital-sign-pdf': [
		'Upload the PDF and your .p12 / .pfx certificate.',
		'Enter the certificate password — it stays in your browser only.',
		'Download the PKCS#7 signed PDF, verifiable in Adobe Acrobat.'
	]
};

export function getHowItWorks(tool: PdfTool): string[] {
	return (
		tool.howItWorks ??
		stepsBySlug[tool.slug] ?? [
			'Upload your file using the drop zone or file picker.',
			'Adjust any options shown below.',
			'Click the action button to process your file.',
			'Download the result — processing stays in your browser.'
		]
	);
}
