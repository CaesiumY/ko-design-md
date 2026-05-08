import { createHighlighter, type Highlighter } from "shiki"

const LANGS = ["markdown", "tsx", "ts", "bash"] as const
// Light theme to match the site's locked-light chrome — github-light keeps
// markdown readable while sitting calmly inside a hairline-bordered card.
const THEME = "github-light"

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [THEME],
      langs: [...LANGS],
    })
  }
  return highlighterPromise
}

export async function highlightRawMarkdown(code: string): Promise<string> {
  const h = await getHighlighter()
  return h.codeToHtml(code, { lang: "markdown", theme: THEME })
}
