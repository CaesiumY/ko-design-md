import { describe, expect, it } from "vitest"
import { lint } from "@google/design.md/linter"
import { REQUIRED_SECTIONS, validateDraft } from "./draft-validator"
import { findKey, readFrontmatter } from "./frontmatter"
import { FRONTMATTER_MAPS } from "./frontmatter-map-table"
import type { FrontmatterMapTraits } from "./frontmatter-map-table"
import type { DraftValidationOptions } from "./draft-validator"

// ── fixture ──────────────────────────────────────────────────────────────────
// A minimal draft that satisfies every block rule: full frontmatter, all 10
// Stitch sections in order, public References, citations in range,
// OKLCH-only yaml token values.

const SOURCES = [
  "https://example.com/design-system",
  "https://example.com/blog/colors",
]

interface FixtureOverrides {
  frontmatter?: string
  /** A ```yaml spec fence for ## Components. Its rows are nested under
   *  `button:` on the way in (see `nestUnderComponent`), so write them flat. */
  specFence?: string
  body?: (sections: string) => string
  dropSection?: string
  duplicateSection?: string
  swapSections?: [string, string]
}

function nestUnderComponent(fence: string): string {
  const [open, ...rest] = fence.split("\n")
  if (!/^```ya?ml$/.test(open)) return fence
  const rows = rest.map((l) => (l.startsWith("```") ? l : `  ${l}`))
  return [open, "button:", ...rows].join("\n")
}

function makeDraft(overrides: FixtureOverrides = {}): string {
  const frontmatter =
    overrides.frontmatter ??
    [
      "---",
      "name: 데모",
      "slug: demo",
      "category: finance",
      'last_updated: "2026-07-03"',
      'created_at: "2026-07-03"',
      "lang: ko",
      "logo: https://getdesign.kr/logos/demo.png",
      // A token map the official linter resolves — `validateDraft` runs it
      // (#421), and a document it reads nothing from is blocked.
      "colors:",
      "  primary: oklch(0.62 0.19 258)   # #3182F6",
      "typography:",
      "  body:",
      "    fontSize: 16px",
      "    fontWeight: 400",
      "---",
    ].join("\n")

  // A component spec under Components, in the shape a valid entry carries it:
  // a `text` fence, which readers see and the spec linter does not (#421). A
  // test that passes its own ```yaml `specFence` gets the rows the token rules
  // still scan — and, now that the entry file is the published standard
  // DESIGN.md, a `body-yaml-fence` block alongside. Rows are nested under a
  // component name on the way in.
  const specFence = nestUnderComponent(
    overrides.specFence ??
      [
        "```text",
        "button:",
        "  primary: oklch(0.62 0.19 258)   # #3182F6 — 원본 대조값",
        "  surface: oklch(0.98 0.005 250)",
        "```",
      ].join("\n")
  )

  const sectionBody: Record<string, string> = {
    "Brand & Style": "브랜드는 절제된 톤을 쓴다 [src:1]. 두 번째 문장이다.",
    Colors: "팔레트는 OKLCH로 관리한다 [src:2]. 두 번째 문장이다.",
    Typography: "본문은 Pretendard Variable을 쓴다 [src:1]. 두 번째 문장이다.",
    Spacing: "4px 그리드를 따른다 [src:1]. 두 번째 문장이다.",
    Rounded: "카드 radius는 16px다 [src:1]. 두 번째 문장이다.",
    "Elevation & Depth": "그림자는 1단계만 쓴다 [src:1]. 두 번째 문장이다.",
    Shapes: "기하학적 형태를 유지한다 [src:1]. 두 번째 문장이다.",
    Components: `주요 컴포넌트는 버튼이다 [src:2]. 두 번째 문장이다.\n\n${specFence}`,
    "Do's and Don'ts": "- Do: 절제된 색 사용 [src:1]\n- Don't: 임의 색 추가",
    References: SOURCES.map((u, i) => `${i + 1}. ${u} — 설명`).join("\n"),
  }

  let names: Array<string> = [...REQUIRED_SECTIONS]
  if (overrides.dropSection) {
    names = names.filter((n) => n !== overrides.dropSection)
  }
  if (overrides.swapSections) {
    const [a, b] = overrides.swapSections
    const ia = names.indexOf(a)
    const ib = names.indexOf(b)
    ;[names[ia], names[ib]] = [names[ib], names[ia]]
  }
  if (overrides.duplicateSection) {
    names.push(overrides.duplicateSection)
  }

  const sections = names
    .map((n) => `## ${n}\n\n${sectionBody[n] ?? "채움 문장이다."}`)
    .join("\n\n")

  const body = overrides.body ? overrides.body(sections) : sections
  return `${frontmatter}\n\n# 데모 — design.md\n\n> 데모 태그라인이다.\n\n${body}\n`
}

const OPTS: DraftValidationOptions = {
  filePath: "/services/demo.md",
  expectedSlug: "demo",
  expectedLogoUrl: "https://getdesign.kr/logos/demo.png",
}

function rulesOf(
  raw: string,
  opts: DraftValidationOptions = OPTS,
  severity?: "block" | "warn"
): Array<string> {
  return validateDraft(raw, opts)
    .issues.filter((i) => !severity || i.severity === severity)
    .map((i) => i.rule)
}

// ── happy path ───────────────────────────────────────────────────────────────

describe("validateDraft — valid draft", () => {
  it("passes a fully valid draft with zero block issues", () => {
    const result = validateDraft(makeDraft(), OPTS)
    expect(result.issues.filter((i) => i.severity === "block")).toEqual([])
    expect(result.passed).toBe(true)
  })

  it("allows non-standard extra sections between standard ones (ordered subsequence)", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Components",
          "## Patterns — 페이지 UI 킷\n\n비표준 섹션이다 [src:1].\n\n## Components"
        ),
    })
    expect(rulesOf(raw, OPTS, "block")).toEqual([])
  })

  it("exempts trailing `# hex` comments after an OKLCH token value", () => {
    // krds convention: `gray-5: oklch(0.985 0 0)  # #FAFAFA`
    const raw = draftWithFrontmatterColors([
      "gray-5: oklch(0.985 0 0)          # #FAFAFA",
    ])
    expect(rulesOf(raw, OPTS, "block")).toEqual([])
  })

  it("does not warn for prose hex when the same line carries an oklch conversion", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n\n공식 그린 #00C01E (≈ oklch(0.7 0.2 150))를 대조값으로 둔다 [src:1].`,
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("hex-in-prose")
  })
})

// ── frontmatter block rules ──────────────────────────────────────────────────

describe("validateDraft — frontmatter", () => {
  it("blocks a malformed frontmatter fence, and judges nothing else in it", () => {
    const raw = makeDraft().replace(/\n---\n/, "\n") // drop closing fence
    expect(rulesOf(raw, OPTS, "block")).toEqual(["frontmatter-yaml-invalid"])
  })

  it("blocks an off-enum category", () => {
    const raw = makeDraft().replace("category: finance", "category: fintech")
    expect(rulesOf(raw, OPTS, "block")).toContain("bad-category")
  })

  it("blocks a missing last_updated", () => {
    const raw = makeDraft().replace('last_updated: "2026-07-03"\n', "")
    expect(rulesOf(raw, OPTS, "block")).toContain("missing-last-updated")
  })

  it("blocks a missing created_at — it is the catalog's sort key, not decoration", () => {
    const raw = makeDraft().replace('created_at: "2026-07-03"\n', "")
    expect(rulesOf(raw, OPTS, "block")).toContain("missing-created-at")
  })

  it("warns when created_at is after last_updated — an entry cannot be added after it was last synced", () => {
    const raw = makeDraft().replace(
      'created_at: "2026-07-03"',
      'created_at: "2026-07-04"'
    )
    expect(rulesOf(raw, OPTS, "warn")).toContain(
      "created-at-after-last-updated"
    )
  })

  it("accepts created_at equal to last_updated — the normal shape for a brand-new entry", () => {
    expect(rulesOf(makeDraft(), OPTS, "warn")).not.toContain(
      "created-at-after-last-updated"
    )
  })

  it("does not warn on the ordering when either date is absent", () => {
    const raw = makeDraft().replace('created_at: "2026-07-03"\n', "")
    expect(rulesOf(raw, OPTS, "warn")).not.toContain(
      "created-at-after-last-updated"
    )
  })

  it("blocks a slug that differs from the expected slug", () => {
    const raw = makeDraft().replace("slug: demo", "slug: other")
    expect(rulesOf(raw, OPTS, "block")).toContain("slug-arg-mismatch")
  })

  // docs/adr/0004 — an unknown key only warns, but `sources` coming back
  // restores the duplicate list the removal was for (Codex review on #364).
  it("blocks the retired frontmatter sources list", () => {
    const raw = makeDraft().replace(
      "lang: ko",
      "sources:\n  - https://example.com/design-system\nlang: ko"
    )
    expect(rulesOf(raw, OPTS, "block")).toContain("retired-frontmatter-key")
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("unknown-frontmatter-key")
  })

  // Codex review round 3: `"sources":` is valid YAML the site parser ignores.
  it("blocks the retired key in its quoted spellings too", () => {
    // Codex review round 6: an escaped spelling YAML resolves to `sources`.
    for (const key of ['"sources"', "'sources'", '"sour\\u0063es"']) {
      const raw = makeDraft().replace(
        "lang: ko",
        `${key}:\n  - https://example.com/design-system\nlang: ko`
      )
      expect(rulesOf(raw, OPTS, "block"), key).toContain(
        "retired-frontmatter-key"
      )
    }
  })

  // The site publishes `_`-prefixed entry files; the catalog checks used to
  // skip them. Now the prefix blocks.
  it("blocks an entry file whose name starts with an underscore", () => {
    const raw = makeDraft()
    const opts = { ...OPTS, filePath: "/services/_demo.md" }
    expect(rulesOf(raw, opts, "block")).toContain("underscore-entry-file")
    expect(rulesOf(raw, OPTS, "block")).not.toContain("underscore-entry-file")
  })

  // docs/adr/0001-korean-design-md-only.md — `en` used to pass this rule.
  it("blocks any lang other than ko", () => {
    const raw = makeDraft().replace("lang: ko", "lang: en")
    expect(rulesOf(raw, OPTS, "block")).toContain("bad-lang")
  })

  it("blocks when the expected logo URL is missing or downgraded", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png",
      "logo: /logos/demo.png"
    )
    expect(rulesOf(raw, OPTS, "block")).toContain("expected-logo-mismatch")
  })

  // A catalog entry always carries a logo — the grid card and the OG image
  // both have a slot for it, and the pipeline no longer lets one be skipped.
  it("blocks a draft with no logo, with or without an expected logo", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png\n",
      ""
    )
    expect(raw).not.toContain("logo:")
    for (const opts of [OPTS, { ...OPTS, expectedLogoUrl: undefined }]) {
      const blocks = rulesOf(raw, opts, "block")
      expect(blocks).toContain("missing-logo")
      expect(blocks).not.toContain("expected-logo-mismatch")
    }
  })

  it("reports an empty `logo:` value as missing-logo, not as a URL-form error", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png",
      "logo:"
    )
    for (const opts of [OPTS, { ...OPTS, expectedLogoUrl: undefined }]) {
      const blocks = rulesOf(raw, opts, "block")
      expect(blocks).toContain("missing-logo")
      expect(blocks).not.toContain("logo-url-form")
      expect(blocks).not.toContain("expected-logo-mismatch")
    }
  })

  it("exempts a slug whose logo was removed by a takedown", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png\n",
      ""
    )
    const opts = { ...OPTS, logoTakedowns: new Set(["demo"]) }
    expect(rulesOf(raw, opts, "block")).not.toContain("missing-logo")
    const other = { ...OPTS, logoTakedowns: new Set(["toss"]) }
    expect(rulesOf(raw, other, "block")).toContain("missing-logo")
  })

  // The takedown procedure removes the `logo:` line. An exempt slug that
  // leaves an empty one behind is still a `logo` key, and the site's build
  // refuses a key it reads with no value.
  it("blocks an exempt slug's empty `logo:` line — only an absent key is exempt", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png",
      "logo:"
    )
    const opts = {
      ...OPTS,
      expectedLogoUrl: undefined,
      logoTakedowns: new Map([["demo", "#123"]]),
    }
    expect(rulesOf(raw, opts, "block")).toEqual(["takedown-logo-declared"])
  })

  // A taken-down entry that writes `logo` in any form has one cause, and the
  // fix does not depend on the form: drop the line, or — when the caller
  // names the expected logo, so a restore was decided — write that value and
  // take the slug off LOGO_TAKEDOWNS (the logo-policy test blocks a listed
  // slug that declares a logo). Every form is the one rule with that one
  // message, and the draft it describes passes (#492 review, #589).
  it("tells every logo form on a taken-down slug the takedown's one fix", () => {
    const logo = "logo: https://getdesign.kr/logos/demo.png"
    const url = logo.slice("logo: ".length)
    const takedown = {
      ...OPTS,
      expectedLogoUrl: undefined,
      logoTakedowns: new Set(["demo"]),
    }
    const expectsLogo = { ...takedown, expectedLogoUrl: url }
    const forms = [
      "logo:",
      logo,
      `"logo": ${url}`,
      `logo: "${url}" # x`,
      `logo:\n  - ${url}`,
      `logo: [${url}]`,
      "logo: []",
    ]
    const rule = "takedown-logo-declared"
    for (const line of forms) {
      const raw = makeDraft().replace(logo, line)
      for (const opts of [takedown, expectsLogo]) {
        const blocks = validateDraft(raw, opts).issues.filter(
          (i) => i.severity === "block"
        )
        const label = `${line} / ${opts.expectedLogoUrl ?? "no expected logo"}`
        expect(
          blocks.map((i) => i.rule),
          label
        ).toEqual([rule])
        // A form may run over several lines (`logo:\n  - url`); the fix
        // covers all of them, or what is left reads as the line above's.
        expect(blocks[0].fix, label).toContain("every line of its value")
        // Apply the fix to this form's draft, and the next run passes.
        if (opts.expectedLogoUrl) {
          expect(blocks[0].fix, label).toContain(`\`${logo}\``)
          expect(blocks[0].fix, label).toContain("LOGO_TAKEDOWNS")
          const restored = { ...opts, logoTakedowns: new Set<string>() }
          expect(
            rulesOf(raw.replace(line, logo), restored, "block"),
            label
          ).toEqual([])
        } else {
          expect(blocks[0].fix, label).toContain("remove")
          expect(
            rulesOf(raw.replace(`${line}\n`, ""), opts, "block"),
            label
          ).toEqual([])
        }
      }
    }
    const dropped = makeDraft().replace(`${logo}\n`, "")
    // An absent line is the takedown itself — unless the caller expects the
    // logo back, when the restore is the same one fix.
    const absent = validateDraft(dropped, expectsLogo).issues.filter(
      (i) => i.severity === "block"
    )
    expect(absent.map((i) => i.rule)).toEqual(["expected-logo-mismatch"])
    expect(absent[0].fix).toContain("LOGO_TAKEDOWNS")
    // No key to replace: the restore adds the line.
    expect(absent[0].fix).toContain(`add \`${logo}\``)
    expect(absent[0].fix).not.toContain("replace")
    const added = dropped.replace("lang: ko", `lang: ko\n${logo}`)
    const restored = { ...expectsLogo, logoTakedowns: new Set<string>() }
    expect(rulesOf(added, restored, "block")).toEqual([])
  })

  // Which entry is taken down is the caller's expected slug when it gives
  // one — `slug-arg-mismatch` holds the written slug to it — and the logo is
  // judged from the key as written, so neither a wrong slug line nor an
  // unrelated refused value hides the takedown for a run (#494 Codex).
  it("finds a takedown by the expected slug and without a built document", () => {
    const takedown = {
      ...OPTS,
      expectedLogoUrl: undefined,
      logoTakedowns: new Set(["demo"]),
    }
    const wrongSlug = makeDraft().replace("slug: demo", "slug: other")
    expect(rulesOf(wrongSlug, takedown, "block")).toContain(
      "takedown-logo-declared"
    )
    // The converse: the written slug names a taken-down entry, the caller's
    // does not — the logo stays.
    const other = { ...takedown, logoTakedowns: new Set(["other"]) }
    expect(rulesOf(wrongSlug, other, "block")).not.toContain(
      "takedown-logo-declared"
    )
    const unbuilt = makeDraft().replace(
      'last_updated: "2026-07-03"',
      'last_updated: "2026-02-30"'
    )
    const blocks = rulesOf(unbuilt, takedown, "block")
    expect(blocks).toContain("frontmatter-parse")
    expect(blocks).toContain("takedown-logo-declared")
  })

  it("finds a takedown when the slug key is cut at a doubled colon", () => {
    // `slug:: demo` is the unknown key `slug:` to YAML, so the entry's slug
    // is its file name — still `demo`, still taken down, and the absent logo
    // is the takedown itself. The cut key is its own block (#589).
    const raw = makeDraft()
      .replace("logo: https://getdesign.kr/logos/demo.png\n", "")
      .replace("slug: demo", "slug:: demo")
    const opts = {
      ...OPTS,
      expectedLogoUrl: undefined,
      logoTakedowns: new Set(["demo"]),
    }
    expect(rulesOf(raw, opts, "block")).toEqual(["colon-cut-frontmatter-key"])
  })

  it("blocks a malformed logo URL even without an expected logo", () => {
    const raw = makeDraft().replace(
      "logo: https://getdesign.kr/logos/demo.png",
      "logo: https://example.com/logo.jpg"
    )
    const opts = { ...OPTS, expectedLogoUrl: undefined }
    expect(rulesOf(raw, opts, "block")).toContain("logo-url-form")
  })

  it("warns on unknown frontmatter keys", () => {
    const raw = makeDraft().replace("lang: ko", "lang: ko\nlast-updated: typo")
    expect(rulesOf(raw, OPTS, "warn")).toContain("unknown-frontmatter-key")
  })

  // A quoted top-level key is the key YAML reads, so it is judged like a bare
  // one (#447 found a bare scan that never saw it).
  it("warns on an unknown key in its quoted spellings too", () => {
    for (const key of ['"notes"', "'notes'", '"not\\u0065s"']) {
      const raw = makeDraft().replace("lang: ko", `lang: ko\n${key}: draft`)
      const issue = validateDraft(raw, OPTS).issues.find(
        (i) => i.rule === "unknown-frontmatter-key"
      )
      expect(issue?.severity, key).toBe("warn")
      expect(issue?.fix, key).toContain("`notes`")
    }
  })

  it("warns once on a key YAML resolves to another spelling", () => {
    // `True:` resolves to the key `true`. The bare scan is a fallback for a
    // block YAML cannot parse; running it on a clean one named the key twice.
    const raw = makeDraft().replace("lang: ko", "lang: ko\nTrue: x")
    const warns = rulesOf(raw, OPTS, "warn").filter(
      (r) => r === "unknown-frontmatter-key"
    )
    expect(warns).toHaveLength(1)
  })

  it("names the key as the file spells it, not as YAML resolves it", () => {
    // `True:` and `0x1F:` resolve to `true` and `31` — strings the author
    // cannot find by searching the file. A quoted key is named unquoted.
    for (const [written, named] of [
      ["True", "True"],
      ["0x1F", "0x1F"],
      ['"notes"', "notes"],
    ]) {
      const raw = makeDraft().replace("lang: ko", `lang: ko\n${written}: x`)
      const issue = validateDraft(raw, OPTS).issues.find(
        (i) => i.rule === "unknown-frontmatter-key"
      )
      expect(issue?.fix, written).toContain(`\`${named}\``)
    }
  })

  it("leaves a known key alone however it is quoted", () => {
    const raw = makeDraft().replace("lang: ko", '"lang": ko')
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("unknown-frontmatter-key")
  })

  it("blocks an empty design_system_name", () => {
    // The site would show no name while YAML consumers get an empty string
    // or null.
    for (const to of [
      'design_system_name: ""',
      "design_system_name:",
      'design_system_name: " "',
    ]) {
      const raw = makeDraft().replace("name: 데모", `name: 데모\n${to}`)
      expect(rulesOf(raw, OPTS, "block"), to).toEqual([
        "bad-design-system-name",
      ])
    }
    const named = makeDraft().replace(
      "name: 데모",
      "name: 데모\ndesign_system_name: 데모 DS"
    )
    expect(rulesOf(named, OPTS, "block")).toEqual([])
  })

  // The catalog index writes the name as `: category · {name} — tagline`, and
  // a reader ends the name at the first ` — ` (#466). A name holding ` — `
  // there would be cut short — and before this rule only `pnpm test` noticed,
  // after the pipeline had passed the draft.
  it("blocks a design_system_name the catalog index would cut at its ` — `", () => {
    const withName = (value: string): string =>
      makeDraft().replace(
        "name: 데모",
        `name: 데모\ndesign_system_name: ${value}`
      )
    for (const value of [
      "Foo — Bar UI",
      "Foo —",
      "— Foo",
      "Foo  —  Bar",
      "Foo — — Bar",
    ]) {
      expect(rulesOf(withName(value), OPTS, "block"), value).toEqual([
        "design-system-name-separator",
      ])
    }
    // A dash the index does not split on is the name's own business.
    for (const value of ["Foo—Bar", "Foo - Bar", "Foo – Bar", "Foo (Bar)"]) {
      expect(rulesOf(withName(value), OPTS, "block"), value).toEqual([])
    }
  })

  // Checked by applying the hint, not by reading it (the convention the list
  // hints below follow). The hint is built from the value with its quotes
  // stripped, and written back bare it could be invalid YAML (`Foo: - Bar`), a
  // list (`- Foo`, `[Foo]`), an alias, or quietly shorter (`Foo - #1` loses
  // `#1` to a comment and still passes) — so each applied line is also read
  // back, and must give the whole name (#508 review).
  it("tells a cut design_system_name a fix the next run accepts", () => {
    // [the value as written in the draft, the line the hint offers]
    const cases: Array<[string, string | null]> = [
      ["Foo — Bar UI", "design_system_name: Foo - Bar UI"],
      ["— Foo", "design_system_name: Foo"],
      ["Foo —", "design_system_name: Foo"],
      ["Foo — — Bar", "design_system_name: Foo - - Bar"],
      ['"Foo: — Bar"', 'design_system_name: "Foo: - Bar"'],
      ['"Foo — #1"', 'design_system_name: "Foo - #1"'],
      ["— - Foo", 'design_system_name: "- Foo"'],
      ["— [Foo]", 'design_system_name: "[Foo]"'],
      ["— *x", 'design_system_name: "*x"'],
      // Needs quoting yet holds both kinds of quote mark, so no one line
      // reads back as it; the marks are dropped instead.
      [`— [a] "b" 'c'`, 'design_system_name: "[a] b c"'],
      // Dropping the marks frees a dash that was quoted; it is dealt with too,
      // or the offered line would be blocked by this same rule.
      [`— [a] "—" 'c'`, 'design_system_name: "[a] - c"'],
      [`— [a] 'b' "—"`, 'design_system_name: "[a] b"'],
      ["—", null],
      // What is left does not show (a zero-width space, a Hangul filler), so
      // offering it as the name would be blocked next as blank.
      [`${String.fromCharCode(0x200b)} —`, null],
      [`— ${String.fromCharCode(0x3164)}`, null],
    ]
    for (const [value, offered] of cases) {
      const line = `design_system_name: ${value}`
      const raw = makeDraft().replace("name: 데모", `name: 데모\n${line}`)
      expect(rulesOf(raw, OPTS, "block"), value).toEqual([
        "design-system-name-separator",
      ])
      const fix = validateDraft(raw, OPTS).issues.find(
        (i) => i.rule === "design-system-name-separator"
      )?.fix
      expect(fix, value).toContain(
        offered === null ? "remove the line" : `\`${offered}\``
      )
      const fixed =
        offered === null
          ? raw.replace(`\n${line}`, "")
          : raw.replace(line, offered)
      expect(rulesOf(fixed, OPTS, "block"), value).toEqual([])
      // The applied line reads back as the whole name, not a cut one.
      if (offered !== null) {
        const name = /^design_system_name: (["']?)(.*)\1$/.exec(offered)?.[2]
        const read = readFrontmatter(fixed)
        const written = read.ok
          ? findKey(read.keys, "design_system_name")?.value
          : undefined
        expect(written, value).toBe(name)
      }
    }
  })

  // The cases above are shapes reviews found one round at a time. This holds
  // the property itself: for any name this rule blocks, applying its hint as
  // written leaves nothing blocked. Names are drawn, deterministically, as
  // words YAML treats specially — drawn by word, not by
  // character, because the shapes that matter (a quoted dash beside both kinds
  // of quote mark) almost never come out of single characters.
  //
  // The cost is inherent: a full `validateDraft` (official linter included) for
  // each drawn name, and again for each applied hint. Inside a full local
  // `pnpm test` on Windows it twice crossed vitest's 5s default (6.7s and 5.2s,
  // 2026-10-18) while passing alone. Drawing fewer names would weaken the
  // property, so the limit is raised instead (the last argument).
  it("offers a hint the next run accepts for any name it blocks", () => {
    const backslash = String.fromCharCode(92)
    const vocabulary = [
      "—",
      "—",
      "-",
      "[a]",
      "{b}",
      '"—"',
      "'—'",
      '"x"',
      "'y'",
      "a:",
      "#1",
      "*x",
      "&y",
      "!t",
      "|",
      ">",
      "@z",
      `b${backslash}c`,
      `d${backslash}`,
      "Foo",
    ]
    // mulberry32: 32-bit integer arithmetic throughout. A textbook LCG written
    // with plain `*` overflows 2^53 here and loses its low bits, and the draws
    // collapse onto a few values — the first version of this test never once
    // produced a name with both kinds of quote mark.
    let seed = 466
    const next = (n: number): number => {
      seed = (seed + 0x6d2b79f5) | 0
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) % n
    }
    let tried = 0
    let unquoted = 0
    for (let i = 0; i < 800 && tried < 200; i++) {
      const words = Array.from(
        { length: 2 + next(4) },
        () => vocabulary[next(vocabulary.length)]
      )
      // Half the names open with the dash: a draft line is valid YAML only
      // when the name starts with a plain character, and the shapes the hint
      // has to rescue — quoting needed, both quote marks present — mostly sit
      // behind a leading dash.
      if (next(2) === 0) words.unshift("—")
      else if (!words.includes("—")) {
        words.splice(next(words.length + 1), 0, "—")
      }
      const line = `design_system_name: ${words.join(" ")}`
      const raw = makeDraft().replace("name: 데모", `name: 데모\n${line}`)
      // Only names that reach this rule alone: ones that are invalid YAML or
      // misread to begin with have their own block and their own fix. One run
      // gives both the verdict and the hint.
      const blocks = validateDraft(raw, OPTS).issues.filter(
        (issue) => issue.severity === "block"
      )
      const rules = blocks.map((issue) => issue.rule)
      if (rules.join() !== "design-system-name-separator") continue
      tried++
      const fix = blocks[0].fix
      if (fix.includes("without its quote marks")) unquoted++
      const offered = /as `(design_system_name: .*)`\.?$/.exec(fix)?.[1]
      const fixed =
        offered === undefined
          ? raw.replace(`\n${line}`, "")
          : raw.replace(line, offered)
      if (offered === undefined) expect(fix, line).toContain("remove the line")
      expect(rulesOf(fixed, OPTS, "block"), `${line}\n→ ${fix}`).toEqual([])
    }
    // Not a count to keep: only that enough names reached the rule for the
    // property to have been exercised.
    expect(tried).toBeGreaterThan(30)
    // And the rescue branch — quote marks dropped — was reached too, or the
    // property would hold only for the easy shapes (#508 review: a quoted dash
    // freed by that branch was the defect the hand-picked cases missed).
    expect(unquoted).toBeGreaterThan(3)
  }, 30_000)

  // Every consumed key holds one value. A list used to reach each field
  // rule, whose message then contradicted itself: "slug
  // `demo` differs from the expected `demo`", "lang `ko` must be exactly
  // `ko`", or "logo is missing" (#454 review, sixth and seventh rounds).
  // `[]` means no value. Each hint must name the one fix the next run accepts
  // — checked by applying it, not by reading the wording (#488 final review;
  // #492 review found "remove the line" for `slug`, which the pipeline then
  // reads as the file name `draft`). Run as the skill pipeline runs it.
  it("tells an explicit empty list the fix the next run accepts", () => {
    const pipeline: DraftValidationOptions = {
      ...OPTS,
      filePath: "/cache/demo/draft.md",
      expectedLogoUrl: undefined,
    }
    const hintFor = (
      raw: string,
      opts: DraftValidationOptions
    ): string | undefined =>
      validateDraft(raw, opts).issues.find(
        (i) => i.rule === "list-frontmatter-value"
      )?.fix
    const logo = "logo: https://getdesign.kr/logos/demo.png"

    // Keys an entry may leave out: the hint says drop the line, and the
    // draft without it passes.
    for (const line of ["estimated_tokens: []", "design_system_name: []"]) {
      const withLine = makeDraft().replace("lang: ko", `lang: ko\n${line}`)
      expect(hintFor(withLine, pipeline), line).toContain("remove the line")
      // Apply the hint to the draft that got it, and check that is what ran.
      const fixed = withLine.replace(`\n${line}`, "")
      expect(fixed, line).not.toContain(line)
      expect(rulesOf(fixed, pipeline, "block"), line).toEqual([])
    }
    // Required keys: the hint asks for the value, and the draft with it
    // passes. Dropping the line blocks again where a machine rule judges the
    // key (a pipeline slug reads as `draft`; the dates; the logo); `name`,
    // `category` and `lang` fall back to a default the gate accepts, so only
    // the design-md rubric's required keys keep them out of the drop hint.
    const required: Array<[string, string, boolean]> = [
      ["slug: demo", "slug: []", true],
      ['last_updated: "2026-07-03"', "last_updated: []", true],
      ['created_at: "2026-07-03"', "created_at: []", true],
      [logo, "logo: []", true],
      ["name: 데모", "name: []", false],
      ["category: finance", "category: []", false],
      ["lang: ko", "lang: []", false],
    ]
    for (const [value, empty, gateBlocksDrop] of required) {
      const fix = hintFor(makeDraft().replace(value, empty), pipeline)
      expect(fix, empty).not.toContain("remove")
      expect(fix, empty).toContain("every entry gives")
      if (gateBlocksDrop) {
        const dropped = makeDraft().replace(`${value}\n`, "")
        expect(rulesOf(dropped, pipeline, "block"), empty).not.toEqual([])
      }
    }
    // Writing each value back gives the base draft, and it passes as run.
    expect(rulesOf(makeDraft(), pipeline, "block")).toEqual([])
    // A taken-down logo has the takedown's own fix, in every form (`[]` and
    // filled lists included) — "tells every logo form on a taken-down slug".
  })

  it("blocks a list where one value belongs, once, for every consumed key", () => {
    const noLogoArg = { ...OPTS, expectedLogoUrl: undefined }
    for (const [from, to] of [
      ["name: 데모", "name: [데모]"],
      ["name: 데모", "name:\n  - 데모"],
      ["name: 데모", "name: 데모\ndesign_system_name: [데모 DS]"],
      ["slug: demo", "slug: [demo]"],
      ["category: finance", "category: [finance]"],
      ["lang: ko", "lang: [ko]"],
      ['last_updated: "2026-07-03"', 'last_updated: ["2026-07-03"]'],
      ['created_at: "2026-07-03"', 'created_at: ["2026-07-03"]'],
      // `[1200]` would be a misread — numbers to YAML, text to the site.
      ["lang: ko", "lang: ko\nestimated_tokens: [many]"],
      [
        "logo: https://getdesign.kr/logos/demo.png",
        "logo: [https://getdesign.kr/logos/demo.png]",
      ],
      // An explicit `[]` is a list to YAML, unlike a bare `key:` (null), even
      // where the site reads both as no value (#488 local review).
      ["name: 데모", "name: []"],
      ["slug: demo", "slug: []"],
      ["lang: ko", "lang: ko\nestimated_tokens: []"],
    ]) {
      const raw = makeDraft().replace(from, to)
      expect(rulesOf(raw, noLogoArg, "block"), to).toEqual([
        "list-frontmatter-value",
      ])
    }
  })

  it("does not blame a missing name for a list slug", () => {
    // Without a `name:` line the site names the entry by its slug — here the
    // list — and the slug's own block is the one message.
    const raw = makeDraft()
      .replace("name: 데모\n", "")
      .replace("slug: demo", "slug: [demo]")
    expect(rulesOf(raw, OPTS, "block")).toEqual(["list-frontmatter-value"])
  })

  it("blocks an empty name", () => {
    // A bare `name:` is YAML's null, which the site's build refuses, and the
    // catalog sorts and titles by the name as text.
    // Whitespace alone is empty too: the card and title would show
    // nothing — as they would for a zero-width
    // space, a Hangul filler or the blank braille pattern, which `trim()`
    // keeps (the last two are a letter and a symbol to Unicode).
    const zeroWidth = String.fromCharCode(0x200b)
    const hangulFiller = String.fromCharCode(0x3164)
    const brailleBlank = String.fromCharCode(0x2800)
    // A symbol outside the BMP (#488 review): MUSICAL SYMBOL NULL NOTEHEAD.
    const nullNotehead = String.fromCodePoint(0x1d159)
    for (const to of [
      'name: ""',
      "name:",
      'name: "   "',
      `name: "${zeroWidth}"`,
      `name: "${hangulFiller}"`,
      `name: "${brailleBlank}"`,
      `name: "${nullNotehead}"`,
    ]) {
      const raw = makeDraft().replace("name: 데모", to)
      expect(rulesOf(raw, OPTS, "block"), to).toEqual(["bad-name"])
    }
    // A name with a visible character among them still passes.
    const padded = makeDraft().replace("name: 데모", `name: "${zeroWidth}데모"`)
    expect(rulesOf(padded, OPTS, "block")).toEqual([])
  })

  it("shows a blank name's invisible characters by code point", () => {
    // A zero-width space prints as nothing, so the message would read
    // `(got "")` — an empty string the file does not have.
    const zeroWidth = String.fromCharCode(0x200b)
    const raw = makeDraft().replace("name: 데모", `name: "${zeroWidth}"`)
    const issue = validateDraft(raw, OPTS).issues.find(
      (i) => i.rule === "bad-name"
    )
    expect(issue?.fix).toContain("U+200B")
    expect(issue?.fix).toContain("visible character")
  })

  it("lets a bare estimated_tokens through as no count", () => {
    // YAML reads null — no value, and the site falls back to its own
    // estimate rather than failing its build.
    const raw = makeDraft().replace("lang: ko", "lang: ko\nestimated_tokens:")
    expect(rulesOf(raw, OPTS, "block")).toEqual([])
  })

  it("does not also warn on a retired key that is quoted", () => {
    // The retired rule already blocks it; one cause, one message.
    const raw = makeDraft().replace(
      "lang: ko",
      '"sources":\n  - https://example.com/design-system\nlang: ko'
    )
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("unknown-frontmatter-key")
  })

  // #421 — shadows moved out of the body into frontmatter.
  it("knows the elevation map", () => {
    const raw = makeDraft().replace(
      "lang: ko",
      "lang: ko\nelevation:\n  shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)"
    )
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("unknown-frontmatter-key")
  })

  // #384 — the spec's component map is a real field, not a typo.
  it("knows the spec's components map", () => {
    const raw = makeDraft().replace(
      "lang: ko",
      "lang: ko\ncomponents:\n  topbar:\n    height: 56px"
    )
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("unknown-frontmatter-key")
  })
})

// ── where the retired rules' inputs go (#589) ───────────────────────────────
// The validator used to block every shape on which the site's hand parser, the
// line-based token readers and YAML disagreed (`misread-frontmatter-value`,
// `nonbare-frontmatter-key`, `quoted-token-value`, `block-scalar-token-value`,
// `unreadable-token-map`, the indentation rule). One reader now reads the
// frontmatter for all of them (docs/adr/0011), so each input those rules
// caught is one of: read as the same value (passes), blocked by another rule,
// or blocked as YAML that does not read. Each row below is one such input and
// its outcome — the whereabouts table of #589, pinned.

describe("where the retired rules' inputs go (#589)", () => {
  const PIPELINE: DraftValidationOptions = {
    ...OPTS,
    filePath: "/cache/demo/draft.md",
  }
  const TYPE_SCALE = /typography:\n(?: {2,}[^\n]*\n)+/
  const COLOUR_ROW = "  primary: oklch(0.62 0.19 258)   # #3182F6"
  const LOGO = "logo: https://getdesign.kr/logos/demo.png"
  const DATE = 'last_updated: "2026-07-03"'
  const aliases = [
    "grid:",
    "  a: &a [x, x, x, x, x, x, x, x, x, x, x]",
    "  b: &b [*a, *a, *a, *a, *a, *a, *a, *a, *a, *a, *a]",
    "  c: [*b, *b, *b, *b, *b, *b, *b, *b, *b, *b, *b]",
  ].join("\n")
  const broken = 'fonts:\n  sans: "Pretendard", sans-serif'

  // [row id, the draft's line, what replaces it, the blocks expected]
  const ROWS: Array<[string, string, string, Array<string>]> = [
    // misread-frontmatter-value — a value the site's parser read differently.
    ["M1 value on the next line", "name: 데모", "name:\n  데모", []],
    [
      "M2 value continued on the next line",
      "name: 데모",
      "name: 데모\n  시스템",
      [],
    ],
    ["M3 lang on the next line", "lang: ko", "lang:\n  ko", []],
    [
      "M4 escapes inside double quotes",
      "name: 데모",
      'name: "데모 \\"DS\\""',
      [],
    ],
    ["M5 a comment after a quoted value", DATE, `${DATE} # synced`, []],
    [
      "M6 a count on the next line",
      "lang: ko",
      "lang: ko\nestimated_tokens:\n  1200",
      [],
    ],
    ["M7 a logo on the next line", LOGO, `logo:\n  ${LOGO.slice(6)}`, []],
    [
      "M8 a name YAML reads as a number",
      "name: 데모",
      "name: 1.50",
      ["bad-name"],
    ],
    [
      "M9 a name YAML reads as a boolean",
      "name: 데모",
      "name: true",
      ["bad-name"],
    ],
    [
      "M10 a system name YAML reads as a number",
      "name: 데모",
      "name: 데모\ndesign_system_name: 2.10",
      ["bad-design-system-name"],
    ],
    [
      "M11 a slug YAML reads as a number",
      "slug: demo",
      "slug: 0x1f",
      ["bad-slug"],
    ],
    ["M12 a name YAML reads as a map", "name: 데모", "name: {}", ["bad-name"]],
    [
      "M13 a name YAML reads as a list",
      "name: 데모",
      'name: ["데모"] # c',
      ["list-frontmatter-value"],
    ],
    ["M14 YAML's null for a name", "name: 데모", "name: ~", ["bad-name"]],
    [
      "M15 YAML's null for a category",
      "category: finance",
      "category: null",
      ["bad-category"],
    ],
    ["M16 YAML's null for lang", "lang: ko", "lang: ~", ["bad-lang"]],
    [
      "M17 YAML's null for a date",
      DATE,
      "last_updated: ~",
      ["missing-last-updated"],
    ],
    ["M18 YAML's null for the logo", LOGO, "logo: ~", ["missing-logo"]],
    [
      "M19 a value continued past a date",
      'created_at: "2026-07-03"',
      "created_at: 2026-07-03\n  x",
      ["frontmatter-parse"],
    ],
    [
      "M20 a map past YAML's alias limit",
      "name: 데모",
      `${aliases}\nname: 데모`,
      ["frontmatter-yaml-invalid"],
    ],
    [
      "M21 a value that contains itself",
      "name: 데모",
      "name: &x [*x]",
      ["list-frontmatter-value"],
    ],
    [
      "M22 a quoted count",
      "lang: ko",
      'lang: ko\nestimated_tokens: "1200"',
      ["frontmatter-parse"],
    ],
    [
      "M23 a binary count",
      "lang: ko",
      "lang: ko\nestimated_tokens: 0b101",
      ["frontmatter-parse"],
    ],
    [
      "M24 a boolean count",
      "lang: ko",
      "lang: ko\nestimated_tokens: true",
      ["frontmatter-parse"],
    ],
    [
      "M25 a list count",
      "lang: ko",
      "lang: ko\nestimated_tokens: [1200]",
      ["list-frontmatter-value"],
    ],
    ["M26 a tag", "name: 데모", "name: !!str 데모", []],
    ["M27 an anchor", "name: 데모", "name: &a 데모", []],
    ["M28 a block scalar", "name: 데모", "name: >-\n  데모", []],
    ["M29 a comment after quoted lang", "lang: ko", 'lang: "ko" # only', []],
    [
      "M30 a quoted value holding `: `",
      "name: 데모",
      'name: "데모: 디자인"',
      [],
    ],
    [
      "M31 a quoted name YAML would read as a number",
      "name: 데모",
      'name: "1.50"',
      [],
    ],
    [
      "M32 a count in exponent form",
      "lang: ko",
      "lang: ko\nestimated_tokens: 1.0e3",
      [],
    ],
    [
      "M33 a key cut at a doubled colon",
      "name: 데모",
      "name:: 토스",
      ["colon-cut-frontmatter-key", "spec-schema-key"],
    ],
    [
      "M34 a key cut at an inner colon",
      "name: 데모",
      "name: 데모\ndesign_system_name:x: y",
      ["colon-cut-frontmatter-key"],
    ],
    // nonbare-frontmatter-key — a known key the site's parser could not see.
    ["N1 a double-quoted key", "lang: ko", '"lang": ko', []],
    ["N2 a single-quoted key", "lang: ko", "'lang': ko", []],
    ["N3 a space before the colon", "lang: ko", "lang : ko", []],
    ["N4 a quoted slug key", "slug: demo", '"slug": demo', []],
    ["N5 an anchored key", "lang: ko", "&a lang: ko", []],
    [
      "N6 a key written through an alias",
      "lang: ko",
      "lang2: &k lang\n? *k\n: ko",
      [],
    ],
    [
      "D1 an alias key that repeats a key's name",
      DATE,
      `holder: &k last_updated\n${DATE}\n? *k\n: "2026-01-01"`,
      ["frontmatter-yaml-invalid"],
    ],
    [
      "D2 a number key and its quoted spelling in one map",
      COLOUR_ROW,
      `${COLOUR_ROW}\n  500: oklch(0.5 0.1 10)\n  "500": oklch(0.6 0.1 10)`,
      ["frontmatter-yaml-invalid"],
    ],
    [
      "N7 a quoted key with its value on the next line",
      "name: 데모",
      '"name":\n  데모',
      [],
    ],
    ["N8 a quoted date key", DATE, `"last_updated": "2026-07-03"`, []],
    ["N9 a quoted token map", "typography:", '"typography":', []],
    ["N10 a quoted logo key", LOGO, `"logo": ${LOGO.slice(6)}`, []],
    [
      "N11 a key-like line inside a quoted value",
      "name: 데모",
      'name: "데모\nlang: ko"',
      ["frontmatter-yaml-invalid"],
    ],
    [
      "N12 a quoted key in a block YAML cannot read",
      "lang: ko",
      `"lang": ko\n${broken}`,
      ["frontmatter-yaml-invalid"],
    ],
    // list-frontmatter-value — reduced to a type check, so its old cross-reader
    // message has nothing left to say about a block YAML cannot read.
    [
      "L1 a list in a block YAML cannot read",
      "lang: ko",
      `lang: [ko]\n${broken}`,
      ["frontmatter-yaml-invalid"],
    ],
    // quoted-token-value — a quoted token value hid from the line readers.
    [
      "Q1 a quoted OKLCH colour",
      COLOUR_ROW,
      '  primary: "oklch(0.62 0.19 258)"   # #3182F6',
      [],
    ],
    [
      "Q2 a quoted hex colour",
      COLOUR_ROW,
      '  primary: "#3182F6"',
      ["non-oklch-token-value"],
    ],
    [
      "Q3 a quoted shadow",
      "lang: ko",
      'lang: ko\nelevation:\n  s1: "0 1px 2px oklch(0 0 0 / 0.06)"',
      [],
    ],
    [
      "Q4 a quoted shadow holding a hex",
      "lang: ko",
      'lang: ko\nelevation:\n  s1: "0 1px 2px #0000001A"',
      [],
    ],
    // block-scalar-token-value — a token value written as `>` or `|`.
    [
      "B1 a folded colour",
      COLOUR_ROW,
      "  primary: >\n    oklch(0.62 0.19 258)",
      [],
    ],
    [
      "B2 a literal hex colour",
      COLOUR_ROW,
      "  primary: |-\n    #3182F6",
      ["non-oklch-token-value"],
    ],
    [
      "B3 a folded shadow",
      "lang: ko",
      "lang: ko\nelevation:\n  s1: >\n    0 1px 2px oklch(0 0 0 / 0.06)",
      [],
    ],
    [
      "B4 a folded easing in elevation",
      "lang: ko",
      "lang: ko\nelevation:\n  ease: >\n    cubic-bezier(.2, 0, .2, 1)",
      ["elevation-not-shadow"],
    ],
    // unreadable-token-map — the linter read a style the extractor did not.
    // A style that is not a map with one of the four sized properties is now
    // one shape rule's (`typography-style-shape`).
    [
      "U1 an inline style",
      "typography:",
      "typography:\n  title: { fontSize: 24px }",
      [],
    ],
    [
      "U2 an inline style with names the scale does not use",
      "typography:",
      "typography:\n  title: { size: 24px }",
      ["typography-style-shape"],
    ],
    [
      "U3 a font family with no size",
      "typography:",
      "typography:\n  code:\n    fontFamily: D2Coding",
      ["typography-style-shape"],
    ],
    [
      "U4 a numeric style name",
      "typography:",
      "typography:\n  1.0:\n    fontSize: 16px",
      [],
    ],
    [
      "U5 a colour alias row",
      COLOUR_ROW,
      `${COLOUR_ROW}\n  brand: "{colors.primary}"`,
      [],
    ],
    [
      "U7 a whole style written as an alias",
      "typography:",
      'typography:\n  hero: "{typography.body}"',
      ["typography-style-shape"],
    ],
    [
      "U8 a style written as one value",
      "typography:",
      "typography:\n  caption: 16px",
      ["typography-style-shape"],
    ],
    [
      "U6 an inline style YAML cannot read",
      "typography:",
      `typography:\n  title: { fontSize: 24px\n${broken}`,
      ["frontmatter-yaml-invalid"],
    ],
    // Its colours half — the linter resolves a colour the extractor drops.
    // Each such row is not OKLCH, so it is blocked where it is written (#597);
    // a palette of nothing else also leaves the sidecar empty, which the
    // linter-against-extractor count names as well.
    [
      "U9 a palette of named colours only",
      COLOUR_ROW,
      "  primary: white\n  surface: transparent",
      ["unreadable-colors", "non-oklch-token-value", "non-oklch-token-value"],
    ],
    [
      "U10 a colour written as an upper-case function",
      COLOUR_ROW,
      "  primary: OKLCH(0.62 0.19 258)",
      ["unreadable-colors", "non-oklch-token-value"],
    ],
    [
      "U11 a named colour beside an OKLCH one",
      COLOUR_ROW,
      `${COLOUR_ROW}\n  surface: white`,
      ["non-oklch-token-value"],
    ],
    // noncanonical-token-indent — now "no map under a token map".
    ["I1 a colour map indented four spaces", COLOUR_ROW, `  ${COLOUR_ROW}`, []],
    [
      "I2 a token nested under a group",
      COLOUR_ROW,
      "  brand:\n    primary: oklch(0.62 0.19 258)",
      ["noncanonical-token-indent"],
    ],
    [
      "I3 an unquoted reference",
      COLOUR_ROW,
      `${COLOUR_ROW}\n  brand: {colors.primary}`,
      ["noncanonical-token-indent"],
    ],
    [
      "I4 a type style nested under a group",
      "typography:",
      "typography:\n  group:\n    caption:\n      fontSize: 12px",
      ["typography-style-shape"],
    ],
    [
      "I5 a map under a sized style",
      "typography:",
      "typography:\n  title:\n    fontSize: 24px\n    mobile:\n      fontSize: 20px",
      ["typography-style-shape"],
    ],
    // frontmatter-parse — the fence it used to report is the read gate's now.
    [
      "P1 a frontmatter with no closing fence",
      "\n---\n",
      "\n",
      ["frontmatter-yaml-invalid"],
    ],
    // …and what it still reports: a value the site's build refuses.
    [
      "P2 a date that is not a real day",
      DATE,
      'last_updated: "2026-02-30"',
      ["frontmatter-parse"],
    ],
  ]

  it.each(ROWS)("%s", (_, from, to, blocks) => {
    const draft = makeDraft()
    expect(draft, "the fixture holds the line to replace").toContain(from)
    expect(rulesOf(draft.replace(from, to), OPTS, "block")).toEqual(blocks)
  })

  it("reads each passing row's value as YAML does", () => {
    // Passing is not enough: the site gets the value the author wrote.
    const read = (raw: string) => {
      const result = readFrontmatter(raw)
      if (!result.ok) throw new Error(result.errors[0].message)
      return Object.fromEntries(result.keys.map((k) => [k.key, k.value]))
    }
    const at = (from: string, to: string) => read(makeDraft().replace(from, to))
    expect(at("name: 데모", "name:\n  데모").name).toBe("데모")
    expect(at("name: 데모", "name: 데모\n  시스템").name).toBe("데모 시스템")
    expect(at("name: 데모", 'name: "데모 \\"DS\\""').name).toBe('데모 "DS"')
    expect(at("lang: ko", '"lang": ko').lang).toBe("ko")
    expect(at("lang: ko", "lang2: &k lang\n? *k\n: ko").lang).toBe("ko")
    expect(
      at("lang: ko", "lang: ko\nestimated_tokens:\n  1200").estimated_tokens
    ).toBe(1200)
  })

  it("judges a colour written below its key by the hex on the value's line (C1)", () => {
    // YAML reads the comment that ends the value's line as the value's, so the
    // hex there is the one the check pairs it with — on the next line or after
    // a quoted value split over two.
    const warns = (to: string) =>
      rulesOf(makeDraft().replace(COLOUR_ROW, to), OPTS, "warn")
    expect(warns("  primary:\n    oklch(0.42 0.18 254)   # #3182F6")).toContain(
      "oklch-hex-mismatch"
    )
    expect(
      warns('  primary: "oklch(0.42\n    0.18 254)"   # #3182F6')
    ).toContain("oklch-hex-mismatch")
    expect(
      warns("  primary:\n    oklch(0.62 0.19 258)   # #3182F6")
    ).not.toContain("oklch-hex-mismatch")
  })

  it("blocks a map written as a YAML alias, once, at any depth (A1, A2)", () => {
    const blocks = (raw: string) => rulesOf(raw, OPTS, "block")
    const END = "    fontWeight: 400\n---"
    // A whole token map: the linter expands it, the sidecar got no rows.
    expect(
      blocks(
        makeDraft().replace(
          END,
          "    fontWeight: 400\nspacing: &scale\n  sm: 4px\nrounded: *scale\n---"
        )
      )
    ).toEqual(["aliased-map-value"])
    // A style: the alias names it, not a misleading "sets no size".
    expect(
      blocks(
        makeDraft().replace(
          TYPE_SCALE,
          "typography:\n  body: &body\n    fontSize: 16px\n  title: *body\n"
        )
      )
    ).toEqual(["aliased-map-value"])
    // An anchor alone, or an alias of one value, is not one.
    expect(
      blocks(
        makeDraft().replace(
          END,
          "    fontWeight: 400\nspacing: &scale\n  sm: &four 4px\nrounded:\n  sm: *four\n---"
        )
      )
    ).toEqual([])
  })

  it("blocks a known key cut at a colon, naming the key meant (M33, M34)", () => {
    // `name:: 토스` is the key `name:` to YAML and `design_system_name:x: y`
    // the key `design_system_name:x`: the site reads neither, so the value
    // meant for the known key is lost. One block names that key and the fix;
    // the line is not also warned about as an unknown key.
    for (const [to, meant] of [
      ["name:: 토스", "name"],
      ["name: 데모\ndesign_system_name:x: y", "design_system_name"],
    ]) {
      const issues = validateDraft(
        makeDraft().replace("name: 데모", to),
        OPTS
      ).issues
      const cut = issues.filter((i) => i.rule === "colon-cut-frontmatter-key")
      expect(cut, to).toHaveLength(1)
      expect(cut[0].severity).toBe("block")
      expect(cut[0].fix).toContain(`\`${meant}: value\``)
      expect(
        issues.map((i) => i.rule),
        to
      ).not.toContain("unknown-frontmatter-key")
    }
    // A key that only starts like a known one is a plain unknown key.
    const near = makeDraft().replace("name: 데모", "name: 데모\nnamespace: x")
    expect(rulesOf(near, OPTS, "block")).toEqual([])
    expect(rulesOf(near, OPTS, "warn")).toContain("unknown-frontmatter-key")
  })

  it("passes the pipeline's quoted keys as the values they hold (N4–N10)", () => {
    // In the pipeline a dropped slug read as the file name, `draft`, and a
    // dropped logo as none. Read once, both are the values written.
    for (const [from, to] of [
      ["slug: demo", '"slug": demo'],
      [LOGO, `"logo": ${LOGO.slice(6)}`],
      ["category: finance", '"category": finance'],
      ["lang: ko", '"lang": ko'],
    ]) {
      expect(
        rulesOf(makeDraft().replace(from, to), PIPELINE, "block"),
        to
      ).toEqual([])
    }
    // …and a quoted slug is the entry's slug for its recorded limitations.
    const limited = makeDraft()
      .replace("slug: demo", '"slug": 11st')
      .replace("lang: ko", "lang: ko\nrounded:\n  circle: 50%")
    expect(
      rulesOf(limited, {
        ...OPTS,
        filePath: "/cache/11st/draft.md",
        expectedSlug: "11st",
      })
    ).not.toContain("spec-unrecorded-limitation")
  })

  it("blocks each unsized style beside a sized one and sends a bare family to `fonts:` (U2, U3)", () => {
    // The linter counts `title` and `code` as styles; the sidecar carries
    // neither, since neither sets a size, weight, line height or tracking.
    // `body` is a style both read, so it is not named.
    const raw = makeDraft().replace(
      TYPE_SCALE,
      "typography:\n  body:\n    fontSize: 16px\n  title: { size: 24px }\n  code:\n    fontFamily: D2Coding\n"
    )
    const shape = validateDraft(raw, OPTS).issues.filter(
      (i) => i.rule === "typography-style-shape"
    )
    expect(shape.map((i) => i.fix.match(/^style `([^`]+)`/)?.[1])).toEqual([
      "title",
      "code",
    ])
    for (const { fix } of shape) {
      expect(fix).toContain("catalog-only `fonts:` map")
      expect(fix).toContain("do not invent a size")
    }
  })

  it("tells a nested style both ways out: a group comment row, or a flat variant (I4, I5)", () => {
    const fixFor = (scale: string) =>
      validateDraft(makeDraft().replace(TYPE_SCALE, scale), OPTS).issues.find(
        (i) => i.rule === "typography-style-shape"
      )?.fix
    const group = fixFor(
      "typography:\n  body:\n    fontSize: 16px\n  group:\n    caption:\n      fontSize: 12px\n"
    )
    expect(group).toContain("`  ## group` comment row")
    expect(group).toContain("(`caption:`)")
    const variant = fixFor(
      "typography:\n  title:\n    fontSize: 24px\n    mobile:\n      fontSize: 20px\n"
    )
    expect(variant).toContain("(`title-mobile:`)")
  })
})

// ── section structure rules ──────────────────────────────────────────────────

describe("validateDraft — sections", () => {
  it("blocks a missing standard section", () => {
    const raw = makeDraft({ dropSection: "Shapes" })
    expect(rulesOf(raw, OPTS, "block")).toContain("missing-section")
  })

  it("blocks standard sections out of order", () => {
    const raw = makeDraft({ swapSections: ["Colors", "Typography"] })
    expect(rulesOf(raw, OPTS, "block")).toContain("section-order")
  })

  it("blocks a duplicated standard section", () => {
    const raw = makeDraft({ duplicateSection: "Colors" })
    expect(rulesOf(raw, OPTS, "block")).toContain("duplicate-section")
  })
})

// ── token fences ─────────────────────────────────────────────────────────────

describe("validateDraft — token fences", () => {
  const withFence = (heading: string, lang = "yaml") =>
    makeDraft({
      body: (sections) =>
        sections.replace(
          `## ${heading}\n`,
          `## ${heading}\n\n\`\`\`${lang}\nbrand: oklch(0.62 0.19 258)\n\`\`\`\n`
        ),
    })

  it.each(["Colors", "Typography", "Spacing", "Rounded"])(
    "blocks a yaml fence under ## %s",
    (heading) => {
      expect(rulesOf(withFence(heading), OPTS, "block")).toContain(
        "token-fence"
      )
    }
  )

  // The opening run is read whole: ````yaml is still a yaml fence, not an
  // unlabelled one whose info string starts with a stray backtick.
  it("blocks a longer backtick fence too", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Colors\n",
          "## Colors\n\n````yaml\nbrand: oklch(0.62 0.19 258)\n````\n"
        ),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("token-fence")
  })

  it("blocks the `yml` spelling too", () => {
    expect(rulesOf(withFence("Colors", "yml"), OPTS, "block")).toContain(
      "token-fence"
    )
  })

  // Nine entries nest `###` groups inside `## Colors`; the section is the H2.
  it("blocks a fence under an H3 inside a token section", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Colors\n",
          "## Colors\n\n### 다크 테마\n\n```yaml\nbrand: oklch(0.62 0.19 258)\n```\n"
        ),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("token-fence")
  })

  // #421 — the entry is served verbatim as the standard DESIGN.md, and the
  // official linter merges every body yaml fence into the frontmatter's schema
  // namespace. Outside the four token sections the fence is not a token fence,
  // but it is no safer: it is the one shape that makes the raw file lint
  // differently from itself.
  it.each(["Elevation & Depth", "Components", "Do's and Don'ts"])(
    "blocks a yaml fence under ## %s as a body yaml fence",
    (heading) => {
      const rules = rulesOf(withFence(heading), OPTS, "block")
      expect(rules).toContain("body-yaml-fence")
      expect(rules).not.toContain("token-fence")
    }
  )

  it("reports a token section's fence once, as a token fence", () => {
    const rules = rulesOf(withFence("Colors"), OPTS, "block")
    expect(rules).toContain("token-fence")
    expect(rules).not.toContain("body-yaml-fence")
  })

  it("leaves a text fence under ## Elevation & Depth alone", () => {
    expect(
      rulesOf(withFence("Elevation & Depth", "text"), OPTS, "block")
    ).not.toContain("body-yaml-fence")
  })

  // A ````md example that shows a ```yaml block is documentation, not a token
  // fence, and must not flip the scanner: the inner ``` used to close the outer
  // fence, so the example's rows were read as prose and the prose after it was
  // swallowed as fence content.
  it("reads a four-backtick example as one fence", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Colors\n",
          "## Colors\n\n````md\n```yaml\nexample: #FF0000\n````\n\n버튼 색은 #00FF00 이다 [src:1].\n"
        ),
    })
    const issues = validateDraft(raw, OPTS).issues
    expect(issues.map((i) => i.rule)).not.toContain("token-fence")
    const proseHex = issues
      .filter((i) => i.rule === "hex-in-prose")
      .map((i) => i.fix)
    expect(proseHex.some((f) => f.includes("#00FF00"))).toBe(true)
    expect(proseHex.some((f) => f.includes("#FF0000"))).toBe(false)
  })

  it("blocks a tilde yaml fence too", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Colors\n",
          "## Colors\n\n~~~yaml\nbrand: oklch(0.62 0.19 258)\n~~~\n"
        ),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("token-fence")
  })

  // A closing line with a language tag does not close a fence, so the rest of
  // the body is swallowed. Say so at the fence instead of letting every later
  // heading surface as missing.
  it("names a fence that is never closed", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Do's and Don'ts\n",
          "## Do's and Don'ts\n\n```yaml\nbutton:\n  bg: oklch(0.62 0.19 258)\n```yaml\n"
        ),
    })
    const blocks = validateDraft(raw, OPTS).issues.filter(
      (i) => i.severity === "block"
    )
    const unclosed = blocks.find((i) => i.rule === "unclosed-fence")
    expect(unclosed?.fix).toContain("Do's and Don'ts: ```yaml")
    // References is present, only swallowed — it must not be reported missing.
    expect(blocks.map((i) => i.rule)).not.toContain("missing-section")
  })

  // Only what the fence could have swallowed is excused. A section left out
  // before the fence opened is still reported in the same pass.
  it("still reports a section missing before an unclosed fence", () => {
    const raw = makeDraft({
      dropSection: "Shapes",
      body: (sections) =>
        sections.replace(
          "## Do's and Don'ts\n",
          "## Do's and Don'ts\n\n```yaml\nbutton:\n  bg: oklch(0.62 0.19 258)\n```yaml\n"
        ),
    })
    const missing = validateDraft(raw, OPTS)
      .issues.filter((i) => i.rule === "missing-section")
      .map((i) => i.section)
    expect(missing).toEqual(["Shapes"])
  })

  it("does not read inline code at the start of a line as a fence", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          "## Colors\n",
          "## Colors\n\n```yaml``` 펜스는 쓰지 않는다 [src:1].\n"
        ),
    })
    const rules = rulesOf(raw, OPTS, "block")
    expect(rules).not.toContain("token-fence")
    expect(rules).not.toContain("unclosed-fence")
  })

  it("leaves a non-yaml fence in a token section alone", () => {
    expect(rulesOf(withFence("Colors", "css"), OPTS, "block")).not.toContain(
      "token-fence"
    )
  })
})

// ── the official DESIGN.md linter ────────────────────────────────────────────

describe("validateDraft — official spec linter", () => {
  // The file is published as-is as the standard DESIGN.md, so the draft gate
  // runs the same linter CI's corpus test does — a draft should not pass the
  // skill pipeline and then fail on the PR.

  it("passes the fixture, which the linter resolves", () => {
    const rules = rulesOf(makeDraft(), OPTS)
    expect(rules.filter((r) => r.startsWith("spec-"))).toEqual([])
  })

  it("blocks a document the linter resolves no colours from", () => {
    const raw = makeDraft().replace(/colors:\n {2}primary: [^\n]*\n/, "")
    expect(rulesOf(raw, OPTS, "block")).toContain("spec-no-colors")
  })

  it("blocks colours the linter resolves and the sidecar would carry none of", () => {
    // A named colour or an upper-case function reads as a colour to the
    // linter, so `spec-no-colors` stays quiet, while the extractor keeps
    // neither — the Tokens tab would ship with no colour.
    const raw = makeDraft().replace(
      /colors:\n {2}primary: [^\n]*\n/,
      "colors:\n  primary: white\n  accent: RGB(49 130 246)\n"
    )
    const issues = validateDraft(raw, OPTS).issues
    expect(issues.map((i) => i.rule)).not.toContain("spec-no-colors")
    const fix = issues.find((i) => i.rule === "unreadable-colors")
    expect(fix?.severity).toBe("block")
    expect(fix?.fix).toContain("`primary`, `accent`")
    expect(fix?.fix).toContain("`name: oklch(L C H)`")
  })

  it("blocks a document with no type scale", () => {
    // `colors:` and `typography:` are the two required maps (#428).
    const raw = makeDraft().replace(/typography:\n(?: {2,}[^\n]*\n)+/, "")
    expect(rulesOf(raw, OPTS, "block")).toContain("spec-no-typography")
  })

  it("warns on a value the spec cannot express, naming where to record it", () => {
    // `%` radius is a real brand value the catalog keeps (ADR 0003); the draft
    // gate says so and says where CI expects the count.
    const raw = makeDraft().replace(
      "lang: ko",
      "lang: ko\nrounded:\n  circle: 50%"
    )
    const issue = validateDraft(raw, OPTS).issues.find(
      (i) => i.rule === "spec-unrecorded-limitation"
    )
    expect(issue?.severity).toBe("warn")
    expect(issue?.fix).toContain("KNOWN_SPEC_LIMITATIONS")
  })

  it("stays silent when the entry's limitation count is already recorded", () => {
    // 11st's one `%` radius is recorded, so re-validating the catalog adds no
    // noise — only a count that moved is worth a line.
    const raw = makeDraft()
      .replace("slug: demo", "slug: 11st")
      .replace("lang: ko", "lang: ko\nrounded:\n  circle: 50%")
    const rules = rulesOf(raw, {
      filePath: "/services/11st.md",
      expectedSlug: "11st",
    })
    expect(rules).not.toContain("spec-unrecorded-limitation")
  })

  it("names the catalog-only map, not a fence, when its value looks like a token", () => {
    // `grid:` is a catalog key the allowlist accepts, but a CSS dimension in
    // it reads to the linter as a token map it will ignore. The fix is in the
    // map, so the message must say so rather than blame a body fence.
    const raw = makeDraft().replace(
      "lang: ko",
      "lang: ko\ngrid:\n  gutter: 16px"
    )
    const issues = validateDraft(raw, OPTS).issues
    const issue = issues.find((i) => i.rule === "spec-token-like-map")
    expect(issue?.severity).toBe("block")
    expect(issue?.fix).toContain("`grid:`")
    expect(issues.map((i) => i.rule)).not.toContain("spec-schema-key")
  })

  it("stays quiet about the spec when the frontmatter itself is invalid", () => {
    // One cause, one message: an unparseable frontmatter already blocks, and
    // the linter's empty model would add three wrong instructions to it.
    const raw = makeDraft().replace(
      "lang: ko",
      "lang: ko\nelevation:\n  s1: 0 1px 2px oklch(0 0 0 / 0.1)\n  s1: 0 2px 4px oklch(0 0 0 / 0.1)"
    )
    const rules = rulesOf(raw, OPTS)
    expect(rules).toContain("frontmatter-yaml-invalid")
    expect(rules.filter((r) => r.startsWith("spec-"))).toEqual([])
  })

  it("falls back to the expected slug when the document does not build", () => {
    const raw = makeDraft()
      .replace("slug: demo", "slug: 11st")
      .replace("lang: ko", "lang: ko\nrounded:\n  circle: 50%")
      // A date that is valid YAML but not a real calendar day: the site refuses it.
      .replace('last_updated: "2026-07-03"', 'last_updated: "2026-13-45"')
    const rules = rulesOf(raw, {
      filePath: "/services/11st.md",
      expectedSlug: "11st",
    })
    expect(rules).not.toContain("spec-unrecorded-limitation")
  })

  it("asks to lower the recorded count when errors went away", () => {
    // 11st records one `%` radius; a draft without it has fewer errors than
    // recorded, and the advice is the opposite of recording one.
    const raw = makeDraft().replace("slug: demo", "slug: 11st")
    const issue = validateDraft(raw, {
      filePath: "/services/11st.md",
      expectedSlug: "11st",
    }).issues.find((i) => i.rule === "spec-unrecorded-limitation")
    expect(issue?.fix).toContain("lower")
    expect(issue?.fix).not.toMatch(/\. \./)
  })

  it("blocks a key the linter reads as schema but does not know", () => {
    // What a body yaml fence used to produce; a frontmatter typo does too.
    const raw = makeDraft().replace("lang: ko", "lang: ko\nease: linear")
    expect(rulesOf(raw, OPTS, "block")).toContain("spec-schema-key")
  })
})

// ── token value rules ────────────────────────────────────────────────────────

describe("validateDraft — token values", () => {
  it("blocks a hex token value inside a yaml fence", () => {
    const raw = makeDraft({
      specFence: ["```yaml", "primary: #3182F6", "```"].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("non-oklch-token-value")
  })

  it("blocks an rgba token value inside a yaml fence", () => {
    const raw = makeDraft({
      specFence: ["```yaml", "overlay: rgba(0, 0, 0, 0.4)", "```"].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("non-oklch-token-value")
  })

  it("warns on a prose hex with no oklch on the same line", () => {
    const raw = makeDraft({
      body: (sections) => `${sections}\n\n버튼 색은 #FF8800로 보인다 [src:1].`,
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })

  it("warns when a token name is declared twice with different values", () => {
    // The shape `services/wanted.md` uses for its per-theme aliases. Nothing
    // downstream can resolve it, so `audit:oklch` stops comparing the token.
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "bg-canvas: oklch(1 0 0)",
        "bg-canvas: oklch(0.148 0.004 277)",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("duplicate-token-value")
  })

  it("stays silent when the same name restates the SAME value", () => {
    // Repetition is not ambiguity — the value is still checkable, and warning
    // here would put a permanent warn on a file that has nothing to fix.
    // Compared after normalisation, so trailing zeros are not a disagreement.
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "bg-canvas: oklch(1 0 0)",
        "bg-canvas: oklch(1.000 0 0)",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("duplicate-token-value")
  })

  it("does not pair two different token names", () => {
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "bg-canvas: oklch(1 0 0)",
        "bg-surface: oklch(0.148 0.004 277)",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("duplicate-token-value")
  })

  it("warns when a token's OKLCH does not match the hex annotated beside it", () => {
    // The hex comment is the provenance record; if the OKLCH beside it decodes to
    // a different colour, a downstream consumer copying the token renders the
    // WRONG brand colour. Format-only checks can't catch this — every entry's
    // OKLCH was hand-computed, and an audit found a systematic lightness bias.
    // #3182F6 is oklch(0.620 0.191 258); 0.42 lightness is far off.
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "primary: oklch(0.42 0.18 254)   # #3182F6",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("accepts an OKLCH that matches its hex within authoring rounding slack", () => {
    // Authors round to 2–3 decimals, so the check must tolerate that much drift
    // without flagging correct conversions. #3182F6 is oklch(0.620 0.191 258);
    // the 2-decimal form stays inside the ΔE bound.
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "primary: oklch(0.620 0.191 258)   # #3182F6",
        "rounded: oklch(0.62 0.19 258)     # #3182F6 — 2-decimal rounding",
        "white: oklch(1 0 0)               # #FFFFFF",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("oklch-hex-mismatch")
  })

  it("leaves markdown-table palettes alone — column roles are not positional", () => {
    // Table layouts differ per entry (class101: name|oklch|hex; codeit:
    // light-hex|light-oklch|dark-hex|dark-oklch), so positional matching would
    // pair an OKLCH with the wrong theme's hex. Until the header row is parsed to
    // resolve column roles, tables stay out of scope rather than noisily wrong.
    const codeitStyle = makeDraft({
      body: (sections) =>
        `${sections}\n\n| Token | Light | Light OKLCH | Dark | Dark OKLCH |\n| --- | --- | --- | --- | --- |\n| \`diff-remove-bg\` | \`#FFC9C7\` | \`oklch(0.883 0.062 21)\` | \`#650205\` | \`oklch(0.320 0.129 28)\` |\n`,
    })
    expect(rulesOf(codeitStyle, OPTS, "warn")).not.toContain(
      "oklch-hex-mismatch"
    )
  })

  it("compares alpha when both the OKLCH and an 8-digit hex declare it", () => {
    // class101 writes `oklch(0 0 0 / 3%)  # #00000008`. A token that agrees on
    // hue but not opacity still renders wrong, so alpha is part of the match.
    const wrongAlpha = makeDraft({
      specFence: [
        "```yaml",
        "surface1: oklch(0 0 0 / 30%)   # #00000008",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(wrongAlpha, OPTS, "warn")).toContain("oklch-hex-mismatch")

    const rightAlpha = makeDraft({
      specFence: [
        "```yaml",
        "surface1: oklch(0 0 0 / 3%)    # #00000008",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(rightAlpha, OPTS, "warn")).not.toContain(
      "oklch-hex-mismatch"
    )
  })

  it("scales with chroma: catches a small hue error on a saturated colour", () => {
    // The reason this rule measures ΔE instead of per-component bounds. Both
    // rows below sit inside the OLD tolerance (ΔH ≤ 5°), but on a saturated
    // colour a 4° error moves the rendered pixel ~37/255 — visibly wrong —
    // while the same tolerance was far too loose to notice.
    // #256EF4 is oklch(0.575 0.214 261); 257 is only 4° off yet must be caught.
    const saturated = makeDraft({
      specFence: [
        "```yaml",
        "primary-50: oklch(0.575 0.205 257)   # #256EF4",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(saturated, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("scales with chroma: tolerates a large hue error on a near-grey", () => {
    // Mirror image of the case above. #FAFAFA carries almost no chroma, so its
    // hue angle is numerical noise and a 200° "error" barely moves the pixel —
    // ΔE stays tiny on its own, with no special-case branch needed.
    const grey = makeDraft({
      specFence: [
        "```yaml",
        "gray-5: oklch(0.985 0.000 200)   # #FAFAFA",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(grey, OPTS, "warn")).not.toContain("oklch-hex-mismatch")
  })

  it("wraps a hue that rounds to 360 back to 0 in the suggestion", () => {
    // #DC6991 decodes to H≈359.98. Rounding alone would suggest an out-of-range
    // `oklch(… 360)`; hue is a circle, so the correction must read 0.
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "rose: oklch(0.20 0.15 340)   # #DC6991",
        "```",
      ].join("\n"),
    })
    const fix = validateDraft(raw, OPTS).issues.find(
      (i) => i.rule === "oklch-hex-mismatch"
    )?.fix
    expect(fix).toContain(" 0)")
    expect(fix).not.toContain("360")
  })

  it("expands 4-digit #RGBA shorthand instead of silently skipping it", () => {
    // A hex the parser can't read means the token is never checked — a silent
    // hole. #F00 8 → #FF000088; the mismatched lightness must still surface.
    const raw = makeDraft({
      specFence: [
        "```yaml",
        "accent: oklch(0.20 0.20 29 / 53%)   # #F008",
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })
})

// ── citation integrity (delegated to auditSourceCitations) ───────────────────

describe("validateDraft — citations", () => {
  it("blocks a citation outside the References range", () => {
    const raw = makeDraft({
      body: (sections) => `${sections}\n\n근거 없는 주장 [src:9].`,
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("citation-range")
  })

  // References is the entry's only source list (docs/adr/0004). An entry that
  // names no public source must not pass just because nothing cites past 0.
  it("blocks a draft whose References lists no public URL", () => {
    const raw = makeDraft({
      body: (sections) =>
        sections.replace(
          /## References\n\n[\s\S]*$/,
          "## References\n\n(없음)"
        ),
    })
    expect(rulesOf(raw, OPTS, "block")).toContain("empty-references")
  })

  it("blocks an ephemeral handoff link listed in References", () => {
    const raw = makeDraft().replace(
      `2. ${SOURCES[1]} — 설명`,
      "2. https://api.anthropic.com/v1/design/h/abc123 — 핸드오프 번들"
    )
    expect(rulesOf(raw, OPTS, "block")).toContain("forbidden-url")
  })
})

describe("oklch-hex-mismatch — annotation forms", () => {
  // The authoring gate advertises an OKLCH↔hex check, but its own pattern used
  // to require the hex immediately after the `#` marker. Catalog files mostly
  // write `# ≈ #HEX` or `# prose (#HEX)`, so a wrong conversion in those shapes
  // sailed through `validate:draft` and was only caught by `audit:oklch`.
  const wrong = "oklch(0.5 0.2 30)" // #58CF04 is nowhere near this

  it("flags a mismatch written as `# ≈ #hex`", () => {
    const raw = makeDraft({
      specFence: ["```yaml", `lime-600: ${wrong}   # ≈ #58CF04`, "```"].join(
        "\n"
      ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("flags a mismatch written as `# prose (#hex)`", () => {
    const raw = makeDraft({
      specFence: [
        "```yaml",
        `blue-800: ${wrong}   # core Wanted Blue (#0066FF), 단일 primary`,
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("oklch-hex-mismatch")
  })

  it("stays silent when the comment names two hexes (pairing is ambiguous)", () => {
    const raw = makeDraft({
      specFence: [
        "```yaml",
        `pink-600: ${wrong}   # ≈ #F553DA (gradient mid는 #FF53C0)`,
        "```",
      ].join("\n"),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("oklch-hex-mismatch")
  })
})

// `## References` entries are citations, not prose. Their human description
// routinely quotes a brand constant as provenance ("…brand.primaryColor:
// #3182F6 예시…"), and URL masking strips the link but leaves that text, so the
// prose rule fired on a line where an inline OKLCH would be pure clutter.
describe("hex-in-prose — References is not prose", () => {
  it("ignores a hex inside a References entry description", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n6. https://example.com/guide — \`brand.primaryColor: #3182F6\` 예시를 든다.`,
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("hex-in-prose")
  })

  it("still flags a hex in ordinary prose above References", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}`.replace(
          "브랜드는 절제된 톤을 쓴다 [src:1].",
          "브랜드 그린은 #00C400이다 [src:1]."
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })

  // The exemption is scoped to the References section, not to "the rest of the
  // file". Every catalog entry ends with References today, but nothing enforces
  // that — non-standard sections are allowed anywhere — so a latched flag would
  // silently disarm the rule for whatever followed.
  it("resumes flagging in a section that follows References", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n\n## Changelog\n\n1. https://example.com/note — 그린을 #00C400으로 바꿨다.`,
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })

  // `parseReferences` (source-citations.ts) ends the block at `#{2,}` — any
  // heading, not just H2. Reading the boundary two different ways inside one
  // validator is how a rule goes quiet on a shape nobody tested.
  it("resumes flagging after a nested heading, not just an H2", () => {
    const raw = makeDraft({
      body: (sections) =>
        `${sections}\n\n### Notes\n\n1. https://example.com/note — 그린을 #00C400으로 바꿨다.`,
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("hex-in-prose")
  })
})

// ── audit-note format ────────────────────────────────────────────────────────
// .claude/rules/audit-notes.md fixes the shape of a re-audit note: a `> **<label>(YYYY-MM-DD).**`
// blockquote, at the head of its section, one per section. The rule existed for
// one batch before it was broken nine times in a row — every violation was
// caught by a human reviewer, which is why it is mechanical now.

describe("audit-note format", () => {
  const NOTE = "> **대조 결과(2026-08-02).** 값 43개를 발행 팔레트와 맞춰 봤다."

  it("accepts a note at the head of its section", () => {
    const raw = makeDraft({
      body: (s) => s.replace("## Colors\n", `## Colors\n\n${NOTE}\n`),
    })
    expect(rulesOf(raw, OPTS)).not.toContain("audit-note-placement")
  })

  it("flags a note that is not the first paragraph of its section", () => {
    // The failure this rule exists for: bezier and vapor-ui both buried the
    // note under two paragraphs, so a reader met the values before the caveat.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "팔레트는 OKLCH로 관리한다 [src:2]. 두 번째 문장이다.",
          `팔레트는 OKLCH로 관리한다 [src:2]. 두 번째 문장이다.\n\n${NOTE}`
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("audit-note-placement")
  })

  it("flags a second note in the same section", () => {
    // Appending instead of overwriting recreates the audit-log accumulation the
    // rule was written to prevent.
    const older = "> **팔레트 정정(2026-07-29).** 이전 라운드 결과다."
    const raw = makeDraft({
      body: (s) =>
        s.replace("## Colors\n", `## Colors\n\n${NOTE}\n\n${older}\n`),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("audit-note-duplicate")
  })

  it("flags a dated check stamp inside a References entry", () => {
    // References carries the source's static character; "checked on DATE" is
    // audit history and belongs in the commit or the section note.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — 설명 (2026-08-02 확인)"
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("reference-audit-stamp")
  })

  it("leaves an undated References description alone", () => {
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — JS 셸이라 브라우저로 열어야 읽힌다."
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("reference-audit-stamp")
  })

  it("does not mistake a Known Gaps bullet for an audit note", () => {
    // Known Gaps keeps a standing list; its dated bullets are a different form
    // and .claude/rules/audit-notes.md says so explicitly.
    const raw = makeDraft({
      body: (s) =>
        `${s}\n\n## Known Gaps\n\n- **철회된 부재 주장 2건 (2026-08-02)** — 종전 판본은 …`,
    })
    const rules = rulesOf(raw, OPTS)
    expect(rules).not.toContain("audit-note-placement")
    expect(rules).not.toContain("audit-note-duplicate")
  })

  it("leaves a release date that merely shares a parenthetical with 확인", () => {
    // `(v1.2, 2025-03-19 배포 확인)` dates the source's release, not an audit.
    // Matching the two tokens anywhere in one parenthetical flags it; the
    // prohibited form is specifically a date the verb directly qualifies.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — 토큰 표 (v1.2, 2025-03-19 배포 확인)"
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).not.toContain("reference-audit-stamp")
  })

  it("flags a check stamp written with a synonym for 확인", () => {
    // Same stamp, different verb. Pinning one word would let the next author
    // reintroduce the history the rule removes, and wonder why it passed.
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "1. https://example.com/design-system — 설명",
          "1. https://example.com/design-system — 설명 (2026-08-02 조회)"
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("reference-audit-stamp")
  })

  it("counts a second note under an H3 inside the same H2 section", () => {
    // The scope of "one note per section" is the standard H2. Resetting on any
    // `#{2,}` — the boundary `inReferences` needs to match `parseReferences` —
    // would let a note tucked under a `### 서브섹션` restart the count, and 9 of
    // 17 catalog entries have exactly that shape inside `## Colors`.
    const older = "> **팔레트 정정(2026-07-29).** 이전 라운드 결과다."
    const raw = makeDraft({
      body: (s) =>
        s.replace(
          "## Colors\n",
          `## Colors\n\n${NOTE}\n\n### 다크 테마 램프\n\n${older}\n`
        ),
    })
    expect(rulesOf(raw, OPTS, "warn")).toContain("audit-note-duplicate")
  })
})

// ── frontmatter token rules ──────────────────────────────────────────────────
// Tokens moved from body fences into frontmatter maps. The token rules kept
// scanning the body, so they judged an empty region: a `#3182F6` written into
// `colors:` passed `validate:catalog` outright. These tests fail if that
// happens again — each asserts a finding the rule can only produce by actually
// reading the frontmatter.

function draftWithFrontmatterColors(rows: Array<string>): string {
  return makeDraft({
    frontmatter: [
      "---",
      "name: 데모",
      "slug: demo",
      "category: finance",
      'last_updated: "2026-07-03"',
      'created_at: "2026-07-03"',
      "lang: ko",
      "logo: https://getdesign.kr/logos/demo.png",
      "colors:",
      ...rows.map((r) => `  ${r}`),
      // Required alongside `colors:` (#428), so the rows under test are the
      // only thing that can fail.
      "typography:",
      "  body:",
      "    fontSize: 16px",
      "---",
    ].join("\n"),
  })
}

function rulesFor(raw: string): Array<string> {
  return validateDraft(raw, OPTS).issues.map((i) => i.rule)
}

describe("token rules read the frontmatter maps", () => {
  it("blocks a hex value in the colors map", () => {
    expect(rulesFor(draftWithFrontmatterColors(["brand: #3182F6"]))).toContain(
      "non-oklch-token-value"
    )
  })

  it("blocks rgb()/hsl() notations too", () => {
    for (const value of [
      "rgb(49, 130, 246)",
      "rgba(0,0,0,.5)",
      "hsl(0 0% 0%)",
    ]) {
      expect(
        rulesFor(draftWithFrontmatterColors([`brand: ${value}`])),
        value
      ).toContain("non-oklch-token-value")
    }
  })

  it("blocks a colour the sidecar would drop, even beside an OKLCH one", () => {
    // The linter reads a named colour or an upper-case function as a colour
    // and the extractor keeps neither, so one mixed into an OKLCH palette left
    // the sidecar while the gate passed (#597).
    for (const value of [
      "white",
      "transparent",
      "RGB(49 130 246)",
      "OKLCH(0.62 0.19 258)",
      "oklab(0.62 -0.03 -0.18)",
      "0.4",
    ]) {
      expect(
        rulesFor(
          draftWithFrontmatterColors([
            "brand: oklch(0.62 0.19 258)",
            `surface: ${value}`,
          ])
        ),
        value
      ).toContain("non-oklch-token-value")
    }
  })

  it("offers the reference spelling for a bare token name", () => {
    const issue = validateDraft(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        "fill-brand: brand",
      ]),
      OPTS
    ).issues.find((i) => i.rule === "non-oklch-token-value")
    expect(issue?.fix).toContain('`fill-brand: "{colors.brand}"`')
  })

  it("blocks an OKLCH value with more written after it", () => {
    // The sidecar would carry the whole string as one colour.
    for (const value of [
      "oklch(0.62 0.19 258) typo",
      "oklch(0.62 0.19 258) oklch(0.5 0.1 30)",
    ]) {
      expect(
        rulesFor(
          draftWithFrontmatterColors([
            "brand: oklch(0.62 0.19 258)",
            `surface: ${value}`,
          ])
        ),
        value
      ).toContain("non-oklch-token-value")
    }
  })

  it("does not offer a token a reference to itself", () => {
    // `"{colors.brand}"` on the `brand` row would pass every rule and never
    // resolve to a colour.
    const issue = validateDraft(
      draftWithFrontmatterColors(["brand: brand"]),
      OPTS
    ).issues.find((i) => i.rule === "non-oklch-token-value")
    expect(issue?.fix).not.toContain("{colors.brand}")
    expect(issue?.fix).toContain("`oklch(L C H)`")
  })

  it("does not offer a reference the reference check would refuse", () => {
    // A Korean key is valid YAML, but `{colors.빨강}` is not reference-shaped,
    // so following that hint would block the row again.
    const issue = validateDraft(
      draftWithFrontmatterColors(["빨강: oklch(0.6 0.2 25)", "accent: 빨강"]),
      OPTS
    ).issues.find((i) => i.rule === "non-oklch-token-value")
    expect(issue?.fix).not.toContain("{colors.빨강}")
    expect(issue?.fix).toContain("`oklch(L C H)`")
  })

  it("offers a reference only to a row that holds a colour", () => {
    // `a: "{colors.b}"` and `b: "{colors.a}"` would pass the draft gate as a
    // cycle that never resolves.
    const fixes = validateDraft(
      draftWithFrontmatterColors(["a: b", "b: a"]),
      OPTS
    )
      .issues.filter((i) => i.rule === "non-oklch-token-value")
      .map((i) => i.fix)
    expect(fixes).toHaveLength(2)
    for (const fix of fixes) expect(fix).not.toMatch(/\{colors\.[ab]\}/)
  })

  it("blocks a colour row with no value or a list for a value", () => {
    // Neither is a string, so the sidecar drops the row while another colour
    // keeps `unreadable-colors` quiet.
    for (const row of [
      "surface:",
      "surface:   # 표면",
      "surface: ~",
      "surface: []",
      "surface: [white]",
    ]) {
      expect(
        rulesFor(
          draftWithFrontmatterColors(["brand: oklch(0.62 0.19 258)", row])
        ),
        row
      ).toContain("non-oklch-token-value")
    }
  })

  it("leaves a row that aliases a map to its own rule", () => {
    // `aliased-map-value` names it; a second block on the row would say the
    // same thing, and call the map a list.
    const rules = rulesFor(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        "surface: *a",
      ]).replace("colors:\n", "grid: &a\n  x: 1\ncolors:\n")
    )
    expect(rules).toContain("aliased-map-value")
    expect(rules).not.toContain("non-oklch-token-value")
  })

  it("blocks a colour reference with no map name", () => {
    // The linter drops it without a word, so nothing else would (#600).
    expect(
      rulesFor(
        draftWithFrontmatterColors([
          "brand: oklch(0.62 0.19 258)",
          'surface: "{nokey}"',
        ])
      )
    ).toContain("non-oklch-token-value")
  })

  it("names the colour a map-less reference meant, in one message", () => {
    const issues = validateDraft(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        'fill-brand: "{brand}"',
      ]),
      OPTS
    ).issues.filter((i) => i.fix.includes("{brand}"))
    expect(issues.map((i) => i.rule)).toEqual(["non-oklch-token-value"])
    expect(issues[0].fix).toContain('`fill-brand: "{colors.brand}"`')
  })

  it("gives a block-scalar map-less reference one message too", () => {
    const issues = validateDraft(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        "fill-brand: |-",
        "  {brand}",
      ]),
      OPTS
    ).issues.filter((i) => i.fix.includes("{brand}"))
    expect(issues.map((i) => i.rule)).toEqual(["non-oklch-token-value"])
  })

  it("still judges a map-less word in the comment of a colour reference row", () => {
    // The row is a sound reference, so nothing else blocks the stray
    // `{typography}` its note carries to the sidecar.
    const rules = rulesFor(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        'fill-brand: "{colors.brand}"  # {typography} 와 혼동 금지',
      ])
    )
    expect(rules).toContain("unresolved-token-ref")
  })

  it("still judges a map-less word after a blocked row's value", () => {
    const issues = validateDraft(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        'fill-brand: "{brand}"  # {typography} 참고',
      ]),
      OPTS
    ).issues.filter((i) => i.fix.includes("{typography}"))
    expect(issues.map((i) => i.rule)).toEqual(["unresolved-token-ref"])
  })

  it("still judges the same map-less word in prose", () => {
    // Only the colour row is the OKLCH rule's; the prose line keeps its own
    // finding.
    const raw = draftWithFrontmatterColors([
      "brand: oklch(0.62 0.19 258)",
      'fill-brand: "{brand}"',
    ]).replace("# 데모", "# 데모\n\n버튼은 {brand} 를 쓴다.")
    expect(raw).toContain("버튼은 {brand}")
    expect(rulesOf(raw, OPTS, "warn")).toContain("dotless-token-ref")
  })

  it("leaves a colour reference to the reference check", () => {
    const rules = rulesFor(
      draftWithFrontmatterColors([
        "brand: oklch(0.62 0.19 258)",
        'surface: "{colors.nope}"',
      ])
    )
    expect(rules).toContain("unresolved-token-ref")
    expect(rules).not.toContain("non-oklch-token-value")
  })

  it("blocks a colour that points outside `colors:`", () => {
    // The linter drops such a row without a word; a colour points into
    // `colors:`. `{Palette.x}` is a namespace the reference check leaves.
    for (const value of ['"{zzz.x}"', '"{fonts.sans}"', '"{Palette.x}"']) {
      expect(
        rulesFor(
          draftWithFrontmatterColors([
            "brand: oklch(0.62 0.19 258)",
            `surface: ${value}`,
          ])
        ),
        value
      ).toContain("non-oklch-token-value")
    }
  })

  it("blocks a value that only opens like a reference", () => {
    // Skipped as a reference, it was found by no reference check and dropped
    // by the sidecar.
    for (const value of ['"{not-a-reference"', '"{colors.brand} x"']) {
      expect(
        rulesFor(
          draftWithFrontmatterColors([
            "brand: oklch(0.62 0.19 258)",
            `surface: ${value}`,
          ])
        ),
        value
      ).toContain("non-oklch-token-value")
    }
  })

  it("blocks an upper-case colour function in the other token maps", () => {
    expect(
      rulesFor(
        draftWithRawColorRows([
          "  brand: oklch(0.62 0.19 258)",
          "rounded:",
          "  card: RGB(0 0 0)",
        ])
      )
    ).toContain("non-oklch-token-value")
  })

  it("accepts an OKLCH value, quoted or not", () => {
    for (const value of [
      "oklch(0.62 0.19 258)",
      '"oklch(0.62 0.19 258)"',
      "oklch(0.62 0.19 258 / 40%)",
    ]) {
      expect(
        rulesFor(draftWithFrontmatterColors([`brand: ${value}`])),
        value
      ).not.toContain("non-oklch-token-value")
    }
  })

  it("warns when the OKLCH does not decode to its annotated hex", () => {
    expect(
      rulesFor(
        draftWithFrontmatterColors(["brand: oklch(0.9 0.02 90)   # #3182F6"])
      )
    ).toContain("oklch-hex-mismatch")
  })

  it("warns when one token name carries two different values", () => {
    // In two maps: YAML reads both, and the drift gate drops the name.
    expect(
      rulesFor(
        draftWithFrontmatterColors([
          "light:",
          "  bg-canvas: oklch(1 0 0)",
          "dark:",
          "  bg-canvas: oklch(0.148 0.004 277)",
        ])
      )
    ).toContain("duplicate-token-value")
  })

  it("blocks one token name written twice in the same map as unreadable YAML", () => {
    // YAML refuses a repeated key, so the colour readers read nothing from the
    // block (docs/adr/0011) and the one cause is the YAML error.
    const rules = rulesFor(
      draftWithFrontmatterColors([
        "bg-canvas: oklch(1 0 0)",
        "bg-canvas: oklch(0.148 0.004 277)",
      ])
    )
    expect(rules).toContain("frontmatter-yaml-invalid")
    expect(rules).not.toContain("duplicate-token-value")
  })

  it("leaves a reference alone rather than judging it as a literal", () => {
    // `{colors.brand}` resolves elsewhere. Treating it as a colour literal
    // would block every semantic alias in the catalog.
    expect(
      rulesFor(
        draftWithFrontmatterColors([
          "brand: oklch(0.62 0.19 258)",
          'fill-brand: "{colors.brand}"',
        ])
      )
    ).not.toContain("non-oklch-token-value")
  })

  it("does not mistake a group comment for a token", () => {
    expect(
      rulesFor(
        draftWithFrontmatterColors([
          "## Brand",
          "# 브랜드 램프",
          "brand: oklch(0.62 0.19 258)",
        ])
      )
    ).not.toContain("non-oklch-token-value")
  })
})

// ── the shapes a regex-only reader used to miss ───────────────────────────────
// Every case below passed the gate before the fix, silently. They share one
// cause: the frontmatter is real YAML now, but the rules approximated YAML with
// regexes, and each approximation differed from the language in some corner.

/** Colour rows verbatim — the caller controls indentation, so a column-0 line
 *  (which YAML treats as still inside the map) can be exercised. */
function draftWithRawColorRows(rows: Array<string>): string {
  return makeDraft({
    frontmatter: [
      "---",
      "name: 데모",
      "slug: demo",
      "category: finance",
      'last_updated: "2026-07-03"',
      'created_at: "2026-07-03"',
      "lang: ko",
      "logo: https://getdesign.kr/logos/demo.png",
      "colors:",
      ...rows,
      "---",
    ].join("\n"),
  })
}

describe("quoting cannot hide a token from the rules", () => {
  // A bare `primary: #FF0038` is not valid YAML — the `#` opens a comment and
  // the value becomes null. So the quoted spelling is the ONLY way an author can
  // actually write a hex, which made it the one spelling that had to be caught
  // and the one that was not: the rule only rejected the form YAML rejects too.
  it("blocks a quoted hex, in both quote styles", () => {
    for (const value of ['"#FF0038"', "'#FF0038'"]) {
      expect(
        rulesFor(draftWithFrontmatterColors([`brand: ${value}`])),
        value
      ).toContain("non-oklch-token-value")
    }
  })
})

describe("a column-0 comment does not end the token map", () => {
  it("keeps checking rows that follow one", () => {
    // YAML keeps the mapping open across a comment at any indentation. Reading
    // the comment as the end of the map left every later token unexamined —
    // measured on a real entry, 22 of 33 colours went unchecked while the
    // validator printed PASSED.
    expect(
      rulesFor(
        draftWithRawColorRows([
          "  brand: oklch(0.62 0.19 258)",
          "# a comment written flush left",
          "  after: #ABCDEF",
        ])
      )
    ).toContain("non-oklch-token-value")
  })

  it("still stops at the next top-level key", () => {
    // The map must end somewhere; `logo` is a sibling key, not a token.
    expect(
      rulesFor(
        draftWithRawColorRows([
          "  brand: oklch(0.62 0.19 258)",
          "typography:",
          "  body: { size: 16px }",
        ])
      )
    ).not.toContain("non-oklch-token-value")
  })
})

describe("frontmatter must parse as YAML", () => {
  it("blocks a font stack whose leading quote breaks the document", () => {
    // The historical failure: this exact shape made seven entries parse to zero
    // tokens with every gate still green, because nothing in the repo read the
    // frontmatter with a YAML parser.
    const draft = makeDraft({
      frontmatter: [
        "---",
        "name: 데모",
        "slug: demo",
        "category: finance",
        'last_updated: "2026-07-03"',
        'created_at: "2026-07-03"',
        "lang: ko",
        "fonts:",
        '  fontFamily: "Pretendard Variable", Pretendard, sans-serif',
        "---",
      ].join("\n"),
    })
    expect(rulesFor(draft)).toContain("frontmatter-yaml-invalid")
  })

  it("passes the same stack once it is quoted as one scalar", () => {
    const draft = makeDraft({
      frontmatter: [
        "---",
        "name: 데모",
        "slug: demo",
        "category: finance",
        'last_updated: "2026-07-03"',
        'created_at: "2026-07-03"',
        "lang: ko",
        "fonts:",
        "  fontFamily: '\"Pretendard Variable\", Pretendard, sans-serif'",
        "---",
      ].join("\n"),
    })
    expect(rulesFor(draft)).not.toContain("frontmatter-yaml-invalid")
  })
})

describe("indentation cannot hide a token either", () => {
  it("blocks a token nested under another, whatever its value", () => {
    // A nested token is renamed `{colors.brand.primary}`, which the sidecar
    // and a `{colors.primary}` reference both miss. `typography:` is the map
    // that legitimately nests, and it is not scanned by this rule.
    expect(
      rulesFor(draftWithRawColorRows(["  brand:", "    primary: #ABCDEF"]))
    ).toContain("noncanonical-token-indent")
  })

  it("reads a map indented by four spaces as the same tokens", () => {
    // Indentation is YAML's business: four spaces is the same flat map (#589).
    expect(
      rulesFor(draftWithRawColorRows(["    primary: oklch(0.62 0.19 258)"]))
    ).toEqual(
      rulesFor(draftWithRawColorRows(["  primary: oklch(0.62 0.19 258)"]))
    )
  })
})

describe("the token map's canonical shape is enforced, not just its values", () => {
  it("blocks a token nested below a group key even when its colour is valid", () => {
    // A VALID colour under a group key is the dangerous case: nothing objects
    // to the value, but the extractor reads the map's own rows, so the token
    // never reaches the sidecar — and `tokens:check` then agrees with the
    // truncated file it just generated. Measured: 33 colours became 32.
    expect(
      rulesFor(
        draftWithRawColorRows(["  brand:", "    primary: oklch(0.62 0.19 258)"])
      )
    ).toContain("noncanonical-token-indent")
  })

  it("leaves the canonical two-space shape alone", () => {
    expect(
      rulesFor(draftWithRawColorRows(["  primary: oklch(0.62 0.19 258)"]))
    ).not.toContain("noncanonical-token-indent")
  })
})

describe("a BOM cannot switch the YAML check off", () => {
  const BOM = String.fromCharCode(0xfeff)

  const brokenFrontmatter = [
    "---",
    "name: 데모",
    "slug: demo",
    "category: finance",
    'last_updated: "2026-07-03"',
    'created_at: "2026-07-03"',
    "lang: ko",
    "fonts:",
    '  fontFamily: "Pretendard Variable", Pretendard, sans-serif',
    "---",
  ].join("\n")

  it("still reads keys through a BOM, so the unknown-key rule keeps working", () => {
    // Two separate readers slice the frontmatter, and only one of them was
    // pinned. `checkFrontmatterKeys` could lose its BOM strip with every other
    // test still green — and that rule fails SILENTLY when it misses, since a
    // key it never sees raises nothing.
    const withTypo = makeDraft({
      frontmatter: [
        "---",
        "name: 데모",
        "slug: demo",
        "category: finance",
        'last-updated: "2026-07-03"',
        'created_at: "2026-07-03"',
        "lang: ko",
        "---",
      ].join("\n"),
    })
    expect(rulesFor(BOM + withTypo)).toContain("unknown-frontmatter-key")
  })

  it("reports invalid YAML with or without one", () => {
    // Editors that emit a BOM would otherwise get a free pass: the `^---` anchor
    // misses and this check returns nothing — the silent zero-token failure
    // the check exists to stop.
    const plain = makeDraft({ frontmatter: brokenFrontmatter })
    expect(rulesFor(plain), "no BOM").toContain("frontmatter-yaml-invalid")
    expect(rulesFor(BOM + plain), "with BOM").toContain(
      "frontmatter-yaml-invalid"
    )
  })
})

describe("the elevation map is held to the token rules", () => {
  const withElevation = (...rows: Array<string>) =>
    makeDraft().replace(
      "lang: ko",
      ["lang: ko", "elevation:", ...rows].join("\n")
    )

  it("accepts a bare one-line shadow, multi-layer included", () => {
    const rules = rulesFor(
      withElevation(
        "  shadow-1: 0 1px 2px oklch(0 0 0 / 0.06), 0 1px 1px oklch(0 0 0 / 0.04)   # 카드"
      )
    )
    expect(rules).not.toContain("elevation-not-shadow")
    expect(rules).not.toContain("noncanonical-token-indent")
  })

  it("blocks a bare hex colour, which YAML reads as a comment", () => {
    // ` #0000001A` opens a YAML comment, so the published value is a
    // colourless `0 1px 2px` and the sidecar drops the token — silently.
    const issue = validateDraft(
      withElevation("  shadow-a: 0 1px 2px #0000001A"),
      OPTS
    ).issues.find((i) => i.rule === "elevation-not-shadow")
    expect(issue?.severity).toBe("block")
    expect(issue?.fix).toContain("oklch")
  })

  it("blames the YAML comment only when the hex would have made a shadow", () => {
    // A trailing `# #hex` note, a z-index, a duration — none is a cut-off
    // shadow, so none gets the hex explanation.
    for (const row of [
      "  scrim: oklch(0 0 0 / 0.32)   # #00000052",
      "  z-modal: 1000   # 100 layer",
      "  fast: 120ms   # fade",
      "  g: 0 1px 2px   # fade-in",
      "  h: 0 4px 8px   # 200 level",
    ]) {
      const issue = validateDraft(withElevation(row), OPTS).issues.find(
        (i) => i.rule === "elevation-not-shadow"
      )
      expect(issue?.fix, row).not.toContain("YAML comment")
    }
  })

  it("still blames the comment for `#HEX` and `# #HEX` notes", () => {
    for (const row of ["  a: 0 1px 2px #FFF", "  b: 0 1px 2px   # #0000001A"]) {
      const issue = validateDraft(withElevation(row), OPTS).issues.find(
        (i) => i.rule === "elevation-not-shadow"
      )
      expect(issue?.fix, row).toContain("YAML comment")
    }
  })

  it("blocks a row that is not a shadow at all", () => {
    // An easing curve or a z-index reaches no sidecar from here; it belongs
    // in a body text fence.
    expect(
      rulesFor(withElevation("  ease: cubic-bezier(.2, 0, .2, 1)"))
    ).toContain("elevation-not-shadow")
  })

  it("blocks a nested row the extractor would drop", () => {
    expect(
      rulesFor(
        withElevation("  group:", "    shadow-1: 0 1px 2px oklch(0 0 0 / 0.06)")
      )
    ).toContain("noncanonical-token-indent")
  })
})

describe("the spec's components map takes only what standard tools read", () => {
  // #384 — no catalog gate read this map, so a quoted hex in a component slid
  // past the OKLCH-only policy while validate:catalog and audit:oklch passed.
  const withComponents = (rows: Array<string>) =>
    draftWithRawColorRows([
      "  brand: oklch(0.62 0.19 258)",
      "components:",
      ...rows,
    ])

  it("blocks a quoted literal colour in a component property", () => {
    // One rule, one fix: a component colour is a reference, so "write it bare"
    // and "make it OKLCH" would both be wrong advice here.
    const rules = rulesFor(
      withComponents(["  pill:", '    backgroundColor: "#FF0038"'])
    )
    expect(rules).toContain("component-value-form")
    expect(rules).not.toContain("non-oklch-token-value")
  })

  // #525 — each of these passed every gate: the linter keeps the value as raw
  // text, a bare number or (unquoted reference) a YAML map, with no finding.
  it.each([
    ["an unquoted reference", "backgroundColor: {colors.brand}", "YAML reads"],
    ["a multi-value shorthand", "padding: 12px 16px", "write one value"],
    ["a missing unit", "height: 48", "add a unit"],
    ["prose", "size: 28 또는 32", "keywords, notes"],
    ["a percentage", "rounded: 50%", "other unit"],
    ["an upper-case unit", "height: 4PX", "lower case (`4px`)"],
    ["a keyword", "width: auto", "keywords, notes"],
    // The linter's number shape is `-?\d*\.?\d+`: these it keeps as text.
    ["a plus sign", "height: +4px", "plainly (`4px`)"],
    ["a trailing point", "height: 48.px", "plainly (`48px`)"],
    ["a plus sign with no unit", "height: +4", "add a unit (`4px`"],
    // Past the linter's 64-character limit a dimension stays raw text.
    ["an over-long dimension", `height: ${"0".repeat(64)}px`, "at most 64"],
    ["a trailing point with no unit", "height: 48.", "add a unit (`48px`"],
    // Two points is not a number at all — not "another unit" either.
    ["two decimal points", "height: 1.2.3px", "keywords, notes"],
    // The linter's `isTokenReference` takes letters, digits, `.`, `_`, `-`.
    [
      "a reference with spaces",
      'textColor: "{ colors.brand }"',
      "between the braces",
    ],
    [
      "a reference with a slash",
      'textColor: "{colors/brand}"',
      "between the braces",
    ],
    // Inside quotes ` #` is text, not a comment: one value, shown whole.
    [
      "a note inside the quotes",
      'textColor: "{colors.brand} # 본문"',
      '`textColor: "{colors.brand} # 본문"`',
    ],
    // YAML starts a value only after a space: the row is one string.
    ["no space after the colon", "height:48px", "Write `height: 48px`"],
    // YAML trims only spaces and tabs; a no-break space stays in the value.
    ["a trailing no-break space", "height: 48px ", "invisible space"],
    ["a leading no-break space", "height:  48px", "invisible space"],
    [
      "an unquoted hex, which YAML cuts as a comment",
      "textColor: #3182F6",
      "literal colour",
    ],
    ["a literal colour", "textColor: oklch(0.62 0.19 258)", "literal colour"],
    ["a quoted literal colour", 'textColor: "#FF0038"', "literal colour"],
    ["a quoted dimension", 'height: "48px"', "drop the quotes"],
  ])("blocks %s as a component value", (_, row, hint) => {
    const result = validateDraft(
      withComponents(["  pill:", `    ${row}`]),
      OPTS
    )
    const form = result.issues.filter((i) => i.rule === "component-value-form")
    expect(form).toHaveLength(1)
    expect(form[0].severity).toBe("block")
    expect(form[0].fix).toContain(hint)
    expect(result.issues.map((i) => i.rule)).not.toContain(
      "non-oklch-token-value"
    )
  })

  it.each(["border: 1px", "border: #fff"])(
    "blocks a property the spec does not define (%s)",
    (row) => {
      // A cut-off hex under an unknown name names the name first: pointing it
      // at a colour token would only meet this block on the next run.
      const result = validateDraft(
        withComponents(["  pill:", `    ${row}`]),
        OPTS
      )
      const unknown = result.issues.filter(
        (i) => i.rule === "unknown-component-property"
      )
      expect(unknown).toHaveLength(1)
      expect(unknown[0].severity).toBe("block")
      expect(unknown[0].fix).toContain("backgroundColor")
      const rules = result.issues.map((i) => i.rule)
      expect(rules).not.toContain("component-value-form")
      expect(rules).not.toContain("noncanonical-component-shape")
    }
  )

  it("calls a nested head with a comment a shape problem, not a colour", () => {
    // `#2024 redesign` is a note, not a cut-off hex.
    const rules = rulesFor(
      withComponents(["  pill:", "    height: #2024 redesign"])
    )
    expect(rules).toContain("noncanonical-component-shape")
    expect(rules).not.toContain("component-value-form")
  })

  it.each([
    '"{colors.brand}"',
    "'{colors.brand}'",
    '"{colors.brand}"   # 주석',
    "48px",
    ".5rem",
    "1.25em",
    "0px",
    "-1px",
  ])("admits %s as a component value", (value) => {
    const rules = rulesFor(withComponents(["  pill:", `    height: ${value}`]))
    expect(rules).not.toContain("component-value-form")
    expect(rules).not.toContain("unknown-component-property")
  })

  it.each([
    ["last", ["  pill:", "    height: 48px", "  card:"], "card"],
    ["between two", ["  card:", "  pill:", "    height: 48px"], "card"],
    ["before a flow map", ["  card:", '  pill: { height: "48px" }'], "card"],
  ])("names a component with no property (%s)", (_, rows, name) => {
    // YAML null: the linter builds no model, so the only other blocks would
    // say the colours and the type scale are missing — held back, since the
    // maps are fine.
    const { issues } = validateDraft(withComponents(rows), OPTS)
    const empty = issues.filter((i) => i.rule === "empty-component")
    expect(empty).toHaveLength(1)
    expect(empty[0].severity).toBe("block")
    expect(empty[0].fix).toContain(`\`${name}\``)
    const rules = issues.map((i) => i.rule)
    expect(rules).not.toContain("spec-no-colors")
    expect(rules).not.toContain("spec-no-typography")
    expect(rules).not.toContain("spec-unrecorded-limitation")
  })

  it("still reports missing colours that no empty component explains", () => {
    // The hold-back is tied to its cause: with a well-formed map and an empty
    // palette, the linter's verdict stands.
    const rules = rulesFor(
      draftWithRawColorRows(["components:", "  pill:", "    height: 48px"])
    )
    expect(rules).not.toContain("empty-component")
    expect(rules).toContain("spec-no-colors")
  })

  it("does not call a misshapen component empty", () => {
    // The nested row has its own block; one cause, one message.
    const rules = rulesFor(
      withComponents(["  button:", "    states:", "      hover: darker"])
    )
    expect(rules).toContain("noncanonical-component-shape")
    expect(rules).not.toContain("empty-component")
  })

  it("allows a reference and a bare dimension", () => {
    const rules = rulesFor(
      withComponents([
        "  pill:   # 배지",
        '    backgroundColor: "{colors.brand}"',
        "    height: 56px",
      ])
    )
    expect(rules).not.toContain("component-value-form")
    expect(rules).not.toContain("noncanonical-component-shape")
  })

  it("judges a one-line flow-map component's values like any other", () => {
    // YAML reads `{ … }` as the same component a block is, so its values are
    // judged — this one is a literal colour (#589).
    const rules = rulesFor(
      withComponents(['  pill: { backgroundColor: "#FF0038" }'])
    )
    expect(rules).toContain("component-value-form")
    expect(rules).not.toContain("noncanonical-component-shape")
  })

  it("blocks nesting past component and property", () => {
    expect(
      rulesFor(
        withComponents(["  button:", "    states:", "      hover: darker"])
      )
    ).toContain("noncanonical-component-shape")
  })

  it("judges a block-scalar component value as YAML reads it", () => {
    // `>` folds to `12px 16px`, a shorthand the spec's map does not read.
    const fix = validateDraft(
      withComponents(["  card:", "    padding: >", "      12px 16px"]),
      OPTS
    ).issues.find((i) => i.rule === "component-value-form")?.fix
    expect(fix).toContain("write one value")
  })

  it.each([
    [
      ["    backgroundColor: |-", '      "{colors.primary}"'],
      '"{colors.primary}"',
    ],
    [["    height: |", "      48px"], "48px"],
  ])(
    "sends a block-scalar value the linter reads as text to the key's line (%j)",
    (rows, oneLine) => {
      // The quotes inside `|-`, and the newline a bare `|` keeps, are part of
      // the value — the one-line spelling is the fix.
      const fix = validateDraft(
        withComponents(["  card:", ...rows]),
        OPTS
      ).issues.find((i) => i.rule === "component-value-form")?.fix
      expect(fix).toContain(`on the key's line as \``)
      expect(fix).toContain(`: ${oneLine}\``)
    }
  )
})

describe("every component value the gate admits is one the linter reads", () => {
  // #525 — four review rounds each found a row the line-based check passed and
  // the pinned linter did not read as a value (a number shape, a reference
  // character, a no-break space, a missing space after the colon). This holds
  // the two together: the gate may be stricter (it blocks a literal colour the
  // linter would read), never looser. Cases are whole rows, so a fault in the
  // row's own shape can be written down, not only one in its value — and a
  // case may hold several, since a row the line scan skips hides best beside
  // one it reads.
  const rowsOf = (c: string | Array<string>) =>
    (typeof c === "string" ? [c] : c).map((r) =>
      r.startsWith(" ") ? r : `    ${r}`
    )
  const draftWith = (rows: Array<string>) =>
    makeDraft({
      frontmatter: [
        "---",
        "name: 데모",
        "slug: demo",
        "category: finance",
        'last_updated: "2026-07-03"',
        'created_at: "2026-07-03"',
        "lang: ko",
        "logo: https://getdesign.kr/logos/demo.png",
        "colors:",
        "  primary: oklch(0.62 0.19 258)",
        "typography:",
        "  body:",
        "    fontSize: 16px",
        "rounded:",
        "  md: 8px",
        "spacing:",
        "  s: 4px",
        "components:",
        "  pill:",
        ...rows,
        "---",
      ].join("\n"),
    })
  // Not judged here: whether a reference's KEY exists, or lands in a map the
  // linter reads (`unresolved-token-ref`, and the linter's own broken-ref
  // error), and whether it fits its property.
  const GATE_RULES = new Set([
    // A row YAML cannot read is not admitted either — no gate judges it.
    "frontmatter-yaml-invalid",
    "component-value-form",
    "unknown-component-property",
    "noncanonical-component-shape",
    "empty-component",
    "unresolved-token-ref",
  ])
  const admits = (rows: Array<string>) =>
    !validateDraft(draftWith(rows), OPTS).issues.some(
      (i) => i.severity === "block" && GATE_RULES.has(i.rule)
    )
  // Rows the gate must keep admitting — without them the parity check below
  // would pass a gate that blocked everything.
  const WELL_FORMED = [
    'backgroundColor: "{colors.primary}"',
    "backgroundColor: '{colors.primary}'",
    'backgroundColor: "{colors.primary}" # c',
    'backgroundColor: "{colors.primary}"\t# c',
    'typography: "{typography.body}"',
    'rounded: "{rounded.md}"',
    'padding: "{spacing.s}"',
    "height: 48px",
    "height:\t48px",
    "height: 0px",
    "height: -0px",
    "height: .5px",
    "height: 00px",
    "height: -.5em",
    "height: 1.0rem",
    "height: 48px # n",
    "height: 48px\t",
    `height: ${"1".repeat(62)}px`,
  ]
  // A block scalar has no quotes of its own: its value is the exact string
  // YAML yields, and that string is what the linter tests (#589 review). So a
  // reference is bare braces inside it, and quotes written inside stay in the
  // value — the linter reads `"{colors.primary}"` as text, not a reference.
  // A `|` or `>` header without `-` keeps a trailing newline, text again.
  const BLOCK_SCALAR_READ = [
    ["backgroundColor: |-", "      {colors.primary}"],
    ["backgroundColor: >-", "      {colors.primary}"],
    ["typography: |-", "      {typography.body}"],
    ["typography: >-", "      {typography.body}"],
    ["height: |-", "      48px"],
    ["height: >-", "      48px"],
  ]
  const BLOCK_SCALAR_TEXT = [
    ["backgroundColor: |-", '      "{colors.primary}"'],
    ["backgroundColor: >-", '      "{colors.primary}"'],
    ["backgroundColor: |-", "      '{colors.primary}'"],
    ["typography: |-", '      "{typography.body}"'],
    ["typography: >-", '      "{typography.body}"'],
    ["height: |-", '      "48px"'],
    ["height: >-", '      "48px"'],
    ["backgroundColor: |", "      {colors.primary}"],
    ["backgroundColor: >", "      {colors.primary}"],
    ["height: |", "      48px"],
    ["height: >", "      48px"],
  ]
  const ROWS: Array<string | Array<string>> = [
    ...WELL_FORMED,
    ...BLOCK_SCALAR_READ,
    ...BLOCK_SCALAR_TEXT,
    ["height: 48px", 'backgroundColor: "{colors.primary}"'],
    // Rows the row splitter does not match, beside one it does.
    ["height: 48px", "padding : 12px 16px"],
    ["height: 48px", "textColor : {colors.primary}"],
    ["height: 48px", "padding\t: 28 또는 32"],
    ["height: 48px", "? padding", "    : 12px 16px"],
    ["height: 48px", "height2 : 4px"],
    ["height: 48px", '"padding": 12px 16px'],
    // A plain value continued on the next line is one value to YAML.
    ["padding: 12px", "      16px"],
    ["height: 48px", "      or 56px"],
    ["- height: 48px"],
    'backgroundColor: "{ colors.primary }"',
    'backgroundColor: "{colors/primary}"',
    'backgroundColor: "{colors.primary} # c"',
    'backgroundColor: "{colors.primary}"\u00a0',
    'backgroundColor: \u00a0"{colors.primary}"',
    "backgroundColor: {colors.primary}",
    'backgroundColor:"{colors.primary}"',
    "backgroundColor: oklch(0.62 0.19 258)",
    "backgroundColor: #3182F6",
    `height: ${"1".repeat(63)}px`,
    "height:48px",
    "height: +4px",
    "height: 48.px",
    "height: 48.",
    "height: 48",
    "height: 1e3px",
    "height: 4PX",
    "height: 50%",
    "height: 12px 16px",
    'height: "48px"',
    "height: 48px\u00a0",
    "height: 48px\u3000",
    "height: \u00a048px",
    "height: \u300048px",
    "height: auto",
    "height: 28 또는 32",
  ]

  it.each(WELL_FORMED)("admits %s", (row) => {
    expect(admits(rowsOf(row))).toBe(true)
  })

  const asCase = (rows: Array<string>) => ({
    rows,
    shown: rows.map((r) => r.trim()).join(" + "),
  })

  it.each(BLOCK_SCALAR_READ.map(asCase))(
    "admits the block scalar $shown, a value the linter reads",
    ({ rows }) => {
      expect(admits(rowsOf(rows))).toBe(true)
    }
  )

  it.each(BLOCK_SCALAR_TEXT.map(asCase))(
    "blocks the block scalar $shown, which the linter reads as text",
    ({ rows }) => {
      expect(admits(rowsOf(rows))).toBe(false)
    }
  )

  it.each(ROWS.map((c) => ({ rows: rowsOf(c) })))(
    "$rows: admitted only if the linter reads every property",
    ({ rows }) => {
      if (!admits(rows)) return
      const pill = lint(draftWith(rows)).designSystem.components.get("pill")
      const props = pill ? [...pill.properties] : []
      expect(
        props.length,
        `the linter reads no property from ${JSON.stringify(rows)}`
      ).toBeGreaterThan(0)
      for (const [prop, read] of props) {
        expect(
          read instanceof Object && "type" in read,
          `the gate admits ${JSON.stringify(rows)}, the linter reads ${prop} as ${JSON.stringify(read)}`
        ).toBe(true)
      }
    }
  )
})

describe("components as YAML reads them", () => {
  // One reader decides what is there (#589): a head written `chip :` is the
  // component `chip` to YAML, so only the empty one above it is named.
  it("names the component YAML reads as empty, and only that", () => {
    const rules = rulesFor(
      draftWithRawColorRows([
        "  brand: oklch(0.62 0.19 258)",
        "components:",
        "  button:",
        "  chip :",
        "    height: 48px",
      ])
    )
    expect(rules).toContain("empty-component")
    expect(rules).not.toContain("noncanonical-component-shape")
  })

  it("does not call a list-item property empty", () => {
    // `- height: 48px` makes the component a list, not null.
    const rules = rulesFor(
      draftWithRawColorRows([
        "  brand: oklch(0.62 0.19 258)",
        "components:",
        "  button:",
        "    - height: 48px",
      ])
    )
    expect(rules).toContain("noncanonical-component-shape")
    expect(rules).not.toContain("empty-component")
  })

  it("tells the author to drop a head row left with nothing under it", () => {
    // Following "keep it in the body" for a component's only property would
    // otherwise meet `empty-component` on the next run.
    const fix = validateDraft(
      draftWithRawColorRows([
        "  brand: oklch(0.62 0.19 258)",
        "components:",
        "  card:",
        "    border: 1px",
      ]),
      OPTS
    ).issues.find((i) => i.rule === "unknown-component-property")?.fix
    expect(fix).toContain("delete the component's head row")
  })

  const componentIssues = (rows: Array<string>) =>
    validateDraft(
      draftWithRawColorRows([
        "  brand: oklch(0.62 0.19 258)",
        "components:",
        ...rows,
      ]),
      OPTS
    ).issues

  it.each([
    ["width: 50%", "component-value-form"],
    ["textColor: oklch(0.62 0.19 258)", "component-value-form"],
    ["width: auto", "component-value-form"],
  ])(
    "says to drop the head row wherever a fix moves the only property out (%s)",
    (row, rule) => {
      const fix = componentIssues(["  card:", `    ${row}`]).find(
        (i) => i.rule === rule
      )?.fix
      expect(fix).toContain("delete the component's head row")
    }
  )

  it.each([
    ["an inline map", ["  pill: { height: 48px }"]],
    [
      "a space before a head's colon",
      ["  button:", "    height: 48px", "  chip :", "    height: 40px"],
    ],
    ["a quoted property key", ["  card:", '    "height": 48px']],
  ])("admits %s, which YAML reads as the plain form", (_, rows) => {
    const rules = componentIssues(rows).map((i) => i.rule)
    expect(rules).not.toContain("noncanonical-component-shape")
    expect(rules).not.toContain("unknown-component-property")
    expect(rules).not.toContain("component-value-form")
  })

  it.each([["    width:50%", "component-value-form"]])(
    "rewrites the row with its value's fix too (%s)",
    (row, rule) => {
      // A rewrite that fixed only the key side would meet
      // `component-value-form` on the next run.
      const fix = componentIssues(["  card:", row]).find(
        (i) => i.rule === rule
      )?.fix
      expect(fix).toContain("not one the map reads either")
      expect(fix).toContain("other unit")
    }
  )
})

describe("nesting, in every token map", () => {
  it("applies the flat-shape rule to spacing and rounded too", () => {
    // The colour map was the only one checked, but the sidecar reads all
    // three as flat maps.
    for (const map of ["spacing", "rounded"]) {
      const draft = makeDraft({
        frontmatter: [
          "---",
          "name: 데모",
          "slug: demo",
          "category: finance",
          'last_updated: "2026-07-03"',
          'created_at: "2026-07-03"',
          "lang: ko",
          `${map}:`,
          "  group:",
          "    inner: 16px",
          "---",
        ].join("\n"),
      })
      expect(rulesFor(draft), map).toContain("noncanonical-token-indent")
    }
  })
})

describe("every map in the table reaches every rule its traits name", () => {
  // #432: these rules used to keep their own lists of map names, and a map
  // missing from one was skipped in silence. Driving the cases from the table
  // means a new map gets them without anyone writing a test for it.
  const draftWithMap = (map: string, rows: Array<string>, body = "") =>
    makeDraft({
      frontmatter: [
        "---",
        "name: 데모",
        "slug: demo",
        "category: finance",
        'last_updated: "2026-07-03"',
        'created_at: "2026-07-03"',
        "lang: ko",
        "logo: https://getdesign.kr/logos/demo.png",
        `${map}:`,
        ...rows,
        "---",
      ].join("\n"),
      body: (sections) => `${sections}\n\n${body}`,
    })

  // Widened to the trait interface: a literal `true` would make the `reference`
  // branch look constant while every map happens to have it.
  for (const [map, traits] of Object.entries<FrontmatterMapTraits>(
    FRONTMATTER_MAPS
  )) {
    it(`${map}: a block scalar is judged as the same value on one line`, () => {
      // YAML reads `>` + `x` as `x`; so does every rule (#589).
      expect(rulesFor(draftWithMap(map, ["  a: >", "    x"]))).toEqual(
        rulesFor(draftWithMap(map, ["  a: x"]))
      )
    })

    it(`${map}: nested row ${traits.rowScan ? "blocked" : "left alone"}`, () => {
      const rules = rulesFor(draftWithMap(map, ["  g:", "    inner: 16px"]))
      if (traits.rowScan) expect(rules).toContain("noncanonical-token-indent")
      else expect(rules).not.toContain("noncanonical-token-indent")
    })

    it(`${map}: not reported as an unknown key`, () => {
      expect(rulesFor(draftWithMap(map, ["  a: 1"]))).not.toContain(
        "unknown-frontmatter-key"
      )
    })

    if (traits.reference) {
      it(`${map}: a reference to a missing key is judged`, () => {
        expect(
          rulesFor(draftWithMap(map, ["  a: 1"], `\`{${map}.no-such-key}\``))
        ).toContain("unresolved-token-ref")
      })
    }
  }
})

describe("working notes never reach a published entry", () => {
  it("blocks an author-facing marker left in the body", () => {
    // The migration script writes one above rows it could not place, and eight
    // entries shipped with it. Nothing looked: an HTML comment is not a token,
    // not prose the citation rules judge, and not a heading.
    for (const marker of [
      "<!-- 이전 시 보존된 값. 산문으로 다듬을 것. -->",
      "<!-- TODO: 값 확인 -->",
      "<!-- FIXME 링크 -->",
    ]) {
      expect(
        rulesFor(makeDraft({ body: (s) => `${s}\n\n${marker}\n` })),
        marker
      ).toContain("working-marker-in-prose")
    }
  })

  it("leaves an ordinary HTML comment alone", () => {
    // The skeleton uses comments for guidance an author deletes as they fill it
    // in; only the ones addressed to the author as unfinished work are flagged.
    expect(
      rulesFor(
        makeDraft({ body: (s) => `${s}\n\n<!-- 라이트 전용 팔레트 -->\n` })
      )
    ).not.toContain("working-marker-in-prose")
  })
})

describe("every {map.name} reference names a declared key", () => {
  // Adds rows to the fixture's frontmatter and one sentence of prose that
  // carries the references under test.
  function draftWithRefs(prose: string, frontmatterRows: Array<string> = []) {
    return makeDraft({
      body: (s) => s.replace("두 번째 문장이다.", `${prose} [src:1].`),
    }).replace(
      "    fontWeight: 400\n---",
      ["    fontWeight: 400", ...frontmatterRows, "---"].join("\n")
    )
  }
  function refIssues(raw: string) {
    return validateDraft(raw, OPTS).issues.filter(
      (i) => i.rule === "unresolved-token-ref"
    )
  }

  it("passes references to declared keys, including a property path", () => {
    const raw = draftWithRefs(
      "버튼은 `{colors.primary}` 채움에 `{typography.body}`, 크기는 {typography.body.fontSize}다"
    )
    expect(refIssues(raw)).toEqual([])
    expect(validateDraft(raw, OPTS).passed).toBe(true)
  })

  it("blocks a key the map does not declare", () => {
    // The shape the sweep found most: a prefix the frontmatter key carries and
    // the reference dropped (`{rounded.pill}` against `radius-pill`).
    const issues = refIssues(draftWithRefs("버튼은 `{colors.brand}` 채움이다"))
    expect(issues.map((i) => i.severity)).toEqual(["block"])
    expect(issues[0].fix).toContain("`{colors.brand}`")
  })

  it("names the map that does declare the key", () => {
    const [issue] = refIssues(
      draftWithRefs("제목은 `{typography.font-heading}`을 쓴다", [
        "fonts:",
        '  font-heading: "Gmarket Sans"',
      ])
    )
    expect(issue.fix).toContain("`{fonts.font-heading}`")
  })

  it("blocks a namespace no entry declares as a map, and says where the value lives", () => {
    const [issue] = refIssues(
      draftWithRefs("전환은 `{motion.dur-base}`다", [
        // Even a document that did carry such a map would not make it a
        // token map: the spec and the sidecar read neither.
        "motion:",
        "  dur-base: 200ms",
      ])
    )
    expect(issue.rule).toBe("unresolved-token-ref")
    expect(issue.fix).toContain("There is no `motion:` map")
    expect(issue.fix).toContain("Write `dur-base` as a plain code span")
  })

  it("points a phantom namespace at the exact key when another map has it", () => {
    const [issue] = refIssues(
      draftWithRefs("카드는 `{shadow.card}` 를 쓴다", [
        "elevation:",
        "  card: 0 1px 2px oklch(0 0 0 / 0.1)",
      ])
    )
    expect(issue.fix).toContain("`{elevation.card}`")
  })

  it("treats a key declared with no value as unresolved", () => {
    const raw = draftWithRefs("`{colors.brand}` 이다").replace(
      "  primary: oklch(0.62 0.19 258)   # #3182F6",
      "  primary: oklch(0.62 0.19 258)   # #3182F6\n  brand:"
    )
    expect(refIssues(raw)).toHaveLength(1)
  })

  it("accepts a pattern that matches a declared key", () => {
    // `*` and `{placeholder}` name a family; wanted and toss describe their
    // reference style with `{colors.*}`, vapor-ui its intents with `{intent}`.
    const raw = draftWithRefs(
      "`{colors.*}` 로 부른다. `{colors.prim*}` 과 `{colors.{role}}` 도 같다"
    )
    expect(refIssues(raw)).toEqual([])
  })

  it("blocks a pattern no declared key matches", () => {
    // vapor-ui wrote `{colors.background-{intent}-100}` against keys spelled
    // `color-background-primary-100` — the same dropped prefix as its 71 plain
    // references, invisible while only name-shaped references were read.
    const [issue] = refIssues(
      draftWithRefs("배경은 `{colors.background-{intent}-100}` 이다")
    )
    expect(issue.fix).toContain("is a pattern that no key")
  })

  it("blocks shorthand that is not one reference", () => {
    // toss wrote `{motion.dur-fast/base/slow}`; a name-shaped pattern let it
    // through while every other motion reference in the file was fixed.
    const [issue] = refIssues(
      draftWithRefs("색은 `{colors.primary/surface}` 중 하나다")
    )
    expect(issue.fix).toContain("is not one reference")
  })

  it("does not mistake inline code at the start of a line for a fence", () => {
    // Read as a fence, ```yaml``` would open one that never closes and hide
    // every reference after it; scanBody already reads it as prose. The
    // inline code has to START a line — mid-line it was never at risk.
    const raw = draftWithRefs(
      "본문이다.\n\n```yaml``` 는 쓰지 않는다.\n\n`{colors.brand}` 이다"
    )
    expect(refIssues(raw)).toHaveLength(1)
  })

  it("reads a fence whose info string follows a space", () => {
    // CommonMark allows ``` tsx; left open as prose, its JSX would be judged.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n``` tsx\n<Button bg={colors.brand} />\n```\n\n"
    )
    expect(refIssues(raw)).toEqual([])
  })

  it("walks a pattern over a property path", () => {
    expect(refIssues(draftWithRefs("`{typography.*.fontSize}` 이다"))).toEqual(
      []
    )
    expect(
      refIssues(draftWithRefs("`{typography.*.letterSpacing}` 이다"))
    ).toHaveLength(1)
  })

  it("tells a packed phantom reference to name each value", () => {
    const [issue] = refIssues(draftWithRefs("`{motion.dur-fast/base/slow}` 다"))
    expect(issue.fix).toContain("Write `dur-fast` as a plain code span")
    expect(issue.fix).toContain("packs several names into one")
  })

  it("does not read braces inside a source-code fence", () => {
    // `bg={colors.brand}` is a JSX expression, not DESIGN.md reference syntax.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```tsx\n<Button bg={colors.brand} />\n```\n\n"
    )
    expect(refIssues(raw)).toEqual([])
  })

  it("reads comments and string literals inside a source-code fence", () => {
    // 11st wrote `// border-radius: {rounded.sm}` and baemin
    // bg={`{colors.primary}`} — references, in the only places source code
    // carries them. The bare JSX expression on the same line is not read.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```tsx\n// border-radius: {rounded.pill}\n<Tag bg={`{colors.brand}`} fg={colors.ink} />\n<p>Don't {colors.nope}</p>\n```\n\n"
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{rounded.pill}`"),
      expect.stringContaining("`{colors.brand}`"),
    ])
  })

  it("reads a plain-text or Markdown fence like a text fence", () => {
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```txt\nbg: {colors.nope}\n```\n\n"
    )
    expect(refIssues(raw)).toHaveLength(1)
  })

  it("still blocks a yaml fence nested in a list item", () => {
    // A fence inside `- ` item content sits four spaces in. Restricting fence
    // markers to three spaces (as for top-level CommonMark) let it slip past
    // body-yaml-fence; the block gate keeps reading any indent.
    const raw = draftWithRefs(
      "본문이다.\n\n- 그림자 예시:\n\n    ```yaml\n    card: 0 1px 2px oklch(0 0 0 / 0.1)\n    ```"
    )
    expect(rulesFor(raw)).toContain("body-yaml-fence")
  })

  it("skips template interpolation and reads html comments", () => {
    // `${styles.root}` is JavaScript interpolation inside a template literal;
    // `<!-- {colors.brand} -->` is a comment and is read like `//` or `/* */`.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```tsx\n<div className={`card ${styles.root} ${colors.ink}`} />\n```\n\n```html\n<!--\n  fill: {colors.brand}\n-->\n<p>{colors.ink}</p>\n```\n\n"
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{colors.brand}`"),
    ])
  })

  it("leaves a lowercase brace-expanded file list alone", () => {
    expect(
      refIssues(
        draftWithRefs("`ui_kits/mobile/{app.jsx, screens.jsx}` 를 받는다")
      )
    ).toEqual([])
  })

  it("blocks only a declared map's bare name; other bare names warn", () => {
    // The fixture declares `colors` and `typography`, not `gradients`; `layout`
    // is a phantom. A path segment (`/{layout}/`) is a route, not a reference.
    const issues = validateDraft(
      draftWithRefs("`{gradients}` · `{layout}` · `/{layout}/index`"),
      OPTS
    ).issues.filter((i) => /token-ref/.test(i.rule))
    expect(issues.map((i) => [i.rule, i.severity])).toEqual([
      ["dotless-token-ref", "warn"],
      ["dotless-token-ref", "warn"],
    ])
    // The advice has to be followable: `{gradients.<key>}` or `{layout.<key>}`
    // would turn the warning into a block from the dotted pass.
    expect(issues.map((i) => i.fix)).toEqual([
      expect.stringContaining("declares no `gradients:` map"),
      expect.stringContaining("There is no `layout:` map"),
    ])
    for (const i of issues) expect(i.fix).not.toContain(".<key>}")
  })

  it("carries a block comment and a template literal across lines", () => {
    // JSDoc-style comments and multi-line template literals are where a
    // reference sits on its own line, away from the opening `/*` or backtick.
    // Both sit in a tsx fence: a css fence is read whole and would not exercise
    // the carried-over state.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```tsx\n/**\n * border-radius: {rounded.pill}\n */\n<Box bg={colors.ink} />\nconst css = `\n  fill: {colors.brand};\n`\n<p>{colors.ink}</p>\n```\n\n"
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{rounded.pill}`"),
      expect.stringContaining("`{colors.brand}`"),
    ])
  })

  it("closes a template literal on a line that ends in a line comment", () => {
    // A styled-components block closed as `` ` // {rounded.x} `` must not
    // leave the scanner inside the template: the JSX on the next line is code.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```tsx\nconst Card = styled.div`\n  border-radius: 12px;\n` // {rounded.pill}\n<Card bg={colors.brand}>{item.title}</Card>\n```\n\n"
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{rounded.pill}`"),
    ])
  })

  it("closes a template literal on a line whose unclosed quote is text", () => {
    // `6.1"` sends the rest of the line back through the scanner; the template
    // closed before it must stay closed, or the JSX below reads as a string
    // (`bg={colors.brand}` blocks) and the comment as one too (`{colours.x}`
    // passes unjudged).
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      '## Components\n\n```tsx\nconst Card = styled.div`\n  border-radius: 12px;\n`; <Spec>6.1" 화면</Spec>\n<Card bg={colors.brand}>{item.title}</Card>\n// {colours.primary}\n```\n\n'
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{colours.primary}`"),
    ])
  })

  it("resolves keys as written, not as YAML normalises them", () => {
    // `toJS()` turns `1.0:` into `1`; the reference has to follow the file.
    const raw = (prose: string) =>
      draftWithRefs(prose, ["spacing:", "  1.0: 4px", "  w-1/2: 50%"])
    expect(refIssues(raw("`{spacing.1.0}` 과 `{spacing.w-1/2}` 이다"))).toEqual(
      []
    )
    expect(refIssues(raw("`{spacing.1}` 이다"))).toHaveLength(1)
  })

  it("reads a stylesheet fence in full", () => {
    // A CSS brace opens a rule block, so `{map.name}` in a declaration value
    // is a reference.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```css\n.card { border-radius: {rounded.pill}; color: red; }\n```\n\n"
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{rounded.pill}`"),
    ])
  })

  it("leaves another token system's aliases in source code alone", () => {
    // A json fence quotes a brand's published tokens: nothing inside is read,
    // even an alias that shares this catalog's map names (`{spacing.4}`). In a
    // code string only this catalog's map names are judged.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      '## Components\n\n```json\n{ "bg": { "$value": "{color.carrot.600}" }, "gap": "{spacing.4}", "fg": "{colors.nope}" }\n```\n\n```tsx\nconst r = "{radius.sm}"\nconst fg = "{colors.gone}"\n```\n\n'
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{colors.gone}`"),
    ])
  })

  it("points a capitalised or misspelled phantom at its own advice", () => {
    // `{Motion.x}` must not be told to write `{motion.x}`, which blocks too.
    const fixes = refIssues(
      draftWithRefs("`{Motion.dur-fast}` 과 `{motoin.ease}` 이다")
    ).map((i) => i.fix)
    expect(fixes).toHaveLength(2)
    for (const fix of fixes) {
      expect(fix).toContain("There is no `motion:` map")
      expect(fix).not.toContain("Did you mean `{motion.")
    }
  })

  it("judges a source comment like prose, unlike a string literal", () => {
    // A `//` comment is the catalog's own spec note; only a string literal can
    // hold another token system's alias.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      '## Components\n\n```tsx\n// transition: {motion.ease-standard}\n// bg: {colours.primary}\nconst alias = "{radius.sm}"\n```\n\n'
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{motion.ease-standard}`"),
      expect.stringContaining("`{colours.primary}`"),
    ])
  })

  it("keeps offsets aligned past a string that ends in a line continuation", () => {
    // `"abc\` + newline: the escape has no next character. A mask that padded
    // it would drift one column and hide every later prose reference.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      '## Components\n\n```tsx\nconst s = "abc\\\ndef"\n```\n\n채움은 {motion.dur-fast} 이다\n\n'
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{motion.dur-fast}`"),
    ])
  })

  it("reads a namespace with a hyphen, digit or underscore", () => {
    // Named after CSS properties or a second palette; a letters-only namespace
    // let each of these skip the check entirely.
    const fixes = refIssues(
      draftWithRefs(
        "`{z-index.modal}` · `{colors2.primary}` · `{line_height.body}`"
      )
    ).map((i) => i.fix)
    expect(fixes).toHaveLength(3)
  })

  it("reads a dotless reference with a Korean particle attached", () => {
    // `{typography}로` is prose, not a template glued to an identifier.
    const issues = validateDraft(
      draftWithRefs("글자는 {typography}로 13px 이다"),
      OPTS
    ).issues.filter((i) => i.rule === "unresolved-token-ref")
    expect(issues).toHaveLength(1)
  })

  it("does not let an unclosed quote in JSX text open a string", () => {
    // A `'`/`"` string cannot span a line, so an inch mark or `'90s` is text;
    // the JSX after it stays code and is not read.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      '## Components\n\n```tsx\n<p>6.1" 화면</p> <Box bg={colors.nope} />\n<p>\'90s <Box bg={colors.nope2} /></p>\n<p x="{colors.gone}" />\n```\n\n'
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{colors.gone}`"),
    ])
  })

  it("skips a dotless word glued on either side, and one inside a source string", () => {
    // `{typography}/{spacing}` is a route template; `t("{primary}")` is an
    // i18n key. Neither is a reference that lost its dot.
    const raw = draftWithRefs(
      "경로는 `{typography}/{spacing}`, 대입은 `{primary}=1` 이다"
    ).replace(
      "## Components\n\n",
      '## Components\n\n```tsx\nconst label = t("{primary}")\n```\n\n'
    )
    expect(
      validateDraft(raw, OPTS).issues.filter((i) => /token-ref/.test(i.rule))
    ).toEqual([])
  })

  it("leaves LESS variable interpolation in a stylesheet fence", () => {
    // `@{typography}` is LESS's own syntax, as `#{$x}` is SCSS's — not a
    // reference that lost its dot, even though `typography:` is declared.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```less\n.btn { font: @{typography}; }\n```\n\n"
    )
    expect(
      validateDraft(raw, OPTS).issues.filter((i) => /token-ref/.test(i.rule))
    ).toEqual([])
  })

  it("still reads a text fence, where component specs live", () => {
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```text\nbutton:\n  fill: {colors.brand}\n```\n\n"
    )
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{colors.brand}`"),
    ])
  })

  it("reads token-line comments, which reach the sidecar as `note`", () => {
    const raw = draftWithRefs("본문이다", [
      "rounded:",
      "  card: 16px   # {rounded.pill} 보다 작다",
    ])
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{rounded.pill}`"),
    ])
  })

  it("points `{components.x}` at the heading reference", () => {
    // One letter too many: without the hint the generic advice has the author
    // strip the braces and lose the link to the `###` entry.
    const [issue] = refIssues(draftWithRefs("`{components.button-primary}` 다"))
    expect(issue.fix).toContain("`{component.button-primary}` (singular)")
    const [other] = refIssues(draftWithRefs("`{colors.brand}` 다"))
    expect(other.fix).not.toContain("singular")
  })

  it("reports each distinct reference once", () => {
    const raw = draftWithRefs(
      "`{colors.brand}` 과 `{colors.brand}`, 그리고 `{colors.ink}`"
    )
    expect(refIssues(raw)).toHaveLength(2)
  })

  it("blocks a misspelled map namespace and names the one it meant", () => {
    const [issue] = refIssues(draftWithRefs("`{colours.primary}` 이다"))
    expect(issue.fix).toContain("is not a frontmatter map")
    expect(issue.fix).toContain("Did you mean `{colors.primary}`?")
    // The nearest name wins, heading namespace included: following the advice
    // must not lead into another block.
    const [heading] = refIssues(draftWithRefs("`{componet.button}` 과 같다"))
    expect(heading.fix).toContain("Did you mean `{component.button}`?")
  })

  it("leaves a packed shape under an unknown namespace, near miss or not", () => {
    // `src/{color.ts, font.ts}` is a file list and `{colours.a/b}` a packed
    // typo; the two cannot be told apart, so neither is judged.
    expect(
      refIssues(
        draftWithRefs(
          "`{x.a/b/c}` 와 `{app.jsx, screens.jsx}`, `src/{color.ts, font.ts}`, `{colours.a/b}`"
        )
      )
    ).toEqual([])
  })

  it("leaves SCSS interpolation in a stylesheet fence", () => {
    // `#{…}` is SCSS's own syntax: a sass:color call is not a packed typo of
    // `colors`, and `#{colors.nope}` is interpolation, not a reference.
    const raw = draftWithRefs("본문이다").replace(
      "## Components\n\n",
      "## Components\n\n```scss\n.a { border-color: #{color.adjust($brand, $lightness: -10%)}; }\n.b { color: #{colors.nope}; }\n```\n\n"
    )
    expect(refIssues(raw)).toEqual([])
  })

  it("still reads `#{…}` outside a stylesheet fence", () => {
    // A token-line comment is the sidecar's `note`; skipping a space after `#`
    // must not take it out of the check.
    const raw = draftWithRefs("본문이다", [
      "rounded:",
      "  card: 16px   #{rounded.pill} 보다 작다",
    ])
    expect(refIssues(raw).map((i) => i.fix)).toEqual([
      expect.stringContaining("`{rounded.pill}`"),
    ])
  })

  it("blocks a capitalised namespace and names the lowercase map", () => {
    const [issue] = refIssues(draftWithRefs("`{Colors.primary}` 이다"))
    expect(issue.fix).toContain("Did you mean `{colors.primary}`?")
  })

  it("leaves a capitalised brace list that is not a reference", () => {
    // toss lists bundle files as `ui_kits/mobile/{Components.jsx, Screens.jsx}`.
    expect(
      refIssues(
        draftWithRefs("`mobile/{Components.jsx, Screens.jsx}` 를 받는다")
      )
    ).toEqual([])
  })

  it("blocks a bare map name, and warns on a key that lost its namespace", () => {
    // wanted wrote `{typography}` for a font. A declared key without its map
    // only warns: `title`/`body` are keys in some entries and also ordinary
    // placeholder words.
    const issues = validateDraft(
      draftWithRefs("글자는 `{typography}` 이고 채움은 `{primary}` 다"),
      OPTS
    ).issues.filter((i) => /token-ref/.test(i.rule))
    expect(issues.map((i) => [i.rule, i.severity])).toEqual([
      ["unresolved-token-ref", "block"],
      ["dotless-token-ref", "warn"],
    ])
    expect(issues[1].fix).toContain("write `{colors.primary}`")
  })

  it("warns on a text-fence name in prose, not in the fence itself", () => {
    // baemin wrote `{ease-out}` in prose for a value its motion fence names.
    const withFence = (prose: string) =>
      draftWithRefs(prose).replace(
        "## Components\n\n",
        "## Components\n\n```text\nease-out: cubic-bezier(0.16, 1, 0.3, 1)\nlabel: { pattern: '{ease-out} 로 전환' }\n```\n\n"
      )
    const dotless = (raw: string) =>
      validateDraft(raw, OPTS).issues.filter(
        (i) => i.rule === "dotless-token-ref"
      )
    expect(
      dotless(withFence("전환은 `{ease-out}` 이다")).map((i) => i.fix)
    ).toEqual([expect.stringContaining("is a name from a ```text fence")])
    expect(dotless(withFence("전환은 부드럽다"))).toEqual([])
  })

  it("leaves the forms outside its scope alone", () => {
    // Doubled braces are handlebars, a backslash escapes a brace, and a
    // PascalCase identifier far from any map name is code. None is the
    // reference syntax — with or without a dot inside.
    const raw = draftWithRefs(
      "`{{primary}}` 와 `{{typography}}`, `{{user.name}}님`, `{{colors.nope}}`, `\\{colors.nope\\}` 와 `\\{typography\\}`, 그리고 `{React.Fragment}` 로 감싼다"
    )
    expect(
      validateDraft(raw, OPTS).issues.filter((i) => /token-ref/.test(i.rule))
    ).toEqual([])
  })

  it("leaves template braces alone", () => {
    const raw = draftWithRefs(
      "이름은 `color-{role}-{intent}`, 간격은 `spacing={4}`, 경로는 `/{section}/llms.txt`, 문구는 `'{company} · {region}'` 이다"
    )
    expect(refIssues(raw)).toEqual([])
  })

  it("accepts a declared key in any script", () => {
    // The map reader takes any non-space, non-colon key; `\\w` is ASCII-only.
    const raw = draftWithRefs("`{colors.빨강}` 과 `{colors.빨*}` 이다").replace(
      "  primary: oklch(0.62 0.19 258)   # #3182F6",
      "  primary: oklch(0.62 0.19 258)   # #3182F6\n  빨강: oklch(0.62 0.2 25)"
    )
    expect(refIssues(raw)).toEqual([])
  })

  it("leaves only the non-map namespaces alone", () => {
    // `{component.x}` points at a `###` heading and `{group.name}` is how prose
    // spells the syntax itself. JSX such as `{item.image}` belongs in a source
    // fence, which is not read; in prose it is judged like any namespace.
    expect(
      refIssues(
        draftWithRefs(
          "`{component.button}` 과 같다. 참조는 `{group.name}` 형태다"
        )
      )
    ).toEqual([])
    expect(refIssues(draftWithRefs("`thumbnail={item.image}`"))).toHaveLength(1)
  })

  it("leaves an unparseable frontmatter to frontmatter-yaml-invalid", () => {
    const raw = draftWithRefs("`{colors.brand}` 이다", ['fonts: "unterminated'])
    const rules = rulesFor(raw)
    expect(rules).toContain("frontmatter-yaml-invalid")
    expect(rules).not.toContain("unresolved-token-ref")
  })
})
