// Reads served files straight out of the eval branches (git show, no checkout) and checks that
// each scenario's ask is really in them. Prints one block per branch.
const { execFileSync } = require("node:child_process")

const STRUCTURES = ["html-frame", "fragments", "components"]
const BASE = {
  "html-frame": "0ef2f879",
  fragments: "2a077dca",
  components: "68b82f54",
}
const ORIGIN = "9f72b964" // the shared base, where the original laftel preview still is

function show(ref, p) {
  try {
    return execFileSync("git", ["show", `${ref}:${p}`], {
      encoding: "utf8",
      maxBuffer: 64 * 1024 * 1024,
    })
  } catch {
    return null
  }
}
const served = (ref, slug) => show(ref, `public/preview/${slug}/preview.html`)

function zones(html) {
  return [
    ...html.matchAll(
      /<(?:section|header)\b[^>]*data-pv-zone="([a-z-]+)"[^>]*>/g
    ),
  ].map((m) => m[1])
}
function zoneSlice(html, zone) {
  const starts = [
    ...html.matchAll(
      /<(?:section|header)\b[^>]*data-pv-zone="([a-z-]+)"[^>]*>/g
    ),
  ]
  const i = starts.findIndex((m) => m[1] === zone)
  if (i < 0) return null
  const end = i + 1 < starts.length ? starts[i + 1].index : html.length
  return html.slice(starts[i].index, end)
}
// "pv-cell" or "pv-cell pv-cell--wide", not the "pv-cells" wrapper.
const cellTags = (html) =>
  [...html.matchAll(/<div\b[^>]*class="pv-cell(?: [^"]*)?"[^>]*>/g)].map(
    (m) => m[0]
  )
const count = (html, re) => [...html.matchAll(re)].length

function scenario1(structure, ref) {
  const framePath =
    structure === "html-frame"
      ? "public/preview/_runtime/frame.css"
      : "prototypes/preview-structure/frame.css"
  const css = show(ref, framePath)
  const rule = /\.pv-zone-title\s*\{[^}]*\}/.exec(css ?? "")
  const out = [
    `frame rule (${framePath}): ${rule ? rule[0].replace(/\s+/g, " ") : "NOT FOUND"}`,
  ]
  for (const slug of ["toss", "chzzk"]) {
    const html = served(ref, slug)
    const inline = /\.pv-zone-title\s*\{[^}]*\}/.exec(html)
    const linked = /<link[^>]*frame\.css[^>]*>/.test(html)
    out.push(
      `${slug}: ${inline ? "inlined " + inline[0].replace(/\s+/g, " ") : linked ? "links frame.css (no inline copy)" : "NEITHER inline rule NOR link"}`
    )
  }
  return out
}

function scenario2(ref) {
  const out = []
  for (const slug of ["toss", "chzzk"]) {
    const html = served(ref, slug)
    const cells = cellTags(html)
    const grouped = cells.filter((t) => /role="group"/.test(t))
    const labelled = cells
      .map((t) => /aria-labelledby="([^"]+)"/.exec(t)?.[1])
      .filter(Boolean)
    const ids = new Set(
      [
        ...html.matchAll(/<p\b[^>]*class="pv-label"[^>]*\bid="([^"]+)"/g),
        ...html.matchAll(/<p\b[^>]*\bid="([^"]+)"[^>]*class="pv-label"/g),
      ].map((m) => m[1])
    )
    const dangling = labelled.filter((id) => !ids.has(id))
    const names = cells.map((t) => /data-pv-cell="([^"]+)"/.exec(t)?.[1])
    const wrongId = cells.filter((t) => {
      const name = /data-pv-cell="([^"]+)"/.exec(t)?.[1]
      return /aria-labelledby="([^"]+)"/.exec(t)?.[1] !== `pv-label-${name}`
    })
    // Labels swapped in for the dark theme sit inside <template>; they replace the label node, so
    // a swapped-in label without the id leaves aria-labelledby pointing at nothing in dark.
    const labelTags = [
      ...html.matchAll(/<p\b[^>]*class="pv-label"[^>]*>/g),
    ].map((m) => m[0])
    const labelNoId = labelTags.filter((t) => !/\bid="/.test(t))
    out.push(
      `${slug}: label tags ${labelTags.length} (with id ${labelTags.length - labelNoId.length}, without id ${labelNoId.length})`
    )
    out.push(
      `${slug}: cells ${cells.length}, role=group ${grouped.length}, aria-labelledby ${labelled.length}, label ids ${ids.size}, dangling ${dangling.length}, not pv-label-{name} ${wrongId.length}, unnamed ${names.filter((n) => !n).length}`
    )
  }
  return out
}

function scenario3(ref) {
  const out = []
  for (const slug of ["toss", "chzzk"]) {
    const html = served(ref, slug)
    out.push(`${slug} zone order: ${zones(html).join(" > ")}`)
  }
  const chzzk = served(ref, "chzzk")
  const tables = zoneSlice(chzzk, "tables")
  if (tables === null) out.push("chzzk tables zone: MISSING")
  else {
    const title = /<h2[^>]*class="pv-zone-title"[^>]*>([^<]*)</.exec(
      tables
    )?.[1]
    const names = cellTags(tables).map(
      (t) => /data-pv-cell="([^"]+)"/.exec(t)?.[1]
    )
    out.push(`chzzk tables zone: title "${title}", cells ${names.join(", ")}`)
  }
  return out
}

function scenario5(ref) {
  const html = served(ref, "toss")
  const buttons = zoneSlice(html, "buttons")
  const firstLabel = /<p\b[^>]*class="pv-label"[^>]*>([\s\S]*?)<\/p>/.exec(
    buttons
  )?.[1]
  const screens = zoneSlice(html, "screens")
  const screenAt = screens.indexOf('class="pv-screen"')
  const firstButton = /<button\b[^>]*>/.exec(screens.slice(screenAt))?.[0]
  return [
    `buttons first label: ${firstLabel?.replace(/\s+/g, " ").trim()}`,
    `screens first button tag: ${firstButton}`,
  ]
}

function meaningful(html) {
  return html
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length >= 30)
}
function overlap(a, b) {
  const set = new Set(meaningful(b))
  const lines = meaningful(a)
  const hit = lines.filter((l) => set.has(l))
  return { lines: lines.length, hit: hit.length, sample: hit.slice(0, 4) }
}

function scenario4(structure, ref) {
  const html = served(ref, "laftel")
  if (html === null) return ["laftel served file: MISSING"]
  const out = []
  out.push(`lines ${html.split("\n").length}, zones ${zones(html).join(" > ")}`)
  for (const z of zones(html)) {
    const slice = zoneSlice(html, z)
    const names = cellTags(slice).map(
      (t) => /data-pv-cell="([^"]+)"/.exec(t)?.[1]
    )
    if (names.length > 0) out.push(`  ${z}: ${names.join(", ")}`)
  }
  out.push(
    `pv-screen count ${count(html, /class="pv-screen"/g)}, dark variant templates ${count(html, /data-theme-variant="dark"/g)}, [data-theme="dark"] rules ${count(html, /\[data-theme="?dark"?\]/g)}, :hover ${count(html, /:hover/g)}, :active ${count(html, /:active/g)}, :focus-visible ${count(html, /:focus-visible/g)}`
  )
  out.push(
    `disclaimer text present: ${/비공식|공식 .*아닙|unofficial/i.test(html)}`
  )
  const original = served(ORIGIN, "laftel")
  const o = overlap(html, original)
  out.push(
    `overlap with the deleted original laftel preview: ${o.hit}/${o.lines} lines (>=30 chars)`
  )
  for (const s of o.sample) out.push(`    = ${s.slice(0, 110)}`)
  for (const slug of ["chzzk", "toss"]) {
    const ref2 = BASE[structure]
    const c = overlap(html, served(ref2, slug))
    out.push(`overlap with ${slug} (allowed to read): ${c.hit}/${c.lines}`)
  }
  return out
}

for (const structure of STRUCTURES) {
  for (const sc of ["5", "1", "2", "3", "4a", "4b"]) {
    const ref = `eval/${structure}-s${sc}`
    console.log(`\n== ${ref}`)
    let lines
    try {
      if (sc === "1") lines = scenario1(structure, ref)
      else if (sc === "2") lines = scenario2(ref)
      else if (sc === "3") lines = scenario3(ref)
      else if (sc === "5") lines = scenario5(ref)
      else lines = scenario4(structure, ref)
    } catch (error) {
      lines = [`ERROR ${error}`]
    }
    for (const l of lines) console.log(`   ${l}`)
  }
}
