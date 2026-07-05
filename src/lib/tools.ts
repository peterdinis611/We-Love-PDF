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
		description: 'Add a text signature to the last page or every page of your PDF.',
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
	}
];

export function getTool(slug: string): PdfTool | undefined {
	return tools.find((t) => t.slug === slug);
}

export function getToolsByCategory(category: ToolCategory): PdfTool[] {
	return tools.filter((t) => t.category === category);
}
