// PROTOTYPE — throwaway code. Builds served previews from item modules, or
// checks that they still match.
//
//   pnpm pv:build [slug …]                       write public/preview/{slug}/preview.html (all items when none named)
//   pnpm pv:build --entry <dir> --out <file>     build one item folder anywhere (staging)
//   pnpm pv:check [slug …]                       write nothing; exit 1 when the contract fails
//                                                or the served file differs from its build
//   pnpm pv:check --file <html>                  the contract check alone, on any HTML file
//
// The build runs the contract check first and writes nothing when it fails.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, relative, resolve } from "node:path"
import { checkPreview, formatProblems } from "./kit/check.ts"
import { ENTRIES, ROOT, buildDir, entryDir, servedPath } from "./kit/entries.ts"

const argv = process.argv.slice(2)
const flag = (name: string): string | undefined => {
  const at = argv.indexOf(name)
  return at === -1 ? undefined : argv[at + 1]
}
const check = argv.includes("--check")
const rel = (p: string): string => relative(ROOT, p).replace(/\\/g, "/")

async function main(): Promise<number> {
  const file = flag("--file")
  if (file !== undefined) {
    const html = readFileSync(resolve(file), "utf8").replace(/\r\n/g, "\n")
    const problems = checkPreview(html)
    if (problems.length === 0) {
      console.log(`ok    ${rel(resolve(file))}`)
      return 0
    }
    console.log(formatProblems(rel(resolve(file)), problems))
    return 1
  }

  const entry = flag("--entry")
  if (entry !== undefined) {
    const out = flag("--out")
    if (out === undefined) {
      console.error("build.ts: --entry needs --out <file>")
      return 2
    }
    const { html } = await buildDir(resolve(entry))
    mkdirSync(dirname(resolve(out)), { recursive: true })
    writeFileSync(resolve(out), html)
    console.log(`built ${rel(resolve(entry))} -> ${rel(resolve(out))}`)
    return 0
  }

  const named = argv.filter((a) => !a.startsWith("--"))
  const slugs = named.length === 0 ? ENTRIES : named
  let failed = 0
  for (const slug of slugs) {
    if (!ENTRIES.includes(slug)) {
      console.error(
        `${slug}: no item module at ${rel(entryDir(slug))}/preview.ts`
      )
      failed++
      continue
    }
    const served = servedPath(slug)
    let html: string
    try {
      html = (await buildDir(entryDir(slug))).html
    } catch (error) {
      console.log((error as Error).message)
      failed++
      continue
    }
    if (!check) {
      mkdirSync(dirname(served), { recursive: true })
      writeFileSync(served, html)
      console.log(`built ${rel(entryDir(slug))} -> ${rel(served)}`)
      continue
    }
    const now = existsSync(served)
      ? readFileSync(served, "utf8").replace(/\r\n/g, "\n")
      : ""
    const problems = checkPreview(now)
    if (problems.length !== 0) {
      console.log(formatProblems(rel(served), problems))
      failed++
    }
    if (now !== html) {
      const a = now.split("\n")
      const b = html.split("\n")
      let line = 0
      while (line < a.length && a[line] === b[line]) line++
      console.log(
        `${rel(served)}:${line + 1} 이 ${rel(entryDir(slug))} 를 빌드한 결과와 다르다(원본과 산출물의 어긋남). ` +
          `서빙 파일이 아니라 항목 모듈을 고치고 pnpm pv:build ${slug} 로 다시 만든다. ` +
          `원본 줄은 pnpm pv:where ${slug} ${line + 1}`
      )
      failed++
    }
    if (problems.length === 0 && now === html)
      console.log(`ok    ${rel(served)}`)
  }
  return failed === 0 ? 0 : 1
}

main().then(
  (code) => process.exit(code),
  (error: unknown) => {
    console.error(error)
    process.exit(2)
  }
)
