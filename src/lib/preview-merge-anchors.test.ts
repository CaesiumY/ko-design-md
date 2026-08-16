import { execFileSync } from "node:child_process"
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, describe, expect, it } from "vitest"
import { splitMergedPreview } from "./preview-halves"
import { validatePreviewPair } from "./preview-validator"

// The converter is run for real rather than imported: it is a script with no
// exports, and the thing under test is the file it writes.
//
// What it must not write is two variant templates in the order
// `[insert][swap]`. That order is not merely awkward — it is unreadable. A
// reader has to decide what a `swap` swaps by looking at what precedes it, and
// with an insert template parked in between, the node the swap was made for is
// no longer there; whichever way a reader resolves that, the dark rendering
// comes out with the two nodes in the wrong order or with both themes' prose at
// once. So the ordering is fixed here, where it is written.
const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const SCRIPT = join(ROOT, "scripts", "merge-preview-themes.mjs")

const dirs: Array<string> = []
afterAll(() => {
  for (const dir of dirs) rmSync(dir, { recursive: true, force: true })
})

const page = (
  theme: "light" | "dark",
  body: string,
  css = ":root{--bg:#fff}"
) =>
  `<!doctype html>
<html lang="ko" data-theme="${theme}"><head><meta charset="utf-8">
<title>zz preview · ${theme}</title>
<style>${css}</style>
</head><body>${body}</body></html>`

function merge(
  lightBody: string,
  darkBody: string,
  css?: { light: string; dark: string }
): string {
  const dir = mkdtempSync(join(tmpdir(), "preview-merge-"))
  dirs.push(dir)
  mkdirSync(join(dir, "public/preview/_runtime"), { recursive: true })
  writeFileSync(join(dir, "public/preview/_runtime/tokens.css"), "")
  mkdirSync(join(dir, "public/preview/zz"), { recursive: true })
  writeFileSync(
    join(dir, "public/preview/zz/light.html"),
    page("light", lightBody, css?.light)
  )
  writeFileSync(
    join(dir, "public/preview/zz/dark.html"),
    page("dark", darkBody, css?.dark)
  )
  execFileSync(process.execPath, [SCRIPT, "zz"], { cwd: dir, stdio: "ignore" })
  return readFileSync(join(dir, "public/preview/zz/preview.html"), "utf8")
}

const ops = (html: string): Array<string> =>
  [...html.matchAll(/data-theme-op="(\w+)"/g)].map((m) => m[1])

describe("merge-preview-themes anchor placement", () => {
  // The dark half adds a node right behind a node both halves have, so
  // `align()` emits `pair` then `dark-only` with the same anchor.
  it("puts the swap before an insert that shares its anchor", () => {
    const html = merge(
      `<p class="lead" data-v="l">라이트</p><div class="sec">공유</div>`,
      `<p class="lead" data-v="d">다크</p><section class="only">다크 전용</section><div class="sec">공유</div>`
    )
    expect(ops(html)).toEqual(["swap", "insert"])
  })

  // Two dark-only nodes on one anchor have to keep their own order too.
  it("keeps two inserts on one anchor in document order", () => {
    const html = merge(
      `<div class="sec">공유</div>`,
      `<div class="sec">공유</div><p class="a">하나</p><p class="b">둘</p>`
    )
    const order = [...html.matchAll(/<p class="(a|b)">/g)].map((m) => m[1])
    expect(order).toEqual(["a", "b"])
  })
})

// A statement at-rule ends at its `;`; what follows is an ordinary rule and
// must still be scoped. Reading the prelude as "everything since the last `}`"
// made an `@import` swallow the selector behind it, and the dark half's token
// block was emitted at `:root` — repainting the light theme with dark values.
describe("merge-preview-themes statement at-rules", () => {
  it("scopes the rule that follows an @import", () => {
    const dir = mkdtempSync(join(tmpdir(), "preview-merge-"))
    dirs.push(dir)
    mkdirSync(join(dir, "public/preview/_runtime"), { recursive: true })
    writeFileSync(join(dir, "public/preview/_runtime/tokens.css"), "")
    mkdirSync(join(dir, "public/preview/zz"), { recursive: true })
    writeFileSync(
      join(dir, "public/preview/zz/light.html"),
      page("light", "<p>본문</p>")
    )
    writeFileSync(
      join(dir, "public/preview/zz/dark.html"),
      `<!doctype html>
<html lang="ko" data-theme="dark"><head><meta charset="utf-8">
<title>zz preview · dark</title>
<style>@import url("x.css");
:root{--bg:#000}</style>
</head><body><p>본문</p></body></html>`
    )
    execFileSync(process.execPath, [SCRIPT, "zz"], {
      cwd: dir,
      stdio: "ignore",
    })
    const html = readFileSync(
      join(dir, "public/preview/zz/preview.html"),
      "utf8"
    )

    expect(html).toContain('@import url("x.css");')
    expect(html).toMatch(/\[data-theme="dark"\]\s*\{--bg:#000\}/)
    expect(html).not.toMatch(/@import url\("x\.css"\);\s*:root\s*\{/)
  })
})

// `identical-style-blocks` asks whether the dark half is a considered
// adaptation or a copy. On the merged layout that question can only be asked
// after the converter has been through the sheet, so it is asked here THROUGH
// the converter — the sibling test in `preview-halves.test.ts` builds a merged
// file by hand and its hand-written spacing happens to match what the converter
// emits, which is exactly the coincidence that let the rule die unnoticed.
//
// The CSS below is written the way a person writes it: `.ic{` with no space,
// a rule indented inside `@media`. `scopeBlock` reserialises all of that
// (`prelude + " {"`, selector lists rejoined with `", "`), so a dark half that
// is a verbatim copy of light still reaches the validator looking different.
const AUTHORED_CSS = `:root{--bg:#fff}
.ic{display:inline-flex;gap:4px}
.a,.b{color:#111}
@media (max-width: 700px) {
  .hero{padding:8px}
}`

function copyVerdict(lightCss: string, darkCss: string): Array<string> {
  const html = merge("<p>본문</p>", "<p>본문</p>", {
    light: lightCss,
    dark: darkCss,
  })
  const halves = splitMergedPreview(html, html.length)
  return validatePreviewPair({
    slug: "zz",
    lightRaw: halves.light,
    darkRaw: halves.dark,
    lightBytes: halves.lightBytes,
    darkBytes: halves.darkBytes,
    served: halves.served,
    designMdRaw: "",
  }).issues.map((i) => i.rule)
}

describe("merge-preview-themes and the copy question", () => {
  it("still calls a copied dark sheet a copy after the converter", () => {
    expect(copyVerdict(AUTHORED_CSS, AUTHORED_CSS)).toContain(
      "identical-style-blocks"
    )
  })

  // The converter cannot tell an author's own `[data-theme="dark"]` block from
  // one it made out of `:root`, so both come back as `:root`. A half that
  // themes itself in one sheet — the shape codeit ships — is still a copy of
  // its twin, and used to slip through on the merged layout alone.
  it("sees through a dual-theme sheet that spells the root both ways", () => {
    const dual = `${AUTHORED_CSS}\n[data-theme="dark"]{--bg:#000}`
    expect(copyVerdict(dual, dual)).toContain("identical-style-blocks")
  })

  it("still lets an adapted dark sheet through", () => {
    expect(
      copyVerdict(AUTHORED_CSS, AUTHORED_CSS.replace("#fff", "#000"))
    ).not.toContain("identical-style-blocks")
  })
})

// A brace inside a quoted value is not a rule boundary. The walk used to count
// braces in the raw text, so `content: "{"` desynchronised it and every rule
// after that one came out with its scope prefix intact — the same failure a
// brace in a comment used to cause, fixed one round earlier and one view short.
describe("merge-preview-themes and braces inside strings", () => {
  it('scopes the rules that follow a `content: "{"`', () => {
    const css = `.tok::after{content:"{"}
.y{color:red}
.z{color:blue}`
    const html = merge("<p>본문</p>", "<p>본문</p>", { light: css, dark: css })
    const dark = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].at(
      -1
    )![1]
    for (const sel of [".tok::after", ".y", ".z"]) {
      expect(dark).toContain(`[data-theme="dark"] ${sel}`)
    }
  })
})

// The third view of the same walk. Comments were fixed, then strings — and the
// comma split still cut inside `:is()`/`:not()`/`:has()`, so the scope landed on
// the pseudo-class's second arm instead of on the selector. Both sheets show it:
// the dark sheet gets `[data-theme="dark"]` inside the parens, and the light
// guard `scopeLightOnly` emits gets `:where(html[data-theme="light"])` there.
//
// The consequence is not spacing. `:is()`/`:not()` take the highest specificity
// among their arguments, so the injected attribute raises the whole selector by a
// class and can flip the cascade; and `:has(> .item, [data-theme="dark"] > .row)`
// asks for a child of a descendant carrying the attribute, which lives on
// `<html>` and is nobody's descendant — that arm can never match.
describe("merge-preview-themes and commas inside a pseudo-class", () => {
  const dark = (html: string) =>
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].at(-1)![1]
  const light = (html: string) =>
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)][0][1]

  it("scopes the whole selector, not the arm after the comma", () => {
    const css = `:is(.a, .b) .x{color:red}
.card:not(.muted, .ghost){color:red}
.grid:has(> .item, > .row){gap:8px}`
    const out = dark(
      merge("<p>본문</p>", "<p>본문</p>", { light: css, dark: css })
    )
    expect(out).toContain('[data-theme="dark"] :is(.a, .b) .x')
    expect(out).toContain('[data-theme="dark"] .card:not(.muted, .ghost)')
    expect(out).toContain('[data-theme="dark"] .grid:has(> .item, > .row)')
    // The exact shapes the split produced, spelled out rather than matched by a
    // pattern: `:where([data-theme="dark"])` is a legitimate paren'd scope that
    // `selectorsOutrankedByTokens` emits, so "no attribute inside any paren" is
    // the wrong assertion.
    for (const bad of [
      ':is(.a, [data-theme="dark"] .b)',
      ':not(.muted, [data-theme="dark"] .ghost)',
      ':has(> .item, [data-theme="dark"] > .row)',
    ]) {
      expect(out).not.toContain(bad)
    }
  })

  it("keeps the light-only guard outside the parens too", () => {
    const out = light(
      merge("<p>본문</p>", "<p>본문</p>", {
        light: ":is(.a, .b) .x{color:red;font-size:12px}",
        dark: ":is(.a, .b) .x{font-size:12px}",
      })
    )
    expect(out).toContain(
      ':where(html[data-theme="light"]) :is(.a, .b) .x { color: red; }'
    )
    expect(out).not.toContain(':is(.a, :where(html[data-theme="light"]) .b)')
  })

  // And a comma that really does separate two selectors still cuts.
  it("still splits a genuine selector list", () => {
    const css = ":is(.a, .b),.c{color:red}"
    const out = dark(
      merge("<p>본문</p>", "<p>본문</p>", { light: css, dark: css })
    )
    expect(out).toContain(
      '[data-theme="dark"] :is(.a, .b), [data-theme="dark"] .c'
    )
  })
})

// The dark sheet used to be run through `stripComments` before it was scoped,
// which erased 696 comments / 36,417 B across the catalogue. Some of those are
// the only record of a dark-only token's original hex, and this PR deletes
// `dark.html` out from under them; it also silently narrowed the gate, dropping
// one `hex-colors-present` warning each on codeit, line-design-system, wanted
// and yeogi.
describe("merge-preview-themes and dark-sheet comments", () => {
  const css = `:root{--bg:#fff}
/* section header */
.card{color:#111} /* trailing note #6500C3 */`

  it("keeps comments the dark sheet carries", () => {
    const html = merge("<p>본문</p>", "<p>본문</p>", {
      light: css,
      dark: css.replace("#fff", "#000"),
    })
    const dark = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].at(
      -1
    )![1]
    expect(dark).toContain("/* section header */")
    expect(dark).toContain("/* trailing note #6500C3 */")
  })

  it("does not read a kept comment as part of the selector behind it", () => {
    const html = merge("<p>본문</p>", "<p>본문</p>", {
      light: css,
      dark: `/* note */\n:root{--bg:#000}`,
    })
    const dark = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].at(
      -1
    )![1]
    expect(dark).toContain("/* note */")
    expect(dark).toMatch(/\[data-theme="dark"\]\s*\{--bg:#000\}/)
    expect(dark).not.toMatch(/\[data-theme="dark"\]\s*\/\* note \*\//)
  })
})

// The round above restored comments AHEAD of a selector; the region BEHIND one
// was still dropped. `scopeBlock` measured both paddings on the blanked scan but
// emitted only the leading slice, so `.b /* why */ {` lost the comment while
// `/* why */ .b {` kept it — and `scopeSelectorList` repeated the arithmetic per
// piece, losing a comment parked mid-list. Only the dark sheet is affected: the
// light sheet is edited at offsets and never re-serialised.
//
// Same two consequences the `stripComments` removal had. The comment is gone
// from the repository once `dark.html` is deleted, and rules that read the sheet
// as text — `hex-colors-present` counts a hex inside a comment — quietly see
// less than they did under the split layout.
describe("merge-preview-themes and comments behind a selector", () => {
  const dark = (html: string) =>
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)].at(-1)![1]

  it("keeps a comment between the selector and the brace", () => {
    const css = `.b /* trailing #6500C3 */ { color: blue }`
    const out = dark(
      merge("<p>본문</p>", "<p>본문</p>", { light: css, dark: css })
    )
    expect(out).toContain("/* trailing #6500C3 */")
    expect(out).toContain('[data-theme="dark"] .b /* trailing #6500C3 */ {')
  })

  it("keeps a comment parked between two selectors in a list", () => {
    const css = `.c /* mid #171719 */, .d { color: green }`
    const out = dark(
      merge("<p>본문</p>", "<p>본문</p>", { light: css, dark: css })
    )
    expect(out).toContain("/* mid #171719 */")
    expect(out).toContain(
      '[data-theme="dark"] .c /* mid #171719 */, [data-theme="dark"] .d'
    )
  })

  // At-rule preludes go down the other two branches of the same `if`, so they
  // need their own case: `@media` recurses, `@font-face` is emitted verbatim.
  it("keeps the comment on an at-rule prelude and on the rule it nests", () => {
    const css = `@media (min-width: 768px) /* at #ffc42e */ {
  .m /* nested */ { color: teal }
}`
    const out = dark(
      merge("<p>본문</p>", "<p>본문</p>", { light: css, dark: css })
    )
    expect(out).toContain("/* at #ffc42e */")
    expect(out).toContain('[data-theme="dark"] .m /* nested */ {')
  })
})

// The seventh face of the scan/emit asymmetry, and the first that leaks a value
// rather than a comment. `eachRule` takes two views on purpose; `eachDeclaration`
// took one — the scan, with comments AND strings blanked — so a declaration whose
// value is entirely a quoted string arrived as `content:` followed by spaces, hit
// the emptiness guard, and was dropped before `visit`.
//
// In `scopeLightOnly` that is a leak, not a lost visit: the declaration is never
// offered to the light guard, so a light-only `content` / `font-family` /
// `font-feature-settings` goes on painting the dark theme, and there is no
// counterpart selector on the dark side that any specificity could neutralise.
// Today's catalogue carries 69 declarations of this shape in its light halves
// and the dark halves restate every one, which is the only reason nothing
// renders wrong — the same accident `.section + .section` was riding on in
// baemin.
describe("merge-preview-themes and string-only declaration values", () => {
  const light = (html: string) =>
    [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)][0][1]

  // `content` and `font-feature-settings` are the two the catalogue writes in
  // this shape; `font-family` is here because it is the one a preview would
  // most plausibly write next, and because the catalogue's bare copies of it all
  // sit inside `@font-face`, where this walk never looks.
  for (const [prop, value] of [
    ["content", '"→"'],
    ["font-family", '"Pretendard"'],
    ["font-feature-settings", '"tnum"'],
  ]) {
    it(`guards a light-only \`${prop}\` whose value is just a string`, () => {
      const out = light(
        merge("<p>본문</p>", "<p>본문</p>", {
          light: `.x::after{${prop}:${value};opacity:1}`,
          dark: ".x::after{opacity:1}",
        })
      )
      expect(out).toContain(
        `:where(html[data-theme="light"]) .x::after { ${prop}: ${value}; }`
      )
      expect(out).toContain(".x::after{opacity:1}")
    })
  }

  // The other direction of the same blindness: the dark half's copy was invisible
  // too, so `darkPropertyIndex` under-reported. Restated means shared, not moved.
  it("leaves it shared when the dark half restates it", () => {
    const out = light(
      merge("<p>본문</p>", "<p>본문</p>", {
        light: '.x::after{content:"→"}',
        dark: '.x::after{content:"←"}',
      })
    )
    expect(out).toContain('.x::after{content:"→"}')
    expect(out).not.toContain('[data-theme="light"]')
  })

  // And a value that really is empty is still not a declaration. The emptiness
  // test reads the comment-only view, not the raw sheet, so a comment where a
  // value should be stays what it is rather than becoming a movable declaration.
  it("does not treat a comment-only value as a declaration", () => {
    const out = light(
      merge("<p>본문</p>", "<p>본문</p>", {
        light: ".x::after{color:/* nothing */ ;opacity:1}",
        dark: ".x::after{opacity:1}",
      })
    )
    expect(out).toContain(".x::after{color:/* nothing */ ;opacity:1}")
    expect(out).not.toContain('[data-theme="light"]')
  })
})

// baemin: the dark half adds a `<section class="section">` and the shared
// Components section carries the same class, so LCS has two answers of equal
// length. Without a tie-break it pairs the light Components section with the
// dark-only one and duplicates a whole section into a swap template. The shipped
// file only avoided that because `dark.html` had been edited by hand to give the
// extra section a class that exists in no commit.
describe("merge-preview-themes alignment tie-break", () => {
  it("prefers the pair whose subtree matches when the class does not decide", () => {
    const shared = `<section class="s"><div class="wrap"><div class="head"></div><div class="grid"></div></div></section>`
    const darkOnly = `<section class="s"><div class="wrap"><div class="note"></div></div></section>`
    const html = merge(shared, `${darkOnly}${shared}`)
    // The dark-only section is an insert; nothing is swapped, so the shared
    // section is never duplicated into a template.
    expect(ops(html)).toEqual(["insert"])
    expect(html).toContain('<div class="note">')
    expect([...html.matchAll(/<div class="grid">/g)]).toHaveLength(1)
  })
})
