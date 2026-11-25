// Builds the folder the two evaluators read: guides, static numbers, the solvers' result files and
// the solution diffs, pulled out of the branches with git show. Nothing else goes in.
// usage: node packet.cjs <outDir>
const { execFileSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

const outDir = process.argv[2]
const BASE = {
  "html-frame": "0ef2f879",
  fragments: "2a077dca",
  components: "68b82f54",
}
const GUIDE_DIR = {
  "html-frame": "prototypes/preview-structure/html-frame",
  fragments: "prototypes/preview-structure/fragments",
  components: "prototypes/preview-structure/components",
}
const git = (args) =>
  execFileSync("git", args, { encoding: "utf8", maxBuffer: 128 * 1024 * 1024 })
const write = (rel, text) => {
  const file = path.join(outDir, rel)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, text)
}

write(
  "SCENARIOS.md",
  git(["show", "9f72b964:prototypes/preview-structure/SCENARIOS.md"])
)
write(
  "STANDARD.md",
  git(["show", "9f72b964:prototypes/preview-structure/STANDARD.md"])
)

for (const [structure, base] of Object.entries(BASE)) {
  for (const doc of ["README.md", "STATS.md"])
    write(
      `${structure}/${doc}`,
      git(["show", `${base}:${GUIDE_DIR[structure]}/${doc}`])
    )
  for (const sc of ["5", "1", "2", "3", "4a", "4b"]) {
    const branch = `eval/${structure}-s${sc}`
    const resultPath = `prototypes/preview-structure/results/${structure}-s${sc}.md`
    write(
      `${structure}/results/${structure}-s${sc}.md`,
      git(["show", `${branch}:${resultPath}`])
    )
    // The solution is everything up to the commit before the one that added the result file.
    const resultCommit = git([
      "log",
      "--format=%H",
      "--diff-filter=A",
      "-1",
      branch,
      "--",
      resultPath,
    ]).trim()
    const solution = git(["rev-parse", `${resultCommit}~1`]).trim()
    let from = base
    if (sc.startsWith("4"))
      from = git([
        "log",
        "--reverse",
        "--format=%H",
        `${base}..${branch}`,
      ]).split("\n")[0]
    write(`${structure}/patches/s${sc}.patch`, git(["diff", from, solution]))
  }
}

for (const doc of ["README.md", "STATS.md"])
  write(
    `custom-tags/${doc}`,
    git(["show", `46ccd564:prototypes/preview-structure/custom-tags/${doc}`])
  )

console.log("packet written to", outDir)
