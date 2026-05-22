---
name: docs-crawler
description: >-
  Crawl an entire documentation or design-system website into one LLM-ready
  Markdown corpus. Discovers every page from the site's sitemap.xml (with a
  same-origin link-following fallback when there is no sitemap), extracts each
  page's main content as clean Markdown, keeps images as their original
  external URLs, and renders JavaScript-heavy pages with a headless browser.
  Use this whenever someone wants the WHOLE of a multi-page docs site,
  design-system site, API reference, component library, or knowledge base
  turned into Markdown — for example "crawl this docs site", "turn this design
  system site into markdown", "make an LLM or RAG corpus from these docs",
  "mirror the entire documentation", "archive the whole knowledge base", or
  "give an AI the full X documentation". It applies even when the user never
  says the word "crawl" — any request to capture, ingest, archive, or convert
  a whole site's documentation pages into text fits. The design-md skill also
  calls it during research to gather a brand's published design-system docs.
  Do not use it for reading or summarizing a single page, for scraping
  structured data such as prices into a spreadsheet, or for generating a
  sitemap.
---

# docs-crawler

Crawl a documentation website into a single Markdown corpus that an LLM can
consume as context.

## When to use

The user wants to capture a multi-page documentation, design-system, or
reference site as Markdown — to feed an LLM, archive it, or research a design
system. This skill is also invoked by the `design-md` skill's research phase.

## Inputs

- **Site URL** (required) — the documentation site, e.g.
  `https://socarframe.socar.kr/`. Any page on the site works; page discovery
  starts from the site's `sitemap.xml`.
- **Output directory** (optional) — where to write the corpus. Defaults to
  `./{host}-docs/` in the current working directory.

If the user has not provided a URL, ask for one — do not guess.

## Running the crawl

From the repository root:

```
pnpm crawl:docs <site-url> [--out <dir>]
```

Equivalent direct form:

```
pnpm exec tsx .claude/skills/docs-crawler/scripts/crawl.ts <site-url> [--out <dir>]
```

The engine discovers pages via `sitemap.xml` (falling back to same-origin
link-following), fetches each page, extracts the main content, and converts it
to Markdown. It prints per-page progress and a final summary line.

## Output

Three artifacts are written under the output directory:

- **`crawl-corpus.md`** — every successful page merged into one document, with
  a table of contents and a `Source:` URL per page. This is the primary
  deliverable.
- **`crawl/pages/{NNN}-{slug}.md`** — one file per page, each with
  `source_url` / `title` / `method` frontmatter.
- **`crawl/manifest.json`** — a per-URL audit log (status, fetch method,
  extracted character count, error reason).

## After crawling

Report back to the user:

- How many pages succeeded versus failed (from the summary line or
  `crawl/manifest.json`).
- The path to `crawl-corpus.md`.
- If any pages failed, list them from the manifest with the reason (e.g.
  `disallowed by robots.txt`, `no extractable content`).

Do not paste the whole corpus into the conversation — point the user at the
file. The corpus can be large.

## Output location and the design-md skill

The `--out` argument controls where everything is written. When the `design-md`
skill calls this crawler during its research phase, it passes `--out` pointing
at its cache directory (`.claude/cache/design-md/{slug}/`), so the resulting
`crawl-corpus.md` lands where `research-collector` can read and cite it.
Nothing special is needed for that case — just run the crawl with the given
`--out`.

## Notes and edge cases

- **No sitemap** — discovery automatically falls back to following same-origin
  links from the start URL.
- **JavaScript-rendered sites** — if a page returns an empty shell, the engine
  re-fetches it through a headless browser. Chromium is installed automatically
  on first need (~150 MB, one-time). Static sites never launch a browser.
- **Images** are kept as their original external URLs — never downloaded.
  Inline `data:` URI images are the exception: the embedded base64 blob is
  replaced with an `inline-image-omitted` placeholder (alt and title text are kept),
  because raw base64 is unreadable to an LLM and would bloat the corpus.
- **Few or no images is normal, especially for design-system sites** — modern
  docs and design-system sites (Docusaurus and similar) render icons and
  component visuals as inline `<svg>`, CSS, or live DOM rather than `<img>`
  files; any real `<img>` (e.g. a navbar logo) is usually site chrome the
  content extractor correctly drops. An image-light or image-free corpus is
  expected in that case — it is not a crawl failure. Capture visuals separately
  (screenshots) if the research needs them.
- **robots.txt** is respected; disallowed paths are skipped.
- **Page cap** — at most 200 pages per crawl.
- **Zero pages crawled** — the engine exits non-zero and prints the reason
  (bad URL, blocked, or an empty site). Surface that to the user rather than
  reporting success.
