# We Love PDF

A fast, privacy-friendly PDF toolkit built with SvelteKit. Merge, split, convert, edit, and secure PDF files — all in the browser. No uploads to a server; your files stay on your device.

Inspired by iLovePDF-style workflows, powered by [pdf-lib](https://pdf-lib.js.org/) and [EmbedPDF](https://www.embedpdf.com/).

## Features

**42 tools** across five categories:

### Organize PDF
| Tool | Route |
|------|-------|
| Merge PDF | `/tools/merge-pdf` |
| Split PDF | `/tools/split-pdf` |
| Extract Pages | `/tools/extract-pages` |
| Delete Pages | `/tools/delete-pages` |
| Organize PDF | `/tools/organize-pdf` |
| Compare PDF | `/tools/compare-pdf` |
| Duplicate Pages | `/tools/duplicate-pages` |
| Batch PDF | `/tools/batch-pdf` |
| View PDF | `/tools/view-pdf` |

### Optimize PDF
| Tool | Route |
|------|-------|
| Compress PDF | `/tools/compress-pdf` |
| PDF Info | `/tools/pdf-info` |
| Edit Metadata | `/tools/edit-metadata` |
| Remove Metadata | `/tools/remove-metadata` |

### Convert PDF
| Tool | Route |
|------|-------|
| Images to PDF | `/tools/images-to-pdf` |
| PDF to JPG | `/tools/pdf-to-jpg` |
| PDF to PNG | `/tools/pdf-to-png` |
| CSV to PDF | `/tools/csv-to-pdf` |
| JSON to PDF | `/tools/json-to-pdf` |
| XML to PDF | `/tools/xml-to-pdf` |
| Excel to PDF | `/tools/excel-to-pdf` |
| Word to PDF | `/tools/word-to-pdf` |
| PowerPoint to PDF | `/tools/powerpoint-to-pdf` |
| PDF to Word | `/tools/pdf-to-docx` |
| PDF to Text | `/tools/pdf-to-text` |
| PDF to HTML | `/tools/pdf-to-html` |
| Text to PDF | `/tools/txt-to-pdf` |
| HTML to PDF | `/tools/html-to-pdf` |
| Markdown to PDF | `/tools/markdown-to-pdf` |

### Edit PDF
| Tool | Route |
|------|-------|
| Rotate PDF | `/tools/rotate-pdf` |
| Watermark PDF | `/tools/watermark-pdf` |
| Page Numbers | `/tools/page-numbers` |
| Sign PDF | `/tools/sign-pdf` |
| Flatten PDF | `/tools/flatten-pdf` |
| Crop PDF | `/tools/crop-pdf` |
| Redact PDF | `/tools/redact-pdf` |
| Fill PDF Form | `/tools/fill-pdf-form` |

### PDF Security
| Tool | Route |
|------|-------|
| Protect PDF | `/tools/protect-pdf` |
| Unlock PDF | `/tools/unlock-pdf` |
| Change PDF Password | `/tools/change-pdf-password` |
| PDF Security Check | `/tools/pdf-security-check` |
| PDF Signature Check | `/tools/pdf-signature-check` |
| Digital Sign PDF | `/tools/digital-sign-pdf` |

## Tech stack

- **[SvelteKit 2](https://kit.svelte.dev/)** + **Svelte 5** (runes)
- **[Tailwind CSS v4](https://tailwindcss.com/)** + [shadcn-svelte](https://www.shadcn-svelte.com/) UI
- **[pdf-lib](https://pdf-lib.js.org/)** — merge, split, rotate, metadata, images, text layout
- **[EmbedPDF](https://www.embedpdf.com/)** — WASM PDF engine for viewing, rendering, text extraction, encryption
- **[fflate](https://github.com/101arrowz/fflate)** — ZIP downloads for batch and image export
- **[Vitest](https://vitest.dev/)** + **[Playwright](https://playwright.dev/)** for tests

## Guides & documentation

Step-by-step tutorials live at **`/guides`** (localized: `/sk/guides`, `/cs/guides`, …).

Built with **[fumadocs-svelte](https://github.com/jis3r/fumadocs-svelte)** + **mdsvex** (`.svx` files):

```
src/content/guides/
├── en/                    # English (default URLs: /guides/…)
│   ├── index.svx
│   ├── getting-started/
│   │   ├── index.svx
│   │   └── privacy.svx
│   ├── merge-pdf-free.svx
│   └── …
├── sk/                    # Slovak (/sk/guides/…)
└── cs/, de/, pl/
```

| Piece | Location |
|-------|----------|
| Content | `src/content/guides/{locale}/**/*.svx` |
| Source adapter | `src/lib/guides/source.ts` — `createFileSystemSource` |
| Layout | `src/lib/components/guides/GuidesDocsLayout.svelte` |
| Route | `src/routes/[[lang]]/guides/[...slug]/` |
| Tool ↔ guide map | `src/lib/guides/registry.ts` |

### Writing a guide

Create `src/content/guides/en/my-topic.svx`:

```markdown
---
title: My guide title
description: Short summary for SEO
relatedTool: merge-pdf
---

## Steps

1. …

> **Tip:** Helpful note for readers.
```

Copy or translate to other locale folders. Slugs are derived automatically for sitemap and prerender.

## Recent features

- **Word / PowerPoint to PDF** — mammoth (.docx) and PPTX text extraction
- **Digital Sign PDF** — PKCS#7 signing with .p12 / .pfx certificates in-browser
- **i18n (EN/SK)** — `/sk` routes with Slovak translations
- **SEO landing pages** — per-tool titles, FAQ schema, benefits sections
- **What's new badges** — highlight recently added tools
- **Plausible analytics** — optional page-view tracking (`PUBLIC_PLAUSIBLE_DOMAIN`)
- **Offline PWA** — caches WASM, JS, and app shell in service worker
- **PDF to Word**, **JSON/XML/Excel to PDF**, **Compare PDF**
- **Page thumbnails** on merge and organize tools
- **Favorites** and **How it works** panels on tool pages
- **URL options** in share links (`?scale=2&pages=1-3`)
- **Progress bars** for batch and multi-page ZIP exports
- **Organize PDF** — sort pages, remove blank pages, drag-and-drop
- **PDF to PNG** — lossless multi-page export as ZIP
- **CSV to PDF** — spreadsheet tables as formatted PDFs
- **PDF Signature Check** — inspect digital signature metadata
- **Share link** — copy tool URL from any tool page
- **Recent tools** — session history on the homepage (localStorage)
- **Organize PDF** — drag-and-drop page reordering
- **View PDF** — keyboard shortcuts (F, ?, arrow keys)
- **PWA** — installable app with offline shell caching
- **ZIP export** for multi-page PDF → image conversion
- **Batch PDF** — process multiple files into one ZIP
- **Crop PDF**, **Redact PDF**, **Remove Metadata**, **Fill PDF Form**

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [Bun](https://bun.sh/) (recommended)

### Install

```sh
bun install
cp .env.example .env
```

### Environment

| Variable | Description |
|----------|-------------|
| `PUBLIC_SITE_URL` | Public site URL for canonical links, Open Graph, and sitemap (e.g. `https://welovepdf.app`) |
| `PUBLIC_PLAUSIBLE_DOMAIN` | Optional Plausible domain for page-view analytics only (no file/upload tracking) |

### Development

```sh
bun dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```sh
bun run build
bun run preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `bun dev` | Start dev server |
| `bun run build` | Production build |
| `bun run preview` | Preview production build |
| `bun run check` | Type-check with svelte-check |
| `bun run lint` | Run Prettier + ESLint |
| `bun run format` | Format with Prettier |
| `bun run test:unit` | Run Vitest unit tests |
| `bun run test:e2e` | Run Playwright e2e tests |
| `bun run test` | Run all tests |

## Project structure

```
src/
├── lib/
│   ├── components/       # Shared UI + tool components
│   ├── pdf/
│   │   ├── operations.ts # pdf-lib operations
│   │   ├── convert.ts    # Text/HTML/Markdown conversion
│   │   └── security.ts   # Encryption helpers
│   ├── guides/           # Fumadocs source + registry
│   ├── components/guides/# Docs layout, TOC, callouts
│   └── tool-seo.ts       # Per-tool SEO + FAQ
├── content/guides/       # .svx guide content (5 locales)
├── routes/
│   ├── [[lang]]/+page.svelte
│   ├── [[lang]]/guides/[...slug]/
│   └── tools/[slug]/     # Dynamic tool pages
└── __tests__/
    ├── unit/             # Vitest tests
    ├── e2e/              # Playwright tests
    └── helpers/          # Test fixtures
```

## How it works

Most tools run **entirely client-side**:

- **pdf-lib** handles structural PDF work (pages, metadata, watermarks, image embedding).
- **EmbedPDF (PDFium WASM)** handles rendering, text extraction, form flattening, and AES encryption.

Tools that need the WASM engine are lazy-loaded via `PdfEngineProvider` to keep the initial bundle smaller.

## Testing

Unit tests live in `src/__tests__/unit/`:

```sh
bunx vitest run src/__tests__/unit
```

E2E tests cover every tool page and key workflows:

```sh
bun run test:e2e
```

Test fixtures are generated on demand in `src/__tests__/fixtures/` (gitignored).

## SEO & growth

- Per-tool landing sections (benefits, FAQ) with JSON-LD FAQ schema
- Custom SEO copy for high-intent tools (`merge pdf free`, `pdf to png`, etc.) in `src/lib/tool-seo.ts`
- **i18n** — English at `/`, Slovak at `/sk` with `hreflang` alternates
- `/sitemap.xml` includes both locales
- Prerendered static pages
- **What's new** badges on recently added tools (`src/lib/changelog.ts`)

Set `PUBLIC_SITE_URL` in `.env` before deploying so canonical URLs resolve correctly.

## Adding a new tool

1. Add an entry to `src/lib/tools.ts`
2. Create `src/lib/components/tools/YourTool.svelte`
3. Register the lazy import in `src/lib/tool-components.ts`
4. Add to `engineTools` in the same file if the tool needs EmbedPDF
5. Add an icon in `src/lib/components/ToolIcon.svelte` (optional)

## License

Private project.
