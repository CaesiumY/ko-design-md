import { describe, expect, it } from "vitest"
import { splitMergedPreview } from "./preview-halves"
import { validatePreviewPair } from "./preview-validator"
import type { ValidationIssue } from "./draft-validator"
import type { PreviewValidationInput } from "./preview-validator"

// The dark sheet of a merged preview should say only what dark changes (ADR
// 0015). These tests hold the validator to that through the same parse the
// shipping gate uses: a merged file is written, dealt out by
// `splitMergedPreview`, and judged by `validatePreviewPair`.

const RULE = "dark-sheet-copy"

const DESIGN_MD = [
  "---",
  "name: 데모",
  "slug: demo",
  "category: finance",
  'last_updated: "2026-07-03"',
  "lang: ko",
  "logo: https://getdesign.kr/logos/demo.png",
  "colors:",
  "  primary: oklch(0.62 0.18 250)",
  "fonts:",
  "  sans: Pretendard Variable, sans-serif",
  "---",
  "",
  "# 데모",
  "",
  "## Colors",
  "",
  "## Typography",
  "",
  "## Components",
].join("\n")

/** A merged preview: the page's own sheet, then the dark sheet, last in head. */
function mergedFile(light: string, dark: string): string {
  return [
    "<!doctype html>",
    '<html lang="ko" data-theme="light">',
    "<head>",
    '<meta charset="utf-8">',
    `<style>${light}</style>`,
    `<style>${dark}</style>`,
    "</head>",
    '<body><main class="hero"><h1>데모</h1><button class="btn">확인</button></main></body>',
    "</html>",
  ].join("\n")
}

function mergedInput(
  light: string,
  dark: string,
  overrides: Partial<PreviewValidationInput> = {}
): PreviewValidationInput {
  const html = mergedFile(light, dark)
  const halves = splitMergedPreview(html, Buffer.byteLength(html))
  return {
    slug: "demo",
    lightRaw: halves.light,
    darkRaw: halves.dark,
    lightBytes: halves.lightBytes,
    darkBytes: halves.darkBytes,
    served: halves.served,
    variantAnchors: halves.variantAnchors,
    designMdRaw: DESIGN_MD,
    ...overrides,
  }
}

function found(input: PreviewValidationInput): Array<ValidationIssue> {
  return validatePreviewPair(input).issues.filter((i) => i.rule === RULE)
}

const LIGHT = [
  ":root { --bg: oklch(1 0 0); --fg: oklch(0.2 0 0); }",
  ".hero { padding: 24px; background: var(--bg); color: var(--fg); }",
  ".btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.62 0.18 250); }",
  ".btn:hover { background: oklch(0.56 0.18 250); }",
].join("\n")

const DARK_TOKENS =
  '[data-theme="dark"] { --bg: oklch(0.2 0 0); --fg: oklch(0.96 0 0); }'

describe("dark-sheet-copy", () => {
  it("names a dark rule that repeats its light rule", () => {
    const issues = found(
      mergedInput(
        LIGHT,
        [
          DARK_TOKENS,
          '[data-theme="dark"] .hero { padding: 24px; background: var(--bg); color: var(--fg); }',
        ].join("\n")
      )
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].fix).toContain(".hero")
  })

  it("stays quiet on a dark sheet that only redefines tokens", () => {
    expect(found(mergedInput(LIGHT, DARK_TOKENS))).toEqual([])
  })

  // The token block is where dark is meant to be written, so a token carried
  // along at its light value beside the ones that change is not the finding.
  it("stays quiet on a token redeclared at its light value beside changed ones", () => {
    expect(
      found(
        mergedInput(
          LIGHT,
          '[data-theme="dark"] { --bg: oklch(0.2 0 0); --fg: oklch(0.2 0 0); }'
        )
      )
    ).toEqual([])
  })

  it("stays quiet on a colour rule that differs from light", () => {
    expect(
      found(
        mergedInput(
          LIGHT,
          `${DARK_TOKENS}\n[data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`
        )
      )
    ).toEqual([])
  })

  // A half-walked rule: the colour was retuned, the layout came along with it.
  it("names a rule that changes a colour but still carries light's other declarations", () => {
    const issues = found(
      mergedInput(
        LIGHT,
        `${DARK_TOKENS}\n[data-theme="dark"] .btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.7 0.15 250); }`
      )
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].fix).toContain(".btn")
  })

  it("reads spacing the merge reserialised as the same rule", () => {
    expect(
      found(
        mergedInput(
          ".hero{padding:24px;color:var(--fg)}",
          `${DARK_TOKENS}\n[data-theme="dark"] .hero {\n  padding: 24px;\n  color:  var(--fg);\n}`
        )
      )
    ).toHaveLength(1)
  })

  it("pairs a rule only with the light rule under the same at-rule", () => {
    const light = `${LIGHT}\n@media (max-width: 720px) { .hero { padding: 12px; } }`
    // Same selector, same declaration as the @media rule — but at the top
    // level, where light says 24px. Dark changes something here.
    expect(
      found(
        mergedInput(
          light,
          `${DARK_TOKENS}\n[data-theme="dark"] .hero { padding: 12px; }`
        )
      )
    ).toEqual([])
    const issues = found(
      mergedInput(
        light,
        `${DARK_TOKENS}\n@media (max-width: 720px) { [data-theme="dark"] .hero { padding: 12px; } }`
      )
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].fix).toContain("@media (max-width: 720px) / .hero")
  })

  // A copied sheet repeats a selector as often as light does, in the same
  // order. Folding light's duplicates into one would read the first dark `.btn`
  // as a change (light "ends up" with the second rule's value) and miss it.
  it("pairs a selector written twice by position", () => {
    const light = [
      ".btn { background: oklch(0.62 0.18 250); }",
      ".btn { background: oklch(0.5 0.18 250); }",
    ].join("\n")
    const dark = [
      DARK_TOKENS,
      '[data-theme="dark"] .btn { background: oklch(0.62 0.18 250); }',
      '[data-theme="dark"] .btn { background: oklch(0.5 0.18 250); }',
    ].join("\n")
    expect(found(mergedInput(light, dark))[0]?.fix).toContain("2 light rule(s)")
  })

  it("names an at-rule block light already carries word for word", () => {
    const spin = "@keyframes spin { to { transform: rotate(360deg); } }"
    const issues = found(
      mergedInput(`${LIGHT}\n${spin}`, `${DARK_TOKENS}\n${spin}`)
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].fix).toContain("@keyframes spin")
  })

  it("reports once per document, with a count and the first rules", () => {
    const dark = [
      DARK_TOKENS,
      '[data-theme="dark"] .hero { padding: 24px; background: var(--bg); color: var(--fg); }',
      '[data-theme="dark"] .btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.62 0.18 250); }',
      '[data-theme="dark"] .btn:hover { background: oklch(0.56 0.18 250); }',
      '[data-theme="dark"] :root { --bg: oklch(1 0 0); }',
    ].join("\n")
    const light = `${LIGHT}\n:root :root { --bg: oklch(1 0 0); }`
    const issues = found(mergedInput(light, dark))
    expect(issues).toHaveLength(1)
    expect(issues[0].fix).toContain("restates 4 light rule(s)")
    expect(issues[0].fix).toContain(".hero; .btn; .btn:hover and 1 more")
  })

  // The remedy is the half an author acts on. Deleting a same-valued dark rule
  // can change the dark rendering, so the message has to say tokens and say
  // compare — and point at the tool by the name it is run with.
  it("says to move colours into tokens and to compare the rendering", () => {
    const [issue] = found(
      mergedInput(
        LIGHT,
        `${DARK_TOKENS}\n[data-theme="dark"] .btn:hover { background: oklch(0.56 0.18 250); }`
      )
    )
    expect(issue.fix).toContain("custom property")
    expect(issue.fix).toContain("Do not delete on sight")
    expect(issue.fix).toContain("pnpm preview:dom-diff")
  })
})

describe("dark-sheet-copy — the split layout", () => {
  // A split pair's dark file is the whole page: it must carry every structural
  // rule itself, and every one of them is also in light. Not a copy.
  it("stays quiet on two files that share their structural CSS", () => {
    const page = (theme: string, bg: string) =>
      `<!doctype html><html lang="ko" data-theme="${theme}"><head><style>:root { --bg: ${bg}; } .hero { padding: 24px; }</style></head><body><main class="hero"><h1>데모</h1></main></body></html>`
    const light = page("light", "oklch(1 0 0)")
    const dark = page("dark", "oklch(0.2 0 0)")
    const issues = validatePreviewPair({
      slug: "demo",
      lightRaw: light,
      darkRaw: dark,
      lightBytes: Buffer.byteLength(light),
      darkBytes: Buffer.byteLength(dark),
      served: [
        { name: "light.html", html: light, bytes: Buffer.byteLength(light) },
        { name: "dark.html", html: dark, bytes: Buffer.byteLength(dark) },
      ],
      variantAnchors: [],
      designMdRaw: DESIGN_MD,
    }).issues.filter((i) => i.rule === RULE)
    expect(issues).toEqual([])
  })
})

describe("dark-sheet-copy — the not-yet-walked list", () => {
  const COPY = `${DARK_TOKENS}\n[data-theme="dark"] .btn:hover { background: oklch(0.56 0.18 250); }`
  const severityOf = (dark: string, backlog: Array<string>) =>
    validatePreviewPair(
      mergedInput(LIGHT, dark, { darkCopyBacklog: new Set(backlog) })
    )
      .issues.filter(
        (i) =>
          i.rule === "dark-sheet-copy" || i.rule === "dark-copy-backlog-stale"
      )
      .map((i) => `${i.severity} ${i.rule}`)

  it("warns on a copy in a listed slug", () => {
    expect(severityOf(COPY, ["demo"])).toEqual(["warn dark-sheet-copy"])
  })

  it("blocks a copy in a slug that is not listed", () => {
    expect(severityOf(COPY, ["other"])).toEqual(["block dark-sheet-copy"])
  })

  it("blocks a listed slug that has nothing left to walk, naming the list", () => {
    expect(severityOf(DARK_TOKENS, ["demo"])).toEqual([
      "block dark-copy-backlog-stale",
    ])
    const issue = validatePreviewPair(
      mergedInput(LIGHT, DARK_TOKENS, { darkCopyBacklog: new Set(["demo"]) })
    ).issues.find((i) => i.rule === "dark-copy-backlog-stale")
    expect(issue?.fix).toContain("DARK_COPY_BACKLOG")
    expect(issue?.fix).toContain("src/lib/dark-sheet-backlog.ts")
  })

  it("says nothing about an unlisted slug with no copy", () => {
    expect(severityOf(DARK_TOKENS, ["other"])).toEqual([])
  })

  // A fixture that passes no list reads the recorded one, and `demo` is not a
  // catalogue slug — so the default is "not listed", which blocks.
  it("reads the recorded list when the caller passes none", () => {
    expect(
      validatePreviewPair(mergedInput(LIGHT, COPY))
        .issues.filter((i) => i.rule === RULE)
        .map((i) => i.severity)
    ).toEqual(["block"])
  })
})
