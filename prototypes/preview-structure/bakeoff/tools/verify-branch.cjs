// Re-runs, on a checked-out eval branch, the checks a solver claimed to have passed, times them,
// and (scenarios 2 and 3) plants the deliberate fault to see whether the contract check names it.
//
// usage: node verify-branch.cjs <structure> <scenario> <outDir> [--cwd <dir>] [--no-write]
//   structure: html-frame | fragments | components
//   scenario:  1 | 2 | 3 | 4a | 4b | 5
//   --no-write skips everything that writes into the checkout (the rebuild and the planted fault).
const { spawnSync } = require("node:child_process")
const fs = require("node:fs")
const path = require("node:path")

const args = process.argv.slice(2)
const flag = (name) => args.includes(name)
const opt = (name) =>
  args.includes(name) ? args[args.indexOf(name) + 1] : undefined
const [structure, scenario, outDir] = args
const cwd = opt("--cwd") ?? process.cwd()
const noWrite = flag("--no-write")

const TEST_FILE = {
  "html-frame": "prototypes/preview-structure/html-frame/check-frame.test.ts",
  fragments: "prototypes/preview-structure/fragments/fragments.test.ts",
  components: "prototypes/preview-structure/components/components.test.ts",
}
const BUILD = {
  "html-frame": null,
  fragments: "pnpm previews:build",
  components: "pnpm pv:build",
}
const isNewEntry = scenario.startsWith("4")
const slugs = isNewEntry ? ["laftel"] : ["toss", "chzzk"]

function contractCommand() {
  if (structure === "html-frame")
    return `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts ${slugs.join(" ")}`
  const base =
    structure === "fragments" ? "pnpm previews:check" : "pnpm pv:check"
  return isNewEntry ? `${base} laftel` : base
}

function run(label, command) {
  const started = Date.now()
  const r = spawnSync(command, {
    cwd,
    shell: true,
    encoding: "utf8",
    timeout: 600_000,
    maxBuffer: 64 * 1024 * 1024,
  })
  const ms = Date.now() - started
  const out = `${r.stdout ?? ""}${r.stderr ?? ""}`.replace(/\r/g, "")
  const lines = out.split("\n").filter((l) => l.trim() !== "")
  return { label, command, exit: r.status, ms, tail: lines.slice(-14) }
}

const steps = []
const push = (s) => {
  steps.push(s)
  return s
}

push(run("head", "git rev-parse HEAD"))
push(run("status-before", "git status --porcelain"))
push(run("warmup", "pnpm exec tsx --version"))

if (BUILD[structure] !== null && !noWrite) {
  push(run("build", BUILD[structure]))
  // An empty status after a rebuild means the committed served files match their sources.
  push(run("status-after-build", "git status --porcelain"))
}
push(run("contract", contractCommand()))
for (const slug of slugs)
  push(run(`validate:${slug}`, `pnpm validate:previews --slug ${slug}`))
push(run("unit-tests", `pnpm exec vitest run ${TEST_FILE[structure]}`))

/** Plants the scenario's deliberate fault in the served toss file. Returns what it did. */
function plantFault() {
  const file = path.join(cwd, "public/preview/toss/preview.html")
  const html = fs.readFileSync(file, "utf8")
  if (scenario === "2") {
    const zoneAt = html.indexOf('data-pv-zone="buttons"')
    if (zoneAt < 0) throw new Error("no buttons zone")
    // The cell's attribute (pv-label-…), not the zone section's own aria-labelledby="pv-buttons".
    const re = / aria-labelledby="pv-label-[^"]*"/g
    re.lastIndex = zoneAt
    const m = re.exec(html)
    if (m === null) throw new Error("no aria-labelledby after the buttons zone")
    fs.writeFileSync(
      file,
      html.slice(0, m.index) + html.slice(m.index + m[0].length)
    )
    const line = html.slice(0, m.index).split("\n").length
    return `removed${m[0]} at line ${line}`
  }
  if (scenario === "3") {
    const starts = [
      ...html.matchAll(/<section\b[^>]*data-pv-zone="([a-z-]+)"[^>]*>/g),
    ].map((m) => ({
      zone: m[1],
      at: m.index,
    }))
    const order = starts.map((s) => s.zone)
    const ia = order.indexOf("selection")
    const ib = order.indexOf("inputs")
    if (ia < 0 || ib !== ia + 1)
      throw new Error(
        `selection/inputs not adjacent in this order: ${order.join(",")}`
      )
    const endB =
      ib + 1 < starts.length ? starts[ib + 1].at : html.indexOf("</main>")
    const a = html.slice(starts[ia].at, starts[ib].at)
    const b = html.slice(starts[ib].at, endB)
    fs.writeFileSync(
      file,
      html.slice(0, starts[ia].at) + b + a + html.slice(endB)
    )
    return `swapped selection and inputs (order was ${order.join(",")})`
  }
  return null
}

let fault = null
if ((scenario === "2" || scenario === "3") && !noWrite) {
  try {
    fault = { did: plantFault() }
    fault.check = run("contract-with-fault", contractCommand())
    // Keep the lines that name the fault, not only the tail.
    fault.restore = run(
      "restore",
      "git checkout -- public/preview/toss/preview.html"
    )
    fault.statusAfter = run("status-after-restore", "git status --porcelain")
  } catch (error) {
    fault = { error: String(error) }
    run("restore", "git checkout -- public/preview/toss/preview.html")
  }
}

const result = { structure, scenario, cwd, noWrite, steps, fault }
fs.mkdirSync(outDir, { recursive: true })
const outFile = path.join(outDir, `${structure}-s${scenario}.json`)
fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + "\n")
for (const s of steps)
  console.log(`${s.label.padEnd(20)} exit ${s.exit}  ${s.ms}ms`)
if (fault !== null)
  console.log(`fault: ${fault.did ?? fault.error} -> exit ${fault.check?.exit}`)
console.log(`wrote ${outFile}`)
