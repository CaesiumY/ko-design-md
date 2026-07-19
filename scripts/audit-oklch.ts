import fs from "node:fs"
import path from "node:path"
import {
  OKLCH_DEFINITION,
  indexCorrections,
  syncOklchLiterals,
} from "../src/lib/oklch-sync"
import { findPreviewDrift, readDefinitions } from "../src/lib/oklch-drift"
import { ALPHA_TOLERANCE, DELTA_E_TOLERANCE } from "../src/lib/oklch-tolerance"

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

interface Lab {
  L: number
  a: number
  b: number
}

const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

function hexToLab(hex: string): { lab: Lab; alpha: number | null } | null {
  let h = hex.replace("#", "")
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  const alpha = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : null
  if (h.length === 8) h = h.slice(0, 6)
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null
  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255)
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255)
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    lab: {
      L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
      a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
      b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
    },
    alpha,
  }
}

function labToLch(lab: Lab): { L: number; C: number; H: number } {
  const C = Math.hypot(lab.a, lab.b)
  let H = (Math.atan2(lab.b, lab.a) * 180) / Math.PI
  if (H < 0) H += 360
  return { L: lab.L, C, H: Math.round(H) % 360 }
}

const lchToLab = (L: number, C: number, H: number): Lab => ({
  L,
  a: C * Math.cos((H * Math.PI) / 180),
  b: C * Math.sin((H * Math.PI) / 180),
})

const deltaE = (p: Lab, q: Lab): number =>
  Math.hypot(p.L - q.L, p.a - q.a, p.b - q.b)

/** Keep the author's decimal precision so a fix produces a minimal diff. */
function like(sample: string, value: number): string {
  const decimals = (sample.split(".")[1] ?? "").length
  return value.toFixed(decimals)
}

// The one shape where the pairing is unambiguous, so it is the only shape we
// JUDGE — shared with the sync pass, which must leave those lines alone.
const DEFINITION = OKLCH_DEFINITION

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

for (const slug of slugs) {
  const mdPath = path.join(SERVICES, `${slug}.md`)
  const lines = fs.readFileSync(mdPath, "utf8").split(/\r?\n/)
  const corrections: Array<{
    old: [string, string, string]
    neu: [string, string, string]
  }> = []

  const fixedLines = lines.map((line, i) => {
    const m = line.match(DEFINITION)
    if (!m) return line
    const want = hexToLab(m[10])
    if (!want) return line
    const got = lchToLab(Number(m[3]), Number(m[5]), Number(m[7]))
    const dE = deltaE(got, want.lab)
    // Only compared when BOTH sides declare it — a 6-digit hex carries no alpha.
    const wroteA = oklchAlpha(m[8])
    const wantA = want.alpha
    const alphaOff =
      wroteA != null &&
      wantA != null &&
      Math.abs(wroteA - wantA) > ALPHA_TOLERANCE
    if (dE <= DELTA_E && !alphaOff) return line

    const from: [string, string, string] = [m[3], m[5], m[7]]
    const target = labToLch(want.lab)
    const chroma = like(m[5], target.C)
    // A pure grey carries float residue on a/b (#111111 lands at a≈1e-11), so
    // atan2 reports an arbitrary angle — 90° rather than the author's 0. Once
    // chroma rounds to zero the hue is unobservable, so keep what was written
    // instead of churning the diff with a meaningless number.
    const hueIsMeaningless = Number(chroma) === 0
    // An alpha-only mismatch leaves the colour itself inside tolerance, so keep
    // the authored L/C/H rather than restating them at full precision.
    const colourOff = dE > DELTA_E
    const to: [string, string, string] = colourOff
      ? [
          like(m[3], target.L),
          chroma,
          hueIsMeaningless ? m[7] : String(target.H),
        ]
      : from
    // `alphaOff` already narrows wantA to a number — it cannot be true otherwise.
    const alphaTo = alphaOff
      ? m[8].replace(/\/\s*[\d.]+\s*%?/, (seg) =>
          seg.includes("%")
            ? `/ ${Number((wantA * 100).toFixed(1))}%`
            : `/ ${Number(wantA.toFixed(3))}`
        )
      : m[8]

    findings.push({
      slug,
      line: i + 1,
      token: m[1],
      from,
      to,
      deltaE: dE,
      colourOff,
      alpha: alphaOff ? [m[8].trim(), alphaTo.trim()] : null,
    })
    // Only a changed triple can be propagated — an alpha-only edit has no
    // old→new pair for --sync to search for.
    if (colourOff) corrections.push({ old: from, neu: to })

    if (!fix) return line
    // Preserve the author's spacing so only the numbers move in the diff.
    return line.replace(
      m[0],
      `${m[1]}:${m[2]}oklch(${to[0]}${m[4]}${to[1]}${m[6]}${to[2]}${alphaTo})${m[9]}${m[10]}`
    )
  })

  if (fix && corrections.length > 0) {
    fs.writeFileSync(mdPath, fixedLines.join("\n"))
  }

  // --sync: a corrected primitive is echoed in aliases, composites, prose and
  // preview HTML. Those carry no hex of their own, so they can only be swept by
  // matching the OLD triple wherever it appears — including `… / alpha)` forms
  // that a `)`-anchored regex would skip.
  if (!sync || corrections.length === 0) continue
  const targets = [
    mdPath,
    path.join(PREVIEW, slug, "light.html"),
    path.join(PREVIEW, slug, "dark.html"),
  ].filter((p) => fs.existsSync(p))

  // Substitution lives in src/lib/oklch-sync.ts — see the note there on why it
  // must be a single pass (sequential passes shipped a wrong colour to main).
  const { byOld, conflicts } = indexCorrections(corrections)
  if (conflicts.length > 0) {
    // Two tokens shared an old value but want different new ones, so there is no
    // single right answer for the literals that copied it. Refuse rather than
    // pick one — the md definitions are already fixed and correct at this point.
    console.error(
      `\n[${slug}] cannot sync: one old value maps to several corrections.`
    )
    for (const c of conflicts) {
      console.error(`  oklch(${c.old})  →  ${c.candidates.join("  |  ")}`)
    }
    console.error(
      `  Derived literals are ambiguous here — update them by hand.\n`
    )
    process.exit(1)
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
  `\n${findings.length} token(s) ${verb}` +
    (sync ? `, ${syncCount} derived literal(s) synced` : "") +
    (findings.length && !fix ? " — re-run with --fix to rewrite" : "")
)

// Second check: does the preview still agree with the md it was built from?
//
// The definition audit above cannot see this. Neither can validate:catalog or
// validate:previews. That blind spot is not hypothetical — a bad `--sync` wrote
// gray-07's colour into 11st's `--gray-06` and every gate stayed green.
let drift = 0
for (const slug of slugs) {
  const preview = path.join(PREVIEW, slug, "light.html")
  if (!fs.existsSync(preview)) continue
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
if (!fix && (findings.length > 0 || drift > 0)) process.exit(1)
