import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { parse } from "yaml"
import { splitFrontmatter } from "./content-parser"

// The migration wrapped values that were ALREADY quoted in the body fence, so
// the parsed string kept a literal quote at each end — `"…"` where the CSS
// wanted `…`. It shipped: 23 rows across four entries. Nothing caught it,
// because the result is still valid YAML, `fontFamily` is not a sidecar field,
// and the spec linter does not judge font-stack contents.

const QUOTE = String.fromCharCode(34)
const SERVICES = path.resolve(process.cwd(), "services")

// eslint-disable-next-line no-restricted-syntax -- Parsed YAML is untyped at this boundary.
function scalars(value: unknown, out: Array<string>): void {
  if (typeof value === "string") {
    out.push(value)
    return
  }
  if (value && typeof value === "object") {
    for (const inner of Object.values(value)) scalars(inner, out)
  }
}

describe("committed frontmatter values", () => {
  const files = fs
    .readdirSync(SERVICES)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()

  it.each(files)("%s carries no doubly-wrapped scalar", (file) => {
    const raw = fs.readFileSync(path.join(SERVICES, file), "utf-8")
    const split = splitFrontmatter(raw)
    expect(split, `${file} has no frontmatter`).not.toBeNull()
    const values: Array<string> = []
    // eslint-disable-next-line no-restricted-syntax -- ditto: `parse` returns any.
    const parsed: unknown = parse(
      (split as { frontmatter: string }).frontmatter
    )
    scalars(parsed, values)
    // A value that both starts and ends with a quote character was wrapped
    // twice. An inner quote is fine and common — `"Pretendard Variable", …` is
    // exactly how a CSS font stack names a family.
    const wrapped = values.filter(
      (v) => v.length > 1 && v.startsWith(QUOTE) && v.endsWith(QUOTE)
    )
    expect(wrapped).toEqual([])
  })
})
