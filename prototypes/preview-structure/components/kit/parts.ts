// PROTOTYPE — throwaway code. The shared parts of the "components" structure:
// page, zone, cell. An item module (entries/{slug}/preview.ts) hands them the
// brand's own markup; every frame tag (`pv-*`, `data-pv-*`, the disclaimer
// strip, <head>) is written here and only here.
//
// Markup goes in as plain HTML text and comes out line for line, re-indented
// to where it sits, so a served line can be found again in the module.

import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { checkPreview, formatProblems } from "./check.ts"
import { ZONES, zoneIndex, zoneTitle } from "./zones.ts"
import type { ZoneId } from "./zones.ts"

interface CellBase {
  /** `data-pv-cell`, kebab-case, unique in the page. */
  name: string
  /** Inner HTML of the cell's label. A label piece that changes in dark carries its own <template>. */
  label: string
  /** Inner HTML of the whole label as shown in dark, when all of it changes. */
  labelDark?: string
  /** Inner HTML of the cell's dummy-data note. */
  dummy?: string
  /** Spans both columns (`pv-cell--wide`). */
  wide?: boolean
  /** Stacks the demo vertically (`pv-stage--stack`). */
  stack?: boolean
}

/** A component cell: the stage holds the brand's demo. */
export interface StageCell extends CellBase {
  kind: "stage"
  stage: string
}

/** A screen cell: the stage holds one `.pv-screen`, then (optional) more. */
export interface ScreenCell extends CellBase {
  kind: "screen"
  screen: string
  /** Markup after the screen, inside the stage (spec lines). */
  after?: string
}

export type Cell = StageCell | ScreenCell

export interface Zone {
  id: ZoneId
  cells: Array<Cell>
}

export interface PreviewDef {
  slug: string
  /** The <title>. */
  title: string
  lang?: string
  /** Adds `<meta name="robots" content="noindex">`. */
  noindex?: boolean
  /** Inner HTML of `header.pv-hero`. */
  hero: string
  /** Any order: the page is built in the order of kit/zones.ts. */
  zones: Array<Zone>
  /** Inner HTML of the closing `catalog-attribution` line, if any. */
  attribution?: string
}

export interface Styles {
  /** Brand CSS after the frame block in the first <style>. */
  light: string
  /** Brand CSS of the second (dark) <style>. */
  dark: string
}

export const definePreview = (def: PreviewDef): PreviewDef => def

export function zone(id: "screens", cells: Array<ScreenCell>): Zone
export function zone(
  id: Exclude<ZoneId, "screens">,
  cells: Array<StageCell>
): Zone
export function zone(id: ZoneId, cells: Array<Cell>): Zone {
  return { id, cells }
}

export const cell = (props: Omit<StageCell, "kind">): StageCell => ({
  kind: "stage",
  ...props,
})

export const screen = (props: Omit<ScreenCell, "kind">): ScreenCell => ({
  kind: "screen",
  ...props,
})

export const DISCLAIMER =
  '<div class="catalog-disclaimer" role="note"><b>ko/design.md 카탈로그 프리뷰</b> — 이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다. 이 화면은 공식 배포본이 아닌 공개 자료 기반 비공식 재현이며, 표시된 상품·가격·평점·거래·채용 정보는 레이아웃 시연용 더미 데이터입니다.</div>'

const FRAME_FILE = join(
  dirname(fileURLToPath(import.meta.url)),
  "../../frame.css"
)

/** The frame block of frame.css, letter for letter (STANDARD §3). */
export function frameBlock(): string {
  const text = readFileSync(FRAME_FILE, "utf8").replace(/\r\n/g, "\n")
  const from = text.indexOf("/* pv-frame:start")
  const end = "/* pv-frame:end */"
  const to = text.indexOf(end)
  if (from === -1 || to === -1)
    throw new Error(`${FRAME_FILE}: no pv-frame block`)
  return text.slice(from, to + end.length)
}

/**
 * A fragment re-indented to `depth` spaces. One leading newline and trailing
 * blank space are dropped, then the common indent, so a module may write its
 * markup at any indent inside a template literal.
 */
export function place(fragment: string, depth: number): string {
  const lines = fragment
    .replace(/\r\n/g, "\n")
    .replace(/^\n/, "")
    .replace(/\s+$/, "")
    .split("\n")
  const common = Math.min(
    ...lines.filter((l) => l.trim() !== "").map((l) => /^ */.exec(l)![0].length)
  )
  const pad = " ".repeat(depth)
  return lines
    .map((l) => (l.trim() === "" ? "" : pad + l.slice(common)))
    .join("\n")
}

function renderCell(c: Cell): string {
  const cls = c.wide === true ? "pv-cell pv-cell--wide" : "pv-cell"
  const stage = c.stack === true ? "pv-stage pv-stage--stack" : "pv-stage"
  const out = [
    `      <div class="${cls}" data-pv-cell="${c.name}">`,
    `        <p class="pv-label">${c.label}</p>`,
  ]
  if (c.labelDark !== undefined)
    out.push(
      `        <template data-theme-variant="dark"><p class="pv-label">${c.labelDark}</p></template>`
    )
  if (c.dummy !== undefined)
    out.push(`        <p class="catalog-dummy">${c.dummy}</p>`)
  out.push(`        <div class="${stage}">`)
  if (c.kind === "screen") {
    out.push(
      `          <div class="pv-screen">`,
      place(c.screen, 12),
      `          </div>`
    )
    if (c.after !== undefined) out.push(place(c.after, 10))
  } else {
    out.push(place(c.stage, 10))
  }
  out.push(`        </div>`, `      </div>`)
  return out.join("\n")
}

function renderZone(z: Zone): string {
  return [
    "",
    `  <section class="pv-zone" data-pv-zone="${z.id}" aria-labelledby="pv-${z.id}">`,
    `    <h2 class="pv-zone-title" id="pv-${z.id}">${zoneTitle(z.id) ?? z.id}</h2>`,
    `    <div class="pv-cells">`,
    ...z.cells.map(renderCell),
    `    </div>`,
    `  </section>`,
  ].join("\n")
}

/** Zones in list order; an id the list does not know goes last, for the check to name. */
function ordered(zones: Array<Zone>): Array<Zone> {
  const rank = (z: Zone): number => {
    const i = zoneIndex(z.id)
    return i === -1 ? ZONES.length : i
  }
  return [...zones].sort((a, b) => rank(a) - rank(b))
}

/** The page as served, unchecked. */
export function renderUnchecked(def: PreviewDef, styles: Styles): string {
  const head = [
    "<!doctype html>",
    `<html lang="${def.lang ?? "ko"}" data-theme="light">`,
    "<head>",
    '<meta charset="utf-8">',
    ...(def.noindex === true ? ['<meta name="robots" content="noindex">'] : []),
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${def.title}</title>`,
    '<link rel="stylesheet" href="/preview/_runtime/tokens.css">',
    '<script src="/preview/_runtime/iframe.js" defer></script>',
    "<style>",
    frameBlock(),
    `${styles.light.replace(/\r\n/g, "\n")}</style>`,
    "<style>",
    `${styles.dark.replace(/\r\n/g, "\n")}</style>`,
    "</head>",
  ]
  const body = [
    "<body>",
    DISCLAIMER,
    '<main class="pv-page">',
    "",
    '  <header class="pv-hero" data-pv-zone="hero">',
    place(def.hero, 4),
    "  </header>",
    ...ordered(def.zones).map(renderZone),
    ...(def.attribution === undefined
      ? []
      : ["", `  <p class="catalog-attribution">${def.attribution}</p>`]),
    "</main>",
    "</body>",
    "</html>",
    "",
  ]
  return [...head, ...body].join("\n")
}

/** The page as served. Throws, naming the cell, when the contract does not hold. */
export function renderPreview(def: PreviewDef, styles: Styles): string {
  const html = renderUnchecked(def, styles)
  const problems = checkPreview(html)
  if (problems.length !== 0)
    throw new Error(
      `${def.slug}: 약속 검사에 걸려 쓰지 않았다. 고칠 곳은 항목 모듈(entries/${def.slug}/preview.ts)의 같은 칸이다.\n` +
        formatProblems(`(build ${def.slug})`, problems)
    )
  return html
}
