// PROTOTYPE — throwaway code. Checks one preview against the parts of
// prototypes/preview-structure/STANDARD.md that the preview validator does not
// look at: the order and shape of the zones, whether anything spills out of a
// cell, and whether the things that are meant to be operated really operate.
//
//   pnpm exec tsx prototypes/preview-structure/base-notes/check-base.ts <slug> [<slug> …]
//
// The preview is opened from this checkout's public/ over a loopback server
// (the contrast harness's), so no dev server is needed.
//
// Exit 0: every check held. Exit 1: at least one did not (each is printed).

import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import {
  newMeasuringContext,
  serveStatic,
} from "../../../scripts/audit-contrast-sweep"
import type { Page } from "playwright"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
// PV_SHOTS=<existing dir>: also save a full-page picture per width and theme.
const SHOTS =
  process.env.PV_SHOTS === undefined || process.env.PV_SHOTS === ""
    ? undefined
    : resolve(process.env.PV_SHOTS)
const WIDTHS = [375, 768, 976, 1440]
const THEMES = ["light", "dark"]
const ZONES: Array<[string, string]> = [
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
  "button, input, select, textarea, a[href], details, [tabindex], [data-pv-toggle]"

async function settle(page: Page): Promise<void> {
  await page.evaluate(
    () =>
      new Promise<void>((done) =>
        requestAnimationFrame(() => requestAnimationFrame(() => done()))
      )
  )
  await page.waitForTimeout(60)
}

/** Shape of the document: does not depend on width or theme. */
function structure(
  zones: Array<[string, string]>,
  controls: string
): Array<string> {
  const out: Array<string> = []
  const body = document.body
  if (!body.firstElementChild?.classList.contains("catalog-disclaimer"))
    out.push("body does not start with the disclaimer strip")
  const main = document.querySelector("main.pv-page")
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
  if (
    document.querySelectorAll("h1").length !== 1 ||
    hero?.querySelector("h1") === null
  )
    out.push("expected one h1, inside the hero")
  const ids = kids
    .slice(1)
    .map(
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
  for (const zone of kids.slice(1)) {
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
      if (!cell.classList.contains("pv-cell") || name === "")
        out.push(`${id}: a child of .pv-cells is not a named .pv-cell`)
      if (seen.has(name))
        out.push(`${id}: data-pv-cell "${name}" is used twice`)
      seen.add(name)
      // label, (dark variant), (dummy-data label), stage — in that order
      const shape = Array.from(cell.children)
        .map((el) =>
          el.matches("p.pv-label")
            ? "L"
            : el.matches("template[data-theme-variant]")
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
          `${id}/${name}: cell children are "${shape}" — expected label, (dark variant), (dummy label), stage`
        )
      if ((cell.querySelector(".pv-screen") !== null) !== (id === "screens"))
        out.push(
          `${id}/${name}: .pv-screen belongs to the screens zone, one per cell`
        )
    }
  }
  for (const screen of Array.from(document.querySelectorAll(".pv-screen"))) {
    if (
      screen.querySelector('[class*="pv-"], [data-pv-zone], [data-pv-cell]') !==
      null
    )
      out.push("a .pv-screen holds frame classes or zones")
  }
  for (const img of Array.from(
    document.querySelectorAll('.pv-screen [role="img"]')
  )) {
    const n = img.querySelectorAll(controls).length
    if (n !== 0) out.push(`a role="img" screen holds ${n} real control(s)`)
  }
  if (body.querySelector("script") !== null)
    out.push("the page carries its own <script>")
  if (document.querySelector('[role="tabpanel"]') !== null)
    out.push("a tab panel exists")
  for (const group of Array.from(
    document.querySelectorAll("[data-pv-toggle]")
  )) {
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
  for (const d of Array.from(document.querySelectorAll(".pv-zone details"))) {
    const zone = d.closest(".pv-zone")
    if (zone?.querySelector("details[open]") === null)
      out.push("an accordion zone has no open <details>")
  }
  return out
}

/** Layout at one width and theme. */
function layout(): Array<string> {
  const out: Array<string> = []
  const root = document.documentElement
  if (root.scrollWidth > root.clientWidth)
    out.push(
      `page scrolls sideways (${root.scrollWidth} > ${root.clientWidth})`
    )
  const clipped = (el: Element, stop: Element): boolean => {
    for (
      let p = el.parentElement;
      p !== null && p !== stop;
      p = p.parentElement
    ) {
      const s = getComputedStyle(p)
      if (s.overflowX !== "visible" || s.overflowY !== "visible") return true
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
      if (clipped(el, cell)) continue
      if (r.right > box.right + 0.5 || r.left < box.left - 0.5) sideways++
      if (r.bottom > box.bottom + 0.5) below++
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
      const problems: Array<string> = []
      let summary = ""
      for (const width of WIDTHS) {
        const context = await newMeasuringContext(browser, {
          width,
          online: false,
        })
        const page = await context.newPage()
        await page.goto(url, { waitUntil: "load" })
        for (const theme of THEMES) {
          await page.evaluate(
            (value) =>
              document.documentElement.setAttribute("data-theme", value),
            theme
          )
          await settle(page)
          if (width === WIDTHS[0] && theme === THEMES[0]) {
            problems.push(
              ...(await page.evaluate(
                ([z, c]) => (0, eval)(`(${z})`)(JSON.parse(c[0]), c[1]),
                [
                  structure.toString(),
                  [JSON.stringify(ZONES), CONTROLS],
                ] as const
              ))
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
          problems.push(
            ...(
              await page.evaluate(
                (fn) => (0, eval)(`(${fn})`)(),
                layout.toString()
              )
            ).map((p: string) => `${width} ${theme}: ${p}`)
          )
        }
        if (SHOTS !== undefined) {
          for (const theme of THEMES) {
            await page.evaluate(
              (value) =>
                document.documentElement.setAttribute("data-theme", value),
              theme
            )
            await settle(page)
            await page.screenshot({
              path: resolve(SHOTS, `${slug}-${width}-${theme}.png`),
              fullPage: true,
            })
          }
        }
        if (width === 976) {
          await page.evaluate(() =>
            document.documentElement.setAttribute("data-theme", "light")
          )
          await settle(page)
          const result = await operate(page)
          console.log(`${slug}: ${result[0]}`)
          problems.push(...result.slice(1))
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
