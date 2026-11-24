// PROTOTYPE — "fragments" structure (ticket 729). Reads one item's fragments
// and writes the served preview.html around them.
//
// An item has (preview-src/{slug}/):
//   brand.css          the light sheet: everything after the frame block in the first <style>
//   dark.css           the second <style> (the dark sheet)
//   zones/hero.html    the inside of <header class="pv-hero">
//   zones/{zone}.html  one file per zone it draws, holding only <pv-cell> blocks
//
// The skeleton — head, disclaimer, <main>, zone wrappers and titles, the cell,
// label and stage wrappers, and the frame block from frame.css — is written
// here, so the item never writes it. Assembly is line for line: every output
// line comes from exactly one source line or from this skeleton, which is what
// `pnpm previews:where` reads back.
//
// Cell grammar (one zone file):
//
//   <pv-cell name="kebab-name" [wide] [stack]>      column 0
//     <pv-label>label, may hold markup</pv-label>   required, first, one line
//     <template data-theme-variant="dark"><pv-label>…</pv-label></template>   optional
//     <p class="catalog-dummy">…</p>                 optional
//     …demo markup, indented two spaces…              the stage
//     <pv-screen> … </pv-screen>                      a screen recreation's box
//   </pv-cell>                                       column 0
//
// Blank lines between cells are kept. Nothing else may sit outside a cell.

import {
  ASSEMBLER_FILE,
  DISCLAIMER_HTML,
  FRAME_CSS,
  HERO_ID,
  REQUIRED_ZONES,
  ZONES,
  ZONES_FILE,
} from "./zones"

export interface SourceFile {
  path: string
  text: string
}

export interface ZoneFile extends SourceFile {
  zone: string
}

export interface PreviewSource {
  slug: string
  title: string
  frameCss: string
  brandCss: SourceFile
  darkCss: SourceFile
  zones: Array<ZoneFile>
}

/** A place in a source file. Line 0 means "the file as a whole". */
export interface Origin {
  file: string
  line: number
}

export interface Finding extends Origin {
  message: string
}

export interface Assembled {
  html: string
  /** origins[i] is where output line i + 1 came from. */
  origins: Array<Origin>
}

interface Line {
  line: number
  text: string
}

interface Cell {
  name: string
  wide: boolean
  stack: boolean
  open: number
  label?: Line
  dark?: Line
  dummy?: Line
  body: Array<Line>
  close: number
}

type ZoneItem = { blank: number } | { cell: Cell }

const KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const OPEN = /^<pv-cell(\s[^>]*)?>$/
const CLOSE = /^<\/pv-cell>$/
const LABEL = /^ {2}<pv-label>(.*)<\/pv-label>$/
const DARK =
  /^ {2}<template data-theme-variant="dark"><pv-label>(.*)<\/pv-label><\/template>$/
const DUMMY = /^ {2}<p class="catalog-dummy">(.*)<\/p>$/
/** Frame markup an item must not write itself. */
const FRAME_MARKUP =
  /class="[^"]*\bpv-|data-pv-(?:zone|cell)\b|<pv-(?!screen>|label>)|<\/pv-(?!screen>|label>)/

export function splitLines(text: string): Array<string> {
  const lines = text.replace(/\r\n/g, "\n").split("\n")
  if (lines.at(-1) === "") lines.pop()
  return lines
}

export function textOf(markup: string): string {
  return markup
    .replace(/<template[\s\S]*?<\/template>/g, "")
    .replace(/<[^>]*>/g, "")
    .trim()
}

const HOW_TO_LABEL =
  "`<pv-cell …>` 바로 다음 줄에 `  <pv-label>md 의 컴포넌트 이름</pv-label>` 을 둔다(STANDARD 2절)"

function parseZone(file: ZoneFile): {
  items: Array<ZoneItem>
  findings: Array<Finding>
} {
  const items: Array<ZoneItem> = []
  const findings: Array<Finding> = []
  const at = (line: number, message: string) =>
    findings.push({ file: file.path, line, message })
  const lines = splitLines(file.text)
  let cell: Cell | undefined
  let phase: "label" | "dark" | "dummy" | "body" = "label"

  lines.forEach((text, i) => {
    const line = i + 1
    if (!cell) {
      if (text.trim() === "") {
        items.push({ blank: line })
        return
      }
      const open = OPEN.exec(text)
      if (!open) {
        at(
          line,
          `칸 밖에 내용이 있다. 구역 조각의 내용은 모두 \`<pv-cell name="…">\` 와 \`</pv-cell>\`(둘 다 줄 머리) 사이에 둔다`
        )
        return
      }
      cell = {
        name: "",
        wide: false,
        stack: false,
        open: line,
        body: [],
        close: 0,
      }
      phase = "label"
      for (const m of (open.at(1) ?? "").matchAll(
        /([^\s=]+)(?:="([^"]*)")?/g
      )) {
        const key = m.at(1)
        const value = m.at(2)
        if (key === "name" && value !== undefined) cell.name = value
        else if (key === "wide" && value === undefined) cell.wide = true
        else if (key === "stack" && value === undefined) cell.stack = true
        else
          at(
            line,
            `칸의 속성 \`${m[0]}\` 을 모른다. 쓸 수 있는 것은 name="…", wide(넓은 칸), stack(세로로 쌓는 시연)뿐이다`
          )
      }
      if (!KEBAB.test(cell.name))
        at(
          line,
          `칸 이름 "${cell.name}" 이 kebab-case 가 아니다. name="button-primary" 처럼 영소문자와 숫자, 하이픈으로 쓴다`
        )
      return
    }

    if (CLOSE.test(text)) {
      if (!cell.label)
        at(cell.open, `칸 \`${cell.name}\` 에 이름표가 없다. ${HOW_TO_LABEL}`)
      if (cell.body.every((b) => b.text.trim() === ""))
        at(
          cell.open,
          `칸 \`${cell.name}\` 의 시연 자리가 비었다. 이름표 아래에 시연 마크업을 둔다`
        )
      cell.close = line
      items.push({ cell })
      cell = undefined
      return
    }
    if (OPEN.test(text)) {
      at(
        line,
        `칸 \`${cell.name}\`(${cell.open}줄)이 닫히기 전에 새 칸이 열렸다. 앞 칸 끝에 \`</pv-cell>\` 을 둔다`
      )
      return
    }
    if (phase === "label") {
      const m = LABEL.exec(text)
      phase = "dark"
      if (m) {
        cell.label = { line, text: m[1] }
        if (textOf(m[1]) === "")
          at(
            line,
            `칸 \`${cell.name}\` 의 이름표가 비어 있다. md 의 컴포넌트 이름을 적는다`
          )
        return
      }
    }
    if (phase === "dark") {
      phase = "dummy"
      const m = DARK.exec(text)
      if (m && cell.label) {
        cell.dark = { line, text: m[1] }
        return
      }
    }
    if (phase === "dummy") {
      phase = "body"
      const m = DUMMY.exec(text)
      if (m && cell.label) {
        cell.dummy = { line, text: m[1] }
        return
      }
    }
    if (text.trim() !== "" && !text.startsWith("  "))
      at(
        line,
        `칸 \`${cell.name}\` 의 시연 줄은 두 칸 이상 들여 쓴다(조립기가 들여쓰기를 더한다)`
      )
    else if (text.includes("<pv-label>"))
      at(
        line,
        `이름표와 다크 이름표는 칸의 첫 줄부터 이름표, 다크 이름표, 더미 데이터 표기 순서로만 둔다. 시연 사이에 끼우지 않는다`
      )
    else if (FRAME_MARKUP.test(text))
      at(
        line,
        `틀의 마크업(pv- class, data-pv-zone, data-pv-cell, 모르는 <pv-…> 태그)은 조립기가 쓴다. 조각에서는 지우고, 화면 재현의 상자는 <pv-screen> 으로 쓴다`
      )
    cell.body.push({ line, text })
  })

  if (cell)
    at(
      cell.open,
      `칸 \`${cell.name}\` 이 닫히지 않았다. 끝에 줄 머리부터 \`</pv-cell>\` 을 둔다`
    )
  return { items, findings }
}

/** Reads, checks the grammar of, and assembles one item. */
export function assemble(src: PreviewSource): {
  assembled?: Assembled
  findings: Array<Finding>
} {
  const findings: Array<Finding> = []
  const known = new Set([HERO_ID, ...ZONES.map((z) => z.id)])
  const byZone = new Map<string, ZoneFile>()
  for (const z of src.zones) {
    if (!known.has(z.zone)) {
      findings.push({
        file: z.path,
        line: 0,
        message: `모르는 구역 \`${z.zone}\`. 구역 파일의 이름은 ${ZONES_FILE} 의 구역 식별자(${[HERO_ID, ...ZONES.map((x) => x.id)].join(", ")}) 가운데 하나다. 새 구역이면 그 목록에 먼저 더한다`,
      })
      continue
    }
    byZone.set(z.zone, z)
  }
  for (const id of REQUIRED_ZONES)
    if (!byZone.has(id))
      findings.push({
        file: `${src.brandCss.path.replace(/brand\.css$/, "")}zones/${id}.html`,
        line: 0,
        message: `필수 구역 \`${id}\` 의 조각이 없다. 이 파일을 만든다(STANDARD 1절)`,
      })

  const hero = byZone.get(HERO_ID)
  if (hero)
    splitLines(hero.text).forEach((text, i) => {
      if (FRAME_MARKUP.test(text) || /<pv-(?:screen|label)>/.test(text))
        findings.push({
          file: hero.path,
          line: i + 1,
          message: `히어로 안에는 틀의 마크업(pv- class, <pv-…> 태그)을 쓰지 않는다. 히어로의 감싸개는 조립기가 쓴다`,
        })
    })

  const parsed: Array<[ZoneFile, Array<ZoneItem>]> = []
  const seen = new Map<string, string>()
  for (const zone of ZONES) {
    const file = byZone.get(zone.id)
    if (!file) continue
    const r = parseZone(file)
    findings.push(...r.findings)
    for (const item of r.items) {
      if (!("cell" in item) || item.cell.name === "") continue
      const first = seen.get(item.cell.name)
      if (first)
        findings.push({
          file: file.path,
          line: item.cell.open,
          message: `칸 이름 \`${item.cell.name}\` 이 이미 ${first} 에 있다. 칸 이름은 파일 안에서 하나뿐이어야 한다`,
        })
      else seen.set(item.cell.name, `${file.path}:${item.cell.open}`)
    }
    parsed.push([file, r.items])
  }
  if (findings.length > 0 || !hero) return { findings }

  const out: Array<string> = []
  const origins: Array<Origin> = []
  const skel = (text: string, line = 0) => {
    out.push(text)
    origins.push({ file: ASSEMBLER_FILE, line })
  }
  const from = (file: string, line: number, text: string) => {
    out.push(text)
    origins.push({ file, line })
  }
  const zoneSkel = (text: string) => {
    out.push(text)
    origins.push({ file: ZONES_FILE, line: 0 })
  }

  skel("<!doctype html>")
  skel('<html lang="ko" data-theme="light">')
  skel("<head>")
  skel('<meta charset="utf-8">')
  skel('<meta name="robots" content="noindex">')
  skel('<meta name="viewport" content="width=device-width, initial-scale=1">')
  skel(`<title>${src.title}</title>`)
  skel(
    `<!-- 조립된 파일이다. 손으로 고치지 않는다. 원본은 preview-src/${src.slug}/, 다시 만들기는 pnpm previews:build ${src.slug}, 이 파일의 줄에서 원본 찾기는 pnpm previews:where ${src.slug} <줄> -->`
  )
  skel('<link rel="stylesheet" href="/preview/_runtime/tokens.css">')
  skel('<script src="/preview/_runtime/iframe.js" defer></script>')
  skel("<style>")
  const frameLines = splitLines(src.frameCss)
  const start = frameLines.findIndex((l) => l.startsWith("/* pv-frame:start"))
  const end = frameLines.findIndex((l) => l.startsWith("/* pv-frame:end"))
  if (start < 0 || end < start)
    return {
      findings: [
        {
          file: FRAME_CSS,
          line: 0,
          message:
            "틀 블록의 표지(/* pv-frame:start …, /* pv-frame:end */)를 찾지 못했다",
        },
      ],
    }
  for (let i = start; i <= end; i++) from(FRAME_CSS, i + 1, frameLines[i])
  splitLines(src.brandCss.text).forEach((t, i) =>
    from(src.brandCss.path, i + 1, t)
  )
  skel("</style>")
  skel("<style>")
  splitLines(src.darkCss.text).forEach((t, i) =>
    from(src.darkCss.path, i + 1, t)
  )
  skel("</style>")
  skel("</head>")
  skel("<body>")
  skel(DISCLAIMER_HTML)
  skel('<main class="pv-page">')
  skel("")
  zoneSkel(`  <header class="pv-hero" data-pv-zone="${HERO_ID}">`)
  splitLines(hero.text).forEach((t, i) =>
    from(hero.path, i + 1, t.trim() === "" ? "" : `    ${t}`)
  )
  zoneSkel("  </header>")

  for (const [file, items] of parsed) {
    if (file.zone === HERO_ID) continue
    const zone = ZONES.find((z) => z.id === file.zone)!
    skel("")
    zoneSkel(
      `  <section class="pv-zone" data-pv-zone="${zone.id}" aria-labelledby="pv-${zone.id}">`
    )
    zoneSkel(
      `    <h2 class="pv-zone-title" id="pv-${zone.id}">${zone.title}</h2>`
    )
    zoneSkel('    <div class="pv-cells">')
    // Blank lines before the first and after the last cell carry nothing.
    let first = items.findIndex((x) => "cell" in x)
    let last = items.length - 1
    while (last >= 0 && !("cell" in items[last])) last--
    if (first < 0) first = items.length
    for (const item of items.slice(first, last + 1)) {
      if ("blank" in item) {
        from(file.path, item.blank, "")
        continue
      }
      const c = item.cell
      const f = file.path
      from(
        f,
        c.open,
        `      <div class="pv-cell${c.wide ? " pv-cell--wide" : ""}" data-pv-cell="${c.name}">`
      )
      from(f, c.label!.line, `        <p class="pv-label">${c.label!.text}</p>`)
      if (c.dark)
        from(
          f,
          c.dark.line,
          `        <template data-theme-variant="dark"><p class="pv-label">${c.dark.text}</p></template>`
        )
      if (c.dummy)
        from(
          f,
          c.dummy.line,
          `        <p class="catalog-dummy">${c.dummy.text}</p>`
        )
      from(
        f,
        c.open,
        `        <div class="pv-stage${c.stack ? " pv-stage--stack" : ""}">`
      )
      for (const b of c.body)
        from(
          f,
          b.line,
          b.text.trim() === ""
            ? ""
            : `        ${b.text}`
                .replace(/<pv-screen>/g, '<div class="pv-screen">')
                .replace(/<\/pv-screen>/g, "</div>")
        )
      from(f, c.close, "        </div>")
      from(f, c.close, "      </div>")
    }
    zoneSkel("    </div>")
    zoneSkel("  </section>")
  }
  skel("</main>")
  skel("</body>")
  skel("</html>")
  return { assembled: { html: out.join("\n") + "\n", origins }, findings }
}
