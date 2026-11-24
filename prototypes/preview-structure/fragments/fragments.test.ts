// PROTOTYPE — tests for the "fragments" preview structure (ticket 729).
// The promise check is tested on purpose-broken inputs; the drift test holds
// every committed public/preview/{slug}/preview.html that has a preview-src/
// to what its fragments assemble into, so `pnpm test` blocks a stale output.

import { describe, expect, it } from "vitest"
import { assemble } from "./assemble"
import { checkPreview, checkServed } from "./contract"
import { buildSlug, driftOf, listSourceSlugs, loadSource } from "./repo"
import type { PreviewSource } from "./assemble"

const FRAME =
  "/* pv-frame:start */\n.pv-page { display: block; }\n/* pv-frame:end */\n"

function source(zones: Record<string, string>): PreviewSource {
  return {
    slug: "demo",
    title: "데모 preview",
    frameCss: FRAME,
    brandCss: {
      path: "preview-src/demo/brand.css",
      text: "  :root { --pv-ink: red; }\n",
    },
    darkCss: {
      path: "preview-src/demo/dark.css",
      text: '  [data-theme="dark"] { }\n',
    },
    zones: Object.entries(zones).map(([zone, text]) => ({
      zone,
      path: `preview-src/demo/zones/${zone}.html`,
      text,
    })),
  }
}

const HERO =
  '<div class="hero"><h1>데모</h1><img src="/logos/demo.png" alt="데모"></div>\n'
const SCREENS = [
  '<pv-cell name="screen-home" wide stack>',
  "  <pv-label>홈, 모바일</pv-label>",
  '  <p class="catalog-dummy">이름은 더미 데이터입니다.</p>',
  "  <pv-screen>",
  '    <div class="phone">홈</div>',
  "  </pv-screen>",
  "</pv-cell>",
  "",
].join("\n")
const BUTTONS = [
  '<pv-cell name="button-primary">',
  "  <pv-label>button-primary, 48</pv-label>",
  '  <template data-theme-variant="dark"><pv-label>button-primary, 48 다크</pv-label></template>',
  '  <button class="btn" type="button">확인</button>',
  "</pv-cell>",
  "",
  '<pv-cell name="button-ghost">',
  "  <pv-label>button-ghost</pv-label>",
  '  <button class="btn ghost" type="button">취소</button>',
  "</pv-cell>",
  "",
].join("\n")
const SELECTION = [
  '<pv-cell name="switch">',
  "  <pv-label>switch</pv-label>",
  '  <input type="checkbox" role="switch" aria-label="알림">',
  "</pv-cell>",
  "",
].join("\n")

const GOOD = () =>
  source({
    hero: HERO,
    screens: SCREENS,
    buttons: BUTTONS,
    selection: SELECTION,
  })

function html(src: PreviewSource): string {
  const { assembled, findings } = assemble(src)
  expect(findings).toEqual([])
  return assembled!.html
}

describe("assembling fragments with the common skeleton", () => {
  it("wraps cells in the frame's zone, cell, label and stage markup", () => {
    const out = html(GOOD())
    expect(out).toContain(
      '  <section class="pv-zone" data-pv-zone="buttons" aria-labelledby="pv-buttons">\n' +
        '    <h2 class="pv-zone-title" id="pv-buttons">버튼</h2>\n' +
        '    <div class="pv-cells">\n' +
        '      <div class="pv-cell" data-pv-cell="button-primary">\n' +
        '        <p class="pv-label">button-primary, 48</p>\n' +
        '        <template data-theme-variant="dark"><p class="pv-label">button-primary, 48 다크</p></template>\n' +
        '        <div class="pv-stage">\n' +
        '          <button class="btn" type="button">확인</button>\n' +
        "        </div>\n" +
        "      </div>\n"
    )
    expect(out).toContain(
      '      <div class="pv-cell pv-cell--wide" data-pv-cell="screen-home">\n' +
        '        <p class="pv-label">홈, 모바일</p>\n' +
        '        <p class="catalog-dummy">이름은 더미 데이터입니다.</p>\n' +
        '        <div class="pv-stage pv-stage--stack">\n' +
        '          <div class="pv-screen">\n' +
        '            <div class="phone">홈</div>\n' +
        "          </div>\n"
    )
  })

  it("puts zones in the common order whatever order the files come in", () => {
    const src = source({
      selection: SELECTION,
      buttons: BUTTONS,
      hero: HERO,
      screens: SCREENS,
    })
    const out = html(src)
    const at = (id: string) => out.indexOf(`data-pv-zone="${id}"`)
    expect(at("hero")).toBeLessThan(at("screens"))
    expect(at("screens")).toBeLessThan(at("buttons"))
    expect(at("buttons")).toBeLessThan(at("selection"))
  })

  it("puts the frame block first in the first style and the brand css right after it", () => {
    const out = html(GOOD())
    expect(out).toContain(
      "<style>\n/* pv-frame:start */\n.pv-page { display: block; }\n/* pv-frame:end */\n  :root { --pv-ink: red; }\n</style>"
    )
  })

  it("knows which source line every served line came from", () => {
    const { assembled } = assemble(GOOD())
    const lines = assembled!.html.split("\n")
    const i = lines.findIndex((l) => l.includes("button-primary, 48</p>"))
    expect(assembled!.origins[i]).toEqual({
      file: "preview-src/demo/zones/buttons.html",
      line: 2,
    })
    const j = lines.findIndex((l) =>
      l.includes('<h2 class="pv-zone-title" id="pv-buttons">')
    )
    expect(assembled!.origins[j].file).toMatch(/zones\.ts/)
  })
})

describe("the promise check", () => {
  it("passes a well-formed item", () => {
    expect(checkPreview(GOOD())).toEqual([])
  })

  it("names a cell with no label, at the fragment line, and says what to write", () => {
    const broken = BUTTONS.replace("  <pv-label>button-ghost</pv-label>\n", "")
    const findings = checkPreview(
      source({ hero: HERO, screens: SCREENS, buttons: broken })
    )
    expect(findings).toHaveLength(1)
    expect(findings[0].file).toBe("preview-src/demo/zones/buttons.html")
    expect(findings[0].line).toBe(7)
    expect(findings[0].message).toContain("button-ghost")
    expect(findings[0].message).toContain("<pv-label>")
  })

  it("names an empty label", () => {
    const broken = BUTTONS.replace(
      "<pv-label>button-ghost</pv-label>",
      "<pv-label> </pv-label>"
    )
    const [f] = checkPreview(
      source({ hero: HERO, screens: SCREENS, buttons: broken })
    )
    expect(f.line).toBe(8)
    expect(f.message).toContain("비어")
  })

  it("names a zone file that is not in the common zone list", () => {
    const src = GOOD()
    src.zones = [
      ...src.zones,
      {
        zone: "tables",
        path: "preview-src/demo/zones/tables.html",
        text: SELECTION.replace(/switch/g, "table-row"),
      },
    ]
    const findings = checkPreview(src)
    expect(findings).toHaveLength(1)
    expect(findings[0].file).toBe("preview-src/demo/zones/tables.html")
    expect(findings[0].message).toContain("tables")
    expect(findings[0].message).toContain("zones.ts")
  })

  it("names a missing required zone", () => {
    const findings = checkPreview(source({ hero: HERO, buttons: BUTTONS }))
    expect(findings.map((f) => f.message).join("\n")).toContain("screens")
  })

  it("refuses frame markup written by hand inside a fragment", () => {
    const broken = BUTTONS.replace(
      '  <button class="btn ghost"',
      '  <div class="pv-stage"></div>\n  <button class="btn ghost"'
    )
    const [f] = checkPreview(
      source({ hero: HERO, screens: SCREENS, buttons: broken })
    )
    expect(f.line).toBe(9)
    expect(f.message).toContain("pv-")
  })

  it("names a cell name used twice and a name that is not kebab-case", () => {
    const twice = checkPreview(
      source({
        hero: HERO,
        screens: SCREENS,
        buttons: BUTTONS,
        selection: SELECTION.replace('"switch"', '"button-ghost"'),
      })
    )
    expect(twice).toHaveLength(1)
    expect(twice[0].file).toBe("preview-src/demo/zones/selection.html")
    expect(twice[0].message).toContain("buttons.html:7")
    const camel = checkPreview(
      source({
        hero: HERO,
        screens: SCREENS,
        buttons: BUTTONS.replace('"button-ghost"', '"buttonGhost"'),
      })
    )
    expect(camel[0].message).toContain("kebab-case")
  })

  it("names an unknown attribute on a cell", () => {
    const [f] = checkPreview(
      source({
        hero: HERO,
        screens: SCREENS,
        buttons: BUTTONS.replace(
          'name="button-ghost"',
          'name="button-ghost" wdie'
        ),
      })
    )
    expect(f.line).toBe(7)
    expect(f.message).toContain("wdie")
  })
})

describe("the promise check on a served file", () => {
  it("catches two zones in the wrong order and says the order is not the item's to set", () => {
    const out = html(GOOD())
    const a = out.indexOf('  <section class="pv-zone" data-pv-zone="buttons"')
    const b = out.indexOf('  <section class="pv-zone" data-pv-zone="selection"')
    const end = out.indexOf("</main>")
    const swapped =
      out.slice(0, a) + out.slice(b, end) + out.slice(a, b) + out.slice(end)
    const findings = checkServed(swapped, "public/preview/demo/preview.html")
    expect(findings).toHaveLength(1)
    expect(findings[0].message).toContain("buttons")
    expect(findings[0].message).toContain("selection")
    expect(findings[0].message).toContain("pnpm previews:build")
    expect(swapped.split("\n")[findings[0].line - 1]).toContain(
      'data-pv-zone="buttons"'
    )
  })

  it("catches a zone it does not know and a wrong zone title", () => {
    const out = html(GOOD())
      .replace(
        'data-pv-zone="selection" aria-labelledby="pv-selection"',
        'data-pv-zone="tables" aria-labelledby="pv-tables"'
      )
      .replace(">버튼</h2>", ">Buttons</h2>")
    const msgs = checkServed(out, "x.html").map((f) => f.message)
    expect(msgs.some((m) => m.includes("tables"))).toBe(true)
    expect(msgs.some((m) => m.includes("버튼"))).toBe(true)
  })

  it("catches a cell with no label and points at that cell's line", () => {
    const out = html(GOOD()).replace(
      '        <p class="pv-label">button-ghost</p>\n',
      ""
    )
    const findings = checkServed(out, "x.html")
    expect(findings).toHaveLength(1)
    expect(out.split("\n")[findings[0].line - 1]).toContain(
      'data-pv-cell="button-ghost"'
    )
  })
})

describe("the items written in this structure", () => {
  const slugs = listSourceSlugs()

  it("has chzzk and toss", () => {
    expect(slugs).toEqual(expect.arrayContaining(["chzzk", "toss"]))
  })

  for (const slug of slugs) {
    it(`${slug}: keeps every promise`, () => {
      expect(checkPreview(loadSource(slug))).toEqual([])
    })
    it(`${slug}: the served file is what its fragments assemble into (else run pnpm previews:build ${slug})`, () => {
      expect(driftOf(slug)).toBeNull()
    })
  }

  it("a fragment edited without assembling is drift", () => {
    const src = loadSource("chzzk")
    const zone = src.zones.find((z) => z.zone === "buttons")!
    zone.text = zone.text.replace(
      "button, 변형과 상태",
      "button, 변형과 상태 (고침)"
    )
    const drift = driftOf("chzzk", buildSlug(src))
    expect(drift).not.toBeNull()
    expect(drift!.message).toContain("pnpm previews:build chzzk")
  })
})
