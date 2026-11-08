import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { BASELINE_TABLE } from "./contrast-baseline"
import { rebaseline, rewriteRecord } from "./contrast-rebaseline"
import { renderHeldReasons } from "./contrast-report"
import type { RebaselineInput, RecordFiles } from "./contrast-rebaseline"
import type { Finding } from "./contrast-report"

// The inner half of `pnpm audit:contrast:rebaseline`: the record's current
// text, one run's findings and its id in, the record's new text out. Every
// fixture here is a small stand-in for the real files, written out by hand so
// the expected text is not derived the way the code derives it.

const TOTALS_HEADER =
  "| slug | theme | kind | measured | elements | fail | borderline | indeterminate |"
const TOTALS_RULE = "| --- | --- | --- | --- | --- | --- | --- | --- |"
const PAIR_HEADER =
  "| slug | kind | both-published | observed-pair | one-token | no-token | total |"
const PAIR_RULE = "| --- | --- | --- | --- | --- | --- | --- |"

// Judgement prose: dated, or written against one run's numbers by a person.
// The command must hand every one of these lines back untouched.
const JUDGEMENT = [
  "같은 날 main 의 CI(run `999`)는 `gradient 5` 였다.",
  "세 재집계(run `100` · 2026-10-26, run `111` · 2026-11-01)의 읽기에서도 그 구간은 비어 있었다.",
  "**어느 슬러그부터 (2026-11-01 재집계 기준).** toss 부터 본다.",
]

const DOC = [
  "# 프리뷰 대비 기준선",
  "",
  "## 슬러그별 총계",
  "",
  "마지막으로 전수 갱신한 것은",
  "2026-11-01 이다(run `111`). 게이트는 warn 행에도 줄을 출력한다.",
  "",
  TOTALS_HEADER,
  TOTALS_RULE,
  "| baemin | dark | text | 3 | 3 | 0 | 0 | 0 |",
  "| baemin | dark | non-text | 0 | 0 | 0 | 0 | 0 |",
  "| baemin | light | text | 3 | 3 | 0 | 0 | 0 |",
  "| baemin | light | non-text | 0 | 0 | 0 | 0 | 0 |",
  "| toss | dark | text | 4 | 4 | 0 | 0 | 0 |",
  "| toss | dark | non-text | 0 | 0 | 0 | 0 | 0 |",
  "| toss | light | text | 4 | 4 | 1 | 0 | 1 |",
  "| toss | light | non-text | 0 | 0 | 0 | 0 | 0 |",
  "",
  "합계는 적지 않는다.",
  "",
  "## 유보 사유",
  "",
  JUDGEMENT[0],
  "",
  "| 사유 | 건수 |",
  "| --- | --- |",
  "| filter | 1 |",
  "",
  "보류 행 수: 1 (run `111`)",
  "",
  "- `gradient` — 그라디언트 위의 글자.",
  "",
  "## 발행색끼리의 경계선 (2026-09-27 · 재집계 2026-11-01)",
  "",
  "분류한 `borderline` 0행을 frontmatter 와 대조했다. 입력은 run `111`(#1 의 head `abc1234` — 그 PR 이 바꾼 것)다.",
  JUDGEMENT[1],
  "",
  "```bash",
  "gh run download <run id> -n contrast-report -D <폴더>",
  "```",
  "",
  "**결과: `borderline` 0행 중 0행이 두 색 모두 발행 토큰인 쌍이다.**",
  "",
  PAIR_HEADER,
  PAIR_RULE,
  "",
  "## 미달의 발행색 분류 (2026-10-16 · 재집계 2026-11-01)",
  "",
  "**결과: `fail` 1행 중 0행이 두 색 모두 발행 토큰인 쌍이다.**",
  "",
  PAIR_HEADER,
  PAIR_RULE,
  "| toss | text | 0 | 0 | 0 | 1 | 1 |",
  "",
  JUDGEMENT[2],
  "",
  "## 미달을 고칠 때",
  "",
].join("\n")

const BASELINE_BEFORE = [
  "// The recorded table.",
  "",
  'import { parseTotalsTable } from "./contrast-report"',
  "",
  "/** The recorded table, byte for byte as the document publishes it. */",
  "export const BASELINE_TABLE = `\\",
].join("\n")
const BASELINE_AFTER = [
  "`",
  "",
  "/** The recorded table as rows, parsed once. */",
  "export const CONTRAST_BASELINE = parseTotalsTable(BASELINE_TABLE)",
  "",
].join("\n")
const baselineSource = (table: Array<string>): string =>
  `${BASELINE_BEFORE}\n${table.join("\n")}${BASELINE_AFTER}`

const FILES: RecordFiles = {
  doc: DOC,
  baseline: baselineSource(DOC.split("\n").slice(7, 17)),
  classifiedRun:
    '{\n  "run": "111",\n  "slugs": [\n    "baemin",\n    "toss"\n  ]\n}\n',
}

// `ink` and `paper` are published; `#777777` is no token.
const ENTRY = [
  "---",
  "name: 예시",
  "colors:",
  "  ## 발행 팔레트",
  "  ink: oklch(0 0 0)   # #000000",
  "  paper: oklch(1 0 0)   # #ffffff",
  "---",
  "본문",
].join("\n")

const finding = (over: Partial<Finding>): Finding => ({
  slug: "toss",
  theme: "light",
  state: "default",
  kind: "text",
  path: "body > main .label",
  sample: "라벨",
  ratio: 7,
  threshold: 4.5,
  width: 375,
  verdict: "pass",
  blockers: [],
  opacityApprox: false,
  fg: "#000000",
  bg: "#ffffff",
  ...over,
})

// Run 222: toss gains a borderline row of two published colours, its fail row
// becomes a token on an unpublished colour, and one dark row is held for two
// reasons. baemin is measured once, in light non-text.
const FINDINGS: Array<Finding> = [
  finding({ path: "a", verdict: "fail", ratio: 4.48, fg: "#777777" }),
  finding({ path: "b", verdict: "borderline", ratio: 4.6 }),
  finding({ path: "c" }),
  finding({ path: "c", width: 1440 }),
  finding({
    path: "d",
    theme: "dark",
    verdict: "indeterminate",
    blockers: ["gradient", "overlay"],
  }),
  finding({ slug: "baemin", kind: "non-text", threshold: 3, path: "e" }),
]

const INPUT: RebaselineInput = {
  run: "222",
  findings: FINDINGS,
  previewSlugs: ["baemin", "toss"],
  entries: { baemin: ENTRY, toss: ENTRY },
  files: FILES,
}

const NEW_TOTALS = [
  TOTALS_HEADER,
  TOTALS_RULE,
  "| baemin | dark | text | 0 | 0 | 0 | 0 | 0 |",
  "| baemin | dark | non-text | 0 | 0 | 0 | 0 | 0 |",
  "| baemin | light | text | 0 | 0 | 0 | 0 | 0 |",
  "| baemin | light | non-text | 1 | 1 | 0 | 0 | 0 |",
  "| toss | dark | text | 1 | 1 | 0 | 0 | 1 |",
  "| toss | dark | non-text | 0 | 0 | 0 | 0 | 0 |",
  "| toss | light | text | 3 | 3 | 1 | 1 | 0 |",
  "| toss | light | non-text | 0 | 0 | 0 | 0 | 0 |",
]

const ok = (input: RebaselineInput) => {
  const got = rebaseline(input)
  if (!got.ok) throw new Error(`refused: ${got.reasons.join("; ")}`)
  return got
}

describe("rebaseline", () => {
  it("writes the run's totals table into the constant and the document's copy", () => {
    const got = ok(INPUT)
    expect(got.files.baseline).toBe(baselineSource(NEW_TOTALS))
    expect(got.files.doc).toContain(`${NEW_TOTALS.join("\n")}\n\n합계는`)
    expect(got.files.doc).not.toContain("| toss | light | text | 4 |")
  })

  it("writes both published-pair tables and the totals the corpus test reads from their prose", () => {
    const doc = ok(INPUT).files.doc
    expect(doc).toContain(
      [
        "**결과: `borderline` 1행 중 1행이 두 색 모두 발행 토큰인 쌍이다.**",
        "",
        PAIR_HEADER,
        PAIR_RULE,
        "| toss | text | 1 | 0 | 0 | 0 | 1 |",
        "",
        "## 미달의 발행색 분류",
      ].join("\n")
    )
    expect(doc).toContain(
      [
        "**결과: `fail` 1행 중 0행이 두 색 모두 발행 토큰인 쌍이다.**",
        "",
        PAIR_HEADER,
        PAIR_RULE,
        "| toss | text | 0 | 0 | 1 | 0 | 1 |",
        "",
        JUDGEMENT[2],
      ].join("\n")
    )
    expect(doc).toContain("분류한 `borderline` 1행을 frontmatter 와")
  })

  it("writes the hold-reason table with the run's held-row line", () => {
    expect(ok(INPUT).files.doc).toContain(
      [
        JUDGEMENT[0],
        "",
        "| 사유 | 건수 |",
        "| --- | --- |",
        "| gradient | 1 |",
        "| overlay | 1 |",
        "",
        "보류 행 수: 1 (run `222`)",
        "",
        "- `gradient` — 그라디언트 위의 글자.",
      ].join("\n")
    )
  })

  it("names the run where the record points at its current run, and records the run's slugs", () => {
    const got = ok(INPUT).files
    expect(got.doc).toContain("2026-11-01 이다(run `222`). 게이트는")
    expect(got.doc).toContain(
      "입력은 run `222`(#1 의 head `abc1234` — 그 PR 이 바꾼 것)다."
    )
    expect(got.classifiedRun).toBe(
      '{\n  "run": "222",\n  "slugs": [\n    "baemin",\n    "toss"\n  ]\n}\n'
    )
  })

  it("leaves every other line of the document as it was, the dated prose among them", () => {
    const after = new Set(ok(INPUT).files.doc.split("\n"))
    const gone = DOC.split("\n").filter((l) => !after.has(l))
    expect(gone).toEqual([
      "2026-11-01 이다(run `111`). 게이트는 warn 행에도 줄을 출력한다.",
      "| baemin | dark | text | 3 | 3 | 0 | 0 | 0 |",
      "| baemin | light | text | 3 | 3 | 0 | 0 | 0 |",
      "| baemin | light | non-text | 0 | 0 | 0 | 0 | 0 |",
      "| toss | dark | text | 4 | 4 | 0 | 0 | 0 |",
      "| toss | light | text | 4 | 4 | 1 | 0 | 1 |",
      "| filter | 1 |",
      "보류 행 수: 1 (run `111`)",
      "분류한 `borderline` 0행을 frontmatter 와 대조했다. 입력은 run `111`(#1 의 head `abc1234` — 그 PR 이 바꾼 것)다.",
      "**결과: `borderline` 0행 중 0행이 두 색 모두 발행 토큰인 쌍이다.**",
      "| toss | text | 0 | 0 | 0 | 1 | 1 |",
    ])
    for (const line of JUDGEMENT) expect(after).toContain(line)
  })

  it("keeps the constant's file byte for byte outside the table", () => {
    // #642: a hand rewrite of this constant once dropped its closing backtick.
    const got = ok(INPUT).files.baseline
    expect(got.startsWith(`${BASELINE_BEFORE}\n`)).toBe(true)
    expect(got.endsWith(BASELINE_AFTER)).toBe(true)
  })

  describe("refuses, writing nothing and saying why,", () => {
    const refused = (input: RebaselineInput): Array<string> => {
      const got = rebaseline(input)
      expect(got).not.toHaveProperty("files")
      return got.ok ? [] : got.reasons
    }

    it("a run id that is not a number", () => {
      expect(refused({ ...INPUT, run: "<run id>" })).toEqual([
        'run id "<run id>" is not a CI run number',
      ])
    })

    it("an artifact with no findings", () => {
      expect(refused({ ...INPUT, findings: [] })).toEqual([
        "the artifact has no findings",
      ])
    })

    it("a measured slug this checkout has no entry or preview for", () => {
      expect(
        refused({
          ...INPUT,
          findings: [...FINDINGS, finding({ slug: "gone", path: "f" })],
        })
      ).toEqual([
        "the artifact measured gone, which has no preview in this checkout",
        "the artifact measured gone, which has no services/gone.md in this checkout",
      ])
    })

    it("a preview the artifact did not measure", () => {
      // An entry added after the run: writing the run's table would delete
      // its four rows.
      expect(
        refused({ ...INPUT, previewSlugs: ["baemin", "new-one", "toss"] })
      ).toEqual([
        "this checkout has a preview for new-one, which the artifact did not measure — the run predates it; use a run of this checkout",
      ])
    })

    it("an entry whose observed colours the classification cannot find", () => {
      const reasons = refused({
        ...INPUT,
        // lg-electronics lists observed groups this stand-in entry lacks.
        entries: { "lg-electronics": ENTRY },
        findings: FINDINGS.map((f) => ({ ...f, slug: "lg-electronics" })),
        previewSlugs: ["lg-electronics"],
      })
      expect(reasons).toHaveLength(1)
      expect(reasons[0]).toMatch(/^lg-electronics: /)
    })

    it("a classified row read as different colour pairs at different widths", () => {
      expect(
        refused({
          ...INPUT,
          findings: [
            ...FINDINGS,
            finding({
              path: "a",
              verdict: "fail",
              ratio: 4.48,
              fg: "#777777",
              width: 1440,
              bg: "#fefefe",
            }),
          ],
        })
      ).toEqual([
        "1 classified row(s) read different colour pairs at different widths, so there is no one pair to classify: toss|light|default|text|a|4.5|4.480|fail||||",
      ])
    })

    it("a record whose anchors are missing or doubled", () => {
      const reasons = refused({
        ...INPUT,
        files: {
          ...FILES,
          doc: DOC.replace("입력은 run `111`", "입력은 그 run").replace(
            "## 유보 사유",
            "## 유보 사유\n\n## 유보 사유"
          ),
          baseline: FILES.baseline.replace("BASELINE_TABLE", "TABLE"),
        },
      })
      expect(reasons).toEqual([
        "src/lib/contrast-baseline.ts has no `export const BASELINE_TABLE = `\\` followed by a totals table",
        'the document has 2 sections headed "## 유보 사유", expected one',
        'found 0 matches of /입력은 run `\\d+`/g under "## 발행색끼리의 경계선 (2026-09-27 · 재집계 2026-11-01)", expected one',
      ])
    })
  })

  it("returns the same files when run again on its own output", () => {
    const once = ok(INPUT).files
    expect(ok({ ...INPUT, files: once }).files).toEqual(once)
  })

  it("summarises the ratchet rows that moved, and the slugs they belong to", () => {
    expect(ok(INPUT).moved).toEqual([
      "ratchet rows moved: 5, in baemin, toss",
      "  baemin | dark | text — measured 3 → 0, elements 3 → 0",
      "    was: | baemin | dark | text | 3 | 3 | 0 | 0 | 0 |",
      "    now: | baemin | dark | text | 0 | 0 | 0 | 0 | 0 |",
      "  baemin | light | text — measured 3 → 0, elements 3 → 0",
      "    was: | baemin | light | text | 3 | 3 | 0 | 0 | 0 |",
      "    now: | baemin | light | text | 0 | 0 | 0 | 0 | 0 |",
      "  baemin | light | non-text — measured 0 → 1, elements 0 → 1",
      "    was: | baemin | light | non-text | 0 | 0 | 0 | 0 | 0 |",
      "    now: | baemin | light | non-text | 1 | 1 | 0 | 0 | 0 |",
      "  toss | dark | text — measured 4 → 1, elements 4 → 1, indeterminate 0 → 1",
      "    was: | toss | dark | text | 4 | 4 | 0 | 0 | 0 |",
      "    now: | toss | dark | text | 1 | 1 | 0 | 0 | 1 |",
      "  toss | light | text — measured 4 → 3, elements 4 → 3, borderline 0 → 1, indeterminate 1 → 0",
      "    was: | toss | light | text | 4 | 4 | 1 | 0 | 1 |",
      "    now: | toss | light | text | 3 | 3 | 1 | 1 | 0 |",
    ])
  })

  it("notes a token it cannot read, in the words the classification command prints", () => {
    // Left out of the palette, so a pair on it reads as no token: whoever
    // runs the command has to be told, or the table looks wrong for no reason.
    const odd = ENTRY.replace(
      "  paper: oklch(1 0 0)   # #ffffff",
      "  paper: oklch(1 0 0)   # #ffffff\n  haze: oklch(none 0 0)   # #000000"
    )
    expect(
      ok({ ...INPUT, entries: { ...INPUT.entries, toss: odd } }).notes
    ).toEqual([
      "Note: toss defines `haze` in a form this cannot read; it is not in the palette",
    ])
    expect(ok(INPUT).notes).toEqual([])
  })

  it("lists the judgement prose it left for a person, naming the run", () => {
    const remaining = ok(INPUT).remaining
    expect(remaining.length).toBeGreaterThan(0)
    expect(remaining.join("\n")).toContain("「어느 슬러그부터」")
    expect(remaining.join("\n")).toContain("입력은 run `222`")
  })

  it("says nothing moved and nothing is left when the record already holds the run", () => {
    const once = ok(INPUT).files
    const again = ok({ ...INPUT, files: once })
    expect(again.moved).toEqual(["ratchet rows moved: none"])
    expect(again.remaining).toEqual([])
  })
})

describe("the places it writes, in the real record", () => {
  // The fixtures above copy the document's phrases by hand, so a wording
  // change in the real document would pass every test there and fail only at
  // the next rebaseline. Writing into the real files here finds each anchor
  // the command looks for, by the command's own lookups.
  const read = (file: string): string =>
    fs
      .readFileSync(path.join(process.cwd(), file), "utf-8")
      .replace(/\r\n/g, "\n")

  it("finds every anchor once in the document and the constant's file", () => {
    const emptyPairs = {
      table: [PAIR_HEADER, PAIR_RULE].join("\n"),
      total: 0,
      both: 0,
    }
    const got = rewriteRecord(
      {
        doc: read("docs/preview-contrast-baseline.md"),
        baseline: read("src/lib/contrast-baseline.ts"),
      },
      {
        run: "1",
        totals: BASELINE_TABLE,
        borderline: emptyPairs,
        fail: emptyPairs,
        held: renderHeldReasons({ tally: [], held: 0, run: "1" }),
      }
    )
    expect(got.reasons).toEqual([])
  })
})
