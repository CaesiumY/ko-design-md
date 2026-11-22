// PROTOTYPE — throwaway code. Checks one preview against the parts of
// prototypes/preview-structure/STANDARD.md that the preview validator does not
// look at: the order and shape of the zones, whether anything spills out of a
// cell, and whether the things that are meant to be operated really operate.
//
//   pnpm exec tsx prototypes/preview-structure/base-notes/check-base.ts <slug> [<slug> …]
//   PV_SHOTS=<existing dir> … : also save a full-page picture per width and theme
//
// The preview is opened from this checkout's public/ over a loopback server
// (the contrast harness's), so no dev server is needed.
//
// Two different documents are looked at, on purpose:
//   - structure() reads the FILE's markup, parsed apart from the page. The shared
//     iframe.js turns every <template data-theme-variant> into a comment before
//     load, so the rendered page can never show where a dark variant sits.
//   - layout() and operate() read the RENDERED page.
//
// What this does not see (do not read "ok" as covering these):
//   - content a brand box cuts off with its own `overflow` (a clipped screen
//     recreation is the brand's drawing, not a spill) — only the box is measured;
//   - the markup inside a dark-variant <template>, beyond a label swap being a label;
//   - whether a zone holds the right components for its use. That is a reading
//     of the DESIGN.md, recorded in base-notes/{slug}.md.
//
// Exit 0: every check held. Exit 1: at least one did not (each is printed).

import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  newMeasuringContext,
  serveStatic,
} from "../../../scripts/audit-contrast-sweep"
import type { Page } from "playwright"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const SHOTS =
  process.env.PV_SHOTS === undefined || process.env.PV_SHOTS === ""
    ? undefined
    : resolve(process.env.PV_SHOTS)
const WIDTHS = [375, 768, 976, 1440]
const THEMES = ["light", "dark"]
// STANDARD §1. The same list lives in toss-rezone.mjs (ZONES) — a prototype
// duplication; whichever structure wins keeps it in one place.
const ZONES: Array<[id: string, title: string]> = [
  ["screens", "화면"],
  ["buttons", "버튼"],
  ["inputs", "입력"],
  ["selection", "선택"],
  ["navigation", "내비게이션"],
  ["content", "콘텐츠"],
  ["feedback", "피드백"],
  ["brand", "브랜드 고유"],
]
const CONTROLS =
  "button, input, select, textarea, a[href], details, [tabindex], [contenteditable], [data-pv-toggle]"

/**
 * The TypeScript runner wraps inner functions in a `__name(…)` helper. A
 * function handed to the page is sent as its source, where no such helper
 * exists, so the page gets a stand-in before any of them runs.
 */
function defineNameHelper(): void {
  ;(globalThis as unknown as { __name: (f: unknown) => unknown }).__name = (
    f
  ) => f
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done()))
      )
  )
  await page.waitForTimeout(60)
}

type StructureInput = {
  html: string
  zones: Array<[string, string]>
  controls: string
}

/** Shape of the file's markup: does not depend on width, theme, or scripts. */
function structure(input: StructureInput): Array<string> {
  const { html, zones, controls } = input
  const doc = new DOMParser().parseFromString(html, "text/html")
  const out: Array<string> = []
  const body = doc.body
  if (!body.firstElementChild?.classList.contains("catalog-disclaimer"))
    out.push("body does not start with the disclaimer strip")
  const main = doc.querySelector("main.pv-page")
  if (main === null) return [...out, "no main.pv-page"]
  const kids = Array.from(main.children)
  const hero = kids[0]
  if (
    hero?.tagName !== "HEADER" ||
    !hero.classList.contains("pv-hero") ||
    hero.getAttribute("data-pv-zone") !== "hero"
  ) {
    out.push("the first child of main is not header.pv-hero[data-pv-zone=hero]")
  }
  if (doc.querySelectorAll("h1").length !== 1 || !hero?.querySelector("h1"))
    out.push("expected one h1, inside the hero")
  // STANDARD §1 row 10: an attribution line may close the page, after the zones.
  const sections = kids.slice(1)
  if (sections.at(-1)?.classList.contains("catalog-attribution")) sections.pop()
  const ids = sections.map(
    (el) => el.getAttribute("data-pv-zone") ?? `<${el.tagName.toLowerCase()}>`
  )
  const known = zones.map(([id]) => id)
  const expected = known.filter((id) => ids.includes(id))
  if (ids.join(",") !== expected.join(","))
    out.push(
      `zones are ${ids.join(",")} — expected the order ${expected.join(",")}`
    )
  if (ids[0] !== "screens")
    out.push("the zone right after the hero is not screens")
  const seen = new Set<string>()
  for (const zone of sections) {
    const id = zone.getAttribute("data-pv-zone") ?? ""
    const title = zones.find(([z]) => z === id)?.[1]
    const h2 = zone.querySelector(":scope > h2.pv-zone-title")
    if (zone.tagName !== "SECTION" || !zone.classList.contains("pv-zone"))
      out.push(`${id}: not section.pv-zone`)
    if (
      h2 === null ||
      h2.id !== `pv-${id}` ||
      zone.getAttribute("aria-labelledby") !== `pv-${id}`
    )
      out.push(`${id}: title id and aria-labelledby do not match`)
    if (h2?.textContent !== title)
      out.push(`${id}: title is "${h2?.textContent}" — expected "${title}"`)
    const lists = zone.querySelectorAll(":scope > .pv-cells")
    if (lists.length !== 1 || zone.children.length !== 2)
      out.push(`${id}: expected a title and one .pv-cells`)
    const cells = Array.from(lists[0]?.children ?? [])
    if (cells.length === 0) out.push(`${id}: an empty zone`)
    for (const cell of cells) {
      const name = cell.getAttribute("data-pv-cell") ?? ""
      const at = `${id}/${name}`
      if (!cell.classList.contains("pv-cell") || name === "")
        out.push(`${id}: a child of .pv-cells is not a named .pv-cell`)
      if (seen.has(name)) out.push(`${at}: data-pv-cell is used twice`)
      seen.add(name)
      // label, (dark variant of the label), (dummy-data label), stage — in that order
      const shape = Array.from(cell.children)
        .map((el) =>
          el.matches("p.pv-label")
            ? "L"
            : el.matches('template[data-theme-variant="dark"]')
              ? "t"
              : el.matches(".catalog-dummy")
                ? "d"
                : el.matches("div.pv-stage")
                  ? "S"
                  : "?"
        )
        .join("")
      if (!/^Lt?d?S$/.test(shape))
        out.push(
          `${at}: cell children are "${shape}" — expected label, (dark variant), (dummy label), stage`
        )
      // A dark variant swaps the node right before it (iframe.js). As a child
      // of the cell that node is the label, so it must carry a label; inside
      // the label it swaps one piece, so a piece must come before it.
      for (const tpl of Array.from(
        cell.querySelectorAll<HTMLTemplateElement>(
          ':scope > template[data-theme-variant="dark"]'
        )
      )) {
        const first = tpl.content.firstElementChild
        if (first === null || !first.matches("p.pv-label"))
          out.push(`${at}: the label's dark variant is not a p.pv-label`)
      }
      for (const tpl of Array.from(
        cell.querySelectorAll(":scope > p.pv-label template")
      )) {
        if (
          tpl.getAttribute("data-theme-variant") !== "dark" ||
          tpl.previousElementSibling === null
        )
          out.push(
            `${at}: a template inside the label has no piece before it to swap`
          )
      }
      const screens = cell.querySelectorAll(".pv-screen").length
      if (screens !== (id === "screens" ? 1 : 0))
        out.push(
          `${at}: ${screens} .pv-screen — a screens cell holds one, other cells none`
        )
    }
  }
  for (const screen of Array.from(doc.querySelectorAll(".pv-screen"))) {
    if (
      screen.querySelector(
        '[class*="pv-"], [data-pv-zone], [data-pv-cell], [data-pv-toggle], [data-pv-option]'
      ) !== null
    )
      out.push("a .pv-screen holds frame classes, zones, or a toggle group")
  }
  for (const img of Array.from(
    doc.querySelectorAll('.pv-screen[role="img"], .pv-screen [role="img"]')
  )) {
    const n = img.querySelectorAll(controls).length
    if (n !== 0) out.push(`a role="img" screen holds ${n} real control(s)`)
  }
  for (const script of Array.from(doc.querySelectorAll("script"))) {
    const src = script.getAttribute("src") ?? ""
    if (!src.endsWith("/preview/_runtime/iframe.js"))
      out.push(`the page carries its own <script>${src && ` (${src})`}`)
  }
  if (doc.querySelector('[role="tabpanel"]') !== null)
    out.push("a tab panel exists")
  for (const group of Array.from(doc.querySelectorAll("[data-pv-toggle]"))) {
    const attr = group.getAttribute("data-pv-toggle") ?? ""
    const options = Array.from(group.querySelectorAll("[data-pv-option]"))
    const on = options.filter((o) => o.getAttribute(attr) === "true").length
    if (
      options.length < 2 ||
      on !== 1 ||
      options.some((o) => o.tagName !== "BUTTON" || !o.hasAttribute(attr))
    ) {
      out.push(
        `toggle group .${group.className}: ${options.length} option(s), ${on} on — expected buttons with one on`
      )
    }
  }
  for (const zone of Array.from(doc.querySelectorAll(".pv-zone"))) {
    if (
      zone.querySelector("details") !== null &&
      zone.querySelector("details[open]") === null
    )
      out.push(
        `${zone.getAttribute("data-pv-zone")}: accordions with none open`
      )
  }
  return out
}

/** Layout of the rendered page at one width and theme. */
function layout(): Array<string> {
  const out: Array<string> = []
  const root = document.documentElement
  if (root.scrollWidth > root.clientWidth)
    out.push(
      `page scrolls sideways (${root.scrollWidth} > ${root.clientWidth})`
    )
  // A box that clips or scrolls along an axis owns what happens inside it on
  // that axis; what it hides is not a spill out of the cell.
  const clippedOn = (
    el: Element,
    stop: Element,
    axis: "overflowX" | "overflowY"
  ): boolean => {
    for (
      let p = el.parentElement;
      p !== null && p !== stop;
      p = p.parentElement
    ) {
      if (getComputedStyle(p)[axis] !== "visible") return true
    }
    return false
  }
  for (const cell of Array.from(document.querySelectorAll(".pv-cell"))) {
    const box = cell.getBoundingClientRect()
    let sideways = 0
    let below = 0
    for (const el of Array.from(cell.querySelectorAll("*"))) {
      const r = el.getBoundingClientRect()
      if (r.width === 0 && r.height === 0) continue
      if (
        (r.right > box.right + 0.5 || r.left < box.left - 0.5) &&
        !clippedOn(el, cell, "overflowX")
      )
        sideways++
      if (r.bottom > box.bottom + 0.5 && !clippedOn(el, cell, "overflowY"))
        below++
    }
    const name = cell.getAttribute("data-pv-cell")
    if (sideways !== 0)
      out.push(`${name}: ${sideways} element(s) stick out sideways`)
    if (below !== 0)
      out.push(`${name}: ${below} element(s) spill below the cell`)
  }
  // The hero's first line and the zones share a left edge.
  const h1 = document.querySelector(".pv-hero h1")
  const title = document.querySelector(".pv-zone-title")
  if (h1 !== null && title !== null) {
    const a = h1.getBoundingClientRect().left
    const b = title.getBoundingClientRect().left
    if (Math.abs(a - b) > 0.5)
      out.push(`hero starts at ${a}px, zones at ${b}px`)
  }
  return out
}

/** Clicks what a visitor would click. The first entry is a count, not a problem. */
async function operate(page: Page): Promise<Array<string>> {
  const out: Array<string> = []
  const shown = (): Promise<number> =>
    page.evaluate(
      () =>
        Array.from(document.querySelectorAll("body *")).filter(
          (el) => el.getClientRects().length !== 0
        ).length
    )
  const before = await shown()
  const groups = page.locator("[data-pv-toggle]")
  for (let g = 0; g < (await groups.count()); g++) {
    const group = groups.nth(g)
    const attr = (await group.getAttribute("data-pv-toggle")) ?? ""
    const options = group.locator("[data-pv-option]")
    const n = await options.count()
    // Nothing to move between; structure() already reports the group.
    if (n < 2) continue
    const was = await options.evaluateAll(
      (els, a) => els.findIndex((el) => el.getAttribute(a) === "true"),
      attr
    )
    const pick = was === n - 1 ? 0 : n - 1
    await options.nth(pick).scrollIntoViewIfNeeded()
    await options.nth(pick).click()
    const now = await options.evaluateAll(
      (els, a) => els.map((el) => el.getAttribute(a)).join(","),
      attr
    )
    const want = Array.from({ length: n }, (_, i) =>
      i === pick ? "true" : "false"
    ).join(",")
    if (now !== want)
      out.push(
        `toggle group ${g} (${attr}): after a click the values are ${now}`
      )
  }
  // Real inputs in zone cells: click what is drawn, not the input.
  const boxes = page.locator(
    '.pv-zone:not([data-pv-zone="screens"]) input[type="checkbox"], .pv-zone:not([data-pv-zone="screens"]) input[type="radio"]'
  )
  for (let i = 0; i < (await boxes.count()); i++) {
    const box = boxes.nth(i)
    const was = await box.isChecked()
    const drawn = box.locator("xpath=following-sibling::*[1]")
    await drawn.scrollIntoViewIfNeeded()
    await drawn.click()
    if ((await box.isChecked()) === was)
      out.push(`input ${i}: a click on the drawn control did not change it`)
  }
  const after = await shown()
  if (after !== before)
    out.push(
      `operating the page changed how many elements are shown (${before} -> ${after})`
    )
  out.unshift(
    `operated ${await groups.count()} toggle group(s) and ${await boxes.count()} real input(s)`
  )
  return out
}

async function main(): Promise<void> {
  const slugs = process.argv.slice(2)
  if (slugs.length === 0) {
    console.error("usage: check-base.ts <slug> [<slug> …]")
    process.exit(2)
  }
  const { chromium } = await import("playwright")
  const server = await serveStatic(resolve(ROOT, "public"))
  const browser = await chromium.launch()
  let failed = false
  try {
    for (const slug of slugs) {
      const url = `http://127.0.0.1:${server.port}/preview/${slug}/preview.html`
      const html = readFileSync(
        resolve(ROOT, "public/preview", slug, "preview.html"),
        "utf8"
      )
      const problems: Array<string> = []
      let summary = ""
      for (const width of WIDTHS) {
        const context = await newMeasuringContext(browser, {
          width,
          online: false,
        })
        await context.addInitScript(defineNameHelper)
        const page = await context.newPage()
        await page.goto(url, { waitUntil: "load" })
        if (width === WIDTHS[0]) {
          problems.push(
            ...(await page.evaluate(structure, {
              html,
              zones: ZONES,
              controls: CONTROLS,
            }))
          )
          summary = await page.evaluate(() =>
            Array.from(document.querySelectorAll(".pv-zone"))
              .map(
                (z) =>
                  `${z.getAttribute("data-pv-zone")} ${z.querySelectorAll(".pv-cell").length}`
              )
              .join(", ")
          )
        }
        for (const theme of THEMES) {
          await page.evaluate(
            (value) =>
              document.documentElement.setAttribute("data-theme", value),
            theme
          )
          await settle(page)
          const found = await page.evaluate(layout)
          problems.push(...found.map((p) => `${width} ${theme}: ${p}`))
          if (SHOTS !== undefined)
            await page.screenshot({
              path: resolve(SHOTS, `${slug}-${width}-${theme}.png`),
              fullPage: true,
            })
        }
        if (width === 976) {
          await page.evaluate(() =>
            document.documentElement.setAttribute("data-theme", "light")
          )
          await settle(page)
          const [count, ...found] = await operate(page)
          console.log(`${slug}: ${count}`)
          problems.push(...found)
        }
        await context.close()
      }
      console.log(`${slug}: zones ${summary}`)
      if (problems.length === 0)
        console.log(
          `${slug}: ok — structure, ${WIDTHS.length} widths x ${THEMES.length} themes, operation`
        )
      else {
        failed = true
        for (const p of problems) console.log(`${slug}: FAIL ${p}`)
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }
  process.exit(failed ? 1 : 0)
}

void main()
