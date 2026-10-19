import { describe, expect, it } from "vitest"
import { readFrontmatter } from "./frontmatter"

/** A document whose frontmatter is `lines`, so a line index in the test reads
 *  as a file line: `---` is line 1 and `lines[0]` is line 2. */
function doc(...lines: Array<string>): string {
  return ["---", ...lines, "---", "", "# Body"].join("\n")
}

function readOk(raw: string) {
  const result = readFrontmatter(raw)
  if (!result.ok)
    throw new Error(`expected a read, got ${result.errors[0]?.message}`)
  return result
}

describe("readFrontmatter", () => {
  it("returns each top-level key's value and its file line", () => {
    const fm = readOk(doc("name: 토스", "slug: toss", "estimated_tokens: 1200"))

    expect(fm.keys.map((k) => [k.key, k.value, k.line])).toEqual([
      ["name", "토스", 2],
      ["slug", "toss", 3],
      ["estimated_tokens", 1200, 4],
    ])
  })

  it("reports a YAML error and the file line it is on instead of values", () => {
    // An unquoted font stack: the second `"` follows a plain scalar's first
    // quoted run, which YAML refuses. Line 4 of the file.
    const result = readFrontmatter(
      doc("name: 토스", "slug: toss", 'font: "Pretendard", sans-serif')
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0].line).toBe(4)
    expect(result.errors[0].message).not.toBe("")
  })

  it("marks a bare `key:` empty and keeps `key: []` an empty list", () => {
    const fm = readOk(doc("name:", "logo: []", "lang: ~", "slug: toss"))

    expect(fm.keys.map((k) => [k.key, k.value, k.empty])).toEqual([
      ["name", null, true],
      ["logo", [], false],
      // Written, if only as YAML's null literal — not the same as nothing.
      ["lang", null, false],
      ["slug", "toss", false],
    ])
  })

  it("reads a value continued on the next line, as YAML does", () => {
    const fm = readOk(doc("name:", "  토스", "slug: toss"))

    expect(fm.keys.map((k) => [k.key, k.value, k.empty])).toEqual([
      ["name", "토스", false],
      ["slug", "toss", false],
    ])
  })

  it("returns the comment that ends a key's line, without its `#`", () => {
    const fm = readOk(
      doc(
        "name: 토스 # brand name",
        "logo: https://getdesign.kr/logos/toss.svg#mark",
        'tagline: "a # b" # quoted value',
        "colors: # palette",
        "  blue-500: oklch(0.620 0.191 258) # #3182F6",
        "slug: toss"
      )
    )

    expect(fm.keys.map((k) => [k.key, k.comment])).toEqual([
      ["name", "brand name"],
      ["logo", undefined],
      ["tagline", "quoted value"],
      ["colors", "palette"],
      ["slug", undefined],
    ])
    expect(fm.keys.find((k) => k.key === "tagline")?.value).toBe("a # b")
  })

  it("returns a token map's rows in source order, with the `## label` rows that open groups", () => {
    const fm = readOk(
      doc(
        "colors:",
        "  ## Brand",
        "  blue-500: oklch(0.620 0.191 258) # #3182F6",
        "  # plain commentary, not a group",
        '  blue-600: "oklch(0.522 0.176 257)"',
        "# flush-left comment keeps the map open",
        "  ## Gray",
        "  gray-50: oklch(0.980 0 0)",
        "slug: toss"
      )
    )
    const colors = fm.keys.find((k) => k.key === "colors")

    expect(colors?.rows).toEqual([
      { kind: "group", label: "Brand", line: 3 },
      {
        kind: "entry",
        key: "blue-500",
        value: "oklch(0.620 0.191 258)",
        source: "oklch(0.620 0.191 258)",
        line: 4,
        empty: false,
        comment: "#3182F6",
        group: "Brand",
      },
      {
        kind: "entry",
        key: "blue-600",
        value: "oklch(0.522 0.176 257)",
        source: '"oklch(0.522 0.176 257)"',
        line: 6,
        empty: false,
        group: "Brand",
      },
      { kind: "group", label: "Gray", line: 8 },
      {
        kind: "entry",
        key: "gray-50",
        value: "oklch(0.980 0 0)",
        source: "oklch(0.980 0 0)",
        line: 9,
        empty: false,
        group: "Gray",
      },
    ])
    expect(fm.keys.find((k) => k.key === "slug")?.rows).toBeUndefined()
  })

  it("returns a nested style's own rows, with the comment on its head line", () => {
    const fm = readOk(
      doc(
        "typography:",
        "  display-1: # hero headline",
        "    fontSize: 56px # 속성명은 스펙 그대로",
        "    fontWeight: 700",
        "  ## Body",
        "  body:",
        "    fontSize: 16px",
        "slug: toss"
      )
    )
    const rows = fm.keys.find((k) => k.key === "typography")?.rows ?? []

    expect(
      rows.map((r) =>
        r.kind === "group"
          ? ["group", r.label]
          : [r.key, r.comment, r.group, r.value]
      )
    ).toEqual([
      [
        "display-1",
        "hero headline",
        undefined,
        { fontSize: "56px", fontWeight: 700 },
      ],
      ["group", "Body"],
      ["body", undefined, "Body", { fontSize: "16px" }],
    ])
    const display = rows.find(
      (r) => r.kind === "entry" && r.key === "display-1"
    )
    expect(
      display?.kind === "entry" &&
        display.rows?.map((r) =>
          r.kind === "entry" ? [r.key, r.value, r.line, r.comment] : r.label
        )
    ).toEqual([
      ["fontSize", "56px", 4, "속성명은 스펙 그대로"],
      ["fontWeight", 700, 5, undefined],
    ])
  })

  it("names a key as it is written, unquoted — `1.0` stays `1.0`", () => {
    const fm = readOk(
      doc('"lang": ko', "spacing:", "  1.0: 4px", "  '050': 2px", "slug: toss")
    )

    expect(fm.keys.map((k) => k.key)).toEqual(["lang", "spacing", "slug"])
    expect(
      fm.keys
        .find((k) => k.key === "spacing")
        ?.rows?.map((r) => (r.kind === "entry" ? r.key : r.label))
    ).toEqual(["1.0", "050"])
  })

  it("fails, at line 1, a document with no frontmatter block", () => {
    const result = readFrontmatter("# Just a body\n")

    expect(result).toEqual({
      ok: false,
      errors: [{ message: expect.stringContaining("frontmatter"), line: 1 }],
    })
  })

  it("fails a block that is not a map of keys", () => {
    const result = readFrontmatter(doc("- name", "- slug"))

    expect(result).toEqual({
      ok: false,
      errors: [{ message: expect.stringContaining("map"), line: 2 }],
    })
  })

  it("counts file lines the same when the file starts with a BOM", () => {
    const bom = String.fromCharCode(0xfeff)
    const fm = readOk(bom + doc("name: 토스", "slug: toss"))

    expect(fm.keys.map((k) => [k.key, k.line])).toEqual([
      ["name", 2],
      ["slug", 3],
    ])
  })

  it("fails, at its key, a value YAML cannot expand within its alias limit", () => {
    const aliases = Array.from({ length: 120 }, () => "*a").join(", ")
    const result = readFrontmatter(
      doc("name: 토스", "anchor: &a [x]", `grid: [${aliases}]`)
    )

    expect(result).toEqual({
      ok: false,
      errors: [{ message: expect.stringContaining("alias"), line: 4 }],
    })
  })

  it("keeps a scalar's exact text beside the value YAML resolves", () => {
    const fm = readOk(
      doc(
        "typography:",
        "  body:",
        "    lineHeight: 1.30 # ratio",
        '    fontFamily: "Pretendard"',
        "colors: # palette",
        "slug: toss"
      )
    )
    const body = fm.keys.find((k) => k.key === "typography")?.rows?.[0]
    const props =
      body?.kind === "entry"
        ? body.rows?.map((r) =>
            r.kind === "entry" ? [r.key, r.value, r.source] : r.label
          )
        : undefined

    expect(props).toEqual([
      ["lineHeight", 1.3, "1.30"],
      ["fontFamily", "Pretendard", '"Pretendard"'],
    ])
    expect(fm.keys.find((k) => k.key === "colors")?.source).toBeUndefined()
    expect(fm.keys.find((k) => k.key === "slug")?.source).toBe("toss")
  })

  it("keeps a date as the text written, not a Date", () => {
    const fm = readOk(doc("last_updated: 2026-10-19"))

    expect(fm.keys[0].value).toBe("2026-10-19")
  })
})
