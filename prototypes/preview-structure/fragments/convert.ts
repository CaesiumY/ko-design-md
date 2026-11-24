// PROTOTYPE — "fragments" structure (ticket 729). Cuts one served preview that
// already follows STANDARD.md (the common base) into fragments.
//
//   pnpm exec tsx prototypes/preview-structure/fragments/convert.ts --slug toss
//     [--in <served html>]   default public/preview/{slug}/preview.html
//     [--out <dir>]          default preview-src/{slug}/  (must not exist yet)
//
// It is the inverse of assemble.ts and refuses anything it cannot put back
// line for line: it stops at the first line that does not fit the shape and
// names it. It does not judge content (zone fit, labels' wording).
// Exit 0: written. Exit 1: the input does not fit (printed). Exit 2: bad arguments.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { splitLines } from "./assemble"
import { ROOT, servedPath, titleOf } from "./repo"
import { DISCLAIMER_HTML, FRAME_CSS, HERO_ID, SRC_ROOT, ZONES } from "./zones"

class Stop extends Error {}

export function convert(
  html: string,
  frameCss: string,
  title: string
): Record<string, string> {
  const lines = splitLines(html)
  let i = 0
  const stop = (why: string): never => {
    throw new Stop(`${i + 1}줄: ${why}\n    > ${lines[i] ?? "(파일 끝)"}`)
  }
  const find = (pred: (l: string) => boolean, why: string) => {
    while (i < lines.length && !pred(lines[i])) i++
    if (i >= lines.length) stop(why)
    return i
  }
  const expect = (want: string) => {
    if (lines[i] !== want) stop(`여기에는 \`${want}\` 이 와야 한다`)
    i++
  }
  const files: Record<string, string> = {}

  // Head: only the title and the two sheets are the item's; the rest is skeleton.
  const t = find((l) => l.includes("<title>"), "<title> 이 없다")
  if (!lines[t].includes(`<title>${title}</title>`))
    stop(
      `<title> 이 md 의 name 으로 만든 "${title}" 과 다르다. 조립기는 md 의 name 을 쓴다`
    )
  const frame = splitLines(frameCss)
  const fs = frame.findIndex((l) => l.startsWith("/* pv-frame:start"))
  const fe = frame.findIndex((l) => l.startsWith("/* pv-frame:end"))
  find((l) => l.startsWith("/* pv-frame:start"), "틀 블록의 시작 표지가 없다")
  if (lines[i - 1] !== "<style>")
    stop("틀 블록이 첫 <style> 의 맨 위에 있지 않다")
  for (let k = fs; k <= fe; k++) {
    if (lines[i] !== frame[k])
      stop(`틀 블록이 ${FRAME_CSS} 의 ${k + 1}줄과 다르다`)
    i++
  }
  const brand: Array<string> = []
  while (i < lines.length && !lines[i].startsWith("</style>"))
    brand.push(lines[i++])
  files["brand.css"] = brand.join("\n") + "\n"
  if (lines[i] !== "</style>")
    stop("첫 <style> 의 닫는 태그가 줄에 홀로 있어야 한다")
  i++
  expect("<style>")
  const dark: Array<string> = []
  while (i < lines.length && !lines[i].startsWith("</style>"))
    dark.push(lines[i++])
  files["dark.css"] = dark.join("\n") + "\n"
  if (!/^<\/style>(<\/head>)?$/.test(lines[i]))
    stop("다크 <style> 뒤에는 </head> 만 온다")

  find((l) => l === DISCLAIMER_HTML, "면책 띠가 공통 뼈대의 글과 다르거나 없다")
  i++
  expect('<main class="pv-page">')
  while (lines[i] === "") i++
  expect(`  <header class="pv-hero" data-pv-zone="${HERO_ID}">`)
  const hero: Array<string> = []
  while (i < lines.length && lines[i] !== "  </header>") {
    const l = lines[i]
    if (l !== "" && !l.startsWith("    "))
      stop("히어로 안의 줄은 네 칸 이상 들여 써 있어야 한다")
    hero.push(l.slice(4))
    i++
  }
  files[`zones/${HERO_ID}.html`] = hero.join("\n") + "\n"
  i++

  let lastZone = -1
  for (;;) {
    while (lines[i] === "") i++
    if (lines[i] === "</main>") break
    const m =
      /^ {2}<section class="pv-zone" data-pv-zone="([a-z-]+)" aria-labelledby="pv-\1">$/.exec(
        lines[i] ?? ""
      )
    if (!m) stop("구역의 여는 줄이 아니다")
    const zi = ZONES.findIndex((z) => z.id === m![1])
    if (zi <= lastZone) stop(`구역 \`${m![1]}\` 이 목록에 없거나 순서가 틀렸다`)
    lastZone = zi
    const zone = ZONES[zi]
    i++
    expect(
      `    <h2 class="pv-zone-title" id="pv-${zone.id}">${zone.title}</h2>`
    )
    expect('    <div class="pv-cells">')
    const out: Array<string> = []
    while (lines[i] !== "    </div>") {
      if (lines[i] === "") {
        out.push("")
        i++
        continue
      }
      const c =
        /^ {6}<div class="pv-cell( pv-cell--wide)?" data-pv-cell="([^"]+)">$/.exec(
          lines[i] ?? ""
        )
      if (!c) stop("칸의 여는 줄이 아니다")
      i++
      const label = /^ {8}<p class="pv-label">(.*)<\/p>$/.exec(lines[i])
      if (!label) stop("칸의 첫 줄이 한 줄짜리 이름표가 아니다")
      i++
      const head = [`  <pv-label>${label![1]}</pv-label>`]
      const dark2 =
        /^ {8}<template data-theme-variant="dark"><p class="pv-label">(.*)<\/p><\/template>$/.exec(
          lines[i]
        )
      if (dark2) {
        head.push(
          `  <template data-theme-variant="dark"><pv-label>${dark2[1]}</pv-label></template>`
        )
        i++
      }
      const dummy = /^ {8}(<p class="catalog-dummy">.*<\/p>)$/.exec(lines[i])
      if (dummy) {
        head.push(`  ${dummy[1]}`)
        i++
      }
      const st = /^ {8}<div class="pv-stage( pv-stage--stack)?">$/.exec(
        lines[i]
      )
      if (!st) stop("이름표 다음에 시연 자리가 아니다")
      i++
      out.push(
        `<pv-cell name="${c![2]}"${c![1] ? " wide" : ""}${st![1] ? " stack" : ""}>`,
        ...head
      )
      const screens: Array<string> = []
      while (lines[i] !== "        </div>") {
        const l = lines[i]
        if (i >= lines.length) stop("시연 자리가 닫히지 않았다")
        if (l !== "" && !l.startsWith("          "))
          stop("시연 자리 안의 줄은 열 칸 이상 들여 써 있어야 한다")
        let body = l === "" ? "" : l.slice(8)
        const open = /^( *)<div class="pv-screen">$/.exec(body)
        if (open) {
          screens.push(`${open[1]}</div>`)
          body = `${open[1]}<pv-screen>`
        } else if (screens.length > 0 && body === screens.at(-1)) {
          screens.pop()
          body = body.replace("</div>", "</pv-screen>")
        } else if (/pv-screen/.test(body))
          stop(
            'pv-screen 은 줄에 홀로 있는 <div class="pv-screen"> 으로만 옮길 수 있다'
          )
        out.push(body)
        i++
      }
      if (screens.length > 0) stop("pv-screen 의 닫는 줄을 찾지 못했다")
      i++
      expect("      </div>")
      out.push("</pv-cell>")
    }
    i++
    expect("  </section>")
    files[`zones/${zone.id}.html`] = out.join("\n") + "\n"
  }
  i++
  if (!/^<\/body>/.test(lines[i] ?? "")) stop("</main> 뒤에는 </body> 만 온다")
  return files
}

function main(argv: Array<string>): number {
  const arg = (k: string) => {
    const j = argv.indexOf(k)
    return j >= 0 ? argv[j + 1] : undefined
  }
  const slug = arg("--slug")
  if (!slug) {
    console.error(
      "쓰는 법: convert.ts --slug <slug> [--in <html>] [--out <dir>]"
    )
    return 2
  }
  const input = arg("--in") ? resolve(arg("--in")!) : servedPath(slug)
  const outDir = arg("--out")
    ? resolve(arg("--out")!)
    : join(ROOT, SRC_ROOT, slug)
  if (existsSync(outDir)) {
    console.error(`${outDir} 가 이미 있다. 덮어쓰지 않는다`)
    return 2
  }
  let files: Record<string, string>
  try {
    files = convert(
      readFileSync(input, "utf8"),
      readFileSync(join(ROOT, FRAME_CSS), "utf8"),
      titleOf(slug)
    )
  } catch (e) {
    if (e instanceof Stop) {
      console.error(`[convert] ${input}\n  ${e.message}`)
      return 1
    }
    throw e
  }
  mkdirSync(join(outDir, "zones"), { recursive: true })
  for (const [name, text] of Object.entries(files))
    writeFileSync(join(outDir, name), text)
  console.log(
    `[convert] ${slug}: ${Object.keys(files).length}개 파일을 ${outDir} 에 썼다`
  )
  return 0
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === resolve(import.meta.filename)
) {
  process.exit(main(process.argv.slice(2)))
}
