import { describe, expect, it } from "vitest"
import { htmlToMarkdown } from "./extract"

// A clearly article-shaped page so Readability's content-density heuristic
// reliably picks the <article> over the <nav>/<footer> chrome.
const ARTICLE_PAGE = `<!doctype html>
<html lang="en">
  <head><title>Button — Example Design System</title></head>
  <body>
    <nav><a href="/home">Home</a> <a href="/about">About the team</a></nav>
    <article>
      <h1>Button</h1>
      <p>The button component is the primary call to action across the entire
      product surface. It is available in three sizes — small, medium, and
      large — and supports both leading and trailing icons so that teams can
      compose the affordance that best fits their layout and density needs.</p>
      <p>Every button must carry a visible, descriptive label. Icon-only
      buttons are permitted only when an accessible name is supplied through
      an aria-label, because screen reader users otherwise have no way to know
      what the control actually does once activated.</p>
      <p>For the full set of available glyphs, see the
      <a href="/components/icon">icon component</a>. Spacing and color tokens
      used by the button are documented on the foundations reference page and
      should never be overridden with inline styles.</p>
      <img src="/assets/button-example.png" alt="A row of primary buttons">
      <img src="data:image/svg+xml;base64,PHN2Zy8+" alt="Inline status icon">
      <img src="data:image/svg+xml;base64,PHN2Zy8+" alt="Chart" title="Quarterly chart">
    </article>
    <footer>Copyright 2026 Example Incorporated. All rights reserved.</footer>
  </body>
</html>`

const PAGE_URL = "https://ds.example.com/components/button"

// A Docusaurus-style page: heading anchor link, breadcrumb + pagination
// chrome, and a Prism-highlighted code block whose lines are block spans.
const DOCUSAURUS_PAGE = `<!doctype html>
<html lang="en">
  <head><title>Installation — Acme UI</title></head>
  <body>
    <nav class="theme-doc-breadcrumbs"><a href="/">Home</a> / <a href="/docs">Docs</a></nav>
    <article>
      <h1>Installation<a class="hash-link" href="#installation" title="Direct link to Installation">​</a></h1>
      <p>Acme UI is distributed as a single npm package that bundles every
      component, hook, and design token the library provides. It targets
      React 18 and newer, and ships with first-class TypeScript types.</p>
      <p>Install the package with your preferred package manager. The snippet
      below shows both npm and pnpm so you can copy whichever one matches the
      setup of your existing project without thinking about it.</p>
      <pre><code><span class="token-line"># npm
</span><span class="token-line">npm install acme-ui
</span><span class="token-line"># pnpm
</span><span class="token-line">pnpm add acme-ui
</span></code></pre>
      <p>Once installed, import the global stylesheet exactly once at the root
      of your application so that component styles are available to every
      route without any further configuration.</p>
      <nav class="pagination-nav"><a href="/prev">Previous · Introduction</a><a href="/next">Next · Theming</a></nav>
    </article>
  </body>
</html>`

describe("htmlToMarkdown", () => {
  it("extracts the main article as markdown", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    expect(result.title).toContain("Button")
    expect(result.markdown).toContain("primary call to action")
    expect(result.chars).toBeGreaterThan(200)
  })

  it("keeps images as absolute external URLs", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    expect(result.markdown).toContain(
      "https://ds.example.com/assets/button-example.png"
    )
  })

  it("keeps base64 data-URI images so the crawler can localize them", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    // A base64 data URI has no spaces or parens, so it is safe inside markdown
    // link syntax. Extraction preserves it; crawl.ts later decodes it into a
    // local file (or, with --external-images, collapses it to a placeholder).
    expect(result.markdown).toContain(
      "![Inline status icon](data:image/svg+xml;base64,PHN2Zy8+)"
    )
  })

  it("preserves alt and title on base64 data-URI images", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    expect(result.markdown).toContain(
      '![Chart](data:image/svg+xml;base64,PHN2Zy8+ "Quarterly chart")'
    )
  })

  it("replaces non-base64 data-URI images with a placeholder", () => {
    // Percent-encoded (non-base64) data URIs can contain spaces/parens that
    // break markdown link syntax, so they are dropped to a placeholder.
    const page = `<!doctype html>
<html lang="en">
  <head><title>Inline SVG page</title></head>
  <body>
    <article>
      <h1>Heading</h1>
      <p>The accordion component groups related content into collapsible
      sections so that long reference pages stay scannable without burying the
      reader under every detail at once. Each section header toggles its panel.</p>
      <p>Use it sparingly: collapsing content the reader almost always needs
      adds a click for no benefit, and search engines may not index text that
      is hidden behind an interaction on first paint.</p>
      <img src="data:image/svg+xml,%3Csvg viewBox=%220 0 1 1%22%3E%3C/svg%3E" alt="Raw inline svg">
    </article>
  </body>
</html>`
    const result = htmlToMarkdown(page, "https://ds.example.com/accordion")
    expect(result.markdown).not.toContain("data:image/svg+xml,")
    expect(result.markdown).toContain("![Raw inline svg](inline-image-omitted)")
  })

  it("resolves relative links to absolute URLs", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    expect(result.markdown).toContain("https://ds.example.com/components/icon")
  })

  it("drops site chrome such as nav and footer", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    expect(result.markdown).not.toContain("About the team")
    expect(result.markdown).not.toContain("All rights reserved")
  })

  it("reports near-zero content for a JS shell page", () => {
    const shell = `<!doctype html><html><head><title>App</title></head>
      <body><div id="root"></div></body></html>`
    const result = htmlToMarkdown(shell, "https://spa.example.com/")
    expect(result.chars).toBeLessThan(200)
  })

  it("rebuilds code-block line breaks from highlighter line spans", () => {
    const result = htmlToMarkdown(DOCUSAURUS_PAGE, "https://acme.dev/install")
    // Highlighter line spans must rejoin on exactly one newline each — not
    // collapsed onto one line, and not doubled into blank lines.
    expect(result.markdown).toContain(
      "# npm\nnpm install acme-ui\n# pnpm\npnpm add acme-ui"
    )
    expect(result.markdown).not.toMatch(/npmnpm|acme-ui#\s?pnpm/)
  })

  it("strips documentation-site chrome (anchors, breadcrumbs, pager)", () => {
    const result = htmlToMarkdown(DOCUSAURUS_PAGE, "https://acme.dev/install")
    expect(result.markdown).toContain("single npm package")
    expect(result.markdown).not.toContain("Direct link to Installation")
    expect(result.markdown).not.toContain("Next · Theming")
  })
})
