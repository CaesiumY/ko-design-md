// PROTOTYPE — "fragments" structure (ticket 729). File-system side: where an
// item's fragments are, what its served file is, and whether the two agree.

import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { assemble } from "./assemble"
import { FRAME_CSS, SRC_ROOT } from "./zones"
import type { Assembled, Finding, PreviewSource } from "./assemble"

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")

const read = (p: string) => readFileSync(p, "utf8").replace(/\r\n/g, "\n")
const rel = (p: string) => relative(ROOT, p).replace(/\\/g, "/")

export function servedPath(slug: string): string {
  return join(ROOT, "public/preview", slug, "preview.html")
}

/** Items written as fragments: every folder under preview-src/. */
export function listSourceSlugs(): Array<string> {
  const dir = join(ROOT, SRC_ROOT)
  if (!existsSync(dir)) return []
  return readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .sort()
}

/** `{name} preview`, from services/{slug}.md's frontmatter. */
export function titleOf(slug: string): string {
  const md = join(ROOT, "services", `${slug}.md`)
  if (!existsSync(md))
    throw new Error(
      `services/${slug}.md 가 없다. 프리뷰의 <title> 은 그 md 의 name 으로 만든다`
    )
  const name = /^name:\s*(.+?)\s*$/m.exec(read(md))?.[1]
  if (!name)
    throw new Error(`services/${slug}.md 의 frontmatter 에 name 이 없다`)
  return `${name.replace(/^["']|["']$/g, "")} preview`
}

/** Reads an item's fragments from preview-src/{slug}/ or from `dir`. */
export function loadSource(slug: string, dir?: string): PreviewSource {
  const base = dir ? resolve(dir) : join(ROOT, SRC_ROOT, slug)
  const need = (name: string) => {
    const p = join(base, name)
    if (!existsSync(p))
      throw new Error(
        `${rel(p)} 가 없다. 항목의 원본 폴더에는 brand.css, dark.css, zones/ 가 있어야 한다`
      )
    return { path: rel(p), text: read(p) }
  }
  const zonesDir = join(base, "zones")
  const zones = existsSync(zonesDir)
    ? readdirSync(zonesDir)
        .filter((f) => f.endsWith(".html"))
        .sort()
        .map((f) => ({
          zone: f.replace(/\.html$/, ""),
          path: rel(join(zonesDir, f)),
          text: read(join(zonesDir, f)),
        }))
    : []
  return {
    slug,
    title: titleOf(slug),
    frameCss: read(join(ROOT, FRAME_CSS)),
    brandCss: need("brand.css"),
    darkCss: need("dark.css"),
    zones,
  }
}

export class FragmentError extends Error {
  constructor(public findings: Array<Finding>) {
    super(findings.map(formatFinding).join("\n"))
  }
}

export function formatFinding(f: Finding): string {
  return `  ✗ ${f.file}${f.line > 0 ? `:${f.line}` : ""} — ${f.message}`
}

export function buildSlug(src: PreviewSource): Assembled {
  const { assembled, findings } = assemble(src)
  if (!assembled) throw new FragmentError(findings)
  return assembled
}

/**
 * null when the committed served file is exactly what the fragments assemble
 * into (line endings aside); otherwise the first line that differs.
 */
export function driftOf(slug: string, assembled?: Assembled): Finding | null {
  const want = (assembled ?? buildSlug(loadSource(slug))).html
  const p = servedPath(slug)
  const how = `원본을 고친 뒤 조립하지 않았거나 서빙 파일을 손으로 고쳤다. \`pnpm previews:build ${slug}\` 를 돌리고 그 결과를 함께 커밋한다(서빙 파일은 손으로 고치지 않는다)`
  if (!existsSync(p))
    return { file: rel(p), line: 0, message: `서빙 파일이 없다. ${how}` }
  const have = read(p)
  if (have === want) return null
  const a = have.split("\n")
  const b = want.split("\n")
  let i = 0
  while (i < a.length && i < b.length && a[i] === b[i]) i++
  return {
    file: rel(p),
    line: i + 1,
    message: `원본에서 조립한 결과와 ${i + 1}줄부터 다르다. ${how}`,
  }
}
