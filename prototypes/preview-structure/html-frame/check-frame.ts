// PROTOTYPE — throwaway code. The promise check of the html-frame structure.
//
// In this structure every preview is one hand-written HTML file, and the frame's
// look (zone titles, the cell grid, labels) comes from one shared stylesheet,
// public/preview/_runtime/frame.css, which each preview links. The served file
// IS the source, so every line number below is a line of the served file.
//
//   pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts <slug|path> [more …]
//
// What it holds a preview to (prototypes/preview-structure/STANDARD.md §1–§3):
//   - the frame link: exactly one, right after the tokens.css link, before any
//     <style>; no pasted copy of the frame block;
//   - the page's own styles never name a frame selector (.pv-*, [data-pv-*]),
//     never redefine --pv-gutter, and frame elements carry no inline style;
//   - the --pv-* variables the frame reads are given in the first <style>, as
//     var(--…) references (weight and tracking may be literal);
//   - only the frame's own pv- classes (read from frame.css) appear;
//   - <main class="pv-page"> holds the hero first, then known zones in ZONES
//     order, each titled as ZONES says, `screens` present;
//   - every cell has a unique kebab-case name and its children in order:
//     label, (dark label template), (catalog-dummy), stage;
//   - .pv-screen sits only in the screens zone and holds no frame markup;
//   - no inline <script>.
//
// It does not look at what the preview validator already looks at (disclaimer,
// tokens.css, iframe.js, colours, sizes), nor at rendering (overflow, contrast).
//
// Exit 0: every promise held. Exit 1: problems (printed, one per line with
// file:line, what is wrong, how to fix). Exit 2: bad arguments or no such file.

import { existsSync, readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
export const FRAME_CSS = "public/preview/_runtime/frame.css"
const FRAME_HREF = "/preview/_runtime/frame.css"
const TOKENS_HREF = "/preview/_runtime/tokens.css"

/**
 * The zone list: id and title, in order. The ONE place it lives in this
 * structure — add, remove or reorder zones here and nowhere else.
 */
export const ZONES: ReadonlyArray<readonly [id: string, title: string]> = [
  ["screens", "화면"],
  ["buttons", "버튼"],
  ["inputs", "입력"],
  ["selection", "선택"],
  ["navigation", "내비게이션"],
  ["content", "콘텐츠"],
  ["feedback", "피드백"],
  ["brand", "브랜드 고유"],
]
const REQUIRED_ZONES = ["screens"]

/** Variables the frame reads; must be given as var(--…) references. */
const FRAME_VARS = [
  "font",
  "ink",
  "ink-muted",
  "canvas",
  "surface",
  "line",
  "radius",
]
/** Optional variables that may be literal (no token holds them). */
const LITERAL_VARS = ["title-weight", "tracking"]

export interface Problem {
  line: number
  code: string
  message: string
  fix: string
}

function frameClasses(): Set<string> {
  const css = readFileSync(resolve(ROOT, FRAME_CSS), "utf8")
  return new Set([...css.matchAll(/\.(pv-[a-z0-9-]+)/g)].map((m) => m[1]))
}

const zoneList = () => ZONES.map(([id]) => id).join(", ")
const kebab = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function checkFrame(html: string): Array<Problem> {
  const problems: Array<Problem> = []
  const add = (line: number, code: string, message: string, fix: string) =>
    problems.push({ line, code, message, fix })

  const dom = new JSDOM(html, { includeNodeLocations: true })
  const doc = dom.window.document
  const lineOf = (node: Node): number => dom.nodeLocation(node)?.startLine ?? 1
  const lineAt = (index: number) => html.slice(0, index).split("\n").length

  // --- the frame link -------------------------------------------------------
  const pasted = html.indexOf("pv-frame:start")
  if (pasted !== -1)
    add(
      lineAt(pasted),
      "frame-copy",
      "페이지에 틀 블록(pv-frame:start … pv-frame:end)의 사본이 있다",
      `블록을 통째로 지운다. 틀은 <link rel="stylesheet" href="${FRAME_HREF}"> 가 싣는다. 틀을 바꾸려면 ${FRAME_CSS} 를 고친다`
    )
  const links = [...doc.querySelectorAll(`link[href="${FRAME_HREF}"]`)]
  const tokens = doc.querySelector(`link[href="${TOKENS_HREF}"]`)
  const firstStyle = doc.querySelector("style")
  const linkFix = `<head> 의 tokens.css 링크 바로 다음 줄에 <link rel="stylesheet" href="${FRAME_HREF}"> 를 한 번만 둔다(첫 <style> 보다 앞)`
  if (links.length !== 1) {
    add(
      links.length > 1 ? lineOf(links[1]) : tokens ? lineOf(tokens) : 1,
      "frame-link",
      `틀 스타일 링크가 ${links.length}개다(하나여야 한다)`,
      linkFix
    )
  } else {
    const link = links[0]
    const placed =
      link.getAttribute("rel") === "stylesheet" &&
      link.parentElement === doc.head &&
      link.previousElementSibling === tokens &&
      (firstStyle === null ||
        link.compareDocumentPosition(firstStyle) &
          dom.window.Node.DOCUMENT_POSITION_FOLLOWING)
    if (!placed)
      add(
        lineOf(link),
        "frame-link",
        "틀 스타일 링크의 자리가 틀렸다. 캐스케이드 순서가 tokens.css, 틀, 페이지 스타일이어야 한다",
        linkFix
      )
  }

  // --- page styles ----------------------------------------------------------
  const styles = [...doc.querySelectorAll("style")]
  const defined = new Map<string, Array<{ line: number; value: string }>>()
  styles.forEach((style, n) => {
    const text = style.textContent
    // Comments out, newlines kept, so offsets still map to lines.
    const css = text.replace(/\/\*[\s\S]*?\*\//g, (c) =>
      c.replace(/[^\n]/g, " ")
    )
    const base =
      (dom.nodeLocation(style) as { startTag?: { endLine: number } } | null)
        ?.startTag?.endLine ?? lineOf(style)
    const at = (i: number) => base + css.slice(0, i).split("\n").length - 1
    for (const m of css.matchAll(/([^{};]*)\{/g)) {
      const prelude = m[1].trim()
      if (/\.pv-|\[data-pv-/.test(prelude))
        add(
          at(m.index + m[1].indexOf(prelude)),
          "page-names-frame",
          `페이지 스타일이 틀 선택자를 이름한다: ${prelude}`,
          `틀 요소(.pv-*, [data-pv-*])에 선언을 더하거나 덮지 않는다. 브랜드 class 를 따로 붙여 거기에 건다. 틀 자체를 바꿀 일이면 ${FRAME_CSS} 를 고친다`
        )
    }
    for (const m of css.matchAll(/--pv-([a-z-]+)\s*:\s*([^;}]*)/g)) {
      const [, name, value] = m
      const line = at(m.index)
      if (name === "gutter") {
        add(
          line,
          "page-redefines-gutter",
          "페이지 스타일이 --pv-gutter 를 다시 정의한다",
          "이 선언을 지운다. --pv-gutter 는 틀이 내주는 값이고, 페이지는 var(--pv-gutter) 로 읽기만 한다"
        )
        continue
      }
      if (n === 0) {
        const list = defined.get(name) ?? []
        list.push({ line, value: value.trim() })
        defined.set(name, list)
      }
      if (FRAME_VARS.includes(name) && !/^var\(--/.test(value.trim()))
        add(
          line,
          "frame-var",
          `--pv-${name} 의 값이 글자 값(${value.trim()})이다`,
          `브랜드 토큰을 참조로 준다(예: --pv-${name}: var(--브랜드-토큰)). 그래야 다크에서 토큰이 바뀔 때 틀도 따라간다`
        )
      else if (!FRAME_VARS.includes(name) && !LITERAL_VARS.includes(name))
        add(
          line,
          "frame-var",
          `틀이 모르는 변수 --pv-${name} 를 정의한다`,
          `틀이 읽는 변수는 ${[...FRAME_VARS, ...LITERAL_VARS].map((v) => `--pv-${v}`).join(", ")} 뿐이다. 브랜드 변수에는 pv- 접두를 쓰지 않는다`
        )
    }
  })
  for (const name of FRAME_VARS) {
    if (!defined.has(name))
      add(
        firstStyle ? lineOf(firstStyle) : 1,
        "frame-var",
        `첫 <style> 에 --pv-${name} 가 없다`,
        `첫 <style> 의 :root 에 --pv-${name}: var(--브랜드-토큰); 을 더한다`
      )
  }

  // --- markup ---------------------------------------------------------------
  const known = frameClasses()
  for (const el of [...doc.querySelectorAll("[class]")]) {
    for (const cls of el.classList) {
      if (cls.startsWith("pv-") && !known.has(cls))
        add(
          lineOf(el),
          "frame-class",
          `틀에 없는 class ${cls} 를 쓴다`,
          `pv- 접두는 틀만 쓴다(${[...known].join(", ")}). 브랜드 class 이면 다른 이름으로 바꾼다`
        )
    }
    if (
      [...el.classList].some((c) => c.startsWith("pv-")) &&
      el.hasAttribute("style")
    )
      add(
        lineOf(el),
        "frame-inline",
        "틀 요소에 인라인 style 이 있다",
        "style 속성을 지운다. 틀 요소의 모양은 frame.css 와 --pv-* 변수로만 정한다"
      )
  }
  for (const script of [...doc.querySelectorAll("script:not([src])")])
    add(
      lineOf(script),
      "own-script",
      "페이지에 자기 <script> 가 있다",
      "지운다. 켜고 끄기는 공용 iframe.js 의 data-pv-toggle 로 한다(STANDARD 5절)"
    )

  const mains = doc.querySelectorAll("main.pv-page")
  const main = [...mains].at(0)
  if (
    main === undefined ||
    mains.length !== 1 ||
    main.parentElement !== doc.body
  ) {
    add(
      main ? lineOf(main) : 1,
      "page-main",
      `<body> 바로 아래의 <main class="pv-page"> 가 ${mains.length}개다`,
      '면책 띠 다음에 <main class="pv-page"> 하나를 두고 히어로와 구역을 모두 그 안에 넣는다'
    )
    return sorted(problems)
  }

  const kids = [...main.children]
  const hero = kids.at(0)
  if (
    !hero?.matches('header.pv-hero[data-pv-zone="hero"]') ||
    hero.querySelectorAll("h1").length !== 1
  )
    add(
      hero ? lineOf(hero) : lineOf(main),
      "hero",
      '<main class="pv-page"> 의 첫 자식이 h1 하나를 가진 히어로가 아니다',
      '<main> 의 첫 자식으로 <header class="pv-hero" data-pv-zone="hero"> 를 두고 그 안에 <h1> 을 하나 둔다'
    )

  const names = new Map<string, Element>()
  const order = ZONES.map(([id]) => id)
  const seen = new Map<string, Element>()
  let last: { id: string; index: number } | undefined
  for (const zone of kids.slice(hero?.matches(".pv-hero") ? 1 : 0)) {
    const id = zone.getAttribute("data-pv-zone")
    const line = lineOf(zone)
    if (!zone.matches("section.pv-zone") || id === null) {
      add(
        line,
        "zone-shape",
        `<main> 안에 구역이 아닌 요소 <${zone.tagName.toLowerCase()}> 가 있다`,
        `<main> 의 자식은 히어로와 <section class="pv-zone" data-pv-zone="…"> 뿐이다. 이 요소를 알맞은 구역의 칸 안으로 옮긴다`
      )
      continue
    }
    const index = order.indexOf(id)
    if (index === -1) {
      add(
        line,
        "zone-unknown",
        `모르는 구역 "${id}"`,
        `data-pv-zone 은 ${zoneList()} 가운데 하나다. 구역을 새로 만들려면 check-frame.ts 의 ZONES 에 더한다`
      )
      continue
    }
    if (seen.has(id)) {
      add(
        line,
        "zone-duplicate",
        `구역 "${id}" 가 두 번 나온다(앞의 것은 ${lineOf(seen.get(id)!)}줄)`,
        "두 구역의 칸을 앞의 구역 하나로 합친다"
      )
      continue
    }
    seen.set(id, zone)
    if (last && index < last.index)
      add(
        line,
        "zone-order",
        `구역 "${id}" 가 구역 "${last.id}" 뒤에 있다`,
        `"${id}" 구역(<section> 통째)을 "${last.id}" 구역 앞으로 옮긴다. 순서는 ${zoneList()}`
      )
    else last = { id, index }
    checkZone(zone, id, ZONES[index][1])
  }
  for (const id of REQUIRED_ZONES)
    if (!seen.has(id))
      add(
        lineOf(main),
        "zone-missing",
        `필수 구역 "${id}" 가 없다`,
        `<section class="pv-zone" data-pv-zone="${id}"> 를 히어로 바로 뒤에 둔다`
      )

  function checkZone(zone: Element, id: string, title: string) {
    const line = lineOf(zone)
    const children = [...zone.children]
    const h2 = children.at(0)
    const cells = children.at(1)
    const rest = children.slice(2)
    if (zone.getAttribute("aria-labelledby") !== `pv-${id}`)
      add(
        line,
        "zone-shape",
        `구역 "${id}" 의 aria-labelledby 가 "pv-${id}" 가 아니다`,
        `<section> 에 aria-labelledby="pv-${id}" 를 단다`
      )
    if (!h2?.matches(`h2.pv-zone-title#pv-${id}`))
      add(
        h2 ? lineOf(h2) : line,
        "zone-shape",
        `구역 "${id}" 의 첫 자식이 제목이 아니다`,
        `구역의 첫 자식으로 <h2 class="pv-zone-title" id="pv-${id}">${title}</h2> 를 둔다`
      )
    else if (h2.textContent.trim() !== title)
      add(
        lineOf(h2),
        "zone-title",
        `구역 "${id}" 의 제목이 "${h2.textContent.trim()}" 다`,
        `제목 글자를 "${title}" 로 바꾼다(제목은 ZONES 의 것만 쓴다)`
      )
    if (!cells?.matches("div.pv-cells") || rest.length > 0) {
      add(
        cells ? lineOf(cells) : line,
        "zone-shape",
        `구역 "${id}" 에 제목 다음 <div class="pv-cells"> 하나만 있지 않다`,
        "제목 다음에 .pv-cells 하나를 두고 모든 칸을 그 안에 넣는다"
      )
      if (!cells?.matches("div.pv-cells")) return
    }
    for (const cell of [...cells.children]) checkCell(cell, id)
  }

  function checkCell(cell: Element, zoneId: string) {
    const line = lineOf(cell)
    if (!cell.matches("div.pv-cell")) {
      add(
        line,
        "cell-shape",
        `.pv-cells 안에 칸이 아닌 <${cell.tagName.toLowerCase()}> 가 있다`,
        '이 요소를 <div class="pv-cell" data-pv-cell="…"> 로 감싸 이름표와 시연 자리를 준다'
      )
      return
    }
    const name = cell.getAttribute("data-pv-cell") ?? ""
    if (!kebab.test(name))
      add(
        line,
        "cell-name",
        `칸 이름 data-pv-cell="${name}" 가 kebab-case 가 아니다`,
        "소문자, 숫자, 하이픈만 쓴다(예: button-primary)"
      )
    else if (names.has(name))
      add(
        line,
        "cell-name",
        `칸 이름 "${name}" 가 겹친다(앞의 것은 ${lineOf(names.get(name)!)}줄)`,
        "파일 안에서 유일한 이름으로 바꾼다"
      )
    else names.set(name, cell)
    const parts = [...cell.children]
    const label = parts.at(0)
    let i = label?.matches("p.pv-label") ? 1 : 0
    if (i === 0 || !label?.textContent.trim())
      add(
        line,
        "cell-label",
        `칸 "${name}" 에 이름표가 없다${label?.matches("p.pv-label") ? "(이름표가 비었다)" : ""}`,
        `칸의 첫 자식으로 <p class="pv-label">컴포넌트 이름</p> 을 둔다. 이름표가 없던 칸은 md 의 컴포넌트 이름만 단다`
      )
    if (parts.at(i)?.matches('template[data-theme-variant="dark"]')) {
      const swap = (parts[i] as HTMLTemplateElement).content.children
      if (swap.length !== 1 || !swap[0].matches("p.pv-label"))
        add(
          lineOf(parts[i]),
          "cell-shape",
          `칸 "${name}" 의 다크 template 이 이름표 하나를 싣지 않는다`,
          '이름표 바로 뒤의 template 안에는 <p class="pv-label">다크 글</p> 하나만 둔다'
        )
      i++
    }
    if (parts.at(i)?.matches(".catalog-dummy")) i++
    const stage = parts.at(i)
    if (!stage?.matches("div.pv-stage") || i !== parts.length - 1)
      add(
        stage ? lineOf(stage) : line,
        "cell-shape",
        `칸 "${name}" 의 자식 순서가 틀렸다: ${parts.map((k) => describe(k)).join(", ")}`,
        '칸의 자식은 이름표, (다크 이름표 template), (catalog-dummy), <div class="pv-stage"> 순서이고 시연 자리가 마지막 하나다'
      )
    for (const screen of [...cell.querySelectorAll(".pv-screen")]) {
      if (zoneId !== "screens")
        add(
          lineOf(screen),
          "screen-frame",
          `화면 재현 .pv-screen 이 "${zoneId}" 구역에 있다`,
          ".pv-screen 은 screens 구역의 칸에만 둔다. 화면이 아니면 .pv-screen 을 브랜드 class 로 바꾼다"
        )
      const inner = screen.querySelector(
        '[class*="pv-"], [data-pv-zone], [data-pv-cell]'
      )
      if (inner)
        add(
          lineOf(inner),
          "screen-frame",
          ".pv-screen 안에 틀의 class 나 구역, 칸이 있다",
          ".pv-screen 안은 브랜드 마크업만 쓴다. pv- class 와 data-pv-zone, data-pv-cell 을 지운다"
        )
    }
  }

  return sorted(problems)
}

function describe(el: Element): string {
  const tag = el.tagName.toLowerCase()
  const cls = el.getAttribute("class")
  return cls ? `${tag}.${cls.split(/\s+/).join(".")}` : tag
}

const sorted = (problems: Array<Problem>) =>
  problems
    .map((p, n) => ({ p, n }))
    .sort((a, b) => a.p.line - b.p.line || a.n - b.n)
    .map(({ p }) => p)

export function format(file: string, problems: Array<Problem>): string {
  return problems
    .map(
      (p) =>
        `${file}:${p.line}  [${p.code}] ${p.message}\n    고치는 법: ${p.fix}`
    )
    .join("\n")
}

function run(args: Array<string>): number {
  if (args.length === 0) {
    console.error("usage: check-frame.ts <slug|path/to/preview.html> [more …]")
    return 2
  }
  let failed = false
  for (const arg of args) {
    const file = /[\\/]|\.html$/.test(arg)
      ? arg
      : `public/preview/${arg}/preview.html`
    const path = resolve(process.cwd(), file)
    if (!existsSync(path)) {
      console.error(`no such file: ${file}`)
      return 2
    }
    const problems = checkFrame(readFileSync(path, "utf8"))
    if (problems.length === 0) {
      console.log(`ok    ${file}`)
      continue
    }
    failed = true
    console.log(`FAIL  ${file} — ${problems.length} problem(s)`)
    console.log(format(file, problems))
  }
  return failed ? 1 : 0
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
)
  process.exit(run(process.argv.slice(2)))
