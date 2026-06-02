// HTML -> Markdown extraction. Pure: deterministic, no I/O.

import { JSDOM } from "jsdom"
import { Readability } from "@mozilla/readability"
import TurndownService from "turndown"
import { INLINE_IMAGE_PLACEHOLDER, isBase64ImageDataUri } from "./images"

export interface ExtractResult {
  title: string
  /**
   * Clean Markdown of the main content. External images stay as absolute URLs
   * and base64 `data:` images are preserved inline; the crawler localizes both
   * afterward. Non-base64 data URIs are dropped to a placeholder here.
   */
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
 * absolute URLs — so external images end up as their original links. Base64
 * `data:` images are preserved inline (the crawler localizes them later);
 * non-base64 data URIs are dropped to a placeholder because their payloads can
 * contain characters that break markdown link syntax.
 */
export function htmlToMarkdown(html: string, pageUrl: string): ExtractResult {
  const dom = new JSDOM(html, { url: pageUrl })
  try {
    const doc = dom.window.document
    preprocessDom(doc)
    const fallbackTitle = doc.title.trim() || pageUrl

    const article = new Readability(doc).parse()
    // Keep base64 `data:` image sources (the crawler decodes them into local
    // files), but replace non-base64 data URIs with a placeholder so their raw,
    // possibly syntax-breaking payloads never reach the corpus. Rewriting
    // Readability's output (not the input DOM) keeps it ahead of Turndown so the
    // built-in image rule still renders alt/title.
    const contentHtml = (article?.content ?? "").replace(
      /src="(data:[^"]*)"/gi,
      (whole, uri: string) =>
        isBase64ImageDataUri(uri) ? whole : `src="${INLINE_IMAGE_PLACEHOLDER}"`,
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
