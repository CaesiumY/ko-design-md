import { createHighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import markdownLang from "shiki/langs/markdown.mjs"
import githubLightTheme from "shiki/themes/github-light.mjs"
import type { HighlighterCore } from "shiki/core"

// Light theme to match the site's locked-light chrome — github-light keeps
// markdown readable while sitting calmly inside a hairline-bordered card.
const THEME = "github-light"

let highlighterPromise: Promise<HighlighterCore> | null = null

function getHighlighter(): Promise<HighlighterCore> {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      engine: createJavaScriptRegexEngine(),
      langs: [markdownLang],
      themes: [githubLightTheme],
    })
  }
  return highlighterPromise
}

export async function highlightRawMarkdown(code: string): Promise<string> {
  const h = await getHighlighter()
  return h.codeToHtml(code, { lang: "markdown", theme: THEME })
}
