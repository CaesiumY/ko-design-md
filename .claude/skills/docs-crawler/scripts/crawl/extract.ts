// HTML -> Markdown extraction. Pure: deterministic, no I/O.

import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"

export interface ExtractResult {
  title: string
  /** Clean Markdown of the main content, images kept as external URLs. */
  markdown: string
  /** Length of extracted plain text — used to detect JS-shell pages. */
  chars: number
}

// Documentation-site chrome that Readability frequently leaves inside the
// article: heading anchor links, breadcrumbs, prev/next pagers, "edit this
// page" links, and the in-page table of contents. On non-matching sites
// these selectors simply match nothing.
const CHROME_SELECTORS = [
  "a.hash-link",
  ".theme-doc-breadcrumbs",
  ".pagination-nav",
  ".theme-edit-this-page",
  ".table-of-contents",
]

/**
 * Clean a documentation page's DOM before extraction:
 *
 *  1. Remove residual doc-site chrome elements.
 *  2. Rebuild code-block line breaks. Syntax highlighters (Prism / Docusaurus
 *     `.token-line`, Shiki `.line`) render each code line as its own span. A
 *     naive `textContent` read collapses the block onto one line (e.g.
 *     `npm installnpm...`); and where the spans carry their own trailing
 *     newline, joining naively doubles every break into a blank line. We
 *     strip each line's trailing newline and re-join on exactly one, keeping
 *     a `<pre><code>` wrapper so Turndown still emits a fenced code block.
 *
 * This must run before Readability, which strips class attributes — the
 * `.token-line` / `.line` signal only exists on the raw DOM.
 */
function preprocessDom(doc: Document): void {
  for (const selector of CHROME_SELECTORS) {
    for (const el of doc.querySelectorAll(selector)) el.remove()
  }
  for (const pre of doc.querySelectorAll("pre")) {
    for (const br of pre.querySelectorAll("br")) br.replaceWith("\n")
    const lineEls = pre.querySelectorAll(".token-line, .line")
    if (lineEls.length === 0) continue
    const code = Array.from(lineEls)
      .map((line) => (line.textContent ?? "").replace(/[\r\n]+$/, ""))
      .join("\n")
    const codeEl = pre.querySelector("code") ?? doc.createElement("code")
    codeEl.textContent = code
    pre.replaceChildren(codeEl)
  }
}

// Placeholder substituted for inline `data:` URI image sources — see
// htmlToMarkdown for the rewrite and its rationale.
const DATA_URI_PLACEHOLDER = "inline-image-omitted"

function createTurndown(): TurndownService {
  return new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
    bulletListMarker: "-",
    hr: "---",
    emDelimiter: "_",
  })
}

/**
 * Extract the main content of an HTML page as Markdown.
 *
 * `preprocessDom` runs first to drop doc-site chrome and repair code blocks.
 * Readability then strips nav/sidebar/footer chrome and, because the JSDOM is
 * constructed with the real page URL, rewrites relative `href`/`src` to
 * absolute URLs — so images end up as their original external links rather
 * than being downloaded.
 */
export function htmlToMarkdown(html: string, pageUrl: string): ExtractResult {
  const dom = new JSDOM(html, { url: pageUrl })
  try {
    const doc = dom.window.document
    preprocessDom(doc)
    const fallbackTitle = doc.title.trim() || pageUrl

    const article = new Readability(doc).parse()
    // Replace inline `data:` URI image sources with a placeholder. A data: URI
    // embeds the image as a base64 blob that would flood the corpus with bytes
    // an LLM cannot read. Rewriting Readability's output (not the input DOM)
    // avoids the placeholder being resolved into a bogus absolute URL, and
    // keeps it ahead of Turndown so the built-in image rule renders alt/title.
    const contentHtml = (article?.content ?? "").replace(
      /src="data:[^"]*"/gi,
      `src="${DATA_URI_PLACEHOLDER}"`,
    )
    const markdown = contentHtml
      ? createTurndown().turndown(contentHtml).trim()
      : ""
    const text = (article?.textContent ?? "").trim()

    return {
      title: (article?.title ?? "").trim() || fallbackTitle,
      markdown,
      chars: text.length,
    }
  } finally {
    // Release the jsdom window so large crawls don't accumulate memory.
    dom.window.close()
  }
}
