# We Love PDF

A fast, privacy-friendly PDF toolkit built with SvelteKit. Merge, split, convert, edit, and secure PDF files — all in the browser. No uploads to a server; your files stay on your device.

Inspired by iLovePDF-style workflows, powered by [pdf-lib](https://pdf-lib.js.org/) and [EmbedPDF](https://www.embedpdf.com/).

## Features

**31 tools** across five categories:

### Organize PDF
| Tool | Route |
|------|-------|
| Merge PDF | `/tools/merge-pdf` |
| Split PDF | `/tools/split-pdf` |
| Extract Pages | `/tools/extract-pages` |
| Delete Pages | `/tools/delete-pages` |
| Organize PDF | `/tools/organize-pdf` |
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

## Tech stack

- **[SvelteKit 2](https://kit.svelte.dev/)** + **Svelte 5** (runes)
- **[Tailwind CSS v4](https://tailwindcss.com/)** + [shadcn-svelte](https://www.shadcn-svelte.com/) UI
- **[pdf-lib](https://pdf-lib.js.org/)** — merge, split, rotate, metadata, images, text layout
- **[EmbedPDF](https://www.embedpdf.com/)** — WASM PDF engine for viewing, rendering, text extraction, encryption
- **[fflate](https://github.com/101arrowz/fflate)** — ZIP downloads for batch and image export
- **[Vitest](https://vitest.dev/)** + **[Playwright](https://playwright.dev/)** for tests

## Recent features

- **ZIP export** for multi-page PDF → image conversion
- **Batch PDF** — process multiple files into one ZIP
- **Crop PDF**, **Redact PDF**, **Remove Metadata**, **Fill PDF Form**

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) (recommended)

### Install

```sh
pnpm install
cp .env.example .env
```

### Environment

| Variable | Description |
|----------|-------------|
| `PUBLIC_SITE_URL` | Public site URL for canonical links, Open Graph, and sitemap (e.g. `https://welovepdf.app`) |

### Development

```sh
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173).

### Production build

```sh
pnpm build
pnpm preview
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm preview` | Preview production build |
| `pnpm check` | Type-check with svelte-check |
| `pnpm lint` | Run Prettier + ESLint |
| `pnpm format` | Format with Prettier |
| `pnpm test:unit` | Run Vitest unit tests |
| `pnpm test:e2e` | Run Playwright e2e tests |
| `pnpm test` | Run all tests |

## Project structure

```
src/
├── lib/
│   ├── components/       # Shared UI + tool components
│   ├── pdf/
│   │   ├── operations.ts # pdf-lib operations
│   │   ├── convert.ts    # Text/HTML/Markdown conversion
│   │   └── security.ts   # Encryption helpers
│   ├── tools.ts          # Tool registry
│   └── tool-components.ts
├── routes/
│   ├── +page.svelte      # Homepage
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
pnpm exec vitest run src/__tests__/unit
```

E2E tests cover every tool page and key workflows:

```sh
pnpm test:e2e
```

Test fixtures are generated on demand in `src/__tests__/fixtures/` (gitignored).

## SEO

- Per-tool meta tags, Open Graph, and JSON-LD
- `/sitemap.xml` and `/robots.txt`
- Prerendered static pages

Set `PUBLIC_SITE_URL` in `.env` before deploying so canonical URLs resolve correctly.

## Adding a new tool

1. Add an entry to `src/lib/tools.ts`
2. Create `src/lib/components/tools/YourTool.svelte`
3. Register the lazy import in `src/lib/tool-components.ts`
4. Add to `engineTools` in the same file if the tool needs EmbedPDF
5. Add an icon in `src/lib/components/ToolIcon.svelte` (optional)

## License

Private project.
