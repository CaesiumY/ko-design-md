// Re-counts what each eval branch changed, straight from git, split by the role a file plays.
// Usage: node diffstat.cjs            (all eval/* branches that exist)
// The solvers' own counts are in their result files; this is the independent count.
const { execFileSync } = require("node:child_process")

const BASES = {
  "html-frame": "0ef2f879",
  fragments: "2a077dca",
  components: "68b82f54",
}

function git(args) {
  return execFileSync("git", args, {
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  })
}

/** Which bucket a changed path falls into, per structure. */
function role(structure, p) {
  if (p.startsWith("prototypes/preview-structure/results/")) return "results"
  if (/\.test\.ts$/.test(p)) return "test"
  if (/\/(README|STATS)\.md$/.test(p)) return "guide"
  if (p === "package.json" || p === "pnpm-lock.yaml") return "wiring"
  // The frame stylesheet the assembler / the parts inline into every served file.
  if (p === "prototypes/preview-structure/frame.css") return "shared"
  const served = /^public\/preview\/[^/_][^/]*\/preview\.html$/.test(p)
  if (structure === "html-frame") {
    if (served) return "source"
    if (p.startsWith("public/preview/_runtime/")) return "shared"
    if (p.startsWith("prototypes/preview-structure/html-frame/"))
      return "shared"
  }
  if (structure === "fragments") {
    if (served) return "generated"
    if (p.startsWith("preview-src/")) return "source"
    if (p.startsWith("public/preview/_runtime/")) return "shared"
    if (p.startsWith("prototypes/preview-structure/fragments/")) return "shared"
  }
  if (structure === "components") {
    if (served) return "generated"
    if (p.startsWith("prototypes/preview-structure/components/entries/"))
      return "source"
    if (p.startsWith("public/preview/_runtime/")) return "shared"
    if (p.startsWith("prototypes/preview-structure/components/"))
      return "shared"
  }
  return "other"
}

const branches = git([
  "for-each-ref",
  "--format=%(refname:short)",
  "refs/heads/eval/",
])
  .split("\n")
  .map((s) => s.trim())
  .filter(Boolean)
  .sort()

const ROLES = [
  "source",
  "shared",
  "generated",
  "guide",
  "test",
  "wiring",
  "other",
]
const rows = []
for (const b of branches) {
  const m = /^eval\/(html-frame|fragments|components)-s(\d[ab]?)$/.exec(b)
  if (!m) continue
  const [, structure, scenario] = m
  let base = BASES[structure]
  // Scenario 4 counts from the prep commit (the one that only deletes laftel's preview).
  if (scenario.startsWith("4")) {
    const log = git(["log", "--reverse", "--format=%H", `${base}..${b}`])
      .split("\n")
      .filter(Boolean)
    if (log.length > 0) base = log[0]
  }
  const numstat = git(["diff", "--numstat", base, b])
    .split("\n")
    .filter(Boolean)
  const acc = Object.fromEntries(
    ROLES.map((r) => [r, { files: 0, add: 0, del: 0, paths: [] }])
  )
  for (const line of numstat) {
    const [a, d, p] = line.split("\t")
    const r = role(structure, p)
    if (r === "results") continue
    acc[r].files += 1
    acc[r].add += a === "-" ? 0 : Number(a)
    acc[r].del += d === "-" ? 0 : Number(d)
    acc[r].paths.push(`${p} (+${a} -${d})`)
  }
  const commits = git(["log", "--format=%h %s", `${BASES[structure]}..${b}`])
    .trim()
    .split("\n")
  rows.push({
    branch: b,
    structure,
    scenario,
    base: base.slice(0, 8),
    tip: git(["rev-parse", "--short=8", b]).trim(),
    acc,
    commits,
  })
}

const json = process.argv.includes("--json")
if (json) {
  process.stdout.write(JSON.stringify(rows, null, 2) + "\n")
} else {
  for (const r of rows) {
    console.log(`\n== ${r.branch}  (${r.base}..${r.tip})`)
    for (const c of r.commits) console.log(`   commit ${c}`)
    for (const role of ROLES) {
      const x = r.acc[role]
      if (x.files === 0) continue
      console.log(
        `   ${role.padEnd(9)} files ${String(x.files).padStart(2)}  +${x.add} -${x.del}`
      )
      for (const p of x.paths) console.log(`      ${p}`)
    }
  }
}
