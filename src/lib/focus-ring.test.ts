import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// The keyboard focus indicator is `--ring`, drawn by `ring-ring` and the base
// `outline-ring`. It once carried `/ 0.4` and its uses added `/30` or `/50` on
// top, so it drew at 12-20% opacity — about 1.4:1 against the page, under the
// 3:1 WCAG 1.4.11 asks of a focus indicator. Nothing failed; it was measured in
// a browser. These checks keep any alpha from creeping back in by either path.

const SRC = join(process.cwd(), "src")

function sourceFiles(dir: string): Array<string> {
  return readdirSync(dir, { withFileTypes: true, recursive: true })
    .filter((e) => e.isFile() && /\.(tsx?|css)$/.test(e.name))
    .filter((e) => !/\.test\.tsx?$/.test(e.name))
    .map((e) => join(e.parentPath, e.name))
}

describe("focus ring opacity", () => {
  it("declares --ring and --sidebar-ring without an alpha", () => {
    const css = readFileSync(join(SRC, "styles.css"), "utf8")
    const decls = [...css.matchAll(/--(?:sidebar-)?ring:\s*([^;]+);/g)].map(
      (m) => m[1].trim()
    )

    expect(decls.length).toBeGreaterThan(0)
    for (const value of decls) expect(value).not.toMatch(/\//)
  })

  it("never thins the ring colour with an opacity modifier", () => {
    const offenders = sourceFiles(SRC).flatMap((file) =>
      [
        ...readFileSync(file, "utf8").matchAll(
          /\b(?:ring|outline|border)-ring\/\d+/g
        ),
      ].map((m) => `${file.slice(SRC.length + 1)}: ${m[0]}`)
    )

    expect(offenders).toEqual([])
  })
})
