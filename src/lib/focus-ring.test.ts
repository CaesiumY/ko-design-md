import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// The keyboard focus indicator is `--ring`, drawn by `ring-ring` and the base
// `outline-ring`. It once carried `/ 0.4` and its uses added `/30` or `/50` on
// top, so it drew at 12-20% opacity — about 1.4:1 against the page, under the
// 3:1 WCAG 1.4.11 asks of a focus indicator. Nothing failed; it was measured in
// a browser.
//
// These checks are allowlists over the source text, not a CSS parser: they
// catch the ways this codebase could plausibly reintroduce an alpha (on the
// token, its theme mapping, or a use, in any Tailwind or CSS spelling), not
// every string a determined author could write.

const SRC = join(process.cwd(), "src")
const CSS = readFileSync(join(SRC, "styles.css"), "utf8")

function sourceFiles(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.(tsx?|css)$/.test(e.name))
    .filter((e) => !/\.test\.tsx?$/.test(e.name))
    .map((e) => join(e.parentPath, e.name))
}

// The only two line shapes allowed to name the ring colour outside a utility:
// the opaque token itself, and the theme mapping that passes it straight on.
// Whole-line, so nothing can ride along after the `;`.
const TOKEN_LINE =
  /^\s*--(?:sidebar-)?ring:\s*oklch\(\s*[\d.]+%?\s+[\d.]+\s+[\d.]+\s*\);\s*$/
const MAPPING_LINE = /^\s*--color-(sidebar-)?ring:\s*var\(--\1ring\);\s*$/

describe("focus ring opacity", () => {
  // An allowlist, not a search for `/`: an alpha has more spellings than a
  // slash (`#e0402866`, `color-mix(…, transparent)`, `rgb(… / .4)`), and only
  // a bare three-channel `oklch(L C H)` is certainly opaque. Every stylesheet
  // under src/, not just styles.css, so a second sheet can't redeclare it.
  it("declares --ring and --sidebar-ring as opaque oklch(L C H)", () => {
    const decls = sourceFiles(SRC)
      .filter((f) => f.endsWith(".css"))
      .flatMap((f) =>
        [
          ...readFileSync(f, "utf8").matchAll(
            /--(?:sidebar-)?ring:\s*([^;]+);/g
          ),
        ].map((m) => m[1].trim())
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

  // Every word `ring` outside a comment is a candidate — a list of reference
  // spellings would leak (`theme(colors.ring / 30%)` matched none of an
  // earlier list) — and each must be one of the few shapes the site uses.
  // Let through without being a colour use: the `ring-` utility prefixes
  // (`ring-3`, `ring-offset-2`, the `ring-` of `ring-ring`, whose colour half
  // is then checked on its own) and a URL path segment.
  it("only references the ring colour in its plain, opaque forms", () => {
    const blank = (s: string) => s.replace(/[^\n]/g, " ")
    // Only comments that start a line or follow whitespace (or `{` for JSX),
    // so `url(//cdn…)` or a `/*` inside a string isn't read as one.
    const stripComments = (src: string) =>
      src
        .replace(
          /(^|[\s{])(\/\*[\s\S]*?\*\/)/g,
          (_, pre: string, c: string) => pre + blank(c)
        )
        .replace(
          /(^|\s)(\/\/[^\n]*)/gm,
          (_, pre: string, c: string) => pre + blank(c)
        )
    const isAllowed = (text: string, at: number) => {
      const line = text.slice(
        text.lastIndexOf("\n", at) + 1,
        (text.indexOf("\n", at) + 1 || text.length + 1) - 1
      )
      const prev = text.charAt(at - 1)
      const next = text.charAt(at + 4)
      if (TOKEN_LINE.test(line) || MAPPING_LINE.test(line)) return true
      // A `ring-` utility prefix: width, offset, or a colour checked next.
      if (next === "-" && !/[-.]/.test(prev)) return true
      // A path segment (`…/ring`): no colour syntax puts the name after `/`.
      if (prev === "/") return true
      // The plain colour utilities, ended by whitespace, a quote or `;`
      // (@apply) — never `/` (opacity), `-`, `[` or `)`.
      const before = text.slice(Math.max(0, at - 9), at)
      return (
        /(?:^|[^a-z-])(?:ring|outline|border)-$/.test(before) &&
        (next === "" || /[\s"'`;]/.test(next))
      )
    }
    const offenders = sourceFiles(SRC).flatMap((file) => {
      const text = stripComments(readFileSync(file, "utf8"))
      return [...text.matchAll(/(?<![A-Za-z0-9_])ring(?![A-Za-z0-9_])/g)]
        .filter((m) => !isAllowed(text, m.index))
        .map((m) => {
          const around = text.slice(Math.max(0, m.index - 12), m.index + 24)
          return `${file.slice(SRC.length + 1)}: …${around.replace(/\s+/g, " ")}…`
        })
    })

    expect(offenders).toEqual([])
  })
})
