// Prints the re-verification JSON files as tables: step exit codes and times, then what the
// contract check said about each planted fault.
// usage: node summarize-verify.cjs <outDir> [--faults]
const fs = require("node:fs")
const path = require("node:path")
const dir = process.argv[2]
const showFaults = process.argv.includes("--faults")
const ORDER = ["5", "1", "2", "3", "4a", "4b"]
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".json"))
const rows = files.map((f) =>
  JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"))
)
rows.sort(
  (a, b) =>
    a.structure.localeCompare(b.structure) ||
    ORDER.indexOf(a.scenario) - ORDER.indexOf(b.scenario)
)

const step = (r, label) => r.steps.find((s) => s.label === label)
const cell = (s) =>
  s === undefined ? "-" : `${s.exit === 0 ? "" : `exit ${s.exit} `}${s.ms}ms`
console.log(
  "| structure | scenario | head | build | status after build | contract | validate (each slug) | unit tests | tests line |"
)
console.log("| --- | --- | --- | --- | --- | --- | --- | --- | --- |")
for (const r of rows) {
  const head = step(r, "head").tail[0].slice(0, 8)
  const afterBuild = step(r, "status-after-build")
  const validates = r.steps
    .filter((s) => s.label.startsWith("validate:"))
    .map((s) => `${s.label.slice(9)} ${cell(s)}`)
    .join(", ")
  const tests = step(r, "unit-tests")
  const testsLine = tests.tail.find((l) => /Tests\s/.test(l))?.trim() ?? "?"
  console.log(
    `| ${r.structure} | ${r.scenario} | ${head} | ${cell(step(r, "build"))} | ${afterBuild === undefined ? "-" : afterBuild.tail.length === 0 ? "clean" : `DIRTY ${afterBuild.tail.join(" ")}`} | ${cell(step(r, "contract"))} | ${validates} | ${cell(tests)} | ${testsLine} |`
  )
}
if (showFaults) {
  for (const r of rows) {
    if (r.fault === null) continue
    console.log(
      `\n== ${r.structure} s${r.scenario}: ${r.fault.did ?? r.fault.error}`
    )
    if (r.fault.check) {
      console.log(
        `   contract exit ${r.fault.check.exit}, ${r.fault.check.ms}ms`
      )
      for (const l of r.fault.check.tail) console.log(`   | ${l.slice(0, 400)}`)
      console.log(
        `   status after restore: ${r.fault.statusAfter.tail.length === 0 ? "clean" : r.fault.statusAfter.tail.join(" ")}`
      )
    }
  }
}
