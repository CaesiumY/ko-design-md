import fs from "node:fs"
import path from "node:path"

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
//   pnpm audit:oklch            # report mismatches vs the annotated hex
//   pnpm audit:oklch --fix      # rewrite those tokens to the hex-derived value
//   pnpm audit:oklch --sync     # after --fix: propagate to aliases/prose/preview
//   pnpm audit:oklch 11st krds  # limit to specific slugs

const cwd = process.cwd()
const SERVICES = path.resolve(cwd, "services")
const PREVIEW = path.resolve(cwd, "public/preview")

// Same bound as the validator's DELTA_E_TOLERANCE — calibrated so honest 2–3
// decimal rounding passes while genuinely wrong conversions surface.
const DELTA_E = 0.01

interface Lab {
  L: number
  a: number
  b: number
}

const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)

function hexToLab(hex: string): Lab | null {
  let h = hex.replace("#", "")
  if (h.length === 3 || h.length === 4) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  if (h.length === 8) h = h.slice(0, 6)
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) return null
  const r = srgbToLinear(parseInt(h.slice(0, 2), 16) / 255)
  const g = srgbToLinear(parseInt(h.slice(2, 4), 16) / 255)
  const b = srgbToLinear(parseInt(h.slice(4, 6), 16) / 255)
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b)
  return {
    L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
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

const escapeRe = (s: string): string => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// `token: oklch(L C H[ / a])  # #hex` — the one shape where the pairing is
// unambiguous, so it is the only shape we JUDGE.
const DEFINITION =
  /^([a-z][\w-]*):(\s+)oklch\(\s*([\d.]+)(\s+)([\d.]+)(\s+)([\d.]+)([^)]*)\)(\s*#\s*)(#[0-9a-fA-F]{3,8})\b/

interface Finding {
  slug: string
  line: number
  token: string
  from: [string, string, string]
  to: [string, string, string]
  deltaE: number
}

const args = process.argv.slice(2)
const fix = args.includes("--fix")
const sync = args.includes("--sync")
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
    const dE = deltaE(got, want)
    if (dE <= DELTA_E) return line

    const target = labToLch(want)
    const chroma = like(m[5], target.C)
    // A pure grey carries float residue on a/b (#111111 lands at a≈1e-11), so
    // atan2 reports an arbitrary angle — 90° rather than the author's 0. Once
    // chroma rounds to zero the hue is unobservable, so keep what was written
    // instead of churning the diff with a meaningless number.
    const hueIsMeaningless = Number(chroma) === 0
    const to: [string, string, string] = [
      like(m[3], target.L),
      chroma,
      hueIsMeaningless ? m[7] : String(target.H),
    ]
    const from: [string, string, string] = [m[3], m[5], m[7]]
    findings.push({ slug, line: i + 1, token: m[1], from, to, deltaE: dE })
    corrections.push({ old: from, neu: to })

    if (!fix) return line
    // Preserve the author's spacing so only the numbers move in the diff.
    return line.replace(
      m[0],
      `${m[1]}:${m[2]}oklch(${to[0]}${m[4]}${to[1]}${m[6]}${to[2]}${m[8]})${m[9]}${m[10]}`
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

  // Longest old-triple first: stops a shorter literal matching inside a longer.
  const ordered = [...corrections].sort(
    (a, b) => b.old.join(" ").length - a.old.join(" ").length
  )

  for (const target of targets) {
    const src = fs.readFileSync(target, "utf8")
    const out = src
      .split(/\r?\n/)
      .map((line) => {
        // The definition line already carries the new value.
        if (DEFINITION.test(line)) return line
        let next = line
        for (const { old, neu } of ordered) {
          const re = new RegExp(
            `(oklch\\(\\s*)${escapeRe(old[0])}(\\s+)${escapeRe(old[1])}(\\s+)${escapeRe(old[2])}(\\s*[/)])`,
            "g"
          )
          const hits = next.match(re)
          if (!hits) continue
          next = next.replace(re, `$1${neu[0]}$2${neu[1]}$3${neu[2]}$4`)
          syncCount += hits.length
        }
        return next
      })
      .join("\n")
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
    console.log(
      `  L${String(f.line).padStart(4)}  ${f.token.padEnd(24)} ` +
        `${f.from.join(" ")}  →  ${f.to.join(" ")}   ΔE=${f.deltaE.toFixed(4)}`
    )
  }
}

const verb = fix ? "corrected" : "mismatched"
console.log(
  `\n${findings.length} token(s) ${verb}` +
    (sync ? `, ${syncCount} derived literal(s) synced` : "") +
    (findings.length && !fix ? " — re-run with --fix to rewrite" : "")
)

// Report-only mode is a check: non-zero exit lets CI or a pre-commit hook gate on it.
if (!fix && findings.length > 0) process.exit(1)
