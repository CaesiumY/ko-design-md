import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// The keyboard focus indicator is `--ring`, drawn by `ring-ring` and the base
// `outline-ring`. It once carried `/ 0.4` and its uses added `/30` or `/50` on
// top, so it drew at 12-20% opacity — about 1.4:1 against the page, under the
// 3:1 WCAG 1.4.11 asks of a focus indicator. Nothing failed; it was measured in
// a browser. These checks keep an alpha from creeping back in through the
// token, its theme mapping, or an opacity modifier on a use — `/30`, `/[0.3]`,
// `/(--a)`, and the same on `sidebar-ring`, `[var(--ring)]` or `(--ring)`.

const SRC = join(process.cwd(), "src")
const CSS = readFileSync(join(SRC, "styles.css"), "utf8")

function sourceFiles(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.(tsx?|css)$/.test(e.name))
    .filter((e) => !/\.test\.tsx?$/.test(e.name))
    .map((e) => join(e.parentPath, e.name))
}

describe("focus ring opacity", () => {
  // An allowlist, not a search for `/`: an alpha has more spellings than a
  // slash (`#e0402866`, `color-mix(…, transparent)`, `rgb(… / .4)`), and only
  // a bare three-channel `oklch(L C H)` is certainly opaque.
  it("declares --ring and --sidebar-ring as opaque oklch(L C H)", () => {
    const decls = [...CSS.matchAll(/--(?:sidebar-)?ring:\s*([^;]+);/g)].map(
      (m) => m[1].trim()
    )

    expect(decls.length).toBeGreaterThan(0)
    for (const value of decls) {
      expect(value).toMatch(/^oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+\s*\)$/)
    }
  })

  // The theme mapping is the other place an alpha could be added: a
  // `color-mix(..., transparent)` there would thin every `ring-ring` at once.
  it("maps the ring colours straight through to their tokens", () => {
    const mapped = Object.fromEntries(
      [...CSS.matchAll(/--color-((?:sidebar-)?ring):\s*([^;]+);/g)].map((m) => [
        m[1],
        m[2].trim(),
      ])
    )

    expect(mapped).toEqual({
      ring: "var(--ring)",
      "sidebar-ring": "var(--sidebar-ring)",
    })
  })

  it("never thins the ring colour with an opacity modifier", () => {
    // Three spellings of the same colour: the named utility (`ring-ring`), the
    // arbitrary value (`[var(--ring)]`) and v4's variable shorthand
    // (`(--ring)`, `(color:--ring)`), each also via `--color-` or `sidebar-`.
    const token = String.raw`--(?:color-)?(?:sidebar-)?ring`
    const alpha = "\\/[^\\s\"'`]+"
    const modifier = new RegExp(
      [
        String.raw`\b(?:ring|outline|border)-(?:sidebar-)?ring`,
        String.raw`\[(?:color:)?var\(${token}\)\]`,
        String.raw`\((?:color:)?${token}\)`,
      ]
        .map((colour) => colour + alpha)
        .join("|"),
      "g"
    )
    const offenders = sourceFiles(SRC).flatMap((file) =>
      [...readFileSync(file, "utf8").matchAll(modifier)].map(
        (m) => `${file.slice(SRC.length + 1)}: ${m[0]}`
      )
    )

    expect(offenders).toEqual([])
  })
})
