import { createHighlighter, type Highlighter } from "shiki"

const LANGS = ["markdown", "tsx", "ts", "bash"] as const
const THEME = "github-dark-dimmed"

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
