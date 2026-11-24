// PROTOTYPE — throwaway code. The contract check of the "components" structure.
//
// It reads finished HTML — what the build is about to write, or what is served
// from public/preview/ — so it also catches a served file someone edited by
// hand. The build runs it before writing and refuses to write on a problem.
// Every problem carries the served line and the zone/cell it is in, which is
// what `pnpm pv:where` takes to find the source.

import { parse } from "parse5"
import { ZONES, zoneIndex, zoneTitle } from "./zones.ts"
import type { DefaultTreeAdapterMap } from "parse5"

type Node = DefaultTreeAdapterMap["node"]
type Element = DefaultTreeAdapterMap["element"]

export interface Problem {
  /** 1-based line in the checked HTML. */
  line: number
  /** `zone/cell`, `zone`, or `page`. */
  where: string
  message: string
}

const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/

function isElement(node: Node): node is Element {
  return "tagName" in node
}

function kids(el: Element): Array<Element> {
  return el.childNodes.filter(isElement)
}

function attr(el: Element, name: string): string | undefined {
  return el.attrs.find((a) => a.name === name)?.value
}

function hasClass(el: Element, name: string): boolean {
  return (attr(el, "class") ?? "").split(/\s+/).includes(name)
}

function lineOf(el: Element): number {
  return el.sourceCodeLocation?.startLine ?? 0
}

function textOf(node: Node): string {
  if (node.nodeName === "#text") return (node as { value: string }).value
  if (!isElement(node)) return ""
  return node.childNodes.map(textOf).join("")
}

function walk(el: Element, visit: (el: Element) => void): void {
  for (const child of kids(el)) {
    visit(child)
    walk(child, visit)
  }
}

function find(root: Element, test: (el: Element) => boolean): Array<Element> {
  const out: Array<Element> = []
  walk(root, (el) => {
    if (test(el)) out.push(el)
  })
  return out
}

/** What a cell child is, as one letter: label, dark variant, dummy, stage. */
function shapeOf(el: Element): string {
  if (el.tagName === "p" && hasClass(el, "pv-label")) return "L"
  if (el.tagName === "template" && attr(el, "data-theme-variant") === "dark")
    return "t"
  if (hasClass(el, "catalog-dummy")) return "d"
  if (el.tagName === "div" && hasClass(el, "pv-stage")) return "S"
  return "?"
}

export function checkPreview(html: string): Array<Problem> {
  const out: Array<Problem> = []
  const say = (line: number, where: string, message: string): void => {
    out.push({ line, where, message })
  }
  const doc = parse(html, { sourceCodeLocationInfo: true })
  const htmlEl = kids(doc as unknown as Element).find(
    (e) => e.tagName === "html"
  )
  const body =
    htmlEl === undefined
      ? undefined
      : kids(htmlEl).find((e) => e.tagName === "body")
  if (body === undefined) {
    say(1, "page", "<body> 가 없다")
    return out
  }

  const first = kids(body).at(0)
  if (first === undefined || !hasClass(first, "catalog-disclaimer"))
    say(
      lineOf(body),
      "page",
      "<body> 의 첫 자식이 면책 띠(catalog-disclaimer)가 아니다. 면책 띠는 틀이 그리니 원본에 직접 쓰지 않는다"
    )

  const mains = find(
    body,
    (e) => e.tagName === "main" && hasClass(e, "pv-page")
  )
  if (mains.length !== 1) {
    say(
      lineOf(body),
      "page",
      `main.pv-page 가 ${mains.length}개다. 하나여야 한다`
    )
    return out
  }
  const page = mains[0]
  const pageKids = kids(page)
  const hero = pageKids.at(0)
  const rest = pageKids.slice(1)
  if (
    hero === undefined ||
    hero.tagName !== "header" ||
    !hasClass(hero, "pv-hero") ||
    attr(hero, "data-pv-zone") !== "hero"
  )
    say(
      lineOf(hero ?? page),
      "hero",
      "main 의 첫 자식이 header.pv-hero[data-pv-zone=hero] 가 아니다"
    )
  else if (find(hero, (e) => e.tagName === "h1").length !== 1)
    say(lineOf(hero), "hero", "히어로에 h1 이 하나가 아니다")

  const zones = [...rest]
  if (
    zones.at(-1) !== undefined &&
    hasClass(zones.at(-1) as Element, "catalog-attribution")
  )
    zones.pop()

  // Zone ids, order, titles.
  const order = ZONES.map((z) => z.id).join(", ")
  let lastIndex = -1
  let lastId = ""
  const seenZones = new Set<string>()
  const seenCells = new Set<string>()
  for (const zone of zones) {
    const id = attr(zone, "data-pv-zone") ?? ""
    const at = lineOf(zone)
    if (zone.tagName !== "section" || !hasClass(zone, "pv-zone")) {
      say(
        at,
        id || "page",
        `구역 자리에 section.pv-zone 이 아닌 <${zone.tagName}> 가 있다`
      )
      continue
    }
    const index = zoneIndex(id)
    if (index === -1) {
      say(
        at,
        id,
        `모르는 구역 "${id}". 구역은 ${order} 가운데 하나다(kit/zones.ts)`
      )
      continue
    }
    if (seenZones.has(id)) say(at, id, `구역 "${id}" 가 두 번 나온다`)
    seenZones.add(id)
    if (index < lastIndex)
      say(
        at,
        id,
        `구역 순서가 틀렸다: "${id}" 가 "${lastId}" 뒤에 있다. 순서는 ${order} 다(kit/zones.ts)`
      )
    else {
      lastIndex = index
      lastId = id
    }
    const zoneKids = kids(zone)
    const title = zoneKids.at(0)
    const cells = zoneKids.at(1)
    const extra = zoneKids.slice(2)
    if (
      title === undefined ||
      title.tagName !== "h2" ||
      !hasClass(title, "pv-zone-title") ||
      attr(title, "id") !== `pv-${id}` ||
      attr(zone, "aria-labelledby") !== `pv-${id}`
    )
      say(
        at,
        id,
        `구역 제목이 h2.pv-zone-title#pv-${id} 가 아니거나 aria-labelledby 와 맞지 않는다`
      )
    else if (textOf(title) !== zoneTitle(id))
      say(
        lineOf(title),
        id,
        `구역 제목이 "${textOf(title)}" 다. "${zoneTitle(id)}" 여야 한다`
      )
    if (
      cells === undefined ||
      !hasClass(cells, "pv-cells") ||
      extra.length !== 0
    ) {
      say(at, id, "구역 안이 제목 하나와 .pv-cells 하나가 아니다")
      continue
    }
    if (kids(cells).length === 0)
      say(at, id, "빈 구역이다. 칸이 없으면 구역을 뺀다")
    checkCells(id, cells, seenCells, say)
  }
  if (zones.length === 0 || attr(zones[0], "data-pv-zone") !== "screens")
    say(
      lineOf(zones[0] ?? page),
      "page",
      "히어로 바로 뒤 구역이 screens(화면)가 아니다"
    )

  // A screen is the brand's drawing: no frame inside it.
  for (const s of find(page, (e) => hasClass(e, "pv-screen"))) {
    const inner = find(
      s,
      (e) =>
        (attr(e, "class") ?? "")
          .split(/\s+/)
          .some((c) => c.startsWith("pv-")) ||
        e.attrs.some((a) => a.name.startsWith("data-pv-"))
    )
    if (inner.length !== 0)
      say(
        lineOf(inner[0]),
        "page",
        "화면(.pv-screen) 안에 틀의 class 나 data-pv-* 속성이 있다"
      )
  }
  for (const script of find(htmlEl as Element, (e) => e.tagName === "script")) {
    if (attr(script, "src") !== "/preview/_runtime/iframe.js")
      say(
        lineOf(script),
        "page",
        "자기 <script> 를 싣고 있다. 공용 iframe.js 만 쓴다"
      )
  }
  // Brand CSS does not reach into the frame (STANDARD §3).
  const lines = html.split("\n")
  const frameEnd = lines.findIndex((l) => l.startsWith("/* pv-frame:end */"))
  let inStyle = false
  lines.forEach((l, i) => {
    if (/^<style>/.test(l)) inStyle = true
    if (/<\/style>/.test(l)) inStyle = false
    if (!inStyle || i <= frameEnd) return
    const selector = l.includes("{") ? l.slice(0, l.indexOf("{")) : ""
    if (/\.pv-|\[data-pv-/.test(selector) || /--pv-gutter\s*:/.test(l))
      say(
        i + 1,
        "page",
        "브랜드 스타일이 틀의 선택자(.pv-*, [data-pv-*])나 --pv-gutter 를 다시 정의한다. 틀의 모양은 frame.css 한 곳에서 바꾼다"
      )
  })
  return out.sort((a, b) => a.line - b.line)
}

function checkCells(
  zoneId: string,
  cells: Element,
  seen: Set<string>,
  say: (line: number, where: string, message: string) => void
): void {
  for (const c of kids(cells)) {
    const name = attr(c, "data-pv-cell") ?? ""
    const where = `${zoneId}/${name || "?"}`
    const at = lineOf(c)
    if (!hasClass(c, "pv-cell") || !KEBAB.test(name)) {
      say(
        at,
        where,
        "칸이 data-pv-cell 에 kebab-case 이름을 가진 .pv-cell 이 아니다"
      )
      continue
    }
    if (seen.has(name)) say(at, where, `칸 이름 "${name}" 이 두 번 쓰였다`)
    seen.add(name)
    const shape = kids(c).map(shapeOf).join("")
    if (!shape.startsWith("L"))
      say(
        at,
        where,
        `칸 ${where} 에 이름표(p.pv-label)가 없다. 칸마다 이름표 하나를 단다`
      )
    else if (!/^Lt?d?S$/.test(shape))
      say(
        at,
        where,
        `칸 ${where} 의 자식 순서가 "${shape}" 다. 이름표, (다크 이름표), (더미 데이터 표기), 시연 자리 순서여야 한다`
      )
    const label = kids(c).find((e) => shapeOf(e) === "L")
    if (label !== undefined && textOf(label).trim() === "")
      say(lineOf(label), where, `칸 ${where} 의 이름표가 비어 있다`)
    for (const t of kids(c).filter((e) => shapeOf(e) === "t")) {
      const content = (t as unknown as { content: Element }).content
      const swapped = kids(content).at(0)
      if (
        swapped === undefined ||
        shapeOf(swapped) !== "L" ||
        textOf(swapped).trim() === ""
      )
        say(
          lineOf(t),
          where,
          `칸 ${where} 의 다크 이름표가 글이 있는 p.pv-label 이 아니다`
        )
    }
    const screens = find(c, (e) => hasClass(e, "pv-screen")).length
    const want = zoneId === "screens" ? 1 : 0
    if (screens !== want)
      say(
        at,
        where,
        `칸 ${where} 에 .pv-screen 이 ${screens}개다. 화면 칸에는 하나, 다른 칸에는 없어야 한다`
      )
  }
}

/** One line per problem, the way the build and the CLI print them. */
export function formatProblems(file: string, problems: Array<Problem>): string {
  return problems
    .map((p) => `${file}:${p.line} [${p.where}] ${p.message}`)
    .join("\n")
}
