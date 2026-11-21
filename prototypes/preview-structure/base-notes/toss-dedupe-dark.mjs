// PROTOTYPE — throwaway code. Folds a preview's copied dark sheet into token
// redefinitions.
//
// A preview carries two <style> blocks. The first is the light sheet. The
// second repeats every light rule under a `[data-theme="dark"] ` prefix, with a
// few values changed. This script keeps only what the copy changes:
//
//   1. a dark rule whose declarations equal its light twin's is dropped;
//   2. a declaration whose value differs becomes a custom property — the light
//      value moves to `:root`, the light rule reads `var(--token)`, and the
//      dark sheet redefines the token under `[data-theme="dark"]`;
//   3. a declaration only the dark rule has stays as a `[data-theme="dark"] …`
//      rule (a delta), because no light declaration exists to carry a token.
//
// Why tokens and not kept dark rules: `[data-theme="dark"] .a` outranks every
// light rule up to one class more specific than `.a`. In the full copy that is
// harmless, since the more specific rule has a dark twin too. Once the twin is
// dropped as identical, a kept `[data-theme="dark"] .a { color }` would start
// beating the light `.a.b { color }`. A token redefinition adds no selector, so
// the cascade stays the light sheet's own.
//
// The script edits the light sheet too: new `:root` tokens and `var()` at each
// site whose value differs. No markup changes.
//
//   node toss-dedupe-dark.mjs <preview.html> [--names <json>] [--write]
//
// Without --write it only prints the report. Exit 1 when something needs a
// hand (repeated properties that differ between themes, a name that clashes).
//
// The render is the proof, not this script: run dom-diff.ts against the
// original afterwards. dom-diff does not read `::placeholder`, so a token that
// lands there is checked separately.
//
// What is toss-only here: the NAMES table below (and the `--tds-` prefix in
// it). Another entry passes its own table with --names; a pair with no name
// gets `--dk-{kind}-{n}`.

import { readFileSync, writeFileSync } from "node:fs"

/** toss: `{kind}|{light value}|{dark value}` -> token name. An existing token
 *  is reused when both of its values already match. */
const NAMES = {
  "bg|var(--tds-white)|var(--tds-near-black)": "--tds-bg-canvas",
  "bg|oklch(1 0 0 / 0)|oklch(0.118 0.020 257 / 0)": "--tds-bg-canvas-clear",
  "bg|var(--tds-white)|var(--tds-grey-100)": "--card",
  "bg|var(--tds-white)|var(--tds-grey-150)": "--tds-bg-raised",
  "bg|var(--tds-white)|var(--tds-grey-200)": "--tds-bg-selected",
  "bg|var(--tds-white)|oklch(0.230 0.012 285)": "--tds-bg-stepper",
  "bg|#fff|var(--tds-grey-100)": "--tds-bg-check",
  "bg|var(--tds-grey-50)|var(--tds-grey-100)": "--tds-bg-inset",
  "bg|var(--tds-grey-100)|var(--tds-grey-200)": "--tds-bg-fill-weak",
  "bg|var(--tds-grey-900)|var(--tds-grey-200)": "--tds-bg-inverse",
  "bg|oklch(0 0 0 / 0.56)|oklch(0 0 0 / 0.64)": "--tds-overlay-scrim",
  "bg|oklch(0 0 0 / 0.018)|oklch(1 0 0 / 0.03)": "--tds-bg-row-hover",
  "bg|oklch(0 0 0 / 0.08)|oklch(1 0 0 / 0.12)": "--tds-bg-chip-x",
  "bg|oklch(1 0 0 / 0.18)|oklch(0 0 0 / 0.22)": "--tds-bg-chip-x-active",
  "bg|oklch(0.940 0.040 18)|oklch(0.220 0.062 18)": "--tds-bg-badge-red",
  "bg|oklch(0.952 0.040 154)|oklch(0.240 0.056 154)": "--tds-bg-badge-green",
  "fg|#fff|var(--tds-near-black)": "--tds-fg-on-fill",
  "fg|#fff|var(--tds-grey-900)": "--tds-fg-inverse",
  "fg|#fff|var(--tds-white)": "--tds-fg-on-grey",
  "fg|var(--tds-fg-quaternary)|oklch(1 0 0 / 0.50)": "--tds-fg-placeholder",
  "line|var(--tds-grey-100)|var(--tds-grey-200)": "--tds-line-row",
  "line|var(--tds-grey-100)|var(--tds-grey-150)": "--tds-line-key",
  "fx|0.96|1.08": "--tds-hover-brightness",
  "shadow|0 0 0 4px oklch(0.620 0.191 258 / 0.12)|0 0 0 4px oklch(0.630 0.192 258 / 0.20)":
    "--tds-shadow-focus-halo",
  "shadow|0 1px 2px oklch(0 0 0 / 0.18)|0 1px 2px oklch(0 0 0 / 0.40)":
    "--tds-shadow-knob",
  "shadow|0 1px 3px oklch(0.155 0.060 261 / 0.06), 0 0 0 0.5px oklch(0.155 0.060 261 / 0.04)|0 1px 3px oklch(0 0 0 / 0.40)":
    "--tds-shadow-selected",
  "shadow|0 2px 6px oklch(0.155 0.060 261 / 0.16), 0 0 0 1px oklch(0.155 0.060 261 / 0.06)|0 2px 6px oklch(0 0 0 / 0.50), 0 0 0 1px oklch(0 0 0 / 0.30)":
    "--tds-shadow-thumb",
  "shadow|0 -8px 28px oklch(0.155 0.060 261 / 0.16)|0 -8px 28px oklch(0 0 0 / 0.56)":
    "--tds-shadow-sheet-lift",
  "shadow|0 8px 24px oklch(0.620 0.191 258 / 0.32)|0 8px 24px oklch(0.630 0.192 258 / 0.40)":
    "--tds-shadow-done",
}

const DARK = '[data-theme="dark"]'
/** Functions whose whole text is one value: never split into their parts. */
const LEAF = new Set([
  "var",
  "oklch",
  "oklab",
  "rgb",
  "rgba",
  "hsl",
  "hsla",
  "lab",
  "lch",
  "color",
  "color-mix",
  "url",
])
/** Properties whose value is tokenised whole (a shadow list is one token). */
const WHOLE = new Set(["box-shadow", "text-shadow"])

const squash = (s) => s.replace(/\s+/g, " ").trim()

/** Comments become spaces of the same length, so offsets survive. */
function mask(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
}

/** Rules and at-rules of one sheet, with offsets into the sheet text. */
function parseSheet(masked, from = 0, to = masked.length, media = "") {
  const items = []
  let i = from
  while (i < to) {
    const open = masked.indexOf("{", i)
    if (open === -1 || open >= to) break
    let depth = 1
    let j = open + 1
    while (j < to && depth > 0) {
      if (masked[j] === "{") depth++
      else if (masked[j] === "}") depth--
      j++
    }
    const close = j - 1
    const rawPrelude = masked.slice(i, open)
    const prelude = squash(rawPrelude)
    const start = i + (rawPrelude.length - rawPrelude.trimStart().length)
    if (prelude.startsWith("@media")) {
      items.push({ type: "media", prelude, start, open, close })
      items.push(...parseSheet(masked, open + 1, close, prelude))
    } else if (prelude.startsWith("@")) {
      items.push({ type: "at", prelude, body: squash(masked.slice(open + 1, close)), media, start, open, close })
    } else {
      items.push({ type: "rule", selector: prelude, decls: parseDecls(masked, open + 1, close), media, start, open, close })
    }
    i = j
  }
  return items
}

function parseDecls(masked, from, to) {
  const decls = []
  let depth = 0
  let quote = null
  let s = from
  const push = (e) => {
    const seg = masked.slice(s, e)
    const colon = seg.indexOf(":")
    if (seg.trim() !== "" && colon !== -1) {
      const raw = seg.slice(colon + 1)
      const lead = raw.length - raw.trimStart().length
      const vStart = s + colon + 1 + lead
      const vEnd = vStart + raw.trim().length
      decls.push({ prop: seg.slice(0, colon).trim(), value: squash(raw), vStart, vEnd })
    }
    s = e + 1
  }
  for (let i = from; i < to; i++) {
    const c = masked[i]
    if (quote !== null) {
      if (c === quote) quote = null
      continue
    }
    if (c === '"' || c === "'") quote = c
    else if (c === "(") depth++
    else if (c === ")") depth--
    else if (c === ";" && depth === 0) push(i)
  }
  push(to)
  return decls
}

/** A value as a flat list of parts. `struct` parts are the skeleton (function
 *  names, commas); the rest are values that may differ between themes. */
function atoms(v, base = 0, out = []) {
  let i = 0
  while (i < v.length) {
    const ch = v[i]
    if (/\s/.test(ch)) {
      i++
      continue
    }
    if (ch === "," || ch === "/") {
      out.push({ text: ch, s: base + i, e: base + i + 1, struct: true })
      i++
      continue
    }
    let j = i
    let depth = 0
    let quote = null
    while (j < v.length) {
      const c = v[j]
      if (quote !== null) {
        if (c === quote) quote = null
      } else if (c === '"' || c === "'") quote = c
      else if (c === "(") depth++
      else if (c === ")") depth--
      else if (depth === 0 && (/\s/.test(c) || c === "," || c === "/")) break
      j++
    }
    const tok = v.slice(i, j)
    const fn = /^([a-zA-Z-]+)\(([\s\S]*)\)$/.exec(tok)
    if (fn !== null && !LEAF.has(fn[1].toLowerCase())) {
      const inner = base + i + fn[1].length + 1
      out.push({ text: fn[1] + "(", s: base + i, e: inner, struct: true })
      atoms(fn[2], inner, out)
      out.push({ text: ")", s: base + j - 1, e: base + j, struct: true })
    } else {
      out.push({ text: squash(tok), s: base + i, e: base + j, struct: false })
    }
    i = j
  }
  return out
}

function kindOf(prop) {
  if (WHOLE.has(prop)) return "shadow"
  if (/^(border|outline)/.test(prop)) return "line"
  if (/^background/.test(prop)) return "bg"
  if (prop === "color" || prop === "fill" || prop === "stroke" || prop === "caret-color") return "fg"
  return "fx"
}

/** Where light and dark differ inside one declaration. */
function differences(lightRaw, darkRaw, prop) {
  const whole = [{ s: 0, e: lightRaw.length, light: squash(lightRaw), dark: squash(darkRaw) }]
  if (WHOLE.has(prop)) return whole
  const la = atoms(lightRaw)
  const da = atoms(darkRaw)
  if (la.length !== da.length) return whole
  const out = []
  for (let i = 0; i < la.length; i++) {
    if (la[i].text === da[i].text && la[i].struct === da[i].struct) continue
    if (la[i].struct || da[i].struct) return whole
    out.push({ s: la[i].s, e: la[i].e, light: la[i].text, dark: da[i].text })
  }
  return out
}

function baseSelector(selector) {
  const parts = selector.split(/\s*,\s*/).map((part) => {
    if (part === DARK) return ":root"
    if (part.startsWith(DARK + " ")) return part.slice(DARK.length + 1)
    return null
  })
  return parts.includes(null) ? null : parts.join(", ")
}

function main() {
  const argv = process.argv.slice(2)
  const namesAt = argv.indexOf("--names")
  const file = argv.find((a, i) => !a.startsWith("--") && (namesAt === -1 || i !== namesAt + 1))
  if (file === undefined) {
    console.error("usage: toss-dedupe-dark.mjs <preview.html> [--names <json>] [--write]")
    process.exit(2)
  }
  const write = argv.includes("--write")
  const names = namesAt === -1 ? NAMES : JSON.parse(readFileSync(argv[namesAt + 1], "utf8"))

  const html = readFileSync(file, "utf8")
  const blocks = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)]
  if (blocks.length < 2) {
    console.error("dedupe-dark: expected two <style> blocks")
    process.exit(2)
  }
  const light = blocks[0][1]
  const dark = blocks[1][1]
  const lightStart = blocks[0].index + "<style>".length
  const darkStart = blocks[1].index + "<style>".length
  const lightMasked = mask(light)
  const darkMasked = mask(dark)
  const lightItems = parseSheet(lightMasked)
  const darkItems = parseSheet(darkMasked)

  const lightRules = new Map()
  for (const item of lightItems) {
    if (item.type !== "rule") continue
    const key = item.media + "|" + item.selector
    if (!lightRules.has(key)) lightRules.set(key, [])
    lightRules.get(key).push(item)
  }
  const lightAt = new Map()
  for (const item of lightItems) if (item.type === "at") lightAt.set(item.prelude, item.body)
  const lightRoot = lightItems.find((i) => i.type === "rule" && i.selector === ":root" && i.media === "")
  if (lightRoot === undefined) {
    console.error("dedupe-dark: the light sheet has no top-level :root rule")
    process.exit(2)
  }
  const lightRootValues = new Map(lightRoot.decls.map((d) => [d.prop, d.value]))
  const darkRoot = darkItems.find((i) => i.type === "rule" && i.selector === DARK && i.media === "")
  if (darkRoot === undefined) {
    console.error(`dedupe-dark: the dark sheet has no top-level ${DARK} token block`)
    process.exit(2)
  }
  const darkRootValues = new Map(darkRoot.decls.map((d) => [d.prop, d.value]))

  const problems = []
  const edits = [] // light sheet: { s, e, text }
  const tokens = new Map() // key -> { name, light, dark, isNew, sites }
  const usedNames = new Set([...lightRootValues.keys(), ...darkRootValues.keys()])
  const deltas = [] // { selector, media, decls: [prop, value] }
  const keptAt = []
  const stats = { darkRules: 0, identical: 0, tokenised: 0, sites: 0, noTwin: 0, atDropped: 0 }
  const seen = new Map()
  let auto = 0

  for (const item of darkItems) {
    if (item.type === "media" || item === darkRoot) continue
    if (item.type === "at") {
      if (lightAt.get(item.prelude) === item.body) stats.atDropped++
      else keptAt.push(item)
      continue
    }
    stats.darkRules++
    const base = baseSelector(item.selector)
    const key = item.media + "|" + base
    const nth = seen.get(key) ?? 0
    seen.set(key, nth + 1)
    const twin = base === null ? undefined : lightRules.get(key)?.[nth]
    if (twin === undefined) {
      stats.noTwin++
      deltas.push({ selector: item.selector, media: item.media, decls: item.decls.map((d) => [d.prop, d.value]) })
      continue
    }
    twin.matched = true
    const lightProps = twin.decls.map((d) => d.prop)
    const darkProps = item.decls.map((d) => d.prop)
    const repeated = (list) => new Set(list).size !== list.length
    const delta = []
    let touched = false
    if (repeated(lightProps) || repeated(darkProps)) {
      // Fallback declarations: order carries meaning, so only an exact copy folds.
      const same =
        lightProps.length === darkProps.length &&
        twin.decls.every((d, i) => d.prop === item.decls[i].prop && d.value === item.decls[i].value)
      if (!same) problems.push(`${key}: repeated properties differ between themes — fold by hand`)
    } else {
      for (const d of item.decls) {
        const l = twin.decls.find((x) => x.prop === d.prop)
        if (l === undefined) {
          delta.push([d.prop, d.value])
          continue
        }
        if (l.value === d.value) continue
        touched = true
        const lightRaw = lightMasked.slice(l.vStart, l.vEnd)
        const darkRaw = darkMasked.slice(d.vStart, d.vEnd)
        for (const diff of differences(lightRaw, darkRaw, d.prop)) {
          const tKey = `${kindOf(d.prop)}|${diff.light}|${diff.dark}`
          let token = tokens.get(tKey)
          if (token === undefined) {
            let name = names[tKey]
            if (name === undefined) {
              do name = `--dk-${kindOf(d.prop)}-${++auto}`
              while (usedNames.has(name))
            }
            const existing = lightRootValues.get(name)
            let isNew = true
            if (existing !== undefined) {
              const existingDark = darkRootValues.get(name) ?? existing
              if (existing !== diff.light || existingDark !== diff.dark) {
                problems.push(`${tKey}: ${name} already exists with other values (${existing} / ${existingDark})`)
              }
              isNew = false
            } else if ([...tokens.values()].some((t) => t.name === name) || darkRootValues.has(name)) {
              problems.push(`${tKey}: ${name} is already taken`)
            }
            token = { name, light: diff.light, dark: diff.dark, isNew, sites: [] }
            tokens.set(tKey, token)
            usedNames.add(name)
          }
          token.sites.push(`${base} { ${d.prop} }`)
          edits.push({ s: l.vStart + diff.s, e: l.vStart + diff.e, text: `var(${token.name})` })
          stats.sites++
        }
      }
      // A light declaration the dark rule does not repeat needs nothing: the
      // light rule matches in dark too. (A kept delta rule looks like this on a
      // second run, which is what makes the script safe to run twice.)
    }
    if (delta.length > 0) deltas.push({ selector: item.selector, media: item.media, decls: delta })
    if (touched) stats.tokenised++
    else if (delta.length === 0) stats.identical++
  }

  // --- the dark token block: keep what differs from :root -------------------
  const drop = new Set()
  for (const d of darkRoot.decls) if (lightRootValues.get(d.prop) === d.value) drop.add(d.prop)
  const rootBody = dark.slice(darkRoot.open + 1, darkRoot.close)
  const declLine = /^\s*(--[\w-]+)\s*:[^;]*;\s*(\/\*.*\*\/)?\s*$/
  const onePerLine =
    rootBody.split("\n").filter((line) => declLine.test(line)).length === darkRoot.decls.length
  let lines
  if (onePerLine) {
    lines = rootBody.split("\n").filter((line) => {
      const m = declLine.exec(line)
      return m === null || !drop.has(m[1])
    })
    // A one-line section comment left with nothing under it goes too.
    const loneComment = /^\s*\/\*.*\*\/\s*$/
    lines = lines.filter((line, i) => {
      if (!loneComment.test(line)) return true
      const next = lines.slice(i + 1).find((l) => l.trim() !== "")
      return next !== undefined && declLine.test(next)
    })
    lines = lines.filter((line, i) => i === 0 || !(line.trim() === "" && lines[i - 1].trim() === ""))
    while (lines.length > 0 && lines[lines.length - 1].trim() === "") lines.pop()
  } else {
    lines = [""].concat(darkRoot.decls.filter((d) => !drop.has(d.prop)).map((d) => `    ${d.prop}: ${d.value};`))
  }
  const fresh = [...tokens.values()].filter((t) => t.isNew)
  if (fresh.length > 0) {
    lines.push("")
    lines.push("    /* 라이트 :root 의 같은 이름을 다크 값으로 다시 정의한다 */")
    for (const t of fresh) lines.push(`    ${t.name}: ${t.dark};`)
  }

  let darkOut = `\n${DARK} {${lines.join("\n")}\n  }\n`
  const byMedia = new Map()
  for (const d of deltas) {
    if (!byMedia.has(d.media)) byMedia.set(d.media, [])
    byMedia.get(d.media).push(`${d.selector} { ${d.decls.map(([p, v]) => `${p}: ${v};`).join(" ")} }`)
  }
  for (const [media, rules] of byMedia) {
    darkOut += media === "" ? rules.join("\n") + "\n" : `${media} {\n${rules.join("\n")}\n}\n`
  }
  for (const item of keptAt) darkOut += dark.slice(item.start, item.close + 1) + "\n"

  // --- the light sheet: var() at each site, new tokens at the end of :root ---
  let lightOut = light
  if (fresh.length > 0) {
    const at = light.lastIndexOf("\n", lightRoot.close)
    const block =
      "\n\n    /* 다크에서 값이 달라지는 자리. 다크 시트가 같은 이름을 다시 정의한다 */\n" +
      fresh.map((t) => `    ${t.name}: ${t.light};`).join("\n")
    edits.push({ s: at, e: at, text: block })
  }
  edits.sort((a, b) => b.s - a.s)
  for (const edit of edits) lightOut = lightOut.slice(0, edit.s) + edit.text + lightOut.slice(edit.e)

  const out =
    html.slice(0, lightStart) + lightOut + html.slice(lightStart + light.length, darkStart) + darkOut + html.slice(darkStart + dark.length)

  const unmatched = lightItems.filter((i) => i.type === "rule" && i !== lightRoot && i.matched !== true)
  const nl = (s) => s.split("\n").length
  console.log(`dark rules (token block aside): ${stats.darkRules}`)
  console.log(`  identical to the light twin, dropped: ${stats.identical}`)
  console.log(`  differing in value, folded into tokens: ${stats.tokenised} rules, ${stats.sites} sites`)
  console.log(`  without a light twin, kept whole: ${stats.noTwin}`)
  console.log(`  at-rules equal to light's, dropped: ${stats.atDropped}; kept: ${keptAt.length}`)
  console.log(`dark token block: ${darkRoot.decls.length} declarations, ${drop.size} equal to :root dropped`)
  console.log(`tokens: ${fresh.length} new, ${tokens.size - fresh.length} reused`)
  for (const [key, t] of tokens) {
    console.log(`  ${t.isNew ? "new   " : "reused"} ${t.name}  [${key.split("|")[0]}] ${t.light}  =>  ${t.dark}  (${t.sites.length})`)
  }
  console.log(`delta rules kept: ${deltas.length}`)
  for (const d of deltas) {
    console.log(`  ${d.media === "" ? "" : d.media + " "}${d.selector} { ${d.decls.map(([p, v]) => `${p}: ${v}`).join("; ")} }`)
  }
  if (deltas.length > 0) {
    console.log("  a kept rule outranks light rules up to one class more specific — check the render")
  }
  console.log(`light rules with no dark twin: ${unmatched.length}`)
  for (const u of unmatched) console.log(`  ${u.media === "" ? "" : u.media + " "}${u.selector}`)
  console.log(`dark sheet: ${nl(dark)} lines / ${Buffer.byteLength(dark)} bytes -> ${nl(darkOut)} lines / ${Buffer.byteLength(darkOut)} bytes`)
  console.log(`light sheet: ${nl(light)} lines / ${Buffer.byteLength(light)} bytes -> ${nl(lightOut)} lines / ${Buffer.byteLength(lightOut)} bytes`)
  console.log(`file: ${nl(html)} lines / ${Buffer.byteLength(html)} bytes -> ${nl(out)} lines / ${Buffer.byteLength(out)} bytes`)
  for (const p of problems) console.error(`NEEDS A HAND: ${p}`)
  if (problems.length > 0) process.exit(1)
  if (write) {
    writeFileSync(file, out)
    console.log(`written: ${file}`)
  }
}

main()
