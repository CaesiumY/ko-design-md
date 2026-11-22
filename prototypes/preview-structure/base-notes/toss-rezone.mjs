// PROTOTYPE — throwaway code. Rebuilds the toss preview's body into the zones
// of prototypes/preview-structure/STANDARD.md and swaps the old page frame for
// frame.css.
//
// Input is the file as stage 1 left it (dark sheet already folded into tokens).
//
//   node toss-rezone.mjs --in <stage-1 html> --out <preview.html>
//
// Everything is done here; nothing was finished by hand. The script is
// toss-only on purpose: the CELLS table says where each old cell goes, and the
// stylesheet edits name toss selectors. What another entry could reuse is the
// shape — pick cells out of the old sections, emit zones in STANDARD order,
// drop the old frame rules, paste frame.css.
//
// Every stylesheet edit asserts that it matched exactly once, so a file that
// has drifted from what this was written against stops the run instead of
// being half-edited.

import { readFileSync, writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"

const HERE = dirname(fileURLToPath(import.meta.url))
const FRAME = join(HERE, "..", "frame.css")

const ZONES = [
  ["screens", "화면"],
  ["buttons", "버튼"],
  ["inputs", "입력"],
  ["selection", "선택"],
  ["navigation", "내비게이션"],
  ["content", "콘텐츠"],
  ["feedback", "피드백"],
  ["brand", "브랜드 고유"],
]

/** Where each old cell goes: [zone, data-pv-cell, stack?]. The order of a
 *  zone's cells is ORDER below, not the order here. */
const CELLS = {
  // 06 Send-Money flow: one cell per phone
  "phone:0": ["screens", "screen-send-home", false],
  "phone:1": ["screens", "screen-send-select", false],
  "phone:2": ["screens", "screen-send-amount", false],
  "phone:3": ["screens", "screen-send-confirm", false],
  "phone:4": ["screens", "screen-send-done", false],
  // 01 Button: the six rows
  "row:0": ["buttons", "button-size", true],
  "row:1": ["buttons", "button-variant", true],
  "row:2": ["buttons", "button-state", true],
  "row:3": ["buttons", "text-button", true],
  "row:4": ["selection", "chip", true],
  "row:5": ["content", "badge", true],
  // 02 Inputs · Switch: the two cards
  "card:0": ["inputs", "text-field", true],
  "card:1": ["selection", "switch-checkbox", true],
  // 03 List · Toast · Dialog
  list: ["content", "list-row", true],
  toast: ["feedback", "toast", false],
  dialog: ["feedback", "dialog", true],
  // 04 NEW: the eight component cards
  "comp:Segmented Control": ["selection", "segmented-control", true],
  "comp:Search Field": ["inputs", "search-field", true],
  "comp:Progress Bar": ["feedback", "progress-bar", true],
  "comp:Rating": ["content", "rating", true],
  "comp:Slider": ["inputs", "slider", true],
  "comp:Tooltip": ["feedback", "tooltip", true],
  "comp:Filter Chips — scrollable row": ["selection", "filter-chips", true],
  "comp:Bottom Sheet — grab handle": ["feedback", "bottom-sheet", true],
  // 05 Full component grid: the seventeen tiles
  "tile:BOARD-ROW": ["content", "board-row", true],
  "tile:BAR-CHART": ["content", "bar-chart", true],
  "tile:BORDER": ["content", "border", true],
  "tile:BOTTOM-INFO": ["buttons", "bottom-info", true],
  "tile:BUBBLE": ["content", "bubble", true],
  "tile:GRID-LIST": ["content", "grid-list", true],
  "tile:LIST-FOOTER": ["buttons", "list-footer", true],
  "tile:LOADER": ["feedback", "loader", true],
  // md 461 calls the menu a selector and the demo picks a sort order: a list
  // opened to put a value in, which is 입력 by use.
  "tile:MENU": ["inputs", "menu", true],
  "tile:NAVIGATION · APPS IN TOSS": ["navigation", "navigation-apps-in-toss", true],
  "tile:NUMERIC-SPINNER": ["inputs", "numeric-spinner", true],
  "tile:POST": ["content", "post", true],
  "tile:PROGRESS-BAR": ["feedback", "progress-bar-row", true],
  "tile:PROGRESS-STEPPER": ["feedback", "progress-stepper", true],
  "tile:STEPPER": ["inputs", "stepper", true],
  "tile:TAB": ["navigation", "tab", true],
  "tile:TABLE-ROW": ["content", "table-row", true],
  // The keypad stays where it was, inside the amount screen. Nothing lands in
  // 브랜드 고유, so that zone is not written.
}

const ORDER = {
  screens: ["screen-send-home", "screen-send-select", "screen-send-amount", "screen-send-confirm", "screen-send-done"],
  buttons: ["button-size", "button-variant", "button-state", "text-button", "bottom-info", "list-footer"],
  inputs: ["text-field", "search-field", "slider", "numeric-spinner", "stepper", "menu"],
  selection: ["switch-checkbox", "segmented-control", "chip", "filter-chips"],
  navigation: ["navigation-apps-in-toss", "tab"],
  content: ["list-row", "badge", "rating", "board-row", "bar-chart", "grid-list", "post", "bubble", "table-row", "border"],
  feedback: ["toast", "dialog", "bottom-sheet", "tooltip", "progress-bar", "progress-bar-row", "progress-stepper", "loader"],
  brand: [],
}

// ---------------------------------------------------------------------------

function arg(flag) {
  const at = process.argv.indexOf(flag)
  return at === -1 ? undefined : process.argv[at + 1]
}
const input = arg("--in")
const output = arg("--out")
if (input === undefined || output === undefined) {
  console.error("usage: toss-rezone.mjs --in <stage-1 html> --out <preview.html>")
  process.exit(2)
}

const source = readFileSync(input, "utf8")
const dom = new JSDOM(source)
const doc = dom.window.document

/** Re-indent a serialized fragment: lines after the first keep their relative
 *  depth, and every line gets `pad`. */
function indent(html, pad) {
  const lines = html.split("\n")
  const rest = lines.slice(1).filter((l) => l.trim() !== "")
  const cut = rest.length === 0 ? 0 : Math.min(...rest.map((l) => l.length - l.trimStart().length))
  return lines
    .map((l, i) => (l.trim() === "" ? "" : pad + (i === 0 ? l.trimStart() : l.slice(cut))))
    .join("\n")
}

function retag(el, tag) {
  const next = doc.createElement(tag)
  for (const a of Array.from(el.attributes)) next.setAttribute(a.name, a.value)
  while (el.firstChild !== null) next.appendChild(el.firstChild)
  el.replaceWith(next)
  return next
}

const one = (root, selector) => {
  const found = root.querySelectorAll(selector)
  if (found.length !== 1) throw new Error(`expected one ${selector}, found ${found.length}`)
  return found[0]
}
const elements = (el) => Array.from(el.children)

// --- markup the standard asks for inside the demos (STANDARD §5) -------------

// Switch and checkbox: a real <input> in front of the drawn control.
const blankCheck = one(doc, ".tds-check.on svg")
for (const line of doc.querySelectorAll(".ctrl-stack .ctrl-line")) {
  const drawn = line.querySelector(".tds-switch, .tds-check")
  const box = doc.createElement("input")
  box.setAttribute("class", "ctrl-input")
  box.setAttribute("type", "checkbox")
  if (drawn.classList.contains("tds-switch")) box.setAttribute("role", "switch")
  if (drawn.classList.contains("on")) box.setAttribute("checked", "")
  drawn.classList.remove("on")
  if (drawn.classList.contains("tds-check") && drawn.querySelector("svg") === null) {
    drawn.innerHTML = "\n                " + blankCheck.outerHTML + "\n              "
  }
  line.insertBefore(box, drawn)
  line.insertBefore(doc.createTextNode("\n              "), drawn)
}

// Segment and tabs: buttons the shared runtime flips (data-pv-toggle).
function toggleGroup(group, itemSelector, groupRole, itemRole, attr) {
  group.setAttribute("role", groupRole)
  group.setAttribute("data-pv-toggle", attr)
  for (const item of Array.from(group.querySelectorAll(itemSelector))) {
    const on = item.classList.contains("active")
    item.classList.remove("active")
    const button = retag(item, "button")
    button.setAttribute("type", "button")
    button.setAttribute("role", itemRole)
    button.setAttribute(attr, on ? "true" : "false")
    button.setAttribute("data-pv-option", "")
  }
}
toggleGroup(one(doc, ".comp-card > .seg"), ".it", "radiogroup", "radio", "aria-checked")
// The underline variant looks like a tab, but it is drawn as a segmented
// control (md 488: one of several options, picked in place) and has no panel.
toggleGroup(one(doc, ".seg-line"), ".it", "radiogroup", "radio", "aria-checked")
toggleGroup(one(doc, ".tab-inline"), ".ti", "tablist", "tab", "aria-selected")

// --- pick the cells out of the old sections ---------------------------------

const cells = new Map() // data-pv-cell -> { zone, name, label, stage, stack }
function cell(key, label, stage) {
  const spec = CELLS[key]
  if (spec === undefined) throw new Error(`no destination for ${key}`)
  const [zone, name, stack] = spec
  if (cells.has(name)) throw new Error(`duplicate cell ${name}`)
  cells.set(name, { zone, name, label: label.trim(), stage, stack })
}
const outer = (list) => list.map((el) => el.outerHTML)

const sections = Array.from(doc.querySelectorAll("section.section"))
if (sections.length !== 6) throw new Error(`expected six old sections, found ${sections.length}`)
const [sButtons, sInputs, sList, sNew, sGrid, sFlow] = sections

Array.from(sButtons.querySelectorAll(".palette-row")).forEach((row, i) => {
  const label = one(row, ".row-label")
  cell(`row:${i}`, label.innerHTML, outer(elements(row).filter((el) => el !== label)))
})

Array.from(sInputs.querySelectorAll(".two-up > .card")).forEach((card, i) => {
  const label = one(card, ".row-label")
  cell(`card:${i}`, label.innerHTML, outer(elements(card).filter((el) => el !== label)))
})

// The list card never had a label; it gets the md's component names.
cell("list", "list-header, list-row", [one(sList, ".listcard").outerHTML])
for (const [key, selector] of [["toast", ".toast"], ["dialog", ".dialog"]]) {
  const demo = one(sList, selector)
  cell(key, one(demo.parentElement, ".row-label").innerHTML, [demo.outerHTML])
}

// The old section caption ended in "치수 (가정)" for all eight cards. The caption
// goes away with the section, so the mark moves onto each card's label.
const ASSUMED = "치수 (가정)"
if (!one(sNew, ".section-head .caption").textContent.trim().endsWith(ASSUMED)) {
  throw new Error("the 04 section caption no longer ends in the assumption mark")
}
for (const card of Array.from(sNew.querySelectorAll(".comp-card"))) {
  const title = one(card, "h4")
  const caption = card.querySelector(".comp-caption")
  const rest = elements(card).filter((el) => el !== title && el !== caption)
  // One wrapper keeps the demo's own spacing (sibling margins) intact.
  const stage =
    rest.length === 1
      ? outer(rest)
      : ['<div class="demo-block">\n' + outer(rest).map((h) => indent(h, "  ")).join("\n") + "\n</div>"]
  cell(`comp:${title.textContent.trim()}`, `${title.textContent.trim()}, ${caption.innerHTML}, ${ASSUMED}`, stage)
}

for (const tile of Array.from(sGrid.querySelectorAll(".ftile"))) {
  const label = one(tile, ".text-meta-caps")
  cell(`tile:${label.textContent.trim()}`, label.innerHTML, outer(elements(one(tile, ".ftile-demo"))))
}

Array.from(sFlow.querySelectorAll(".mock-frame > .stage")).forEach((stage, i) => {
  const label = one(stage, ".stage-label")
  const num = one(label, ".num").textContent.trim()
  const text = label.textContent.replace(num, "").trim()
  const phone = one(stage, ".phone")
  cell(`phone:${i}`, `${num} ${text}`, ['<div class="pv-screen">\n' + indent(phone.outerHTML, "  ") + "\n</div>"])
})

// --- write the body ----------------------------------------------------------

const strip = retag(one(doc, "header.strip"), "div")
const hero = retag(one(doc, "section.hero"), "div")
const disclaimer = one(doc, "body > .catalog-disclaimer")

let body = "<body>\n" + disclaimer.outerHTML + "\n<main class=\"pv-page\">\n\n"
body += '  <header class="pv-hero" data-pv-zone="hero">\n'
body += indent(strip.outerHTML, "    ") + "\n" + indent(hero.outerHTML, "    ") + "\n"
body += "  </header>\n"

const placed = new Set()
const perZone = []
for (const [zone, title] of ZONES) {
  const names = ORDER[zone]
  const mine = [...cells.values()].filter((c) => c.zone === zone)
  if (mine.length !== names.length || mine.some((c) => !names.includes(c.name))) {
    throw new Error(`ORDER.${zone} does not list the cells that landed there`)
  }
  if (names.length === 0) continue
  perZone.push(`${zone} ${names.length}`)
  body += `\n  <section class="pv-zone" data-pv-zone="${zone}" aria-labelledby="pv-${zone}">\n`
  body += `    <h2 class="pv-zone-title" id="pv-${zone}">${title}</h2>\n`
  body += '    <div class="pv-cells">\n'
  for (const name of names) {
    const c = cells.get(name)
    placed.add(name)
    body += `      <div class="pv-cell" data-pv-cell="${name}">\n`
    body += `        <p class="pv-label">${c.label}</p>\n`
    body += `        <div class="pv-stage${c.stack ? " pv-stage--stack" : ""}">\n`
    body += c.stage.map((h) => indent(h, "          ")).join("\n") + "\n"
    body += "        </div>\n"
    body += "      </div>\n"
  }
  body += "    </div>\n  </section>\n"
}
if (placed.size !== cells.size) throw new Error("a cell was picked but not placed")
body += "\n</main>\n</body></html>\n"

// --- the stylesheet ----------------------------------------------------------

const bodyAt = source.indexOf("<body>")
let head = source.slice(0, bodyAt)

function replaceOnce(text, from, to, what) {
  const first = text.indexOf(from)
  if (first === -1 || text.indexOf(from, first + 1) !== -1) {
    throw new Error(`stylesheet edit "${what}" did not match exactly once`)
  }
  return text.slice(0, first) + to + text.slice(first + from.length)
}

const squash = (s) => s.replace(/\s+/g, " ").trim()
const mask = (css) => css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "))
function findRules(css, from = 0, to = css.length, media = "", out = []) {
  let i = from
  while (i < to) {
    const open = css.indexOf("{", i)
    if (open === -1 || open >= to) break
    let depth = 1
    let j = open + 1
    while (j < to && depth > 0) {
      if (css[j] === "{") depth++
      else if (css[j] === "}") depth--
      j++
    }
    const prelude = squash(css.slice(i, open))
    if (prelude.startsWith("@media")) findRules(css, open + 1, j - 1, prelude, out)
    else out.push({ selector: prelude, media, open, end: j })
    i = j
  }
  return out
}
/** Delete one rule, with the line(s) it stands on. */
function removeRule(text, selector, media = "") {
  const styleAt = text.indexOf("<style>") + "<style>".length
  const styleEnd = text.indexOf("</style>")
  const css = text.slice(styleAt, styleEnd)
  const hits = findRules(mask(css)).filter((r) => r.selector === selector && (media === "" ? r.media === "" : r.media.includes(media)))
  if (hits.length !== 1) throw new Error(`rule "${selector}" ${media}: expected one, found ${hits.length}`)
  const rule = hits[0]
  const ruleStart = rule.open - (css.slice(0, rule.open).length - css.slice(0, rule.open).trimEnd().length) - selectorLength(css, rule.open)
  const lineStart = css.lastIndexOf("\n", ruleStart) + 1
  let lineEnd = css.indexOf("\n", rule.end)
  lineEnd = lineEnd === -1 ? css.length : lineEnd + 1
  if (css.slice(lineStart, ruleStart).trim() !== "" || css.slice(rule.end, lineEnd).trim() !== "") {
    throw new Error(`rule "${selector}" shares its line with something else`)
  }
  return text.slice(0, styleAt) + css.slice(0, lineStart) + css.slice(lineEnd) + text.slice(styleEnd)
}
/** Length of the raw selector text that ends just before `open`. */
function selectorLength(css, open) {
  const before = mask(css).slice(0, open).trimEnd()
  const from = Math.max(before.lastIndexOf("}"), before.lastIndexOf("{"), before.lastIndexOf(";")) + 1
  return before.length - (from + (before.slice(from).length - before.slice(from).trimStart().length))
}

// 1. The old page frame goes: sections, section heads, cell and label classes.
for (const selector of [
  ".section",
  ".section.canvas",
  ".section-head",
  ".section-head .num",
  ".section-head h2",
  ".section-head .caption",
  ".row-label",
  ".palette-row + .palette-row",
  ".two-up",
  ".card",
  ".comp-grid",
  ".comp-card",
  ".comp-card h4",
  ".full-grid",
  ".ftile",
  ".ftile .ftile-demo",
  ".mock-frame",
  ".mock-frame > .stage",
  ".mock-frame .stage-label",
  ".mock-frame .stage-label .num",
]) {
  head = removeRule(head, selector)
}
for (const selector of [".section", ".two-up, .comp-grid", ".mock-frame"]) head = removeRule(head, selector, "1023px")
for (const selector of [
  ".section",
  ".section-head",
  ".section-head h2",
  ".section-head .caption",
  ".full-grid",
  ".mock-frame",
  ".mock-frame > .stage",
  ".phone",
]) {
  head = removeRule(head, selector, "640px")
}
for (const comment of [
  "  /* === Section frame === */\n",
  "  /* === CARDS === */\n",
  "  /* === NEW COMPONENTS (06) === */\n",
  "  /* === 08 · FULL COMPONENT GRID === */\n",
]) {
  head = replaceOnce(head, comment, "", `drop ${comment.trim()}`)
}
head = replaceOnce(
  head,
  "  /* === KEY SCREEN — 5-phone Send-Money flow === */\n",
  "  /* === KEY SCREEN — Send-Money flow, one phone per cell === */\n",
  "screen comment"
)

// 2. What stays but changes.
// The state label inside a demo keeps its class; it no longer lives in a card.
head = replaceOnce(head, "  .comp-card .comp-caption {", "  .comp-caption {", "state label selector")
// The first zone draws the line under the hero now.
head = replaceOnce(
  head,
  "  .hero {\n    background: var(--tds-bg-canvas);\n    border-bottom: 1px solid var(--tds-grey-200);\n",
  "  .hero {\n    background: var(--tds-bg-canvas);\n",
  "hero bottom line"
)
// A phone used to be laid out by .mock-frame; in a cell it must not be wider than the cell.
head = replaceOnce(head, "  .phone {\n    width: 360px;\n", "  .phone {\n    width: 360px;\n    max-width: 100%;\n", "phone max-width")

// The hero's inner wrappers take the frame's gutter, so the hero and the zones
// share a left edge at every width (frame.css gives --pv-gutter).
head = replaceOnce(
  head,
  "  .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }",
  "  .container { padding: 0 var(--pv-gutter); }",
  "container gutter"
)
head = removeRule(head, ".container", "640px")

// 3. Finger feedback and toggles, each from services/toss.md.
// Press: the press overlay over the fill, dur-fast with the base ease (md 319, 326, 358).
head = replaceOnce(
  head,
  "    transition: filter 120ms cubic-bezier(0.22, 0.61, 0.36, 1);\n  }\n  .btn:hover { filter: brightness(var(--tds-hover-brightness)); }\n",
  "    transition: filter 120ms cubic-bezier(0.22, 0.61, 0.36, 1), box-shadow 120ms cubic-bezier(0.22, 0.61, 0.36, 1);\n  }\n  .btn:hover { filter: brightness(var(--tds-hover-brightness)); }\n  .btn:active { box-shadow: inset 0 0 0 999px var(--tds-overlay-press); }\n",
  "button press"
)
head = replaceOnce(
  head,
  "  .dlg-btn.primary {",
  "  .dlg-btn:active { box-shadow: inset 0 0 0 999px var(--tds-overlay-press); }\n  .dlg-btn.primary {",
  "dialog button press"
)
head = replaceOnce(
  head,
  "  .dlg-btn { flex: 1; height: 48px; border-radius: 14px; border: 0; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; }",
  "  .dlg-btn { flex: 1; height: 48px; border-radius: 14px; border: 0; font-size: 15px; font-weight: 700; cursor: pointer; font-family: inherit; transition: box-shadow 120ms cubic-bezier(0.22, 0.61, 0.36, 1); }",
  "dialog button transition"
)
head = replaceOnce(
  head,
  "    letter-spacing: -0.005em; cursor: pointer;\n  }\n",
  "    letter-spacing: -0.005em; cursor: pointer;\n    transition: box-shadow 120ms cubic-bezier(0.22, 0.61, 0.36, 1);\n  }\n  .bottom-info .bi-cta:active { box-shadow: inset 0 0 0 999px var(--tds-overlay-press); }\n",
  "bottom-info CTA press"
)
head = replaceOnce(
  head,
  "    letter-spacing: -0.005em;\n    cursor: pointer;\n  }\n  .phone .bottom-cta:disabled {",
  "    letter-spacing: -0.005em;\n    cursor: pointer;\n    transition: box-shadow 120ms cubic-bezier(0.22, 0.61, 0.36, 1);\n  }\n  .phone .bottom-cta:active { box-shadow: inset 0 0 0 999px var(--tds-overlay-press); }\n  .phone .bottom-cta:disabled {",
  "bottom CTA press"
)
// Focus: white ground and a 1.5px blue border (md 391, 492). Before .input.error so an error keeps its red.
head = replaceOnce(
  head,
  "  .input.focused {",
  "  .input:focus-visible {\n    outline: 0;\n    background: var(--tds-bg-canvas);\n    border: 1.5px solid var(--tds-blue-500);\n  }\n  .input.focused {",
  "text field focus"
)
head = replaceOnce(
  head,
  "  .search-field.focus {\n",
  "  .search-field:focus-within,\n  .search-field.focus {\n",
  "search field focus"
)
// Switch and checkbox follow a real input (md 484).
head = replaceOnce(
  head,
  "  .ctrl-line { display: flex; align-items: center; gap: 12px; font-size: 15px; color: var(--tds-grey-900); }\n",
  "  .ctrl-line { position: relative; display: flex; align-items: center; gap: 12px; font-size: 15px; color: var(--tds-grey-900); }\n  .ctrl-input { position: absolute; width: 1px; height: 1px; margin: 0; opacity: 0; }\n",
  "control input"
)
head = replaceOnce(head, "  .tds-switch.on { background", "  .ctrl-input:checked + .tds-switch { background", "switch on")
head = replaceOnce(head, "  .tds-switch.on::after {", "  .ctrl-input:checked + .tds-switch::after {", "switch knob")
head = replaceOnce(head, "  .tds-check.on { background", "  .ctrl-input:checked + .tds-check { background", "checkbox on")
head = replaceOnce(head, "  .tds-check.on svg {", "  .ctrl-input:checked + .tds-check svg {", "checkbox glyph")
// Segment and tabs are buttons now, styled by the attribute the runtime flips (md 488, 528).
const reset = "    appearance: none;\n    border: 0;\n    background: transparent;\n    font-family: inherit;\n"
head = replaceOnce(head, "  .seg .it {\n", "  .seg .it {\n" + reset, "segment reset")
head = replaceOnce(head, "  .seg .it.active {", '  .seg .it[aria-checked="true"] {', "segment on")
head = replaceOnce(head, "  .seg-line .it {\n", "  .seg-line .it {\n" + reset, "underline tab reset")
head = replaceOnce(head, "  .seg-line .it.active {", '  .seg-line .it[aria-checked="true"] {', "underline segment on")
head = replaceOnce(
  head,
  "  .tab-inline .ti {\n    padding: 10px 4px; margin-right: 18px;\n",
  "  .tab-inline .ti {\n" + reset + "    padding: 10px 4px; margin-right: 18px;\n",
  "tab reset"
)
head = replaceOnce(head, "  .tab-inline .ti.active {", '  .tab-inline .ti[aria-selected="true"] {', "tab on")

// 4. The frame's variables, as references to the brand's own.
head = replaceOnce(
  head,
  "    --ghost: var(--tds-grey-100);\n",
  "    --ghost: var(--tds-grey-100);\n\n" +
    "    /* services/toss.md typography.*.fontFamily */\n" +
    '    --tds-font-sans: "Pretendard Variable", Pretendard, -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro", "Apple SD Gothic Neo", "Noto Sans KR", Roboto, "Helvetica Neue", Arial, sans-serif;\n\n' +
    "    /* 틀(pv-frame)이 읽는 변수. 브랜드 변수를 참조로만 준다 */\n" +
    "    --pv-font: var(--tds-font-sans);\n" +
    "    --pv-ink: var(--tds-grey-900);\n" +
    "    --pv-ink-muted: var(--tds-grey-700);\n" +
    "    --pv-canvas: var(--tds-grey-50);\n" +
    "    --pv-surface: var(--tds-bg-canvas);\n" +
    "    --pv-line: var(--tds-grey-200);\n" +
    "    --pv-radius: var(--tds-radius-xl);\n" +
    "    --pv-tracking: -0.005em;\n",
  "frame variables"
)

// 5. frame.css, verbatim, at the top of the first <style>.
const frameFile = readFileSync(FRAME, "utf8")
const frameStart = frameFile.indexOf("/* pv-frame:start")
const endMark = "/* pv-frame:end */"
const frameEnd = frameFile.indexOf(endMark)
if (frameStart === -1 || frameEnd === -1) throw new Error("frame.css has no pv-frame markers")
const frame = frameFile.slice(frameStart, frameEnd + endMark.length)
head = replaceOnce(head, "<style>\n  :root {", "<style>\n" + frame + "\n  :root {", "paste frame")

head = head.replace(/\n{3,}/g, "\n\n")

writeFileSync(output, head + body)
console.log(`cells: ${cells.size} (${perZone.join(", ")})`)
console.log(`lines: ${source.split("\n").length - 1} -> ${(head + body).split("\n").length - 1}`)
console.log(`bytes: ${Buffer.byteLength(source)} -> ${Buffer.byteLength(head + body)}`)
console.log(`written: ${output}`)
