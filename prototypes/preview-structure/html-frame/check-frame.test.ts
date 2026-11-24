// PROTOTYPE — throwaway code. Tests for the html-frame promise check.
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { checkFrame } from "./check-frame"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

const cell = (name: string, label = `<p class="pv-label">${name}</p>`) =>
  `      <div class="pv-cell" data-pv-cell="${name}">
        ${label}
        <div class="pv-stage"><button type="button">x</button></div>
      </div>`

const zone = (id: string, title: string, cells: Array<string>) =>
  `  <section class="pv-zone" data-pv-zone="${id}" aria-labelledby="pv-${id}">
    <h2 class="pv-zone-title" id="pv-${id}">${title}</h2>
    <div class="pv-cells">
${cells.join("\n")}
    </div>
  </section>`

const SCREENS = zone("screens", "화면", [
  `      <div class="pv-cell pv-cell--wide" data-pv-cell="screen-home">
        <p class="pv-label">홈</p>
        <div class="pv-stage"><div class="pv-screen"><p>홈 화면</p></div></div>
      </div>`,
])
const BUTTONS = zone("buttons", "버튼", [cell("button-primary")])
const INPUTS = zone("inputs", "입력", [cell("text-field")])

const ROOT_VARS = `:root {
  --brand-ink: oklch(0.2 0 0);
  --pv-font: var(--brand-font);
  --pv-ink: var(--brand-ink);
  --pv-ink-muted: var(--brand-ink);
  --pv-canvas: var(--brand-ink);
  --pv-surface: var(--brand-ink);
  --pv-line: var(--brand-ink);
  --pv-radius: var(--brand-radius);
  --pv-tracking: -0.3px;
}`

function page(
  zones: Array<string>,
  {
    head = `<link rel="stylesheet" href="/preview/_runtime/tokens.css">
<link rel="stylesheet" href="/preview/_runtime/frame.css">
<script src="/preview/_runtime/iframe.js" defer></script>`,
    style = `${ROOT_VARS}\n.btn { color: red; }`,
  } = {}
) {
  return `<!doctype html>
<html lang="ko" data-theme="light">
<head>
<meta charset="utf-8">
<title>x preview</title>
${head}
<style>
${style}
</style>
<style>
[data-theme="dark"] { --brand-ink: oklch(0.9 0 0); }
</style>
</head>
<body>
<div class="catalog-disclaimer" role="note">면책</div>
<main class="pv-page">
  <header class="pv-hero" data-pv-zone="hero"><h1>브랜드</h1></header>
${zones.join("\n")}
</main>
</body>
</html>
`
}

const lineOf = (html: string, needle: string) =>
  html.slice(0, html.indexOf(needle)).split("\n").length

describe("checkFrame", () => {
  it("passes a page that keeps every promise", () => {
    expect(checkFrame(page([SCREENS, BUTTONS, INPUTS]))).toEqual([])
  })

  it.each(["chzzk", "toss"])("passes the served %s preview", (slug) => {
    const html = readFileSync(
      resolve(ROOT, `public/preview/${slug}/preview.html`),
      "utf8"
    )
    expect(checkFrame(html)).toEqual([])
  })

  it("passes the skeleton a new entry starts from", () => {
    const html = readFileSync(
      resolve(ROOT, "prototypes/preview-structure/html-frame/skeleton.html"),
      "utf8"
    )
    expect(checkFrame(html)).toEqual([])
  })

  it("catches zones out of order, on the line of the zone that came too late", () => {
    const html = page([SCREENS, INPUTS, BUTTONS])
    const problems = checkFrame(html)
    expect(problems.map((p) => p.code)).toEqual(["zone-order"])
    expect(problems[0].line).toBe(lineOf(html, 'data-pv-zone="buttons"'))
    expect(problems[0].message).toContain("buttons")
    expect(problems[0].message).toContain("inputs")
    expect(problems[0].fix).toMatch(/앞으로|옮긴다/)
  })

  it("catches an unknown zone and names the known ones", () => {
    const html = page([SCREENS, zone("tables", "표", [cell("table")])])
    const problems = checkFrame(html)
    expect(problems.map((p) => p.code)).toEqual(["zone-unknown"])
    expect(problems[0].line).toBe(lineOf(html, 'data-pv-zone="tables"'))
    expect(problems[0].fix).toContain("selection")
  })

  it("catches a cell without a label, on the cell's line", () => {
    const html = page([
      SCREENS,
      zone("buttons", "버튼", [cell("button-primary", "")]),
    ])
    const problems = checkFrame(html)
    expect(problems.map((p) => p.code)).toEqual(["cell-label"])
    expect(problems[0].line).toBe(lineOf(html, 'data-pv-cell="button-primary"'))
    expect(problems[0].message).toContain("button-primary")
    expect(problems[0].fix).toContain('<p class="pv-label">')
  })

  it("catches an empty label and a label that is not the first child", () => {
    const empty = page([
      SCREENS,
      zone("buttons", "버튼", [cell("a", '<p class="pv-label">  </p>')]),
    ])
    expect(checkFrame(empty).map((p) => p.code)).toEqual(["cell-label"])
    const late = page([
      SCREENS,
      zone("buttons", "버튼", [
        `      <div class="pv-cell" data-pv-cell="a">
        <div class="pv-stage"></div>
        <p class="pv-label">a</p>
      </div>`,
      ]),
    ])
    expect(checkFrame(late).map((p) => p.code)).toContain("cell-label")
  })

  it("catches a wrong zone title and a missing screens zone", () => {
    const title = page([SCREENS, zone("buttons", "Buttons", [cell("a")])])
    expect(checkFrame(title).map((p) => p.code)).toEqual(["zone-title"])
    expect(checkFrame(page([BUTTONS])).map((p) => p.code)).toEqual([
      "zone-missing",
    ])
  })

  it("catches duplicate and non-kebab cell names", () => {
    const html = page([
      SCREENS,
      zone("buttons", "버튼", [cell("a"), cell("a"), cell("Big_Button")]),
    ])
    expect(checkFrame(html).map((p) => p.code)).toEqual([
      "cell-name",
      "cell-name",
    ])
  })

  it("catches a missing frame link and a pasted frame block", () => {
    const noLink = page([SCREENS], {
      head: `<link rel="stylesheet" href="/preview/_runtime/tokens.css">
<script src="/preview/_runtime/iframe.js" defer></script>`,
    })
    expect(checkFrame(noLink).map((p) => p.code)).toEqual(["frame-link"])
    const pasted = page([SCREENS], {
      style: `/* pv-frame:start */\n/* pv-frame:end */\n${ROOT_VARS}`,
    })
    expect(checkFrame(pasted).map((p) => p.code)).toEqual(["frame-copy"])
  })

  it("catches page styles that reach into the frame", () => {
    const html = page([SCREENS], {
      style: `${ROOT_VARS}\n.pv-cell { padding: 0 }\n.x { --pv-gutter: 0 }`,
    })
    expect(checkFrame(html).map((p) => p.code)).toEqual([
      "page-names-frame",
      "page-redefines-gutter",
    ])
  })

  it("catches a missing or literal frame variable", () => {
    const html = page([SCREENS], {
      style: ROOT_VARS.replace(
        "var(--brand-ink);\n  --pv-ink-muted",
        "#000;\n  --pv-ink-muted"
      ).replace("  --pv-line: var(--brand-ink);\n", ""),
    })
    expect(checkFrame(html).map((p) => p.code)).toEqual([
      "frame-var",
      "frame-var",
    ])
  })

  it("catches an unknown pv- class and a zone inside a screen", () => {
    const html = page([
      zone("screens", "화면", [
        `      <div class="pv-cell" data-pv-cell="s">
        <p class="pv-label">s</p>
        <div class="pv-stage"><div class="pv-screen"><div class="pv-card">x</div></div></div>
      </div>`,
      ]),
    ])
    expect(checkFrame(html).map((p) => p.code)).toEqual([
      "frame-class",
      "screen-frame",
    ])
  })
})
