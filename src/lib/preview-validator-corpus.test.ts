import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { describe, expect, it } from "vitest"
import { readPreviewHalves } from "./preview-halves"
import { resolvePreviewLayout } from "./preview-layout"
import {
  darkSwapAnchorMismatches,
  darkVariantAnchors,
  swatchFillCount,
  validatePreviewPair,
} from "./preview-validator"
import type { AnchorSig, VariantAnchor } from "./preview-validator"

// `swatchFillCount` walks document structure, keeping a stack of open elements.
// This test holds that walk to what a browser actually renders, measured with
// jsdom over every shipped preview. jsdom is a devDependency, so it can be the
// ground truth here while the validator itself stays dependency-free apart from
// `node:zlib` — that division of labour is the reason this file exists.
//
// Before issue #222 the validator scanned line by line, the two counts
// legitimately disagreed (bezier 7 vs 12), and this file could only compare
// verdicts. Now it asserts the **counts** match: both sides compute the same
// meaning by different means — under `<body>`, inline `style` carrying
// `background`, no text including descendants, attributed to the nearest
// `data-theme-only` ancestor — so any divergence means the walk misread the
// structure. Count equality is far tighter than verdict equality: it catches
// drift that stays quiet below the limit, which is exactly where bezier's
// 7-vs-12 hid.
//
// The verdict comparison stays too. Equal counts do not prove the threshold
// comparison and the `shared + max` aggregation are wired into `checkFile`
// correctly, and that is a separate failure.

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const PREVIEW = join(ROOT, "public", "preview")
const SERVICES = join(ROOT, "services")

// Keep in step with SWATCH_FILL_LIMIT in preview-validator.ts. Duplicated
// rather than exported because the point of this test is to check the shipped
// behaviour from the outside.
const SWATCH_FILL_LIMIT = 24

/** Ground truth: what a browser would actually render as a bare colour fill. */
function domFillCount(html: string): number {
  const doc = new JSDOM(html).window.document
  let shared = 0
  let light = 0
  let dark = 0
  for (const el of doc.querySelectorAll("body [style]")) {
    // getAttribute is `string | null` even behind a `[style]` selector, so the
    // fallback stays. textContent is non-null on an Element, so a `??` there
    // would be flagged as an unnecessary condition.
    if (!/background/.test(el.getAttribute("style") ?? "")) continue
    if (el.textContent.trim() !== "") continue
    const theme =
      el
        .closest("[data-theme-only]")
        ?.getAttribute("data-theme-only")
        ?.toLowerCase() ?? null
    if (theme === "light") light++
    else if (theme === "dark") dark++
    else shared++
  }
  return shared + Math.max(light, dark)
}

function slugs(): Array<string> {
  if (!existsSync(PREVIEW)) return []
  return readdirSync(PREVIEW, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .filter(
      (s) =>
        resolvePreviewLayout((file) => existsSync(join(PREVIEW, s, file))) !==
          null && existsSync(join(SERVICES, `${s}.md`))
    )
    .sort()
}

describe("swatch-catalog — corpus cross-check against a DOM walk", () => {
  const all = slugs()

  it("finds previews to check", () => {
    // A silent zero here would make every assertion below vacuous.
    expect(all.length).toBeGreaterThan(0)
  })

  for (const slug of all) {
    it(`${slug}: fill count and gate verdict match a DOM walk`, () => {
      // The merged layout has one file; the halves are reconstructed from it,
      // which is exactly what the shipping gate feeds the validator.
      const halves = readPreviewHalves(join(PREVIEW, slug))
      if (halves === null) throw new Error(`${slug}: no usable preview layout`)
      const lightRaw = halves.light
      const darkRaw = halves.dark

      const result = validatePreviewPair({
        slug,
        lightRaw,
        darkRaw,
        lightBytes: halves.lightBytes,
        darkBytes: halves.darkBytes,
        served: halves.served,
        designMdRaw: readFileSync(join(SERVICES, `${slug}.md`), "utf8"),
      })
      const fired = result.issues.some((i) => i.rule === "swatch-catalog")

      const lightTruth = domFillCount(lightRaw)
      const darkTruth = domFillCount(darkRaw)

      // 1) Count equality — did the walk read the structure correctly?
      expect(
        swatchFillCount(lightRaw),
        `${slug} light scope: the walk and a DOM walk disagree on the fill count`
      ).toBe(lightTruth)
      expect(
        swatchFillCount(darkRaw),
        `${slug} dark scope: the walk and a DOM walk disagree on the fill count`
      ).toBe(darkTruth)

      // 2) Verdict equality — is that count wired into the gate correctly? The
      // rule is per file but the result is per pair, so compare against
      // whichever theme a DOM walk finds heavier.
      const truth = Math.max(lightTruth, darkTruth)
      const shouldFire = truth >= SWATCH_FILL_LIMIT

      expect(
        fired,
        shouldFire
          ? `${slug}: a DOM walk sees ${truth} fills (light ${lightTruth} / dark ${darkTruth}, limit ${SWATCH_FILL_LIMIT}) but swatch-catalog did not fire — the rule has been voided, see issue #222`
          : `${slug}: swatch-catalog fired although a DOM walk sees only ${truth} fills (light ${lightTruth} / dark ${darkTruth}, limit ${SWATCH_FILL_LIMIT}) — the walk counts more than renders`
      ).toBe(shouldFire)
    })
  }
})

// The corpus is 34 files in one generator's house style, so it never exercises
// single-quoted attributes, unquoted values, stray close tags, `<template>`, or
// comment-only children — all of which a hand-authored entry may carry
// (CONTRIBUTING allows hand-authoring, and `hasAttrValue`'s note says so). The
// walk could diverge on any of these and the corpus sweep above would stay
// green.
//
// Expectations are never written by hand here. Naming a number would make this
// a copy of the walk and verify nothing; the assertion is equality with jsdom.
const STRUCTURE_FIXTURES: Array<[string, string]> = [
  [
    "multi-line start tag",
    `<div\n  class="c"\n  style="background:red"\n></div>`,
  ],
  ["void fill", `<hr style="background:red">`],
  ["comment-only child", `<div style="background:red"><!-- c --></div>`],
  ["nbsp-only child", `<div style="background:red">&nbsp;</div>`],
  [
    "same-tag nesting",
    `<span style="background:red"><span style="background:blue"></span></span>`,
  ],
  [
    "self-closing tags inside svg",
    `<svg viewBox="0 0 2 2"><path d="M0 0"/></svg><div style="background:red"></div>`,
  ],
  ["single-quoted attribute", `<div style='background:red'></div>`],
  ["unquoted attribute value", `<div style=background:red></div>`],
  [
    "attribute value containing >",
    `<div title="a > b" style="background:red"></div>`,
  ],
  ["stray close tag", `<div style="background:red"></span></div>`],
  ["data-style must not count", `<div data-style="background:red"></div>`],
  [
    "theme wrapper across lines",
    `<div\n  data-theme-only="dark"\n>\n<div style="background:red"></div>\n</div><div style="background:blue"></div>`,
  ],
  [
    "fill after a closed wrapper",
    `<div data-theme-only="light"><div style="background:red"></div></div><div style="background:blue"></div>`,
  ],
  [
    "inline script containing markup",
    `<script>var a = "<div style=x></div>"</script><div style="background:red"></div>`,
  ],
  [
    "template content does not render",
    `<template><div style="background:red"></div></template><div style="background:blue"></div>`,
  ],
  // 아래 셋은 opaque 요소의 닫는 태그를 찾는 경로를 건다. 이 경로는 자체
  // 리뷰에서 실제 버그 두 개가 나온 자리이므로, 리팩터가 조용히 되돌리지
  // 못하도록 각각을 픽스처로 고정한다.
  [
    // `body.toLowerCase()` 의 인덱스를 원본에 쓰면 여기서 어긋난다 —
    // U+0130 은 소문자화하면 두 글자가 되어 사본이 원본보다 길어진다.
    // 이스케이프를 소스에 타이핑하면 리터럴 문자로 정규화되는 함정이 있어
    // 코드 포인트로 만든다.
    "case-folding that changes length, before a script",
    `<p>${String.fromCodePoint(0x130)}</p><script>var a = 1</script><div style="background:red"></div>`,
  ],
  [
    // `</scriptx` 가 `</script` 로 읽히면 스크립트가 거기서 끝난 것으로 보고
    // 그 뒤 문자열 리터럴 안의 마크업을 요소로 세기 시작한다. fill 을 그
    // 리터럴 **안에** 둬야 갈라진다 — 뒤에만 두면 오귀속돼도 개수가 같아
    // 픽스처가 아무것도 판별하지 못한다.
    "close tag whose name is a prefix of the real one",
    `<script>var a = "</scriptx><div style=background:red></div>"</script><div style="background:blue"></div>`,
  ],
  [
    // 닫는 `>` 가 끝까지 없는 시작 태그. 파서는 EOF 에서 그 태그와 뒤따르는
    // 내용을 전부 버리므로, 워커가 스캔을 중단하는 것이 DOM 과 같은 답이다.
    "unterminated start tag swallows the rest",
    `<div style="background:red"></div><span style="background:blue`,
  ],
  // 아래 넷은 속성 구간을 읽는 경로를 건다. 정규식으로 `style=` 을 찾으면
  // 따옴표 구간이 토큰으로 안 보여, 다른 속성 **값 안**의 문자열을 속성으로
  // 읽는다 — 이 PR 이 고치는 것과 같은 부류다.
  [
    "style= appearing inside another attribute value",
    `<div title="a style=b" style="background:red"></div>`,
  ],
  [
    // 뒤에 dark 2개를 두는 것이 핵심이다. `shared + max(light, dark)` 는 단일
    // 오귀속을 삼키므로(light→shared 하나만으로는 총계가 안 변한다), 경쟁하는
    // 테마 계수가 있어야 오귀속이 수로 드러난다.
    "data-theme-only= appearing inside another attribute value",
    `<div title="data-theme-only=dark" data-theme-only="light"><div style="background:red"></div></div><div data-theme-only="dark"><div style="background:1"></div><div style="background:2"></div></div>`,
  ],
  [
    // 파서는 먼저 나온 속성을 쓴다. 뒤엣것을 쓰면 fill 여부가 뒤집힐 수 있다.
    "duplicate attribute — the first one wins",
    `<div style="background:red" style="color:blue"></div>`,
  ],
  [
    // 값 없는 속성. `closest("[data-theme-only]")` 는 값이 비어도 이 요소에서
    // 멈추므로, 못 찾으면 red 가 shared 가 아니라 바깥 light 로 오귀속된다.
    // 여기서도 경쟁하는 dark 2개가 있어야 그 차이가 총계로 드러난다.
    "valueless data-theme-only still anchors attribution",
    `<div data-theme-only="light"><div data-theme-only><div style="background:red"></div></div></div><div data-theme-only="dark"><div style="background:1"></div><div style="background:2"></div></div>`,
  ],
]

describe("swatch-catalog — structural fixtures cross-checked against a DOM walk", () => {
  for (const [label, body] of STRUCTURE_FIXTURES) {
    it(`${label}: fill count matches a DOM walk`, () => {
      const html = `<!doctype html><html lang="ko" data-theme="light"><head></head><body><main>${body}</main></body></html>`
      expect(swatchFillCount(html)).toBe(domFillCount(html))
    })
  }
})

// ── dark variant anchors ─────────────────────────────────────────────────────
//
// `darkVariantAnchors` reads which node stands in front of each dark variant
// template and what the template holds, with the same walker. The rule built
// on it (`dark-swap-anchor`) blocks, so the pairing is held to a jsdom pairing
// the way the fill count is — but pairing by pairing and in document order,
// which is tighter than a count: a walk that read one anchor wrong and one
// right would still count 184.

/** The signature a browser would give a node, read the way iframe.js reads it. */
function domSig(node: Node): AnchorSig {
  if (node.nodeType !== 1) return { kind: "text" }
  const el = node as Element
  return {
    kind: "element",
    tag: el.localName,
    classes: [...new Set(el.classList)].sort(),
  }
}

/** `p.a.b` for an element, `#text` for a text run — the message vocabulary. */
function sigLabel(sig: AnchorSig): string {
  if (sig.kind === "text") return "#text"
  return sig.classes.length > 0
    ? `${sig.tag}.${sig.classes.join(".")}`
    : sig.tag
}

/** iframe.js's `contentNode`: comments and blank text are formatting. */
function isFormatting(node: Node): boolean {
  return (
    node.nodeType === 8 ||
    (node.nodeType === 3 && (node.textContent ?? "").trim() === "")
  )
}

function domVariantAnchors(raw: string): Array<VariantAnchor> {
  const doc = new JSDOM(raw).window.document
  return [
    ...doc.querySelectorAll<HTMLTemplateElement>(
      'template[data-theme-variant="dark"]'
    ),
  ].map((tpl) => {
    let light = tpl.previousSibling
    while (light !== null && isFormatting(light)) light = light.previousSibling
    const first = [...tpl.content.childNodes].find((n) => !isFormatting(n))
    return {
      op: tpl.getAttribute("data-theme-op") === "insert" ? "insert" : "swap",
      light: light === null ? null : domSig(light),
      dark: first === undefined ? null : domSig(first),
      nested: tpl.content.querySelector("template") !== null,
    }
  })
}

describe("dark-swap-anchor — corpus cross-check against a DOM walk", () => {
  const all = slugs()

  for (const slug of all) {
    it(`${slug}: pairs every dark variant template the way a browser would`, () => {
      const halves = readPreviewHalves(join(PREVIEW, slug))
      if (halves === null) throw new Error(`${slug}: no usable preview layout`)
      // `served` is the authored document — the only string the templates
      // survive in, and the one the rule reads.
      for (const doc of halves.served) {
        expect(
          darkVariantAnchors(doc.html),
          `${slug}/${doc.name}: the walk and a DOM walk pair the templates differently`
        ).toEqual(domVariantAnchors(doc.html))
      }
    })
  }

  it("finds anchors to judge, and no mismatch in the shipped catalogue", () => {
    let anchors = 0
    const found: Array<string> = []
    for (const slug of all) {
      const halves = readPreviewHalves(join(PREVIEW, slug))
      if (halves === null) throw new Error(`${slug}: no usable preview layout`)
      for (const doc of halves.served) {
        anchors += darkVariantAnchors(doc.html).length
        for (const m of darkSwapAnchorMismatches(doc.html)) {
          found.push(`${slug}: ${sigLabel(m.light)} → ${sigLabel(m.dark)}`)
        }
      }
    }
    // A catalogue with no templates would make the assertion below vacuous.
    expect(anchors).toBeGreaterThan(0)
    expect(
      found,
      `dark swap templates standing behind a node they were not written for (light → template):\n${found.join("\n")}`
    ).toEqual([])
  })
})

// Shapes the generator never emits but a hand-written file may. Expectations
// are equality with jsdom, never a hand-written pairing — see STRUCTURE_FIXTURES.
const ANCHOR_FIXTURES: Array<[string, string]> = [
  [
    "indentation and a comment between the light node and the template",
    '<p class="a">L</p>\n  <!-- c -->\n  <template data-theme-variant="dark">\n    <p class="a">D</p>\n  </template>',
  ],
  [
    "nbsp between the light node and the template",
    '<p class="a">L</p>&nbsp;<template data-theme-variant="dark"><p class="a">D</p></template>',
  ],
  [
    "template with nothing in front of it",
    '<template data-theme-variant="dark"><p>D</p></template><p>L</p>',
  ],
  [
    "template whose first child is a comment",
    '<p class="a">L</p><template data-theme-variant="dark"><!-- c --><p class="b">D</p></template>',
  ],
  [
    "empty template",
    '<p class="a">L</p><template data-theme-variant="dark">  </template>',
  ],
  [
    "template holding only text",
    '<p class="a">L</p><template data-theme-variant="dark">bare</template>',
  ],
  [
    "data-theme-op inside another attribute value",
    '<p class="a">L</p><template data-theme-variant="dark" title="data-theme-op=insert"><p class="a">D</p></template>',
  ],
  [
    "template markup inside a script string",
    '<script>var a = "<template data-theme-variant=dark><p class=x>S</p></template>"</script><p class="a">L</p><template data-theme-variant="dark"><p class="a">D</p></template>',
  ],
  [
    "uppercase tags and single-quoted classes",
    "<DIV CLASS='a b'>L</DIV><TEMPLATE DATA-THEME-VARIANT='dark'><DIV CLASS='b a'>D</DIV></TEMPLATE>",
  ],
  [
    "text node in front of the template",
    '<div>bare text<template data-theme-variant="dark"><p>D</p></template></div>',
  ],
  [
    "class attribute carrying a character reference",
    '<p class="a&#32;b">L</p><template data-theme-variant="dark"><p class="a b">D</p></template>',
  ],
  [
    "a body tag written inside the template",
    '<p class="a">L</p><template data-theme-variant="dark"><body><p class="a">D</p></template>',
  ],
  [
    "a swap behind another variant template",
    '<p class="a">L</p><template data-theme-variant="dark" data-theme-op="insert"><p>I</p></template><template data-theme-variant="dark"><p class="a">D</p></template>',
  ],
  [
    "class attribute joined by a non-breaking space",
    '<p class="demo&nbsp;stack">L</p><template data-theme-variant="dark"><p class="stack">D</p></template>',
  ],
  [
    "control attributes written as character references",
    '<p class="a">L</p><template data-theme-variant="d&#97;rk" data-theme-op="ins&#101;rt"><p>I</p></template>',
  ],
  [
    "a comment mentioning a template inside the template",
    '<p class="a">L</p><template data-theme-variant="dark"><!-- <template later --><p class="a">D</p></template>',
  ],
  [
    "bare text in the template where an element stood",
    '<p class="a">L</p><template data-theme-variant="dark">bare</template>',
  ],
  [
    "a nested template, read as the first node",
    '<p class="a">L</p><template data-theme-variant="dark"><template><p>inner</p></template><p class="a">D</p></template>',
  ],
]

describe("dark-swap-anchor — structural fixtures cross-checked against a DOM walk", () => {
  for (const [label, body] of ANCHOR_FIXTURES) {
    it(`${label}: pairing matches a DOM walk`, () => {
      const html = `<!doctype html><html lang="ko" data-theme="light"><head></head><body><main>${body}</main></body></html>`
      expect(darkVariantAnchors(html)).toEqual(domVariantAnchors(html))
    })
  }
})

// Where the walk KNOWINGLY differs from a parser. Pinned as differences so the
// decision stays visible: if the walker ever learns these, the assertion flips
// and the list shrinks on purpose rather than by accident. None occurs in a
// shipped preview, and each errs toward not firing.
const ANCHOR_KNOWN_GAPS: Array<[string, string]> = [
  [
    // The parser foster-parents the <p> out of the table and leaves the
    // template inside; the walk keeps both where they were written.
    "foster parenting: a <p> and its template written inside a <table>",
    '<table class="t"><tr><td>x</td></tr><p class="a">L</p><template data-theme-variant="dark"><p class="a">D</p></template></table>',
  ],
  [
    // `&Tab;` is not in WHITESPACE_ENTITIES, so the walk reads it as a text
    // node and the anchor becomes text (exempt); the parser reads a blank.
    "a named whitespace reference outside the walker's list",
    '<p class="a">L</p>&Tab;<template data-theme-variant="dark"><p class="a">D</p></template>',
  ],
  [
    // The walk ends the outer template at the FIRST </template>, so the tail
    // leaks into the outer walk and stands in front of the next template.
    // The rule leaves nested templates out of the judgement for this reason.
    "a nested template's tail leaking in front of the next template",
    '<p class="a">L</p><template data-theme-variant="dark"><template><p>inner</p></template><div class="tail">D</div></template><template data-theme-variant="dark"><p class="a">E</p></template>',
  ],
]

describe("dark-swap-anchor — known gaps against a DOM walk", () => {
  for (const [label, body] of ANCHOR_KNOWN_GAPS) {
    it(`${label}: still differs from a DOM walk`, () => {
      const html = `<!doctype html><html lang="ko" data-theme="light"><head></head><body><main>${body}</main></body></html>`
      expect(darkVariantAnchors(html)).not.toEqual(domVariantAnchors(html))
    })
  }
})
