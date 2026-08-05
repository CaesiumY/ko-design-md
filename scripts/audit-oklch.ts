import fs from "node:fs"
import path from "node:path"
import {
  applyDefinition,
  countDefinitions,
  indexCorrections,
  matchDefinition,
  syncOklchLiterals,
} from "../src/lib/oklch-sync"
import { findPreviewDrift, readDefinitions } from "../src/lib/oklch-drift"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "../src/lib/oklch-tolerance"
import {
  deltaE,
  hexToOklab,
  lchToOklab,
  oklabToLch,
} from "../src/lib/oklch-convert"
import type { CorrectionConflict } from "../src/lib/oklch-sync"
import type { Oklab } from "../src/lib/oklch-convert"

// Audit (and optionally fix) OKLCH values that disagree with the hex annotated
// beside them — the past-data counterpart to the `oklch-hex-mismatch` rule in
// `src/lib/draft-validator.ts`.
//
// Why this exists as its own tool rather than living in the validator:
//
//   1. The validator only scans `name: oklch(…)  # #hex` lines inside yaml
//      fences, because that is the one shape where "these two describe the same
//      colour" is unambiguous. But a corrected primitive is echoed in three
//      OTHER shapes that the validator deliberately ignores — semantic aliases
//      (`fg-2: oklch(…)  # gray-80`), composite values (gradients), and prose
//      citations. Those cannot be validated (there is no hex to compare) but
//      they CAN be swept once a primitive changes, which is what `--sync` does.
//   2. Preview HTML under `public/preview/{slug}/` hardcodes the same values and
//      is not markdown at all, so no md-level rule reaches it.
//
// Every one of those three shapes shipped a stale value at least once because
// ad-hoc `oklch(L C H)`-only regexes missed them. This script matches an oklch
// literal regardless of what follows it (`)`, ` / alpha)`), across md, sidecar
// and preview HTML, so the sweep is complete by construction.
//
//   pnpm audit:oklch              # report mismatches vs the annotated hex
//   pnpm audit:oklch --fix        # rewrite those tokens to the hex-derived value
//   pnpm audit:oklch --fix --sync # …and propagate to aliases/prose/preview
//   pnpm audit:oklch 11st krds    # limit to specific slugs
//
// `--sync` reaches the md and the preview HTML but NOT `services/*.tokens.json`,
// which is generated rather than hand-edited. Follow a fix with
// `pnpm tokens:build <slug>…` or the `tokens:check` gate will fail in CI.
//
// `--sync` implies `--fix` rather than standing alone. Propagation searches for
// the OLD triple, which only exists while the mismatch is still on the
// definition line — so a SEPARATE `--sync` pass after `--fix` finds nothing and
// silently no-ops, leaving exactly the stale derived copies this script exists
// to catch.

const cwd = process.cwd()
const SERVICES = path.resolve(cwd, "services")
const PREVIEW = path.resolve(cwd, "public/preview")

// Shared with the draft validator — see src/lib/oklch-tolerance.ts for the
// calibration. An 8-digit hex pins opacity as well as colour, and ΔE alone
// cannot see it: `oklch(0 0 0 / 30%)  # #00000008` scores a perfect 0 while
// rendering at ten times the annotated 3%.
const DELTA_E = DELTA_E_TOLERANCE

/** Alpha declared inside an oklch literal (`/ 30%`, `/ 0.3`), or null. */
function oklchAlpha(value: string): number | null {
  const m = value.match(/\/\s*([\d.]+)\s*(%?)/)
  if (!m) return null
  return m[2] === "%" ? Number(m[1]) / 100 : Number(m[1])
}

/** Oklch with the hue already rounded to the integer degrees tokens are written in. */
function labToLch(lab: Oklab): { L: number; C: number; H: number } {
  const { L, C, H } = oklabToLch(lab)
  return { L, C, H: Math.round(H) % 360 }
}

/** Keep the author's decimal precision so a fix produces a minimal diff. */
function like(sample: string, value: number): string {
  const decimals = (sample.split(".")[1] ?? "").length
  return value.toFixed(decimals)
}

interface Finding {
  slug: string
  line: number
  token: string
  from: [string, string, string]
  to: [string, string, string]
  deltaE: number
  /** False when only the opacity was wrong and `to` restates the authored triple. */
  colourOff: boolean
  /** `[authored, corrected]` when the opacity disagrees with an 8-digit hex. */
  alpha: [string, string] | null
}

const args = process.argv.slice(2)
const sync = args.includes("--sync")
// See the header note: syncing is only meaningful in the same pass as the fix
// that creates the old→new pairs it propagates.
const fix = args.includes("--fix") || sync
const slugFilter = args.filter((a) => !a.startsWith("--"))

const slugs = fs
  .readdirSync(SERVICES)
  .filter((f) => f.endsWith(".md"))
  .map((f) => f.replace(/\.md$/, ""))
  .filter((s) => slugFilter.length === 0 || slugFilter.includes(s))

const findings: Array<Finding> = []
let syncCount = 0
// Slugs whose md was corrected but whose derived literals could not be swept,
// collected so one slug's ambiguity does not abort the rest of the catalogue.
const unsynced: Array<{ slug: string; conflicts: Array<CorrectionConflict> }> =
  []

// Coverage, not just findings. "No mismatches" and "matched nothing" produce
// identical output otherwise — the failure mode that let 102 annotated pairs go
// unjudged while this gate reported a clean catalogue.
const coverage = { annotated: 0, judged: 0 }

for (const slug of slugs) {
  const mdPath = path.join(SERVICES, `${slug}.md`)
  const md = fs.readFileSync(mdPath, "utf8")
  const lines = md.split(/\r?\n/)
  const c = countDefinitions(md)
  coverage.annotated += c.annotated
  coverage.judged += c.judged
  const corrections: Array<{
    old: [string, string, string]
    neu: [string, string, string]
  }> = []

  const fixedLines = lines.map((line, i) => {
    const d = matchDefinition(line)
    if (!d) return line
    const want = hexToOklab(d.hex)
    if (!want) return line
    const got = lchToOklab(Number(d.L), Number(d.C), Number(d.H))
    const dE = deltaE(got, want.lab)
    // Only compared when BOTH sides declare it — a 6-digit hex carries no alpha.
    const wroteA = oklchAlpha(d.tail)
    const wantA = want.alpha
    const alphaOff =
      wroteA != null &&
      wantA != null &&
      Math.abs(wroteA - wantA) > ALPHA_TOLERANCE
    if (dE <= DELTA_E && !alphaOff) return line

    const from: [string, string, string] = [d.L, d.C, d.H]
    const target = labToLch(want.lab)
    const chroma = like(d.C, target.C)
    // A pure grey carries float residue on a/b (#111111 lands at a≈1e-11), so
    // atan2 reports an arbitrary angle — 90° rather than the author's 0. Once
    // chroma rounds to zero the hue is unobservable, so keep what was written
    // instead of churning the diff with a meaningless number.
    const hueIsMeaningless = Number(chroma) === 0
    // An alpha-only mismatch leaves the colour itself inside tolerance, so keep
    // the authored L/C/H rather than restating them at full precision.
    const colourOff = dE > DELTA_E
    const to: [string, string, string] = colourOff
      ? [like(d.L, target.L), chroma, hueIsMeaningless ? d.H : String(target.H)]
      : from
    // `alphaOff` already narrows wantA to a number — it cannot be true otherwise.
    const alphaTo = alphaOff
      ? d.tail.replace(/\/\s*[\d.]+\s*%?/, (seg) =>
          seg.includes("%")
            ? `/ ${Number((wantA * 100).toFixed(1))}%`
            : `/ ${Number(wantA.toFixed(3))}`
        )
      : d.tail

    findings.push({
      slug,
      line: i + 1,
      token: d.token,
      from,
      to,
      deltaE: dE,
      colourOff,
      alpha: alphaOff ? [d.tail.trim(), alphaTo.trim()] : null,
    })
    // Only a changed triple can be propagated — an alpha-only edit has no
    // old→new pair for --sync to search for.
    if (colourOff) corrections.push({ old: from, neu: to })

    if (!fix) return line
    // Preserve the author's spacing so only the numbers move in the diff, and
    // splice through `applyDefinition` so a `$` in the comment cannot be read as
    // a substitution pattern. Both are pinned by tests in `src/lib/` — this file
    // has none of its own.
    return applyDefinition(line, d, to, alphaTo)
  })

  if (fix && corrections.length > 0) {
    fs.writeFileSync(mdPath, fixedLines.join("\n"))
  }

  // --sync: a corrected primitive is echoed in aliases, composites, prose and
  // preview HTML. Those carry no hex of their own, so they can only be swept by
  // matching the OLD triple wherever it appears — including `… / alpha)` forms
  // that a `)`-anchored regex would skip.
  if (!sync || corrections.length === 0) continue
  // 파생 리터럴은 md 뿐 아니라 프리뷰 HTML 에도 복사돼 있다. 파일명을 박아두면
  // 이름이 다른 프리뷰(단일 파일 병합 등)가 sync 에서 조용히 빠져 낡은 값이
  // 남으므로, 디렉터리의 모든 .html 을 대상으로 삼는다. 치환은 old→new 리터럴
  // 매칭이라 테마와 무관하다.
  const previewDir = path.join(PREVIEW, slug)
  const previewFiles = fs.existsSync(previewDir)
    ? fs
        .readdirSync(previewDir)
        .filter((f) => f.endsWith(".html"))
        .map((f) => path.join(previewDir, f))
    : []
  const targets = [mdPath, ...previewFiles].filter((p) => fs.existsSync(p))

  // Substitution lives in src/lib/oklch-sync.ts — see the note there on why it
  // must be a single pass (sequential passes shipped a wrong colour to main).
  const { byOld, conflicts } = indexCorrections(corrections)
  if (conflicts.length > 0) {
    // Two tokens shared an old value but want different new ones, so there is no
    // single right answer for the literals that copied it. Refuse rather than
    // pick one — this slug's md definitions are already fixed and correct.
    //
    // Skip only THIS slug and keep going. Exiting here killed the loop, so every
    // slug that readdirSync happened to order later got neither its md fix nor
    // its sync — and the documented invocation carries no slug filter, so one
    // service's conflict silently stranded all the ones behind it.
    unsynced.push({ slug, conflicts })
    continue
  }
  for (const target of targets) {
    const src = fs.readFileSync(target, "utf8")
    const { text: out, count } = syncOklchLiterals(src, byOld)
    syncCount += count
    if (out !== src) fs.writeFileSync(target, out)
  }
}

const byslug = new Map<string, Array<Finding>>()
for (const f of findings) {
  const arr = byslug.get(f.slug) ?? []
  arr.push(f)
  byslug.set(f.slug, arr)
}

for (const [slug, items] of byslug) {
  console.log(`\n${slug} — ${items.length}`)
  for (const f of items) {
    const colour = f.colourOff
      ? `${f.from.join(" ")}  →  ${f.to.join(" ")}`
      : `${f.from.join(" ")}  (colour ok)`
    const alpha = f.alpha ? `   alpha ${f.alpha[0]} → ${f.alpha[1]}` : ""
    console.log(
      `  L${String(f.line).padStart(4)}  ${f.token.padEnd(24)} ` +
        `${colour}   ΔE=${f.deltaE.toFixed(4)}${alpha}`
    )
  }
}

const verb = fix ? "corrected" : "mismatched"
console.log(
  `\n${coverage.judged}/${coverage.annotated} annotated definition(s) judged` +
    (coverage.annotated - coverage.judged
      ? ` (${coverage.annotated - coverage.judged} skipped — comment names more than one hex)`
      : "")
)
console.log(
  `${findings.length} token(s) ${verb}` +
    (sync ? `, ${syncCount} derived literal(s) synced` : "") +
    (findings.length && !fix ? " — re-run with --fix to rewrite" : "")
)

// A pattern that matches nothing is the one failure this tool cannot express as
// a finding, so it needs its own signal. Anything above zero is left to the
// coverage line above and the catalogue canary in oklch-sync.test.ts.
//
// Know where that split leaves a gap. A PARTIAL regression — the pattern still
// matching most lines but losing, say, one brand's — prints a lower coverage
// line here but does not fail; only the canary's ratio assertion turns it into
// an error, and that runs under `pnpm test`. CI runs both, so the gate is whole
// there. A local `pnpm audit:oklch --fix` on its own is not: the drop is on
// screen for a human to notice, and nothing enforces it.
//
// Recorded rather than exited on: the preview drift check below parses md with
// its OWN regex (`oklch-drift.ts`), so it still produces real diagnostics on a
// run where this pattern is broken. Exiting here would bury them.
const patternDead = coverage.annotated > 0 && coverage.judged === 0
if (patternDead) {
  console.error(
    `\nJudged 0 of ${coverage.annotated} annotated definition(s) — ` +
      `OKLCH_DEFINITION is matching nothing. This is a broken pattern, ` +
      `not a clean catalogue.`
  )
}

// Reported after the whole catalogue is walked, so the count is the real one —
// the earlier per-slug abort could only ever name the first conflict it hit.
if (unsynced.length > 0) {
  console.error(
    `\n${unsynced.length} slug(s) corrected but NOT synced — ` +
      `one old value maps to several corrections:`
  )
  for (const { slug, conflicts } of unsynced) {
    console.error(`\n  ${slug}`)
    for (const c of conflicts) {
      console.error(`    oklch(${c.old})  →  ${c.candidates.join("  |  ")}`)
    }
  }
  console.error(
    `\n  Their md definitions are fixed; only the derived literals (aliases,\n` +
      `  gradients, prose, preview CSS) are ambiguous — update those by hand.\n` +
      `  Every other slug was processed normally.`
  )
}

// Second check: does the preview still agree with the md it was built from?
//
// The definition audit above cannot see this. Neither can validate:catalog or
// validate:previews. That blind spot is not hypothetical — a bad `--sync` wrote
// gray-07's colour into 11st's `--gray-06` and every gate stayed green.
let drift = 0
for (const slug of slugs) {
  // 라이트 스코프만 검사한다 — 다크는 [data-theme="dark"] 에서 토큰을 설계상
  // 다른 값으로 재정의하므로 라이트 기준 md 와 비교하면 오탐이 쏟아진다
  // (이슈 #187, 측정 231건).
  //
  // 없으면 조용히 넘기지 않는다. 프리뷰 파일 이름이 바뀌면(단일 파일 병합 등)
  // 이 루프가 exit 0 에 아무 출력 없이 통과해 "게이트는 초록인데 검사는 안 됨"
  // 상태를 만든다. 현재 카탈로그는 모든 슬러그가 light.html 을 갖고 있으므로
  // 여기서 멈추는 것이 정상이다.
  const preview = path.join(PREVIEW, slug, "light.html")
  if (!fs.existsSync(preview)) {
    console.error(
      `\n${slug}: no light.html under public/preview/${slug}/ — the drift ` +
        `check cannot run for this slug. If the preview format changed, teach ` +
        `this loop the new layout instead of letting it skip silently.`
    )
    process.exitCode = 1
    continue
  }
  const defs = readDefinitions(
    fs.readFileSync(path.join(SERVICES, `${slug}.md`), "utf8")
  )
  const found = findPreviewDrift(fs.readFileSync(preview, "utf8"), defs)
  if (found.length === 0) continue
  console.log(`\n${slug}/light.html — ${found.length} drifted from ${slug}.md`)
  for (const d of found) {
    console.log(`  --${d.name.padEnd(24)} ${d.preview}   md says ${d.expected}`)
  }
  drift += found.length
}
if (drift > 0) {
  console.log(
    `\n${drift} preview literal(s) disagree with their md definition — ` +
      `edit the preview to match (the md is the source of truth).`
  )
}

// Report-only mode is a check: non-zero exit lets CI or a pre-commit hook gate on it.
// An unsynced slug fails in either mode — it means the tree is now half-updated.
// A dead pattern fails in either mode too: with nothing judged, a `--fix` run
// that "corrected" nothing is not a success, it is a no-op on a broken tool.
if (patternDead) process.exit(1)
if (unsynced.length > 0) process.exit(1)
if (!fix && (findings.length > 0 || drift > 0)) process.exit(1)
