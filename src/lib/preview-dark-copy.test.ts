import { describe, expect, it } from "vitest"
import { splitMergedPreview } from "./preview-halves"
import { darkSheetReport, validatePreviewPair } from "./preview-validator"
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

// The layout deals only the LAST sheet out as "the dark sheet". A dark-scoped
// rule written in a sheet before it stays in the light half, scope and all —
// and is a dark rule all the same. Where it sits must not decide whether it is
// read.
describe("dark rules a light sheet carries", () => {
  const report = (light: string, dark: string) => {
    const html = mergedFile(light, dark)
    const halves = splitMergedPreview(html, Buffer.byteLength(html))
    return darkSheetReport(halves.light, halves.dark)
  }

  it("names one that repeats its light rule, as it is written", () => {
    const issues = found(
      mergedInput(
        `${LIGHT}\n[data-theme="dark"] .btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.62 0.18 250); }`,
        DARK_TOKENS
      )
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].fix).toContain('[data-theme="dark"] .btn')
  })

  it("counts one that sets something outside tokens", () => {
    expect(
      report(
        `${LIGHT}\n[data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`,
        DARK_TOKENS
      )
    ).toEqual({ copies: [], overrideRules: 1 })
  })

  // An at-rule's name is the same rule in any case. One the walk did not open
  // would keep its rules from both the count and the copy check.
  it("counts one under an at-rule whose name is in capitals", () => {
    expect(
      report(
        `${LIGHT}\n@MEDIA (min-width: 1px) { [data-theme="dark"] .btn { background: oklch(0.7 0.15 250); } }`,
        DARK_TOKENS
      )
    ).toEqual({ copies: [], overrideRules: 1 })
  })

  it("leaves a token block there uncounted", () => {
    expect(
      report(
        `${LIGHT}\n[data-theme="dark"] { --bg: oklch(0.2 0 0); --fg: oklch(0.96 0 0); }`,
        '[data-theme="dark"] .hero { outline: 1px solid var(--fg); }'
      )
    ).toEqual({ copies: [], overrideRules: 1 })
  })

  // Each group lines up with light on its own, so what a light sheet carries
  // cannot move the pairing the dark sheet already had.
  it("does not move how the dark sheet's own rules pair", () => {
    expect(
      report(
        `${LIGHT}\n[data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`,
        `${DARK_TOKENS}\n[data-theme="dark"] .btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.62 0.18 250); }`
      )
    ).toEqual({ copies: [".btn"], overrideRules: 1 })
  })

  // …and the other way round: the dark sheet's rules do not use up the
  // position one of these is paired at. Counted together, the rule below
  // would be read against light's second `.btn` and its repeated padding
  // would pass for a change.
  it("pairs one with light by its own position, not after the dark sheet's", () => {
    expect(
      report(
        `${LIGHT}\n.btn { margin: 0; }\n[data-theme="dark"] .btn { padding: 8px 12px; }`,
        `${DARK_TOKENS}\n[data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`
      )
    ).toEqual({ copies: ['[data-theme="dark"] .btn'], overrideRules: 1 })
  })

  // A sheet copied whole repeats these rules too, with the scope on twice
  // (seed-design's snackbar). The repeat is a copy of the rule the earlier
  // sheet carries, and the override is counted once — where it is written.
  it("names the dark sheet's repeat of one as a copy, and counts it once", () => {
    const rule = (scope: string) =>
      `html${scope} .btn { background: oklch(0.7 0.15 250) !important; }`
    expect(
      report(
        `${LIGHT}\n${rule('[data-theme="dark"]')}`,
        `${DARK_TOKENS}\n${rule('[data-theme="dark"][data-theme="dark"]')}`
      )
    ).toEqual({ copies: ['html[data-theme="dark"] .btn'], overrideRules: 1 })
  })

  // The count's other member, and where each kind of copy lands in the list.
  it("counts an at-rule block light lacks as one, and lists block copies last", () => {
    const spin = "@keyframes spin { to { transform: rotate(360deg); } }"
    const pulse = "@keyframes pulse { to { opacity: 0.4; } }"
    expect(
      report(
        `${LIGHT}\n${spin}\n[data-theme="dark"] .btn:hover { background: oklch(0.56 0.18 250); }`,
        `${DARK_TOKENS}\n${spin}\n${pulse}\n[data-theme="dark"] .hero { padding: 24px; }`
      )
    ).toEqual({
      copies: [".hero", '[data-theme="dark"] .btn:hover', "@keyframes spin"],
      overrideRules: 1,
    })
  })

  // Another spelling of the scope is read like the usual one: here the rule
  // changes the background light gives `.btn`, so it is counted.
  it("counts one whose scope is spelled another way", () => {
    expect(
      report(
        `${LIGHT}\n[data-theme='dark'] .btn { background: oklch(0.7 0.15 250); }`,
        DARK_TOKENS
      ).overrideRules
    ).toBe(1)
  })

  it("reads the dark arm of a list that also names a light selector", () => {
    expect(
      report(
        `${LIGHT}\n.note, [data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`,
        DARK_TOKENS
      ).overrideRules
    ).toBe(1)
  })
})

// The scope has one spelling the merge writes and several a hand can. A copy is
// a copy under any of them: were only the usual one read, a sheet copied whole
// behind `html[data-theme="dark"]` would pass the check that exists to stop it.
describe("dark-sheet-copy — a scope spelled another way", () => {
  const COPIED_BTN =
    ".btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.62 0.18 250); }"
  const SPELLINGS = [
    'html[data-theme="dark"]',
    ':root[data-theme="dark"]',
    "[data-theme='dark']",
    "[data-theme=dark]",
    ':where([data-theme="dark"])',
    '[data-theme="dark" i]',
  ]
  const blocked = (light: string, dark: string) =>
    found(mergedInput(light, dark)).map((i) => i.severity)

  it.each(SPELLINGS)(
    "blocks a copied rule in the dark sheet under %s",
    (scope) => {
      expect(blocked(LIGHT, `${DARK_TOKENS}\n${scope} ${COPIED_BTN}`)).toEqual([
        "block",
      ])
    }
  )

  it.each(SPELLINGS)("blocks one in an earlier sheet under %s", (scope) => {
    expect(blocked(`${LIGHT}\n${scope} ${COPIED_BTN}`, DARK_TOKENS)).toEqual([
      "block",
    ])
  })

  // An earlier sheet may already carry a dark rule under the very text the
  // dark sheet's rule comes out as. That rule is read as well, but it does not
  // stand in for light: a rule that restates light's `.btn` is a copy whether
  // or not an earlier sheet overrides `.btn` under the same spelling.
  const report = (light: string, dark: string) => {
    const html = mergedFile(light, dark)
    const halves = splitMergedPreview(html, Buffer.byteLength(html))
    return darkSheetReport(halves.light, halves.dark)
  }
  const EARLIER_OVERRIDE = ".btn { background: oklch(0.7 0.15 250); }"

  it.each([
    [':root[data-theme="dark"]', ':root[data-theme="dark"]'],
    ["[data-theme='dark']", "[data-theme='dark']"],
    // The split takes one layer off a doubled scope, and what is left is the
    // earlier sheet's spelling.
    ['html[data-theme="dark"][data-theme="dark"]', 'html[data-theme="dark"]'],
    // Spellings that never met in one key, for the same answer.
    [':root[data-theme="dark"]', 'html[data-theme="dark"]'],
    ['[data-theme="dark"]', '[data-theme="dark"]'],
  ])(
    "blocks a copy of light under %s though an earlier sheet overrides under %s",
    (copy, earlier) => {
      expect(
        blocked(
          `${LIGHT}\n${earlier} ${EARLIER_OVERRIDE}`,
          `${DARK_TOKENS}\n${copy} ${COPIED_BTN}`
        )
      ).toEqual(["block"])
    }
  )

  it("names the reviewer's copy, and counts the earlier override once", () => {
    expect(
      report(
        '.btn{color:red;padding:4px}\n:root[data-theme="dark"] .btn{color:blue}',
        '[data-theme="dark"]{--bg:black}\n:root[data-theme="dark"] .btn{color:red;padding:4px}'
      )
    ).toEqual({ copies: [':root[data-theme="dark"] .btn'], overrideRules: 1 })
  })

  it("reads a dark-sheet rule against light the same with or without that earlier rule", () => {
    const dark = `${DARK_TOKENS}\n:root[data-theme="dark"] ${COPIED_BTN}`
    const alone = report(LIGHT, dark).copies
    expect(alone).toEqual([':root[data-theme="dark"] .btn'])
    expect(
      report(`${LIGHT}\n:root[data-theme="dark"] ${EARLIER_OVERRIDE}`, dark)
        .copies
    ).toEqual(alone)
  })

  it("leaves a value neither light nor the earlier rule gives counted, and no copy", () => {
    expect(
      report(
        `${LIGHT}\n:root[data-theme="dark"] ${EARLIER_OVERRIDE}`,
        `${DARK_TOKENS}\n:root[data-theme="dark"] .btn { background: oklch(0.8 0.1 250); }`
      )
    ).toEqual({ copies: [], overrideRules: 2 })
  })

  // A sheet copied whole repeats the earlier sheet's dark rule among its
  // copies of light. That repeat is the earlier rule again and lines up with
  // it, not with a light rule: were it to take one of light's positions, the
  // copies behind it would each be read one rule off.
  it.each([
    [
      "ahead of them",
      'html[data-theme="dark"] .s{color:blue}\n.s{color:red}\n.s{color:green}',
      'html[data-theme="dark"][data-theme="dark"] .s{color:blue}\n[data-theme="dark"] .s{color:red}\n[data-theme="dark"] .s{color:green}',
      ['html[data-theme="dark"] .s', ".s", ".s"],
    ],
    [
      "between them",
      '.s{color:red}\nhtml[data-theme="dark"] .s{color:blue}\n.s{color:green}\n.s{color:teal}',
      '[data-theme="dark"] .s{color:red}\nhtml[data-theme="dark"][data-theme="dark"] .s{color:blue}\n[data-theme="dark"] .s{color:green}\n[data-theme="dark"] .s{color:teal}',
      [".s", 'html[data-theme="dark"] .s', ".s", ".s"],
    ],
  ])(
    "lines a whole copy up with light's repeated selector, the earlier rule's repeat %s",
    (_where, light, dark, copies) => {
      expect(report(light, `[data-theme="dark"]{--bg:black}\n${dark}`)).toEqual(
        { copies, overrideRules: 1 }
      )
    }
  )

  // Whatever the rule of the earlier sheet's text holds — that rule and one
  // declaration more, another value, nothing — it takes no position among
  // light's rules, and the copies of light behind it are read where they
  // stand.
  it.each([
    [
      "with a declaration added",
      "color:blue;margin:0",
      ['html[data-theme="dark"] .s', ".s", ".s"],
      2,
    ],
    ["retuned", "color:pink", [".s", ".s"], 2],
    ["emptied", "", [".s", ".s"], 1],
  ])(
    "keeps the copies behind the earlier rule's repeat in place, the repeat %s",
    (_how, body, copies, overrideRules) => {
      expect(
        report(
          'html[data-theme="dark"] .s{color:blue}\n.s{color:red}\n.s{color:green}',
          `[data-theme="dark"]{--bg:black}\nhtml[data-theme="dark"][data-theme="dark"] .s{${body}}\n[data-theme="dark"] .s{color:red}\n[data-theme="dark"] .s{color:green}`
        )
      ).toEqual({ copies, overrideRules })
    }
  )

  // A rule of the earlier sheet's text is read against every light rule of
  // its selector, the middle one too: with first-and-last alone, the second
  // of these three copies would be no copy.
  it("names each copy of a selector light writes three times, behind a scope an earlier sheet also uses", () => {
    expect(
      report(
        '.s{color:red}\n.s{color:green}\n.s{color:teal}\n:root[data-theme="dark"] .s{color:blue}',
        '[data-theme="dark"]{--bg:black}\n:root[data-theme="dark"] .s{color:red}\n:root[data-theme="dark"] .s{color:green}\n:root[data-theme="dark"] .s{color:teal}'
      )
    ).toEqual({
      copies: [
        ':root[data-theme="dark"] .s',
        ':root[data-theme="dark"] .s',
        ':root[data-theme="dark"] .s',
      ],
      overrideRules: 1,
    })
  })

  // seed-design's dark sheet repeats `html[data-theme="dark"] .snackbar` from
  // an earlier sheet. The repeat is read against the rule it repeats, gives
  // nothing that rule does not, and is a copy of it.
  it("still pairs a rule with the earlier sheet's rule of the same text", () => {
    const html = mergedFile(
      `${LIGHT}\nhtml[data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`,
      `${DARK_TOKENS}\nhtml[data-theme="dark"][data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }`
    )
    const halves = splitMergedPreview(html, Buffer.byteLength(html))
    expect(darkSheetReport(halves.light, halves.dark)).toEqual({
      copies: ['html[data-theme="dark"] .btn'],
      overrideRules: 1,
    })
  })

  it("does not take a scope for one where it names another element", () => {
    const html = mergedFile(
      LIGHT,
      `${DARK_TOKENS}\nbody[data-theme="dark"] ${COPIED_BTN}`
    )
    const halves = splitMergedPreview(html, Buffer.byteLength(html))
    expect(darkSheetReport(halves.light, halves.dark)).toEqual({
      copies: [],
      overrideRules: 1,
    })
  })
})

// A pair is the same selector under the same at-rules, and an at-rule's
// prelude has spellings too: `(max-width:720px)` is the query
// `(max-width: 720px)` is. Read as two at-rules, a copy under one pairs with
// nothing and is no copy.
describe("dark-sheet-copy — an at-rule prelude spelled another way", () => {
  const report = (light: string, dark: string) => {
    const html = mergedFile(light, dark)
    const halves = splitMergedPreview(html, Buffer.byteLength(html))
    return darkSheetReport(halves.light, halves.dark)
  }
  const NARROW = ".btn { padding: 4px 8px; }"

  it.each([
    ["@media (max-width: 720px)", "@media (max-width:720px)"],
    ["@media (max-width: 720px)", "@media ( max-width : 720px )"],
    ["@media (max-width: 720px)", "@MEDIA (max-width: 720px)"],
    [
      "@media screen and (min-width: 600px)",
      "@media screen and (min-width:600px)",
    ],
    ["@media (width >= 600px)", "@media (width>=600px)"],
    ["@supports (display: grid)", "@supports (display:grid)"],
    ["@container card (min-width: 400px)", "@container card (min-width:400px)"],
    ["@media (aspect-ratio: 16 / 9)", "@media (aspect-ratio:16/9)"],
    // No space after the name, the way a minifier writes it.
    ["@media (max-width: 720px)", "@media(max-width:720px)"],
    ["@supports (display: grid)", "@supports(display:grid)"],
    ["@container (min-width: 400px)", "@container(min-width:400px)"],
  ])("pairs a rule under %s with one under %s", (lightAt, darkAt) => {
    expect(
      report(
        `${LIGHT}\n${lightAt} { ${NARROW} }`,
        `${DARK_TOKENS}\n${darkAt} { [data-theme="dark"] ${NARROW} }`
      )
    ).toEqual({ copies: [`${darkAt} / .btn`], overrideRules: 0 })
  })

  it("blocks the copy the reviewer's input carries", () => {
    const issues = found(
      mergedInput(
        `${LIGHT}\n@media (max-width: 720px){.btn{padding:8px;color:red}}`,
        `${DARK_TOKENS}\n@media (max-width:720px){[data-theme="dark"] .btn{padding:8px;color:red}}`
      )
    )
    expect(issues).toHaveLength(1)
    expect(issues[0].severity).toBe("block")
  })

  it("pairs a dark rule an earlier sheet carries the same way", () => {
    expect(
      report(
        `${LIGHT}\n@media (max-width: 720px) { ${NARROW} }\n@media (max-width:720px) { [data-theme="dark"] ${NARROW} }`,
        DARK_TOKENS
      )
    ).toEqual({
      copies: ['@media (max-width:720px) / [data-theme="dark"] .btn'],
      overrideRules: 0,
    })
  })

  it("pairs an at-rule block under one the same way", () => {
    const spin = "@keyframes spin { to { transform: rotate(360deg); } }"
    expect(
      report(
        `${LIGHT}\n@media (min-width: 600px) { ${spin} }`,
        `${DARK_TOKENS}\n@media (min-width:600px) { ${spin} }`
      )
    ).toEqual({
      copies: ["@media (min-width:600px) / @keyframes spin"],
      overrideRules: 0,
    })
  })

  it("pairs an at-rule block whose own name is in capitals", () => {
    const body = "{ to { transform: rotate(360deg); } }"
    expect(
      report(
        `${LIGHT}\n@keyframes spin ${body}`,
        `${DARK_TOKENS}\n@KEYFRAMES spin ${body}`
      )
    ).toEqual({ copies: ["@KEYFRAMES spin"], overrideRules: 0 })
  })

  it("pairs through one at-rule inside another, each spelled its own way", () => {
    expect(
      report(
        `${LIGHT}\n@supports (display: grid) { @media (max-width: 720px) { ${NARROW} } }`,
        `${DARK_TOKENS}\n@supports (display:grid) { @media (max-width:720px) { [data-theme="dark"] ${NARROW} } }`
      )
    ).toEqual({
      copies: ["@supports (display:grid) / @media (max-width:720px) / .btn"],
      overrideRules: 0,
    })
  })

  // The other direction: a different query is a different at-rule, and what a
  // prelude names keeps its case and its spaces where they say something.
  it.each([
    ["@media (max-width: 720px)", "@media (max-width: 72px)"],
    ["@media (max-width: 720px)", "@media (min-width: 720px)"],
    // `not(` is a function to a browser, and the rule under it is dropped.
    ["@supports not (display: grid)", "@supports not(display: grid)"],
    // Inside a string a space is part of the value.
    ['@supports (content: "a: b")', '@supports (content: "a:b")'],
    ['@container style(--k: "a: b")', '@container style(--k: "a:b")'],
    // A style query holds a custom property's value, where a space counts.
    ["@container style(--k: a, b)", "@container style(--k: a,b)"],
    [
      "@container card (min-width: 400px)",
      "@container Card (min-width: 400px)",
    ],
    ["@layer base", "@layer Base"],
    ["@scope (.card :hover)", "@scope (.card:hover)"],
  ])("does not pair a rule under %s with one under %s", (lightAt, darkAt) => {
    expect(
      report(
        `${LIGHT}\n${lightAt} { ${NARROW} }`,
        `${DARK_TOKENS}\n${darkAt} { [data-theme="dark"] ${NARROW} }`
      )
    ).toEqual({ copies: [], overrideRules: 1 })
  })
})

// What the pairing cannot read is not left to pass as "no copy found". A rule
// that names the dark theme anywhere but on the root, in front, is refused
// outright — on the not-yet-walked list too: the list excuses copies that
// were found, not rules that were never read.
describe("dark-scope-unread", () => {
  const COPIED_BTN =
    ".btn { padding: 8px 12px; border-radius: 8px; background: oklch(0.62 0.18 250); }"
  const unread = (
    light: string,
    dark: string,
    overrides: Partial<PreviewValidationInput> = {}
  ) =>
    validatePreviewPair(mergedInput(light, dark, overrides)).issues.filter(
      (i) => i.rule === "dark-scope-unread"
    )

  it.each([
    ':is([data-theme="dark"])',
    'html:not([data-theme="light"])[data-theme="dark"]',
    'body[data-theme="dark"]',
    'html [data-theme="dark"]',
  ])("blocks a dark-sheet rule scoped with %s, and names it", (scope) => {
    const issues = unread(LIGHT, `${DARK_TOKENS}\n${scope} ${COPIED_BTN}`)
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain(".btn")
  })

  it("blocks one in an earlier sheet, named as it is written", () => {
    const issues = unread(
      `${LIGHT}\n.wrap [data-theme="dark"] ${COPIED_BTN}`,
      DARK_TOKENS
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain('.wrap [data-theme="dark"] .btn')
  })

  it("blocks on the not-yet-walked list as well", () => {
    expect(
      unread(LIGHT, `${DARK_TOKENS}\n:is([data-theme="dark"]) ${COPIED_BTN}`, {
        darkCopyBacklog: new Set(["demo"]),
      }).map((i) => i.severity)
    ).toEqual(["block"])
  })

  // Light is what is written bare, so "everywhere but dark" is no scope the
  // pairing knows: it would read the rule as a dark one.
  it("blocks a light rule that is scoped by naming dark to exclude it", () => {
    const issues = unread(
      `${LIGHT}\n:root:not([data-theme="dark"]) .btn { margin: 0; }`,
      DARK_TOKENS
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain("needs no scope")
  })

  // The attribute is the page's theme switch. A demo element that carries it
  // (a theme picker's option) reads as a dark rule the pairing cannot place.
  it("blocks a demo element that borrows the attribute, and says to rename it", () => {
    const issues = unread(
      `${LIGHT}\n.picker button[data-theme="dark"] { color: var(--fg); }`,
      DARK_TOKENS
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain("another name")
  })

  it("names one under an at-rule with the at-rule it sits in", () => {
    const issues = unread(
      LIGHT,
      `${DARK_TOKENS}\n@media (min-width: 600px) { :is([data-theme="dark"]) ${COPIED_BTN} }`
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain("600px")
  })

  it("blocks a rule for one unread arm of its selector list", () => {
    expect(
      unread(
        LIGHT,
        `${DARK_TOKENS}\n[data-theme="dark"] .hero, body[data-theme="dark"] .btn { margin: 0; }`
      ).map((i) => i.severity)
    ).toEqual(["block"])
  })

  // The walk hands the pairing flat rules. One written inside another is part
  // of its parent's body, and one under an at-rule that names the theme is a
  // dark rule whose selector does not say so.
  const COPIED_HERO =
    ".hero { padding: 24px; background: var(--bg); color: var(--fg); }"

  it("blocks a dark-sheet rule that carries the light rules nested inside it", () => {
    const issues = unread(
      LIGHT,
      `[data-theme="dark"] { --bg: oklch(0.2 0 0); ${COPIED_HERO} ${COPIED_BTN} }`
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain(":root [nests a rule]")
  })

  it("blocks an earlier-sheet rule that nests its dark rule", () => {
    const issues = unread(
      `${LIGHT}\n.card { color: blue; [data-theme="dark"] & { color: navy; } }`,
      DARK_TOKENS
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain(".card [nests a rule]")
  })

  it("blocks an earlier-sheet dark rule that nests another", () => {
    expect(
      unread(
        `${LIGHT}\n[data-theme="dark"] .card { .title { color: navy; } }`,
        DARK_TOKENS
      ).map((i) => i.severity)
    ).toEqual(["block"])
  })

  it("blocks dark-sheet rules under an at-rule that names the theme", () => {
    const issues = unread(
      LIGHT,
      `${DARK_TOKENS}\n@scope ([data-theme="dark"]) { ${COPIED_HERO} }`
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain(".hero [under an at-rule naming the theme]")
  })

  it("blocks earlier-sheet rules under an at-rule that names the theme", () => {
    const issues = unread(
      `${LIGHT}\n@scope ([data-theme="dark"]) { .btn { background: navy; } }`,
      DARK_TOKENS
    )
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain(
      '@scope ([data-theme="dark"]) / .btn [under an at-rule naming the theme]'
    )
  })

  it("leaves light nesting that says nothing of dark alone", () => {
    expect(
      unread(
        `${LIGHT}\n.card { color: blue; &:hover { color: navy; } }\n@scope (.card) { .title { margin: 0; } }`,
        DARK_TOKENS
      )
    ).toEqual([])
  })

  it("does not take a brace in a string for a nested rule", () => {
    expect(
      unread(
        LIGHT,
        `${DARK_TOKENS}\n[data-theme="dark"] .hero::before { content: "{"; }`
      )
    ).toEqual([])
  })

  // seed-design carries one: a stray "}" in front of an @media block. The
  // browser drops the block with the prelude it cannot read as a selector, so
  // what is inside applies in neither theme.
  it("is quiet for a block the browser drops after a stray brace", () => {
    expect(
      unread(
        LIGHT,
        `${DARK_TOKENS}\n[data-theme="dark"] }\n@media (max-width: 720px) { .btn { margin: 0; } }`
      )
    ).toEqual([])
  })

  // A "}" that is part of a string or escaped is no stray brace: the browser
  // applies that rule, so it is not excused.
  it.each(['.btn[title="\\"}"]', ".btn\\}x"])(
    "still blocks a rule whose selector %s only spells a brace",
    (selector) => {
      expect(
        unread(
          `${LIGHT}\n:is([data-theme="dark"]) ${selector} { margin: 0; }`,
          DARK_TOKENS
        ).map((i) => i.severity)
      ).toEqual(["block"])
    }
  )

  it("is quiet for every spelling the pairing reads", () => {
    const dark = [
      DARK_TOKENS,
      '[data-theme="dark"] .hero { outline: 1px solid var(--fg); }',
      'html[data-theme="dark"] .btn { background: oklch(0.7 0.15 250); }',
      ":root[data-theme='dark'] .btn:hover { background: oklch(0.6 0.15 250); }",
      'html[data-theme="dark"][data-theme="dark"] .hero h1 { margin: 0; }',
      '@media (min-width: 600px) { [data-theme="dark"] .hero, [data-theme="dark"] :is(.btn, .hero):not(.x) { gap: 0; } }',
    ].join("\n")
    expect(
      unread(
        `${LIGHT}\n[data-theme=dark] .hero { border: 0; }\n[data-theme="light"] .hero { margin: 0; }`,
        dark
      )
    ).toEqual([])
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
