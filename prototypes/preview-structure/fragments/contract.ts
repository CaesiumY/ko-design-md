// PROTOTYPE — the promise check of the "fragments" structure (ticket 729).
//
// Two halves:
//   - checkPreview(source): the fragment grammar (unknown zone file, missing
//     required zone, cell without a label, frame markup written by hand, …)
//     and then the served-file promises on a fresh assembly, every finding
//     pointed back at a source file and line.
//   - checkServed(html): the same promises read off any served HTML — the
//     committed file, a staged one, or one edited by hand. Zone order cannot go
//     wrong in the fragments (the common list sets it), so a wrong order can
//     only show up here.

import { parse } from "parse5"
import { assemble } from "./assemble"
import { HERO_ID, ZONES, ZONES_FILE } from "./zones"
import type { DefaultTreeAdapterMap } from "parse5"
import type { Finding, Origin, PreviewSource } from "./assemble"

type Node = DefaultTreeAdapterMap["node"]
type Element = DefaultTreeAdapterMap["element"]

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function isElement(n: Node): n is Element {
  return "tagName" in n
}
function kids(n: Node): Array<Element> {
  return "childNodes" in n ? n.childNodes.filter(isElement) : []
}
function attr(el: Element, name: string): string | undefined {
  return el.attrs.find((a) => a.name === name)?.value
}
function hasClass(el: Element, cls: string): boolean {
  return (attr(el, "class") ?? "").split(/\s+/).includes(cls)
}
function text(n: Node): string {
  if (n.nodeName === "#text")
    return (n as DefaultTreeAdapterMap["textNode"]).value
  if (isElement(n) && n.tagName === "template") return ""
  return "childNodes" in n ? n.childNodes.map(text).join("") : ""
}
function lineOf(el: Element): number {
  return el.sourceCodeLocation?.startLine ?? 0
}

/**
 * Checks a served preview against the structure's promises. Lines are the
 * served file's; with `origins` (from a fresh assembly) each finding is moved
 * to the source line it came from.
 */
export function checkServed(
  html: string,
  servedPath: string,
  origins?: Array<Origin>
): Array<Finding> {
  const findings: Array<Finding> = []
  const slug =
    /preview\/([^/]+)\/preview\.html$/.exec(
      servedPath.replace(/\\/g, "/")
    )?.[1] ?? "{slug}"
  const rebuild = ` 서빙 파일을 손으로 고쳤다면 원본(preview-src/${slug}/)을 고치고 \`pnpm previews:build ${slug}\` 로 다시 만든다.`
  const at = (line: number, message: string) => {
    const o = origins?.[line - 1]
    if (o)
      findings.push({
        file: o.file,
        line: o.line,
        message: `${message} (서빙 파일 ${servedPath}:${line})`,
      })
    else findings.push({ file: servedPath, line, message: message + rebuild })
  }

  const doc = parse(html, { sourceCodeLocationInfo: true })
  const htmlEl = kids(doc).find((e) => e.tagName === "html")
  const body = htmlEl && kids(htmlEl).find((e) => e.tagName === "body")
  if (!body) {
    at(1, "<body> 가 없다.")
    return findings
  }
  const top = kids(body)
  if (!top[0] || !hasClass(top[0], "catalog-disclaimer"))
    at(
      top[0] ? lineOf(top[0]) : 1,
      "<body> 의 첫 자식이 면책 띠 `catalog-disclaimer` 가 아니다."
    )
  const main = top.find((e) => e.tagName === "main" && hasClass(e, "pv-page"))
  if (!main) {
    at(1, '`<main class="pv-page">` 가 없다.')
    return findings
  }
  const parts = kids(main)
  const hero = parts.at(0)
  if (
    !hero ||
    hero.tagName !== "header" ||
    attr(hero, "data-pv-zone") !== HERO_ID
  )
    at(
      hero ? lineOf(hero) : lineOf(main),
      '`<main>` 의 첫 자식이 `<header class="pv-hero" data-pv-zone="hero">` 가 아니다.'
    )

  const order = ZONES.map((z) => z.id)
  let lastIdx = -1
  let lastId = ""
  const seenZones = new Set<string>()
  const seenCells = new Map<string, number>()
  for (const sec of parts.slice(hero?.tagName === "header" ? 1 : 0)) {
    const id = attr(sec, "data-pv-zone")
    const line = lineOf(sec)
    if (
      sec.tagName !== "section" ||
      !hasClass(sec, "pv-zone") ||
      id === undefined
    ) {
      at(
        line,
        `\`<main>\` 안에 구역이 아닌 요소 \`<${sec.tagName}>\` 가 있다. 히어로 뒤에는 구역(section.pv-zone)만 둔다.`
      )
      continue
    }
    const idx = order.indexOf(id)
    if (idx < 0) {
      at(
        line,
        `모르는 구역 \`${id}\`. 구역은 ${ZONES_FILE} 의 목록(${order.join(", ")}) 가운데 하나다.`
      )
      continue
    }
    if (seenZones.has(id)) at(line, `구역 \`${id}\` 이 두 번 있다.`)
    else if (idx < lastIdx)
      at(
        line,
        `구역 순서가 틀렸다: \`${id}\` 가 \`${lastId}\` 뒤에 있다. 순서는 항목이 아니라 ${ZONES_FILE} 의 목록이 정한다(${order.join(" → ")}).`
      )
    seenZones.add(id)
    if (idx > lastIdx) {
      lastIdx = idx
      lastId = id
    }
    const zone = ZONES[idx]
    if (attr(sec, "aria-labelledby") !== `pv-${id}`)
      at(line, `구역 \`${id}\` 의 aria-labelledby 가 "pv-${id}" 가 아니다.`)
    const secKids = kids(sec)
    const h2 = secKids.at(0)
    const cells = secKids.at(1)
    const rest = secKids.slice(2)
    if (
      !h2 ||
      h2.tagName !== "h2" ||
      !hasClass(h2, "pv-zone-title") ||
      attr(h2, "id") !== `pv-${id}` ||
      text(h2).trim() !== zone.title
    )
      at(
        h2 ? lineOf(h2) : line,
        `구역 \`${id}\` 의 제목은 \`<h2 class="pv-zone-title" id="pv-${id}">${zone.title}</h2>\` 이어야 한다.`
      )
    if (!cells || !hasClass(cells, "pv-cells") || rest.length > 0) {
      at(line, `구역 \`${id}\` 안에는 제목 다음에 \`.pv-cells\` 하나만 둔다.`)
      continue
    }
    for (const cell of kids(cells)) {
      const cl = lineOf(cell)
      const name = attr(cell, "data-pv-cell")
      if (!hasClass(cell, "pv-cell") || name === undefined) {
        at(
          cl,
          `구역 \`${id}\` 의 .pv-cells 안에 칸(div.pv-cell[data-pv-cell])이 아닌 요소가 있다.`
        )
        continue
      }
      if (!KEBAB.test(name))
        at(cl, `칸 이름 "${name}" 이 kebab-case 가 아니다.`)
      const prev = seenCells.get(name)
      if (prev !== undefined)
        at(
          cl,
          `칸 이름 \`${name}\` 이 ${prev}줄에도 있다. 칸 이름은 파일 안에서 하나뿐이다.`
        )
      else seenCells.set(name, cl)
      const ch = kids(cell)
      let i = 0
      if (ch[i]?.tagName === "p" && hasClass(ch[i], "pv-label")) {
        if (text(ch[i]).trim() === "")
          at(lineOf(ch[i]), `칸 \`${name}\` 의 이름표가 비어 있다.`)
        i++
      } else {
        at(
          cl,
          `칸 \`${name}\` 에 이름표가 없다. 칸의 첫 자식은 \`<p class="pv-label">\` 이다(원본에서는 \`<pv-label>\`).`
        )
      }
      if (
        ch[i]?.tagName === "template" &&
        attr(ch[i], "data-theme-variant") === "dark"
      )
        i++
      if (ch[i]?.tagName === "p" && hasClass(ch[i], "catalog-dummy")) i++
      if (!ch[i] || !hasClass(ch[i], "pv-stage")) {
        at(
          ch[i] ? lineOf(ch[i]) : cl,
          `칸 \`${name}\` 의 자식 순서가 틀렸다. 이름표, (다크 이름표), (더미 데이터 표기), 시연 자리 순서다.`
        )
        continue
      }
      i++
      if (ch[i])
        at(
          lineOf(ch[i]),
          `칸 \`${name}\` 의 시연 자리 뒤에 요소가 있다. 시연 자리 안으로 옮긴다.`
        )
    }
  }
  return findings
}

/** The whole promise check for one item written as fragments. */
export function checkPreview(src: PreviewSource): Array<Finding> {
  const { assembled, findings } = assemble(src)
  if (!assembled) return findings
  return checkServed(
    assembled.html,
    `public/preview/${src.slug}/preview.html`,
    assembled.origins
  )
}
