import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// Contract tests pinning the /design-md machine-gate wiring. The skill prose
// IS the pipeline — any editor (human or model) who drops these load-bearing
// strings silently disconnects the deterministic validators, and nothing else
// would catch it until the next onboarding run. Pattern follows
// design-md-skill-logo-policy.test.ts.

const ROOT = process.cwd()

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

function readFrontmatter(path: string): string {
  const raw = readRepoFile(path)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

// Reads a threshold out of preview-validator.ts rather than restating it, so
// the doc assertions below are derived from the gate instead of duplicating
// it. Hardcoding the numbers here would leave the tests green while the
// prompts went stale on the next recalibration — the same drift this file
// exists to catch, just on the numeric axis instead of the prose one.
// Handles both `= 24` and `= 40 * 1024` forms; the latter is reported in KiB.
function validatorThreshold(source: string, name: string): number {
  const kib = source.match(new RegExp(`const ${name} = (\\d+) \\* 1024\\b`))
  if (kib) return Number(kib[1])
  const plain = source.match(new RegExp(`const ${name} = ([\\d.]+)`))
  if (!plain) throw new Error(`${name} not found in preview-validator.ts`)
  return Number(plain[1])
}

const AGENT_PATHS = [
  ".claude/agents/research-collector.md",
  ".claude/agents/design-md-author.md",
  ".claude/agents/design-md-reviewer.md",
  ".claude/agents/preview-html-author.md",
  ".claude/agents/preview-html-reviewer.md",
]

describe("/design-md machine gates", () => {
  it("wires the draft gate (6a2) and preview gate (9a2) into the skill body", () => {
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")

    // Draft gate: command, report path, and the retry contract.
    expect(skill).toContain("pnpm validate:draft")
    expect(skill).toContain("review-machine-{N}.json")
    expect(skill).toContain(
      "machine_report_path: {cache_dir}/review-machine-{N}.json"
    )

    // Preview gate: command, report path, and the reviewer handoff.
    expect(skill).toContain("pnpm validate:previews")
    expect(skill).toContain("preview-review-machine-{M}.json")
    expect(skill).toContain(
      "machine_report_path: {cache_dir}/preview-review-machine-{M}.json"
    )

    // Machine retries must not consume the semantic-review budget.
    expect(skill).toContain("do not increment N")
    expect(skill).toContain("do not increment M")
  })

  it("keeps the CLI entrypoints the skill invokes available in package.json", () => {
    const pkg = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>
    }
    expect(pkg.scripts["validate:draft"]).toContain("validate-draft")
    expect(pkg.scripts["validate:catalog"]).toContain("--services")
    expect(pkg.scripts["validate:previews"]).toContain("validate-preview")
  })

  it("hands the machine report to both reviewers and retires mental grepping", () => {
    const designReviewer = readRepoFile(".claude/agents/design-md-reviewer.md")
    const previewReviewer = readRepoFile(
      ".claude/agents/preview-html-reviewer.md"
    )

    expect(designReviewer).toContain("machine_report_path")
    expect(previewReviewer).toContain("machine_report_path")
    // The deterministic validator owns hex/rgba detection now.
    expect(designReviewer).not.toContain("grep mentally")
    // PR #105 lesson: citation existence is not citation correctness.
    expect(designReviewer).toContain("Semantic spot-check")
  })

  it("pins model: inherit on every pipeline agent", () => {
    for (const path of AGENT_PATHS) {
      expect(readFrontmatter(path), `${path} frontmatter`).toMatch(
        /^model: inherit$/m
      )
    }
  })

  // created_at is the catalog's sort key, but nothing in the pipeline would
  // notice its absence: an entry missing it still renders, just pinned to the
  // bottom of the list. Four entries shipped that way before the field became
  // required (#194), all because the author template never emitted it. These
  // assertions pin the three places that have to agree.
  it("wires created_at through the author template, the rubric, and the draft gate", () => {
    const author = readRepoFile(".claude/agents/design-md-author.md")
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    const rubric = readRepoFile(
      ".claude/skills/design-md/references/rubric-design.md"
    )
    const validator = readRepoFile("src/lib/draft-validator.ts")

    // The frontmatter template must emit the field, or every skill-onboarded
    // entry lands undated.
    expect(author).toMatch(/^created_at:/m)
    // Stage 1 must say ${today} feeds created_at, not only last_updated.
    expect(skill).toContain("created_at")
    // The reviewer scores against the required-key list, so it must include it.
    expect(rubric).toMatch(/All required keys present:.*created_at/)
    // And the deterministic gate must actually block a draft that omits it.
    expect(validator).toContain("missing-created-at")
  })

  it("sweeps the 976px embed width in Stage 12", () => {
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    expect(skill).toContain("976 (detail-page embed width")
    expect(skill).toContain("375/768/976/1440")
  })

  // PR #221 moved the preview size gate from raw bytes to brotli. The prompts
  // ARE the pipeline: an author still told "< 100KB" optimizes against a unit
  // the gate stopped measuring, and — worse — the number it replaced is one an
  // LLM writing HTML cannot compute, so the replacement has to be behavioural.
  it("teaches the brotli size gate everywhere the retired raw cap lived", () => {
    const previewAuthor = readRepoFile(".claude/agents/preview-html-author.md")
    const previewReviewer = readRepoFile(
      ".claude/agents/preview-html-reviewer.md"
    )
    const rubric = readRepoFile(
      ".claude/skills/design-md/references/rubric-preview.md"
    )
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    const validator = readRepoFile("src/lib/preview-validator.ts")

    const surfaces = [
      ["preview-html-author.md", previewAuthor],
      ["preview-html-reviewer.md", previewReviewer],
      ["rubric-preview.md", rubric],
      ["SKILL.md", skill],
    ] as const

    for (const [name, text] of surfaces) {
      expect(
        text,
        `${name} must not cite the retired raw 100KB cap`
      ).not.toMatch(/100\s?K(?:B|iB)/i)
      expect(text, `${name} must name the brotli unit`).toContain("brotli")
    }

    // The author cannot compute brotli, so what it is given must be a rule it
    // can follow: inline binary is the only payload that does not compress.
    expect(previewAuthor).toContain("base64")
    expect(previewAuthor).toContain("@font-face")
    // The reviewer's no-machine-report path needs the same eyeball proxy.
    expect(previewReviewer).toContain("data:")

    // The rubric is the surface that states the gate in its real unit, so its
    // three byte figures must be the gate's own. The author deliberately gets
    // only the raw backstop — brotli is not a number it can aim at.
    const blockBrotli = validatorThreshold(validator, "BLOCK_BROTLI_BYTES")
    const warnBrotli = validatorThreshold(validator, "WARN_BROTLI_BYTES")
    const blockRaw = validatorThreshold(validator, "BLOCK_RAW_BYTES")
    expect(rubric).toContain(`${blockBrotli} KiB`)
    expect(rubric).toContain(`${warnBrotli} KiB`)
    expect(rubric).toContain(`${blockRaw} KiB`)
    expect(previewAuthor).toContain(`${blockRaw} KiB`)

    // Rule ids stay on the validator side — no doc under .claude/ cites one,
    // and the validator's block messages quote the rubric prose instead.
    expect(validator).toContain("file-too-large")
    expect(validator).toContain("file-too-large-raw")
    expect(validator).toContain("file-size-budget")
  })

  // The two content rules PR #221 mechanized. Each validator block message
  // quotes a rubric phrase back at the reader ("component demo, not a swatch
  // catalog" / "standalone type-scale showcase") — that quotation is how a
  // reviewer maps a machine block onto a rubric item without either side
  // naming a rule id. Reword one side alone and the block stops pointing at a
  // rule the reader can find.
  it("teaches the swatch-catalog and type-scale blocks to author, rubric, reviewer", () => {
    const previewAuthor = readRepoFile(".claude/agents/preview-html-author.md")
    const previewReviewer = readRepoFile(
      ".claude/agents/preview-html-reviewer.md"
    )
    const rubric = readRepoFile(
      ".claude/skills/design-md/references/rubric-preview.md"
    )
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    const validator = readRepoFile("src/lib/preview-validator.ts")

    // The quoted prose, both sides.
    expect(rubric).toContain("not a swatch catalog")
    expect(validator).toContain("not a swatch catalog")
    expect(rubric).toContain("standalone type-scale showcase")
    expect(validator).toContain("standalone type-scale showcase")

    // The thresholds, derived from the gate rather than restated. Both the
    // author (which must not build the showcase) and the rubric (which scores
    // it) have to carry the same numbers the validator enforces.
    const fillLimit = validatorThreshold(validator, "SWATCH_FILL_LIMIT")
    const labelFloor = validatorThreshold(validator, "TYPE_SCALE_LABEL_FLOOR")
    const labelPercent = Math.round(
      validatorThreshold(validator, "TYPE_SCALE_LABEL_RATIO") * 100
    )
    for (const [name, text] of [
      ["preview-html-author.md", previewAuthor],
      ["rubric-preview.md", rubric],
    ] as const) {
      expect(text, `${name} must cite the swatch limit`).toContain(
        `${fillLimit} or more`
      )
      expect(text, `${name} must cite the label floor`).toContain(
        `${labelFloor} or more`
      )
      expect(text, `${name} must cite the label ratio`).toContain(
        `${labelPercent}% or more`
      )
    }

    // Author: the counts are structural, so a rename does not evade them.
    expect(previewAuthor).toContain("any token showcase")
    expect(previewAuthor).toContain("fill-only elements per theme")

    // Rubric: a machine block zeroes the item rather than docking a point.
    // Counted, not merely contained — adding the paragraph to Item 2 and
    // forgetting Item 3 is the real failure mode.
    expect(
      rubric.match(
        /\*\*A machine block on this item forces `earned` to 0\.\*\*/g
      )?.length,
      "Items 2 and 3 must both carry the adopt-wholesale rule"
    ).toBe(2)

    // Reviewer: the same instruction on the surface that writes the JSON.
    expect(previewReviewer).toContain("set Item 2 `earned` to **0**")
    expect(previewReviewer).toContain("set Item 3 `earned` to **0**")

    // Skill: the 9a2 summary must say the gate owns these two now, or the
    // orchestrator's retry loop reads as structural-only and a content block
    // looks like a validator bug rather than a fix the author must apply.
    expect(skill).toContain("swatch catalog")
    expect(skill).toContain("type-scale showcase")

    expect(validator).toContain("swatch-catalog")
    expect(validator).toContain("type-scale-showcase")
  })

  // The raw self-check line the docs give an agent that cannot compute brotli.
  // It is a derived number — back-calculated from the brotli caps at the
  // corpus's worst observed compression ratio — so nothing in the validator
  // states it and the constant-derived assertions above cannot reach it.
  //
  // Two halves are machine-checkable without re-deriving the ratio, and they
  // are the halves that actually break: the three surfaces must agree with
  // each other (updating two and forgetting the third is the realistic
  // mistake), and the line must sit inside the raw hard cap it is supposed to
  // keep an author away from. The ratio-based reasoning that produced 150
  // lives beside the brotli constants in preview-validator.ts, where a
  // recalibration will be read.
  it("keeps the raw self-check line consistent and inside the raw cap", () => {
    const validator = readRepoFile("src/lib/preview-validator.ts")
    const rawCapKib = validatorThreshold(validator, "BLOCK_RAW_BYTES")

    const surfaces = [
      ".claude/skills/design-md/references/rubric-preview.md",
      ".claude/agents/preview-html-author.md",
      ".claude/agents/preview-html-reviewer.md",
    ]
    const cited = surfaces.map((path) => {
      const m = readRepoFile(path).match(/roughly \*{0,2}(\d+) KiB/)
      if (!m) throw new Error(`${path} states no raw self-check line`)
      return { path, kib: Number(m[1]) }
    })

    for (const { path, kib } of cited) {
      expect(
        kib,
        `${path} puts the self-check line at or above the ${rawCapKib} KiB raw cap, so following it would not keep a file inside the gate`
      ).toBeLessThan(rawCapKib)
    }

    const distinct = [...new Set(cited.map((c) => c.kib))]
    expect(
      distinct,
      `the three surfaces disagree on the self-check line: ${cited
        .map((c) => `${c.path}=${c.kib}`)
        .join(", ")}`
    ).toHaveLength(1)
  })

  // The join between docs and validator is prose, deliberately: a doc names
  // the behaviour ("not a swatch catalog") and the validator's block message
  // quotes that phrase back, so a reader can map a machine block onto a rubric
  // item without either side knowing a rule id. Leaking an id into a prompt
  // breaks that in a way nothing would notice — the prompt starts naming an
  // implementation detail it cannot act on, and the phrase-level join stops
  // being the only thing holding the two surfaces together.
  //
  // This is not hypothetical. Writing "the swatch-catalog clause above" in the
  // rubric put one id into the docs during this very change; review caught the
  // hyphen. Deriving the id list from the validator keeps the guard honest as
  // rules are added.
  it("keeps validator rule ids out of the skill prompts and rubrics", () => {
    const validator = readRepoFile("src/lib/preview-validator.ts")
    const ruleIds = [
      ...new Set(
        [...validator.matchAll(/(?:block|warn)\(\s*\n?\s*"([a-z0-9-]+)"/g)].map(
          (m) => m[1]
        )
      ),
    ]
    // A regex that silently matched nothing would make this test vacuous.
    expect(ruleIds.length).toBeGreaterThan(10)

    const docs = [
      ".claude/skills/design-md/SKILL.md",
      ".claude/skills/design-md/references/rubric-preview.md",
      ".claude/agents/preview-html-author.md",
      ".claude/agents/preview-html-reviewer.md",
    ]
    for (const doc of docs) {
      const text = readRepoFile(doc)
      const leaked = ruleIds.filter((id) => text.includes(id))
      expect(
        leaked,
        `${doc} names validator rule ids (${leaked.join(", ")}) — describe the behaviour in prose instead; the validator's block message quotes the doc, not the other way round`
      ).toEqual([])
    }
  })
})
