export type ToolCategory = 'organize' | 'optimize' | 'convert' | 'edit' | 'security';

export interface PdfTool {
	slug: string;
	name: string;
	description: string;
	category: ToolCategory;
	icon: string;
	color: string;
	available: boolean;
	multiple?: boolean;
	accept?: string;
	howItWorks?: string[];
}

export const categoryLabels: Record<ToolCategory, string> = {
	organize: 'Organize PDF',
	optimize: 'Optimize PDF',
	convert: 'Convert PDF',
	edit: 'Edit PDF',
	security: 'PDF Security'
};

export const tools: PdfTool[] = [
	{
		slug: 'merge-pdf',
		name: 'Merge PDF',
		description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
		category: 'organize',
		icon: 'merge',
		color: 'bg-red-500',
		available: true,
		multiple: true
	},
	{
		slug: 'split-pdf',
		name: 'Split PDF',
		description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
		category: 'organize',
		icon: 'split',
		color: 'bg-orange-500',
		available: true
	},
	{
		slug: 'extract-pages',
		name: 'Extract Pages',
		description: 'Select and extract specific pages from your PDF into a new document.',
		category: 'organize',
		icon: 'extract',
		color: 'bg-amber-500',
		available: true
	},
	{
		slug: 'delete-pages',
		name: 'Delete Pages',
		description: 'Remove unwanted pages from your PDF and download the cleaned document.',
		category: 'organize',
		icon: 'delete',
		color: 'bg-yellow-500',
		available: true
	},
	{
		slug: 'organize-pdf',
		name: 'Organize PDF',
		description: 'Sort pages of your PDF file however you like. Delete or add pages as needed.',
		category: 'organize',
		icon: 'organize',
		color: 'bg-lime-500',
		available: true
	},
	{
		slug: 'compare-pdf',
		name: 'Compare PDF',
		description: 'Compare two PDFs and highlight text differences page by page.',
		category: 'organize',
		icon: 'compare',
		color: 'bg-lime-600',
		available: true,
		multiple: true
	},
	{
		slug: 'view-pdf',
		name: 'View PDF',
		description: 'Open and read PDF documents with a fast, full-featured viewer powered by EmbedPDF.',
		category: 'organize',
		icon: 'view',
		color: 'bg-rose-500',
		available: true
	},
	{
		slug: 'duplicate-pages',
		name: 'Duplicate Pages',
		description: 'Copy selected pages and append them to the end of your PDF document.',
		category: 'organize',
		icon: 'duplicate',
		color: 'bg-pink-500',
		available: true
	},
	{
		slug: 'batch-pdf',
		name: 'Batch PDF',
		description: 'Process multiple PDFs at once — compress, rotate, flatten, or remove metadata — and download as ZIP.',
		category: 'organize',
		icon: 'batch',
		color: 'bg-rose-600',
		available: true,
		multiple: true
	},
	{
		slug: 'compress-pdf',
		name: 'Compress PDF',
		description: 'Reduce file size by optimizing and stripping unnecessary metadata.',
		category: 'optimize',
		icon: 'compress',
		color: 'bg-green-500',
		available: true
	},
	{
		slug: 'pdf-info',
		name: 'PDF Info',
		description: 'Inspect metadata, page count, author, and other document properties.',
		category: 'optimize',
		icon: 'info',
		color: 'bg-emerald-500',
		available: true
	},
	{
		slug: 'edit-metadata',
		name: 'Edit Metadata',
		description: 'Update title, author, subject, and keywords in your PDF document properties.',
		category: 'optimize',
		icon: 'metadata',
		color: 'bg-cyan-500',
		available: true
	},
	{
		slug: 'remove-metadata',
		name: 'Remove Metadata',
		description: 'Strip title, author, subject, and other document properties for privacy.',
		category: 'optimize',
		icon: 'scrub',
		color: 'bg-teal-600',
		available: true
	},
	{
		slug: 'images-to-pdf',
		name: 'Images to PDF',
		description: 'Convert JPG and PNG images into a single PDF document.',
		category: 'convert',
		icon: 'images',
		color: 'bg-teal-500',
		available: true,
		multiple: true,
		accept: 'image/jpeg,image/png,.jpg,.jpeg,.png'
	},
	{
		slug: 'pdf-to-jpg',
		name: 'PDF to JPG',
		description: 'Convert PDF pages to PNG or JPEG images with adjustable quality.',
		category: 'convert',
		icon: 'image',
		color: 'bg-violet-500',
		available: true
	},
	{
		slug: 'pdf-to-png',
		name: 'PDF to PNG',
		description: 'Convert every PDF page to lossless PNG images and download as a ZIP archive.',
		category: 'convert',
		icon: 'png',
		color: 'bg-purple-500',
		available: true
	},
	{
		slug: 'csv-to-pdf',
		name: 'CSV to PDF',
		description: 'Turn CSV spreadsheet data into a formatted PDF table.',
		category: 'convert',
		icon: 'csv',
		color: 'bg-indigo-500',
		available: true,
		accept: '.csv,text/csv'
	},
	{
		slug: 'json-to-pdf',
		name: 'JSON to PDF',
		description: 'Convert JSON arrays or objects into a readable PDF table.',
		category: 'convert',
		icon: 'json',
		color: 'bg-blue-500',
		available: true,
		accept: '.json,application/json'
	},
	{
		slug: 'xml-to-pdf',
		name: 'XML to PDF',
		description: 'Turn structured XML data into a formatted PDF table.',
		category: 'convert',
		icon: 'xml',
		color: 'bg-sky-500',
		available: true,
		accept: '.xml,text/xml,application/xml'
	},
	{
		slug: 'excel-to-pdf',
		name: 'Excel to PDF',
		description: 'Convert the first Excel worksheet into a PDF table.',
		category: 'convert',
		icon: 'excel',
		color: 'bg-cyan-500',
		available: true,
		accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
	},
	{
		slug: 'word-to-pdf',
		name: 'Word to PDF',
		description: 'Convert .docx Word documents to PDF via HTML (basic formatting preserved).',
		category: 'convert',
		icon: 'word',
		color: 'bg-blue-600',
		available: true,
		accept: '.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	},
	{
		slug: 'powerpoint-to-pdf',
		name: 'PowerPoint to PDF',
		description: 'Convert .pptx slide text into a readable PDF document.',
		category: 'convert',
		icon: 'powerpoint',
		color: 'bg-orange-600',
		available: true,
		accept: '.pptx,application/vnd.openxmlformats-officedocument.presentationml.presentation'
	},
	{
		slug: 'pdf-to-docx',
		name: 'PDF to Word',
		description: 'Extract PDF text into an editable Word (.docx) document.',
		category: 'convert',
		icon: 'docx',
		color: 'bg-violet-600',
		available: true
	},
	{
		slug: 'pdf-to-text',
		name: 'PDF to Text',
		description: 'Extract readable text content from your PDF document.',
		category: 'convert',
		icon: 'text',
		color: 'bg-fuchsia-500',
		available: true
	},
	{
		slug: 'pdf-to-html',
		name: 'PDF to HTML',
		description: 'Convert PDF text content into a clean HTML or Markdown document.',
		category: 'convert',
		icon: 'html',
		color: 'bg-orange-500',
		available: true
	},
	{
		slug: 'txt-to-pdf',
		name: 'Text to PDF',
		description: 'Turn plain text into a formatted PDF document.',
		category: 'convert',
		icon: 'txt',
		color: 'bg-lime-500',
		available: true,
		accept: '.txt,text/plain'
	},
	{
		slug: 'html-to-pdf',
		name: 'HTML to PDF',
		description: 'Convert HTML pages into a PDF with headings, lists, and paragraphs.',
		category: 'convert',
		icon: 'html',
		color: 'bg-amber-500',
		available: true,
		accept: '.html,text/html'
	},
	{
		slug: 'markdown-to-pdf',
		name: 'Markdown to PDF',
		description: 'Convert Markdown files into a styled PDF document.',
		category: 'convert',
		icon: 'markdown',
		color: 'bg-yellow-500',
		available: true,
		accept: '.md,.markdown,text/markdown'
	},
	{
		slug: 'rotate-pdf',
		name: 'Rotate PDF',
		description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once.',
		category: 'edit',
		icon: 'rotate',
		color: 'bg-blue-500',
		available: true
	},
	{
		slug: 'watermark-pdf',
		name: 'Watermark PDF',
		description: 'Add a text watermark to every page of your PDF document.',
		category: 'edit',
		icon: 'watermark',
		color: 'bg-indigo-500',
		available: true
	},
	{
		slug: 'page-numbers',
		name: 'Page Numbers',
		description: 'Add page numbers to the bottom of every page in your PDF.',
		category: 'edit',
		icon: 'numbers',
		color: 'bg-purple-500',
		available: true
	},
	{
		slug: 'sign-pdf',
		name: 'Sign PDF',
		description: 'Add a visible text signature to the last page or every page (not a digital certificate).',
		category: 'edit',
		icon: 'sign',
		color: 'bg-sky-500',
		available: true
	},
	{
		slug: 'flatten-pdf',
		name: 'Flatten PDF',
		description: 'Flatten form fields and annotations into the page content for sharing.',
		category: 'edit',
		icon: 'flatten',
		color: 'bg-stone-500',
		available: true
	},
	{
		slug: 'crop-pdf',
		name: 'Crop PDF',
		description: 'Trim page margins by adjusting the crop box on selected pages.',
		category: 'edit',
		icon: 'crop',
		color: 'bg-stone-600',
		available: true
	},
	{
		slug: 'redact-pdf',
		name: 'Redact PDF',
		description: 'Permanently remove sensitive words and phrases from your PDF.',
		category: 'edit',
		icon: 'redact',
		color: 'bg-stone-700',
		available: true
	},
	{
		slug: 'fill-pdf-form',
		name: 'Fill PDF Form',
		description: 'Fill interactive PDF form fields and download the completed document.',
		category: 'edit',
		icon: 'form',
		color: 'bg-stone-800',
		available: true
	},
	{
		slug: 'protect-pdf',
		name: 'Protect PDF',
		description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
		category: 'security',
		icon: 'lock',
		color: 'bg-slate-600',
		available: true
	},
	{
		slug: 'unlock-pdf',
		name: 'Unlock PDF',
		description: 'Remove PDF password protection using the correct password.',
		category: 'security',
		icon: 'unlock',
		color: 'bg-slate-500',
		available: true
	},
	{
		slug: 'change-pdf-password',
		name: 'Change PDF Password',
		description: 'Replace the password on an encrypted PDF and update permission settings.',
		category: 'security',
		icon: 'key',
		color: 'bg-slate-700',
		available: true
	},
	{
		slug: 'pdf-security-check',
		name: 'PDF Security Check',
		description: 'Inspect whether a PDF is encrypted and what actions are allowed.',
		category: 'security',
		icon: 'shield',
		color: 'bg-slate-800',
		available: true
	},
	{
		slug: 'pdf-signature-check',
		name: 'PDF Signature Check',
		description: 'See if a PDF is digitally signed and inspect signature details.',
		category: 'security',
		icon: 'signature',
		color: 'bg-slate-900',
		available: true
	},
	{
		slug: 'digital-sign-pdf',
		name: 'Digital Sign PDF',
		description: 'Apply a PKCS#7 digital signature using your .p12 or .pfx certificate.',
		category: 'security',
		icon: 'cert',
		color: 'bg-slate-950',
		available: true
	}
];

export function getTool(slug: string): PdfTool | undefined {
	return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): PdfTool[] {
	return tools.filter((t) => t.category === category);
}
