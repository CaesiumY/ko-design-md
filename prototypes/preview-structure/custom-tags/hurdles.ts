// PROTOTYPE (ticket 731) — throwaway. Checks the five hurdles the research
// named for the "custom-tags" structure, one experiment each, on temporary
// copies of public/preview/chzzk/preview.html. Nothing under public/ changes.
//
//   pnpm exec tsx prototypes/preview-structure/custom-tags/hurdles.ts \
//     --base <common-base preview.html> [--only 1,2,3,4,5]
//
// Hurdle 3 runs `pnpm audit:contrast:staged` twice and takes minutes.
// Prints one block per hurdle; README.md records what it printed.

import { spawnSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { JSDOM } from "jsdom"
import { serveStatic } from "../../../scripts/audit-contrast-sweep"
import { splitMergedPreview } from "../../../src/lib/preview-halves"
import type { Page } from "playwright"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..")
const TAGS = join(ROOT, "public/preview/chzzk/preview.html")
const argv = process.argv.slice(2)
const baseIdx = argv.indexOf("--base")
const baseArg = baseIdx === -1 ? undefined : argv.at(baseIdx + 1)
if (baseArg === undefined) {
  console.error("usage: hurdles.ts --base <common-base preview.html>")
  process.exit(2)
}
const BASE = resolve(baseArg)
const onlyIdx = argv.indexOf("--only")
const only =
  onlyIdx === -1 ? [1, 2, 3, 4, 5] : argv[onlyIdx + 1].split(",").map(Number)

const tags = readFileSync(TAGS, "utf8")
const base = readFileSync(BASE, "utf8")
const tmp = mkdtempSync(join(tmpdir(), "custom-tags-"))

function put(name: string, html: string): string {
  const path = join(tmp, name, "preview.html")
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, html)
  return path
}

function must(html: string, from: string, to: string): string {
  if (!html.includes(from)) throw new Error(`not found: ${from}`)
  return html.replace(from, to)
}

/** `scripts/validate-preview.ts` in staging mode; the lines it printed. */
function validate(path: string): string {
  const r = spawnSync(
    process.execPath,
    [
      join(ROOT, "node_modules/tsx/dist/cli.mjs"),
      join(ROOT, "scripts/validate-preview.ts"),
      "--preview",
      path,
      "--design-md",
      join(ROOT, "services/chzzk.md"),
      "--expected-logo-src",
      "/logos/chzzk.png",
      "--verbose",
    ],
    { encoding: "utf8", cwd: ROOT }
  )
  const out = `${r.stdout}${r.stderr}`
    .split("\n")
    .filter((l) => /block|warn|PASSED|FAILED|ok |error/i.test(l))
    .map((l) => l.trim().slice(0, 400))
    .join("\n    ")
  return `exit ${r.status}\n    ${out}`
}

// Same five replaces as `visibleText` in src/lib/preview-validator.ts (not
// exported): what the validator's prose rules read.
function visibleText(html: string): string {
  return html
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/\s+/g, " ")
}

/** Label and zone-title texts as the common base writes them. */
function frameTexts(html: string): Array<string> {
  const doc = new JSDOM(html).window.document
  const out: Array<string> = []
  for (const t of doc.querySelectorAll(".pv-label, .pv-zone-title"))
    out.push(t.textContent)
  for (const tpl of doc.querySelectorAll("template"))
    for (const t of tpl.content.querySelectorAll(".pv-label"))
      out.push(t.textContent)
  return out
}

async function withBrowser<T>(
  fn: (
    open: (html: string, opts: { js: boolean; theme?: string }) => Promise<Page>
  ) => Promise<T>
): Promise<T> {
  const { chromium } = await import("playwright")
  const server = await serveStatic(join(ROOT, "public"))
  const browser = await chromium.launch()
  try {
    return await fn(async (html, opts) => {
      const ctx = await browser.newContext({
        javaScriptEnabled: opts.js,
        viewport: { width: 1440, height: 900 },
      })
      await ctx.route("**/*", (route) =>
        new URL(route.request().url()).hostname === "127.0.0.1"
          ? route.continue()
          : route.abort()
      )
      server.setOracle(html)
      const page = await ctx.newPage()
      await page.goto(`http://127.0.0.1:${server.port}/__oracle/preview.html`, {
        waitUntil: "load",
      })
      if (opts.theme !== undefined && opts.js) {
        await page.evaluate((t) => {
          document.documentElement.setAttribute("data-theme", t)
        }, opts.theme)
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)))
      }
      return page
    })
  } finally {
    await browser.close()
    await server.close()
  }
}

function hurdle1(): void {
  console.log("\n[1] 공용 스크립트 밖 스크립트 금지")
  const external = must(
    tags,
    '<script src="/preview/_runtime/iframe.js" defer></script>',
    '<script src="/preview/_runtime/iframe.js" defer></script>\n<script src="/preview/_runtime/pv-tags.js" defer></script>'
  )
  console.log(
    "  a. 그리는 코드를 별도 파일(src)로 실은 사본:",
    validate(put("h1a", external))
  )
  const inline = must(
    tags,
    "</head>",
    "<script>/* drawTags() 를 여기 둔 경우 */</script>\n</head>"
  )
  console.log(
    "  b. 그리는 코드를 인라인 <script> 로 둔 사본:",
    validate(put("h1b", inline))
  )
  console.log("  c. 본 구조(그리는 코드가 iframe.js 안):", validate(TAGS))
}

function hurdle2(): void {
  console.log("\n[2] 속성에 든 이름표를 산문 검사가 읽지 못함")
  const inAttr = must(
    tags,
    'label="badge"',
    'label="badge, All rights reserved"'
  )
  const inText = must(
    tags,
    '<span class="spec">높이 20, radius 4, 12 / 20 / 700</span>',
    '<span class="spec">높이 20, radius 4, 12 / 20 / 700</span><span class="spec">All rights reserved</span>'
  )
  console.log(
    "  a. 문구를 칸 이름표 속성에 심은 사본:",
    validate(put("h2a", inAttr))
  )
  console.log(
    "  b. 같은 문구를 요소의 글로 심은 사본:",
    validate(put("h2b", inText))
  )
  const texts = frameTexts(base)
  const seenBase = texts.filter((t) => visibleText(base).includes(t)).length
  const seenTags = texts.filter((t) => visibleText(tags).includes(t)).length
  console.log(
    `  c. 바탕의 이름표, 다크 이름표, 구역 제목 ${texts.length}개 중 검사기의 보이는 글(visibleText)에 든 것: 바탕 ${seenBase}개, 태그 구조 ${seenTags}개`
  )
  const missing = texts.filter((t) => !visibleText(tags).includes(t))
  console.log(
    `     태그 구조에서 빠진 것: ${missing.map((t) => `"${t}"`).join(", ")}`
  )
}

function textElements(report: string): string {
  const r = JSON.parse(readFileSync(report, "utf8"))
  const o = r.render?.observed
  if (o === undefined) return JSON.stringify(r.render)
  return `measured ${o.measured}, fail ${o.fail}, 텍스트 요소 light ${o.textElements.light} / dark ${o.textElements.dark}`
}

function hurdle3(): void {
  console.log("\n[3] 대비 측정이 태그 안쪽을 보지 못함")
  // Variant: the same tags, but each cell's drawn content moved into a shadow
  // root after the runtime has drawn it (DOMContentLoaded fires after the
  // deferred iframe.js). That is what a Shadow DOM renderer would leave.
  const shadow = must(
    tags,
    "</body>",
    `<script>document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".pv-cell").forEach(function (cell) {
    var root = cell.attachShadow({ mode: "open" })
    while (cell.firstChild) root.appendChild(cell.firstChild)
  })
})</script>
</body>`
  )
  for (const [name, html] of [
    ["h3-light-dom", tags],
    ["h3-shadow-dom", shadow],
  ] as const) {
    const path = put(name, html)
    const report = join(dirname(path), "report.json")
    spawnSync(
      process.execPath,
      [
        join(ROOT, "node_modules/tsx/dist/cli.mjs"),
        join(ROOT, "scripts/observe-staged-contrast.ts"),
        "--staged",
        path,
        "--json-out",
        report,
      ],
      { encoding: "utf8", cwd: ROOT }
    )
    console.log(`  ${name}: ${textElements(report)}`)
  }
}

async function hurdle4(): Promise<void> {
  console.log("\n[4] 다크에서 글이 달라지는 이름표의 묶임")
  const darkLabel = "라이브 시청, 데스크톱 (채팅 폭, 제목 크기, 전송 버튼 가정)"
  const lightLabel =
    "라이브 시청, 데스크톱 (채팅 폭, 제목 크기, 전송 버튼, 라이트 구독 버튼과 채팅 색 가정)"
  const halves = (html: string) => splitMergedPreview(html, html.length)
  for (const [name, html] of [
    ["바탕", base],
    ["태그 구조(label-dark 속성)", tags],
  ] as const) {
    const h = halves(html)
    console.log(
      `  a. ${name}: 검사기가 다시 짠 다크 반쪽의 보이는 글에 다크 이름표가 있다 ${visibleText(h.dark).includes(darkLabel)}, 라이트 이름표가 있다 ${visibleText(h.dark).includes(lightLabel)}`
    )
  }
  // The other way to write it: the dark label as the cell's first child.
  const firstChild = must(
    tags,
    `label-dark="${darkLabel}" wide stack>`,
    `wide stack>\n      <template data-theme-variant="dark"><p class="pv-label">${darkLabel}</p></template>`
  )
  console.log(
    "  b. 다크 이름표를 칸의 첫 자식 <template> 로 쓴 사본:",
    validate(put("h4b", firstChild))
  )
  await withBrowser(async (open) => {
    for (const [name, html] of [
      ["태그 구조(label-dark 속성)", tags],
      ["첫 자식 <template> 사본", firstChild],
    ] as const) {
      const page = await open(html, { js: true, theme: "dark" })
      const labels = await page.evaluate(() =>
        [
          ...document.querySelectorAll(
            '[data-pv-cell="screen-live-watch"] .pv-label'
          ),
        ].map((p) => p.textContent)
      )
      console.log(
        `  c. ${name}, 다크로 연 브라우저의 그 칸 이름표: ${JSON.stringify(labels)}`
      )
    }
  })
}

async function hurdle5(): Promise<void> {
  console.log("\n[5] 스크립트 없이도 라이트가 그려지는 성질")
  await withBrowser(async (open) => {
    const read = async (html: string, js = false) => {
      const page = await open(html, { js })
      return page.evaluate(() => ({
        text: document.body.innerText,
        zones: document.querySelectorAll("section.pv-zone").length,
        cells: document.querySelectorAll(".pv-cell").length,
        labels: document.querySelectorAll(".pv-label").length,
        height: document.body.scrollHeight,
      }))
    }
    const b = await read(base)
    const t = await read(tags)
    const on = await read(tags, true)
    console.log(
      `  태그 구조, 스크립트 켬: 구역 ${on.zones}, 칸 ${on.cells}, 이름표 ${on.labels}, 높이 ${on.height}px`
    )
    console.log(
      `  바탕, 스크립트 끔: 구역 ${b.zones}, 칸 ${b.cells}, 이름표 ${b.labels}, 높이 ${b.height}px`
    )
    console.log(
      `  태그 구조, 스크립트 끔: 구역 ${t.zones}, 칸 ${t.cells}, 이름표 ${t.labels}, 높이 ${t.height}px`
    )
    const lines = (s: string) =>
      s
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l !== "")
    const tl = new Set(lines(t.text))
    const missing = lines(b.text).filter((l) => !tl.has(l))
    console.log(
      `  바탕에 보이고 태그 구조에 안 보이는 줄 ${missing.length}개: ${missing.map((l) => `"${l}"`).join(", ")}`
    )
  })
}

console.log(`temp copies: ${tmp}`)
if (only.includes(1)) hurdle1()
if (only.includes(2)) hurdle2()
if (only.includes(3)) hurdle3()
if (only.includes(4)) await hurdle4()
if (only.includes(5)) await hurdle5()
