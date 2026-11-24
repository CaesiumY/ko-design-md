// PROTOTYPE — throwaway code. From a served line back to its source.
//
//   pnpm pv:where <slug> <line> [<line> …]
//
// Validators speak in lines of public/preview/{slug}/preview.html. That file
// is built: the parts write the frame lines, and every piece of brand markup
// (hero, stage, screen, after) is copied in line for line. So a served line
// inside a piece is the same line, at a fixed offset, in the item module's
// template literal; a line in a <style> is a line of light.css, dark.css or
// frame.css; anything else was written by kit/parts.ts.

import { readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { ENTRIES, ROOT, entryDir, servedPath } from "./kit/entries.ts"

const args = process.argv.slice(2)
const slug = args.at(0) ?? ""
const lineArgs = args.slice(1)
if (
  slug === "" ||
  lineArgs.length === 0 ||
  !ENTRIES.includes(slug) ||
  lineArgs.some((l) => !/^\d+$/.test(l))
) {
  console.error(
    `usage: where.ts <slug> <line> [<line> …]   (slugs: ${ENTRIES.join(", ")})`
  )
  process.exit(2)
}

const rel = (p: string): string => relative(ROOT, p).replace(/\\/g, "/")
const lines = (file: string): Array<string> =>
  readFileSync(file, "utf8").replace(/\r\n/g, "\n").split("\n")

const served = lines(servedPath(slug))
const moduleFile = join(entryDir(slug), "preview.ts")
const mod = lines(moduleFile)
const KIT = "prototypes/preview-structure/components/kit/parts.ts"
const FRAME = join(ROOT, "prototypes/preview-structure/frame.css")

/** Index of the last line at or above `from` that matches, or -1. */
function up(from: number, re: RegExp, stop?: RegExp): number {
  for (let i = from; i >= 0; i--) {
    if (re.test(served[i])) return i
    if (stop?.test(served[i])) return -1
  }
  return -1
}
function down(from: number, re: RegExp): number {
  for (let i = from; i < served.length; i++) if (re.test(served[i])) return i
  return -1
}

/** The module line of `key` inside the block of cell `name` (or anywhere when name is undefined). */
function keyLine(key: string, name: string | undefined): number {
  let from = 0
  let to = mod.length
  if (name !== undefined) {
    from = mod.findIndex((l) => l.trim() === `name: "${name}",`)
    if (from === -1) return -1
    const next = mod.findIndex(
      (l, i) => i > from && l.trim().startsWith("name: ")
    )
    to = next === -1 ? mod.length : next
  }
  for (let i = from; i < to; i++)
    if (mod[i].trim().startsWith(`${key}:`)) return i
  return -1
}

function inPiece(
  key: string,
  name: string | undefined,
  offset: number,
  at: number
): string {
  const k = keyLine(key, name)
  const where = name === undefined ? key : `칸 ${name} 의 ${key}`
  if (k === -1)
    return `${rel(moduleFile)} 에서 ${where} 를 찾지 못했다(served ${at + 1})`
  const target = k + 1 + offset
  const same = mod[target]?.trim() === served[at].trim()
  return `${rel(moduleFile)}:${target + 1}  (${where}, 조각의 ${offset + 1}번째 줄)${same ? "" : "  주의: 글이 같지 않다. pnpm pv:check 로 어긋남부터 본다"}`
}

function locate(at: number): string {
  const text = served.at(at)
  if (text === undefined || at < 0)
    return `served 파일은 ${served.length}줄이다`

  // <style>: frame block, then light.css; the second sheet is dark.css.
  const styleOpen = up(at, /^<style>$/, /^<\/style>/)
  if (styleOpen !== -1 && !/^<\/?style>$/.test(text)) {
    const firstStyle = served.indexOf("<style>")
    if (styleOpen === firstStyle) {
      const frameEnd = down(styleOpen, /^\/\* pv-frame:end \*\/$/)
      if (at <= frameEnd) {
        const frame = lines(FRAME)
        const start = frame.findIndex((l) => l.startsWith("/* pv-frame:start"))
        return `${rel(FRAME)}:${start + (at - styleOpen - 1) + 1}  (틀 블록. 모든 항목에 함께 들어간다)`
      }
      return `${rel(join(entryDir(slug), "light.css"))}:${at - frameEnd}  (첫 <style>, 틀 블록 뒤)`
    }
    return `${rel(join(entryDir(slug), "dark.css"))}:${at - styleOpen}  (다크 <style>)`
  }

  // Hero.
  const heroOpen = up(at, /^ {2}<header class="pv-hero"/, /^ {2}<\/header>$/)
  if (heroOpen !== -1 && at > heroOpen && !/^ {2}<\/header>$/.test(text))
    return inPiece("hero", undefined, at - heroOpen - 1, at)

  // Cells: the parts write the cell at 6 spaces, its label, dark label and
  // dummy note at 8, the stage at 8, a screen at 10, and the pieces deeper.
  const cellOpen = up(
    at,
    /^ {6}<div class="pv-cell[^"]*" data-pv-cell="[^"]+">$/,
    /^ {6}<\/div>$/
  )
  if (cellOpen === -1 || /^ {6}<\/div>$/.test(text))
    return `${KIT} 가 쓴 틀의 줄(head, 면책 띠, 구역, 제목). 항목 모듈에는 이 줄이 없다`
  const name = /data-pv-cell="([^"]+)"/.exec(served[cellOpen])![1]
  const stageOpen = down(cellOpen, /^ {8}<div class="pv-stage/)
  if (at <= stageOpen) {
    if (at === cellOpen)
      return `${KIT} 가 쓴 칸의 겉 줄. 이 칸의 원본은 ${rel(moduleFile)}:${keyLine("name", name) + 1}`
    if (/^ {8}<p class="pv-label">/.test(text)) {
      const k = keyLine("label", name)
      return `${rel(moduleFile)}:${k + 1}  (칸 ${name} 의 label. 겉의 <p class="pv-label"> 는 ${KIT} 가 쓴다)`
    }
    if (/^ {8}<template data-theme-variant="dark">/.test(text))
      return `${rel(moduleFile)}:${keyLine("labelDark", name) + 1}  (칸 ${name} 의 labelDark)`
    if (/^ {8}<p class="catalog-dummy">/.test(text))
      return `${rel(moduleFile)}:${keyLine("dummy", name) + 1}  (칸 ${name} 의 dummy)`
    return `${KIT} 가 쓴 줄(칸 ${name} 의 시연 자리 여는 줄)`
  }
  const stageClose = down(stageOpen, /^ {8}<\/div>$/)
  if (at >= stageClose) return `${KIT} 가 쓴 줄(칸 ${name} 을 닫는 줄)`
  const screenOpen = /^ {10}<div class="pv-screen">$/.test(
    served[stageOpen + 1]
  )
    ? stageOpen + 1
    : -1
  if (screenOpen === -1) return inPiece("stage", name, at - stageOpen - 1, at)
  const screenClose = down(screenOpen, /^ {10}<\/div>$/)
  if (at === screenOpen || at === screenClose)
    return `${KIT} 가 쓴 줄(칸 ${name} 의 .pv-screen 겉)`
  if (at < screenClose) return inPiece("screen", name, at - screenOpen - 1, at)
  return inPiece("after", name, at - screenClose - 1, at)
}

for (const arg of lineArgs) {
  const at = Number(arg) - 1
  console.log(
    `${rel(servedPath(slug))}:${arg}  ->  ${locate(at)}\n    ${(served[at] ?? "").trim().slice(0, 120)}`
  )
}
