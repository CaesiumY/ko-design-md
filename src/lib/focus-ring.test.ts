import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// The keyboard focus indicator is `--ring`, drawn by `ring-ring` and the base
// `outline-ring`. It once carried `/ 0.4` and its uses added `/30` or `/50` on
// top, so it drew at 12-20% opacity — about 1.4:1 against the page, under the
// 3:1 WCAG 1.4.11 asks of a focus indicator. Nothing failed; it was measured in
// a browser. These checks keep an alpha from creeping back in through the
// token, its theme mapping, or any use: all three are allowlists, so a new
// spelling of an alpha fails instead of slipping past a list of known ones.

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

  // An allowlist again, for the same reason as the token check: chasing alpha
  // spellings on the use side never ends (`/30`, `/[0.3]`, `(--ring)/30`,
  // `--alpha(var(--color-ring) / 50%)`, `color-mix(…var(--ring)…)`, …). So
  // every reference to the ring colour is found, and each must be one of the
  // few shapes the site actually uses; anything else fails, alpha or not.
  it("only references the ring colour in its plain, opaque forms", () => {
    const reference =
      /--(?:color-)?(?:sidebar-)?ring\b|\b[a-z][a-z-]*-(?:sidebar-)?ring\b/g
    const isAllowed = (text: string, at: number, ref: string) => {
      const line = text.slice(
        text.lastIndexOf("\n", at) + 1,
        (text.indexOf("\n", at) + 1 || text.length + 1) - 1
      )
      const next = text.charAt(at + ref.length)
      // The token and its theme mapping, whose values the tests above pin.
      if (/^\s*--(?:color-)?(?:sidebar-)?ring:/.test(line)) return true
      // The plain utilities, ended by whitespace, a quote or `;` (@apply) —
      // never `/` (opacity), `-` or `[`.
      if (/^(?:ring|outline|border)-ring$/.test(ref)) {
        return next === "" || /[\s"'`;]/.test(next)
      }
      // A file name in a comment (`focus-ring.test.ts`), not a utility.
      return next === "."
    }
    const offenders = sourceFiles(SRC).flatMap((file) => {
      const text = readFileSync(file, "utf8")
      return [...text.matchAll(reference)]
        .filter((m) => !isAllowed(text, m.index, m[0]))
        .map((m) => {
          const around = text.slice(Math.max(0, m.index - 12), m.index + 24)
          return `${file.slice(SRC.length + 1)}: …${around.replace(/\s+/g, " ")}…`
        })
    })

    expect(offenders).toEqual([])
  })
})
