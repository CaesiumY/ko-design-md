import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { classify, fenceComments, fenceRows } from "./token-migration-rules"

const SERVICES = path.resolve(process.cwd(), "services")

interface Counted {
  slug: string
  rowCount: number
  commentCount: number
}

function countCatalog(): Array<Counted> {
  return fs
    .readdirSync(SERVICES)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"))
    .sort()
    .map((f) => {
      const raw = fs.readFileSync(path.join(SERVICES, f), "utf-8")
      const lines = raw.split(/\r?\n/)
      const body = lines.slice(lines.indexOf("---", 1) + 1).join("\n")
      return {
        slug: f.replace(/\.md$/, ""),
        rowCount: fenceRows(body).length,
        commentCount: fenceComments(body).length,
      }
    })
}

const catalog = countCatalog()

describe("token migration classification", () => {
  // The four token sections must stay free of ```yaml fences.
  //
  // Before the migration this file asserted the opposite direction — that all
  // 204 rows the extractor skips had a destination — and that check did its job
  // once. What has to hold from here is that nobody reintroduces a fence: the
  // extractor reads frontmatter now, so a token written back into the body is
  // read by nothing, appears in no sidecar, and fails no other gate.
  it("leaves no token fence in the body", () => {
    const withFences = catalog
      .filter((c) => c.rowCount > 0)
      .map((c) => `${c.slug}: ${c.rowCount}`)
    expect(withFences).toEqual([])
  })

  it("leaves no comment stranded in a body fence", () => {
    // The 151 comment lines the fences used to carry now live in the
    // frontmatter maps. A non-zero count here means a fence came back with
    // commentary that no reader will ever reach.
    const stranded = catalog
      .filter((c) => c.commentCount > 0)
      .map((c) => `${c.slug}: ${c.commentCount}`)
    expect(stranded).toEqual([])
  })

  it("still classifies every row it is given", () => {
    // The rules stay live for the next entry that arrives fence-shaped — an
    // onboarding draft, or a contributor following an older example.
    const rows = [
      { key: "fill-brand", value: "blue-500", section: "Colors" },
      {
        key: "brand-grad",
        value: "linear-gradient(90deg, red, blue)",
        section: "Colors",
      },
      { key: "disabled", value: "0.30", section: "Colors" },
      {
        key: "font-x-src",
        value: "https://example.com/f.css",
        section: "Typography",
      },
    ]
    const resolvable = {
      colors: new Set(["blue-500"]),
      spacing: new Set<string>(),
      rounded: new Set<string>(),
    }
    const kinds = rows.map((r) => classify("unknown-slug", r, resolvable)?.kind)
    expect(kinds).toEqual([
      "reference",
      "catalog-map",
      "catalog-map",
      "catalog-key",
    ])
  })
})
