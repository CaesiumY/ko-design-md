// PROTOTYPE — throwaway code. Turns a served preview written to STANDARD.md
// (one HTML file) into an item of the "components" structure: an item module
// that hands its markup to the shared parts, plus the brand's two style sheets.
//
//   pnpm exec tsx prototypes/preview-structure/components/convert.ts \
//     --in <preview.html> --out <entry dir>
//   pnpm exec prettier --write <entry dir>/preview.ts
//
// It slices the brand's markup out verbatim (parse5 source offsets) and stops
// rather than guess when a frame tag does not look the way the parts write it:
// an extra attribute on a label, something before the screen in a screen cell,
// a disclaimer that differs from the shared one. Fix the input or the parts,
// then run it again.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join, resolve } from "node:path"
import { parse } from "parse5"
import { DISCLAIMER } from "./kit/parts.ts"
import type { DefaultTreeAdapterMap } from "parse5"

type Node = DefaultTreeAdapterMap["node"]
type Element = DefaultTreeAdapterMap["element"]

function arg(flag: string): string {
  const at = process.argv.indexOf(flag)
  const value = at === -1 ? undefined : process.argv[at + 1]
  if (value === undefined) {
    console.error("usage: convert.ts --in <preview.html> --out <entry dir>")
    process.exit(2)
  }
  return value
}

const input = resolve(arg("--in"))
const outDir = resolve(arg("--out"))
const src = readFileSync(input, "utf8").replace(/\r\n/g, "\n")
const doc = parse(src, { sourceCodeLocationInfo: true })

function stop(message: string, el?: Element): never {
  const line = el?.sourceCodeLocation?.startLine
  console.error(
    `convert: ${input}${line === undefined ? "" : `:${line}`}: ${message}`
  )
  process.exit(1)
}

const isEl = (n: Node): n is Element => "tagName" in n
const kids = (el: Element): Array<Element> => el.childNodes.filter(isEl)
const attr = (el: Element, name: string): string | undefined =>
  el.attrs.find((a) => a.name === name)?.value
const classes = (el: Element): Array<string> =>
  (attr(el, "class") ?? "").split(/\s+/).filter(Boolean)
function all(
  root: Element,
  test: (el: Element) => boolean,
  out: Array<Element> = []
): Array<Element> {
  for (const k of kids(root)) {
    if (test(k)) out.push(k)
    all(k, test, out)
  }
  return out
}
/** The source between an element's start and end tags. */
function inner(el: Element): string {
  const loc = el.sourceCodeLocation
  if (loc?.startTag === undefined || loc.endTag === undefined)
    stop("no source location", el)
  return src.slice(loc.startTag.endOffset, loc.endTag.startOffset)
}
function startTag(el: Element): string {
  const loc = el.sourceCodeLocation
  if (loc?.startTag === undefined) stop("no source location", el)
  return src.slice(loc.startTag.startOffset, loc.startTag.endOffset)
}
function outer(el: Element): string {
  const loc = el.sourceCodeLocation
  if (loc === undefined || loc === null) stop("no source location", el)
  return src.slice(loc.startOffset, loc.endOffset)
}
function expectTag(el: Element, want: string, what: string): void {
  if (startTag(el) !== want)
    stop(`${what}: start tag is ${startTag(el)} — the parts write ${want}`, el)
}

const htmlEl = kids(doc as unknown as Element).find(
  (e) => e.tagName === "html"
) as Element
const head = kids(htmlEl).find((e) => e.tagName === "head") as Element
const body = kids(htmlEl).find((e) => e.tagName === "body") as Element

// <head>: only what the parts can write back.
const title = all(head, (e) => e.tagName === "title").at(0)
const noindex =
  all(head, (e) => e.tagName === "meta" && attr(e, "name") === "robots")
    .length === 1
const lang = attr(htmlEl, "lang") ?? "ko"
const known = new Set(["meta", "title", "link", "script", "style"])
for (const e of kids(head))
  if (!known.has(e.tagName)) stop(`unexpected <${e.tagName}> in <head>`, e)
const styles = kids(head).filter((e) => e.tagName === "style")
if (styles.length !== 2) stop(`expected two <style>, found ${styles.length}`)
const first = inner(styles[0])
const endMark = "/* pv-frame:end */\n"
if (!first.startsWith("\n/* pv-frame:start") || !first.includes(endMark))
  stop("the first <style> does not open with the frame block", styles[0])
const light = first.slice(first.indexOf(endMark) + endMark.length)
const dark = inner(styles[1]).replace(/^\n/, "")

// <body>: the disclaimer, then main.pv-page.
const [strip, main, ...after] = kids(body)
if (outer(strip) !== DISCLAIMER)
  stop("the disclaimer strip differs from the shared one", strip)
if (after.length !== 0) stop("something follows main.pv-page", after[0])
expectTag(main, '<main class="pv-page">', "main")
const [hero, ...zoneEls] = kids(main)
expectTag(hero, '<header class="pv-hero" data-pv-zone="hero">', "hero")

const lit = (s: string): string =>
  !/["\\\n`]/.test(s) && !s.includes("${")
    ? `"${s}"`
    : "`" +
      s.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$\{/g, "\\${") +
      "`"

/** A fragment as a template literal: on its own lines, at column 0. */
function block(fragment: string, el: Element): string {
  if (!/^\n/.test(fragment) || !/\n *$/.test(fragment))
    stop("markup does not start and end on its own line", el)
  const lines = fragment.replace(/^\n/, "").replace(/\n *$/, "").split("\n")
  const common = Math.min(
    ...lines.filter((l) => l.trim() !== "").map((l) => /^ */.exec(l)![0].length)
  )
  const text = lines
    .map((l) => (l.trim() === "" ? "" : l.slice(common)))
    .join("\n")
  return lit(`\n${text}\n`)
}

const zones: Array<string> = []
let attribution: string | undefined
for (const z of zoneEls) {
  if (classes(z).includes("catalog-attribution")) {
    attribution = inner(z)
    continue
  }
  const id = attr(z, "data-pv-zone") ?? stop("a zone without data-pv-zone", z)
  expectTag(
    z,
    `<section class="pv-zone" data-pv-zone="${id}" aria-labelledby="pv-${id}">`,
    "zone"
  )
  const [, list] = kids(z)
  const cells: Array<string> = []
  for (const c of kids(list)) {
    const name =
      attr(c, "data-pv-cell") ?? stop("a cell without data-pv-cell", c)
    const wide = classes(c).includes("pv-cell--wide")
    expectTag(
      c,
      `<div class="pv-cell${wide ? " pv-cell--wide" : ""}" data-pv-cell="${name}">`,
      name
    )
    const props: Array<string> = [`name: ${lit(name)}`]
    let stageEl: Element | undefined
    for (const k of kids(c)) {
      if (stageEl !== undefined) stop(`${name}: something follows the stage`, k)
      if (k.tagName === "p" && classes(k).includes("pv-label")) {
        expectTag(k, '<p class="pv-label">', `${name} label`)
        props.push(`label: ${lit(inner(k))}`)
      } else if (k.tagName === "template") {
        expectTag(
          k,
          '<template data-theme-variant="dark">',
          `${name} dark label`
        )
        const m = /^<p class="pv-label">([\s\S]*)<\/p>$/.exec(inner(k))
        if (m === null)
          stop(`${name}: the dark variant is not one p.pv-label`, k)
        props.push(`labelDark: ${lit(m[1])}`)
      } else if (classes(k).includes("catalog-dummy")) {
        expectTag(k, '<p class="catalog-dummy">', `${name} dummy`)
        props.push(`dummy: ${lit(inner(k))}`)
      } else if (classes(k).includes("pv-stage")) {
        stageEl = k
      } else stop(`${name}: a cell child the parts do not write`, k)
    }
    if (stageEl === undefined) stop(`${name}: no stage`, c)
    const stack = classes(stageEl).includes("pv-stage--stack")
    expectTag(
      stageEl,
      `<div class="pv-stage${stack ? " pv-stage--stack" : ""}">`,
      `${name} stage`
    )
    if (wide) props.push("wide: true")
    if (stack) props.push("stack: true")
    if (id === "screens") {
      const [scr, ...more] = kids(stageEl)
      expectTag(scr, '<div class="pv-screen">', `${name} screen`)
      const before = src.slice(
        stageEl.sourceCodeLocation!.startTag!.endOffset,
        scr.sourceCodeLocation!.startOffset
      )
      if (before.trim() !== "") stop(`${name}: text before the screen`, scr)
      props.push(`screen: ${block(inner(scr), scr)}`)
      if (more.length !== 0) {
        const rest = src.slice(
          scr.sourceCodeLocation!.endOffset,
          stageEl.sourceCodeLocation!.endTag!.startOffset
        )
        props.push(`after: ${block(rest, stageEl)}`)
      }
      cells.push(`screen({\n${props.join(",\n")},\n})`)
    } else {
      props.push(`stage: ${block(inner(stageEl), stageEl)}`)
      cells.push(`cell({\n${props.join(",\n")},\n})`)
    }
  }
  zones.push(`zone(${lit(id)}, [\n${cells.join(",\n")},\n])`)
}

const slug = outDir.split(/[\\/]/).at(-1) as string
const module = `// Item module of the "components" structure. Converted from the served
// preview by prototypes/preview-structure/components/convert.ts.
// Build: pnpm pv:build ${slug}   Check: pnpm pv:check ${slug}

import { cell, definePreview, screen, zone } from "../../kit/parts.ts"

export default definePreview({
slug: ${lit(slug)},
title: ${lit(title === undefined ? "" : inner(title))},
${lang === "ko" ? "" : `lang: ${lit(lang)},\n`}${noindex ? "noindex: true,\n" : ""}hero: ${block(inner(hero), hero)},
zones: [
${zones.join(",\n")},
],
${attribution === undefined ? "" : `attribution: ${lit(attribution)},\n`}})
`

mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, "preview.ts"), module)
writeFileSync(join(outDir, "light.css"), light)
writeFileSync(join(outDir, "dark.css"), dark)
console.log(`convert: ${input} -> ${outDir} (${zones.length} zones)`)
