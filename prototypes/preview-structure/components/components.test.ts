// PROTOTYPE — throwaway code. The contract of the "components" structure:
// the check catches a wrong zone order, an unknown zone and a cell without a
// label, and every served preview equals what its item module builds.

import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { checkPreview } from "./kit/check.ts"
import {
  cell,
  definePreview,
  renderPreview,
  renderUnchecked,
  screen,
  zone,
} from "./kit/parts.ts"
import { ENTRIES, buildEntry, servedPath } from "./kit/entries.ts"
import type { PreviewDef } from "./kit/parts.ts"

const STYLES = { light: ":root { --pv-font: sans-serif; }\n", dark: "" }

function sample(): PreviewDef {
  return definePreview({
    slug: "sample",
    title: "sample preview",
    hero: `<h1>브랜드</h1>\n<img src="/logos/sample.png" alt="">`,
    zones: [
      zone("screens", [
        screen({ name: "screen-home", label: "홈", screen: `<div>화면</div>` }),
      ]),
      zone("buttons", [
        cell({
          name: "button-primary",
          label: "button-primary",
          stage: `<button type="button">확인</button>`,
        }),
      ]),
      zone("inputs", [
        cell({ name: "text-field", label: "text-field", stage: `<input>` }),
      ]),
    ],
  })
}

const messages = (html: string): string =>
  checkPreview(html)
    .map((p) => p.message)
    .join("\n")

describe("checkPreview", () => {
  it("passes a page the parts built", () => {
    expect(checkPreview(renderPreview(sample(), STYLES))).toEqual([])
  })

  it("catches two zones in the wrong order", () => {
    const html = renderPreview(sample(), STYLES)
    const a = html.indexOf(`  <section class="pv-zone" data-pv-zone="buttons"`)
    const b = html.indexOf(`  <section class="pv-zone" data-pv-zone="inputs"`)
    const end = html.indexOf("</section>", b) + "</section>\n".length
    const swapped =
      html.slice(0, a) + html.slice(b, end) + html.slice(a, b) + html.slice(end)
    expect(messages(swapped)).toMatch(/순서.*inputs.*buttons/)
  })

  it("catches a zone that is not in the list", () => {
    const html = renderPreview(sample(), STYLES).replaceAll("inputs", "widgets")
    expect(messages(html)).toMatch(/모르는 구역 "widgets"/)
  })

  it("catches a cell without a label", () => {
    const html = renderPreview(sample(), STYLES).replace(
      `<p class="pv-label">button-primary</p>`,
      ""
    )
    expect(messages(html)).toMatch(/buttons\/button-primary.*이름표/)
  })

  it("catches a cell whose label is empty", () => {
    const html = renderPreview(sample(), STYLES).replace(
      `<p class="pv-label">button-primary</p>`,
      `<p class="pv-label"> </p>`
    )
    expect(messages(html)).toMatch(/buttons\/button-primary.*이름표가 비어/)
  })

  it("catches brand CSS that redefines a frame selector", () => {
    const html = renderUnchecked(sample(), {
      light: ".pv-cell { padding: 0; }\n",
      dark: "",
    })
    expect(messages(html)).toMatch(/틀의 선택자/)
  })

  it("points at the served line of the problem", () => {
    const html = renderPreview(sample(), STYLES).replace(
      `<p class="pv-label">button-primary</p>`,
      ""
    )
    const line = html
      .split("\n")
      .findIndex((l) => l.includes(`data-pv-cell="button-primary"`))
    expect(checkPreview(html)[0].line).toBe(line + 1)
  })
})

describe("renderPreview", () => {
  it("builds the zones in the order of the list, not the order written", () => {
    const def = sample()
    const html = renderPreview(
      { ...def, zones: [...def.zones].reverse() },
      STYLES
    )
    expect(html.indexOf(`data-pv-zone="screens"`)).toBeLessThan(
      html.indexOf(`data-pv-zone="inputs"`)
    )
  })

  it("refuses a cell with no label before writing anything", () => {
    const def = sample()
    def.zones[1].cells[0].label = ""
    expect(() => renderPreview(def, STYLES)).toThrow(/button-primary.*이름표/)
  })
})

describe("served previews", () => {
  it.each(ENTRIES)("%s equals what its item module builds", async (slug) => {
    const built = await buildEntry(slug)
    const served = readFileSync(servedPath(slug), "utf8").replace(/\r\n/g, "\n")
    // Rebuild with: pnpm pv:build <slug>
    expect(
      served === built,
      `public/preview/${slug}/preview.html 이 원본과 다르다. pnpm pv:build ${slug} 로 다시 만든다.`
    ).toBe(true)
    expect(checkPreview(built)).toEqual([])
  })
})
