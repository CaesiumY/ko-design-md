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
      "https://ds.example.com/assets/button-example.png",
    )
  })

  it("replaces inline data-URI images with a placeholder, keeping alt text", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    // A data: URI is an embedded blob, not a link — its base64 payload must
    // not leak into the corpus, where it is unreadable noise for an LLM.
    expect(result.markdown).not.toContain("data:image")
    // The alt text is the meaningful part and is preserved.
    expect(result.markdown).toContain(
      "![Inline status icon](inline-image-omitted)",
    )
  })

  it("preserves the title attribute on inline data-URI images", () => {
    const result = htmlToMarkdown(ARTICLE_PAGE, PAGE_URL)
    // A data: URI image must render exactly like any other image apart from
    // the src — including the optional title attribute.
    expect(result.markdown).toContain(
      '![Chart](inline-image-omitted "Quarterly chart")',
    )
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
      "# npm\nnpm install acme-ui\n# pnpm\npnpm add acme-ui",
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
