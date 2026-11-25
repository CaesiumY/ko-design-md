// PROTOTYPE — "fragments" structure (ticket 729). One entry point: build, check, where.
//
//   pnpm previews:build [slug…]                 assemble preview-src/{slug}/ into
//                                               public/preview/{slug}/preview.html (no slug: all)
//   pnpm previews:build --slug s --src <dir> --out <html>   assemble a staged item
//   pnpm previews:check [slug…]                 promise check + drift check (no slug: all)
//   pnpm previews:check --slug s --src <dir>    promise check of a staged item
//   pnpm previews:check --served <html>         promise check of any served file
//   pnpm previews:where <slug> <line> [--src <dir>]   which source line made that served line
//
// Exit 0: fine. Exit 1: findings (printed, each with file:line and how to fix).
// Exit 2: bad arguments or unreadable files.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { checkPreview, checkServed } from "./contract"
import {
  FragmentError,
  buildSlug,
  driftOf,
  formatFinding,
  listSourceSlugs,
  loadSource,
  servedPath,
} from "./repo"
import type { Finding } from "./assemble"

function opts(argv: Array<string>) {
  const named = new Map<string, string>()
  const rest: Array<string> = []
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith("--")) named.set(argv[i], argv[++i] ?? "")
    else rest.push(argv[i])
  }
  return { named, rest }
}

function report(tag: string, findings: Array<Finding>): number {
  for (const f of findings) console.error(formatFinding(f))
  if (findings.length > 0) console.error(`\n[${tag}] ${findings.length}건`)
  return findings.length > 0 ? 1 : 0
}

function write(path: string, html: string) {
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, html)
}

function build(argv: Array<string>): number {
  const { named, rest } = opts(argv)
  const src = named.get("--src")
  if (src !== undefined) {
    const slug = named.get("--slug")
    const out = named.get("--out")
    if (!slug || !out) {
      console.error("--src 에는 --slug 와 --out 이 함께 필요하다")
      return 2
    }
    write(resolve(out), buildSlug(loadSource(slug, src)).html)
    console.log(`[previews:build] ${slug} → ${out}`)
    return 0
  }
  const slugs = rest.length > 0 ? rest : listSourceSlugs()
  for (const slug of slugs) {
    write(servedPath(slug), buildSlug(loadSource(slug)).html)
    console.log(
      `[previews:build] ${slug} → public/preview/${slug}/preview.html`
    )
  }
  return 0
}

function check(argv: Array<string>): number {
  const { named, rest } = opts(argv)
  const served = named.get("--served")
  if (served !== undefined)
    return report(
      "previews:check",
      checkServed(readFileSync(resolve(served), "utf8"), served)
    )
  const src = named.get("--src")
  if (src !== undefined) {
    const slug = named.get("--slug")
    if (!slug) {
      console.error("--src 에는 --slug 가 함께 필요하다")
      return 2
    }
    return report("previews:check", checkPreview(loadSource(slug, src)))
  }
  const slugs = rest.length > 0 ? rest : listSourceSlugs()
  const findings: Array<Finding> = []
  for (const slug of slugs) {
    const own = checkPreview(loadSource(slug))
    findings.push(...own)
    if (own.length > 0) continue
    const drift = driftOf(slug)
    if (drift) {
      findings.push(drift)
      if (drift.line === 0) continue // no served file yet
      // The served file no longer is the assembly; hold it to the promises too.
      findings.push(
        ...checkServed(
          readFileSync(servedPath(slug), "utf8"),
          `public/preview/${slug}/preview.html`
        )
      )
    }
  }
  if (findings.length === 0)
    console.log(
      `[previews:check] ${slugs.join(", ")}: 약속 위반 없음, 서빙 파일이 원본과 같음`
    )
  return report("previews:check", findings)
}

function where(argv: Array<string>): number {
  const { named, rest } = opts(argv)
  const [slug, lineArg] = rest
  const line = Number(lineArg)
  if (!slug || !Number.isInteger(line) || line < 1) {
    console.error(
      "쓰는 법: previews:where <slug> <서빙 파일의 줄 번호> [--src <dir>]"
    )
    return 2
  }
  const assembled = buildSlug(loadSource(slug, named.get("--src")))
  const o = assembled.origins[line - 1] as
    (typeof assembled.origins)[number] | undefined
  if (!o) {
    console.error(`${line}줄은 조립 결과(${assembled.origins.length}줄) 밖이다`)
    return 2
  }
  const text = assembled.html.split("\n")[line - 1]
  const kind = o.line === 0 ? "공통 뼈대(파일 전체에서 한 번 쓰는 줄)" : "원본"
  console.log(`${o.file}${o.line > 0 ? `:${o.line}` : ""}  ← ${kind}`)
  console.log(`  서빙 ${line}줄: ${text.trim()}`)
  if (named.get("--src") === undefined && driftOf(slug, assembled))
    console.log(
      "  주의: 서빙 파일이 지금 원본의 조립 결과와 다르다. 줄 번호는 조립 결과 기준이다(pnpm previews:build 로 맞춘다)"
    )
  return 0
}

function main(argv: Array<string>): number {
  const [verb, ...rest] = argv
  try {
    if (verb === "build") return build(rest)
    if (verb === "check") return check(rest)
    if (verb === "where") return where(rest)
  } catch (e) {
    if (e instanceof FragmentError)
      return report(`previews:${verb}`, e.findings)
    console.error(e instanceof Error ? e.message : e)
    return 2
  }
  console.error("쓰는 법: cli.ts build|check|where …")
  return 2
}

process.exit(main(process.argv.slice(2)))
