import { describe, expect, it } from "vitest"
// Derived, not restated: the skeleton is checked against the same list the
// section gate enforces, so adding a required section can never leave the
// template behind.
import { REQUIRED_SECTIONS } from "./draft-validator"
import { reducedMotionBlock } from "./reduced-motion-block"
import {
  STAGED_CONTRAST_RULE,
  observedRender,
  skippedRender,
} from "./staged-contrast-report"
import {
  DESIGN_MD_AGENT_PATHS,
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_REVIEWER_AGENT,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_SKILL,
  DESIGN_MD_STITCH_FORMAT,
  DESIGN_MD_TEMPLATE,
  PREVIEW_HTML_AUTHOR_AGENT,
  PREVIEW_HTML_REVIEWER_AGENT,
  PREVIEW_PROSE_AUDIT_SKILL,
  readRepoFile,
} from "./skill-asset-paths"

// Contract tests pinning the /design-md machine-gate wiring. The skill prose
// IS the pipeline — any editor (human or model) who drops these load-bearing
// strings silently disconnects the deterministic validators, and nothing else
// would catch it until the next onboarding run. Pattern follows
// design-md-skill-logo-policy.test.ts.

function readFrontmatter(path: string): string {
  const raw = readRepoFile(path)
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  return match?.[1] ?? ""
}

// The docs state their counts in words ("these six patterns", "four follow-up
// text inputs") because that is how the prose reads. The tests below turn one
// back into a number to compare it against what the file actually lists, so the
// map lives here rather than inside any of them.
const NUMBER_WORDS: Partial<Record<string, number>> = {
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
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

// Every advisory section of the preview rubric declares itself in this one
// heading form. Two tests read it: one finds the prose section among them, the
// other holds SKILL.md's roll call to the whole list.
const ADVISORY_HEADING =
  /^## (.+?) \(advisory [^)]*emits `warn` issues, does NOT change the 10-point score\)$/gm

describe("/design-md machine gates", () => {
  it("wires the draft gate (6a2) and preview gate (9a2) into the skill body", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)

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
    const designReviewer = readRepoFile(DESIGN_MD_REVIEWER_AGENT)
    const previewReviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)

    expect(designReviewer).toContain("machine_report_path")
    expect(previewReviewer).toContain("machine_report_path")
    // The deterministic validator owns hex/rgba detection now.
    expect(designReviewer).not.toContain("grep mentally")
    // PR #105 lesson: citation existence is not citation correctness.
    expect(designReviewer).toContain("Semantic spot-check")
  })

  it("pins model: inherit on every pipeline agent", () => {
    for (const path of DESIGN_MD_AGENT_PATHS) {
      expect(readFrontmatter(path), `${path} frontmatter`).toMatch(
        /^model: inherit$/m
      )
    }
  })

  // The drift gate only compares a preview token whose name it can reach, and
  // previews namespace their custom properties (`--tds-primary` for md
  // `primary`), so each slug needs a rewrite rule declared in `src/lib`. A new
  // entry without one contributes nothing and the corpus test fails — on the
  // PR, in CI, with a message the person onboarding has never seen, because the
  // skill never runs `pnpm test`. The gate existed with no way for the author
  // to know about it (#246). These assertions pin both ends: the skill names
  // the two tables, and the two tables still exist under those names.
  it("tells onboarding to register a preview token alias rule", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)

    // Naming the symbols is the whole point — a reader who cannot find them
    // cannot act on the failure.
    expect(skill).toContain("PREVIEW_TOKEN_ALIASES")
    expect(skill).toContain("MATCH_FLOOR")
    // And the step has to actually run, or the failure still lands in CI.
    expect(skill).toContain("oklch-drift-corpus.test.ts")

    // Without these, a rename in src/lib leaves the skill pointing at symbols
    // that no longer exist and the prose rots silently.
    expect(readRepoFile("src/lib/oklch-drift.ts")).toContain(
      "PREVIEW_TOKEN_ALIASES"
    )
    expect(readRepoFile("src/lib/oklch-drift-corpus.test.ts")).toContain(
      "MATCH_FLOOR"
    )
  })

  // Issue #324: the token gates' coverage ratchet is a row per entry now, and
  // a new entry owes it one the same way it owes MATCH_FLOOR one. Same wiring,
  // same failure mode if the pointer goes missing — the message lands in CI on
  // a person who never saw the table. Pinned at both ends, in its own test so
  // a failure names which of the two tables the skill stopped mentioning.
  it("tells onboarding to record the entry's token coverage", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    expect(skill).toContain("TOKEN_COVERAGE")
    expect(skill).toContain("token-coverage.test.ts")
    expect(readRepoFile("src/lib/token-coverage.test.ts")).toContain(
      "TOKEN_COVERAGE"
    )
  })

  // created_at is the catalog's sort key, but nothing in the pipeline would
  // notice its absence: an entry missing it still renders, just pinned to the
  // bottom of the list. Four entries shipped that way before the field became
  // required (#194), all because the author template never emitted it. These
  // assertions pin the three places that have to agree.
  it("wires created_at through the author template, the rubric, and the draft gate", () => {
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_DESIGN)
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

  // The fill-in skeleton is only useful if the author subagent is actually
  // handed it. A template nobody is pointed at is a file that rots — the repo
  // carried one such artifact until docs/PRD.md was rewritten: a pre-Stitch
  // skeleton appendix whose Korean headings matched none of the current
  // sections. These assertions pin the three places that have to agree for the
  // skeleton to reach the author.
  it("wires the design.md template through the skill and the author agent", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)
    const template = readRepoFile(DESIGN_MD_TEMPLATE)

    // Stage 6 must pass the path, alongside the format reference.
    expect(skill).toContain(
      "template_path: ${repo_root}/.claude/skills/design-md/references/design-md-template.md"
    )
    // The author must be told to read it, and which file wins on a conflict.
    expect(author).toContain("references/design-md-template.md")
    expect(author).toContain("references/stitch-format.md")

    // The skeleton has to carry every section the author is required to emit,
    // or following it produces a draft the section gate rejects.
    for (const heading of REQUIRED_SECTIONS) {
      expect(template, `template omits ## ${heading}`).toContain(
        `## ${heading}`
      )
    }
  })

  // The three conventions that produced 28 of the 31 warnings standing when the
  // catalog was first measured against the published spec. Each is cheap to
  // follow while authoring and expensive to retrofit — renaming a colliding
  // token touches the sidecar and the preview, and deleting an uncited source
  // renumbers every later citation. So the author must be told up front.
  it("teaches the token conventions that are expensive to retrofit", () => {
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)
    const format = readRepoFile(DESIGN_MD_STITCH_FORMAT)

    for (const doc of [author, format]) {
      // Per-theme palettes get distinct names.
      expect(doc).toContain("dark-bg-canvas")
      // Dimensions carry a unit even at zero.
      expect(doc).toMatch(/0em/)
      // A new source is cited in the same pass.
      expect(doc).toMatch(/\[src:N\]/)
    }
  })

  it("sweeps the 976px embed width in Stage 12", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    expect(skill).toContain("976 (detail-page embed width")
    expect(skill).toContain("375/768/976/1440")
  })

  // PR #221 moved the preview size gate from raw bytes to brotli. The prompts
  // ARE the pipeline: an author still told "< 100KB" optimizes against a unit
  // the gate stopped measuring, and — worse — the number it replaced is one an
  // LLM writing HTML cannot compute, so the replacement has to be behavioural.
  it("teaches the brotli size gate everywhere the retired raw cap lived", () => {
    const previewAuthor = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const previewReviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const skill = readRepoFile(DESIGN_MD_SKILL)
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
    const previewAuthor = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const previewReviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const skill = readRepoFile(DESIGN_MD_SKILL)
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

  // The swap-anchor block (#321) joins the author prompt the same way: the
  // prompt states the convention in prose, the validator's message quotes the
  // phrase, and no rule id crosses over. Reword one side alone and the block
  // stops pointing at the sentence the author was given.
  it("joins the dark swap-anchor block to the author prompt by phrase", () => {
    const previewAuthor = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const validator = readRepoFile("src/lib/preview-validator.ts")
    // A phrase only this rule uses: "defined by the node in front of it" was in
    // the insert bullet before the rule existed, so deleting the rule's own
    // bullet left that assertion green. It is looked for in the block call, not
    // the whole file, because the rule's header comment says it too — a
    // reworded message would still have matched.
    const call =
      /block\(\s*"dark-swap-anchor",[\s\S]*?\n\s*\)/.exec(validator)?.[0] ?? ""
    expect(call, "the dark-swap-anchor block call").not.toBe("")
    expect(previewAuthor).toContain("a class in common")
    expect(call).toContain("a class in common")
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
      DESIGN_MD_RUBRIC_PREVIEW,
      PREVIEW_HTML_AUTHOR_AGENT,
      PREVIEW_HTML_REVIEWER_AGENT,
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
    // The CLI defines a few ids of its own inline, as `rule: "…"` (a missing
    // preview file, an unreadable merged preview). They reach the same machine
    // report, so they must stay out of the same docs.
    const cli = readRepoFile("scripts/validate-preview.ts")
    const ruleIds = [
      ...new Set([
        ...[
          ...validator.matchAll(/(?:block|warn)\(\s*\n?\s*"([a-z0-9-]+)"/g),
        ].map((m) => m[1]),
        ...[...cli.matchAll(/rule: "([a-z0-9-]+)"/g)].map((m) => m[1]),
        // Stage 9a3 adds its contrast items to the same machine report, so its
        // id is held to the same rule. Imported, not grepped: the constant is
        // the one the report is built with.
        STAGED_CONTRAST_RULE,
      ]),
    ]
    expect(ruleIds).toContain("unreadable-merged-preview")
    // A regex that silently matched nothing would make this test vacuous.
    expect(ruleIds.length).toBeGreaterThan(10)

    const docs = [
      DESIGN_MD_SKILL,
      DESIGN_MD_RUBRIC_PREVIEW,
      PREVIEW_HTML_AUTHOR_AGENT,
      PREVIEW_HTML_REVIEWER_AGENT,
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

  // Issue #322: a wrapped card row whose last item is alone on its row never
  // overflows, so no sweep and no static rule sees it — the guard is prose on
  // two surfaces, the author (must not write it) and the reviewer (must flag
  // it). Fixing one surface alone is the realistic drift, so both are pinned
  // to the same three facts: the grid form to use, the flex-wrap form it
  // replaces, and that the failure is not an overflow.
  it("teaches the orphan-row stretch on both the authoring and the review surface", () => {
    const author = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    for (const [name, text] of [
      ["preview-html-author.md", author],
      ["rubric-preview.md", rubric],
    ] as const) {
      // The guard is one bullet line on each surface, and the flex-wrap form is
      // checked inside that line, not the whole file: both files already said
      // `flex-wrap` about atomic control groups before this guard existed, so a
      // file-wide substring stayed green with the guard's own mention deleted.
      const guard = text
        .split("\n")
        .find((line) => line.includes("repeat(auto-fit, minmax("))
      expect(guard, `${name} must prescribe the grid form`).toBeDefined()
      expect(
        guard,
        `${name} must name the flex-wrap form it replaces, in the same bullet`
      ).toContain("flex-wrap: wrap")
      expect(text, `${name} must say the failure does not overflow`).toMatch(
        /never overflows|not an overflow|does \*\*not\*\* overflow|nothing overflows/
      )
    }
  })

  // The rubric states how many static-scan patterns it lists. A bullet added
  // without the count is the drift nobody would notice, and it happened in
  // the very change that added the sixth.
  it("keeps the rubric's stated static-scan pattern count equal to its bullet count", () => {
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const start = rubric.indexOf("## Mobile overflow")
    const end = rubric.indexOf("## Dummy-data labelling")
    expect(start, "the Mobile overflow section must exist").toBeGreaterThan(-1)
    expect(end, "the Dummy-data section must follow it").toBeGreaterThan(start)
    const section = rubric.slice(start, end)
    const stated = /[Ss]can for these (\w+) patterns/.exec(section)
    if (stated === null)
      throw new Error("the section must state its pattern count")
    const expected = /^\d+$/.test(stated[1])
      ? Number(stated[1])
      : NUMBER_WORDS[stated[1]]
    if (expected === undefined)
      throw new Error(
        `the rubric says "${stated[1]} patterns" — a count this test cannot read; extend NUMBER_WORDS`
      )
    // Counts every bold bullet in the section — the list is the only bold
    // bullets it has. A non-pattern bold bullet would have to be fenced off.
    const bullets = section.match(/^- \*\*/gm)?.length ?? 0
    expect(
      bullets,
      `the rubric says "${stated[1]} patterns" but lists ${bullets} bold bullets`
    ).toBe(expected)
  })

  // Issue #404. Stage 4c is conditional on one intake variable, so the whole
  // board checkpoint is reachable only if Stage 2 actually asks for it and the
  // approved paths actually travel. Both ends broke on the way in: the bullet
  // was added under a sentence that still said "three follow-up text inputs",
  // which is the exact instruction an intake agent follows — it would skip the
  // last question, leave `design_board_paths` empty, and the gate would never
  // fire while the skill still described it.
  it("keeps Stage 2's board question wired to the Stage 4c gate", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)

    // The stated count has to equal the list, or following the prose drops a
    // question. Sliced to the follow-up block: the file has other bullet lists.
    const start = skill.indexOf("Then ask ")
    const end = skill.indexOf("Capture the answers as:")
    expect(
      start,
      "Stage 2 must introduce its follow-up inputs"
    ).toBeGreaterThan(-1)
    expect(end, "the capture line must follow them").toBeGreaterThan(start)
    const block = skill.slice(start, end)
    const stated = /Then ask (\w+) follow-up text inputs/.exec(block)?.[1]
    const expected = stated === undefined ? undefined : NUMBER_WORDS[stated]
    if (expected === undefined)
      throw new Error(
        `Stage 2 says "${stated} follow-up text inputs" — a count this test cannot read; extend NUMBER_WORDS`
      )
    const bullets = block.match(/^- \*\*/gm)?.length ?? 0
    expect(
      bullets,
      `Stage 2 says "${stated} follow-up text inputs" but lists ${bullets}`
    ).toBe(expected)

    // The variable has to be captured, be what the gate keys on, and reach the
    // research dispatch. Approving a board that stops at the gate leaves the
    // run rebuilding from public sources while the approval implies otherwise.
    expect(block, "the board question must name its variable").toContain(
      "Stage 4c"
    )
    expect(skill, "the capture line must bind the variable").toMatch(
      /Capture the answers as:[^\n]*design_board_paths/
    )
    const gate = skill.slice(
      skill.indexOf("### Stage 4c"),
      skill.indexOf("## Stage 5")
    )
    expect(gate, "Stage 4c must exist ahead of Stage 5").not.toBe("")
    expect(gate, "Stage 4c must key on the intake variable").toContain(
      "design_board_paths"
    )
    expect(
      gate,
      "Stage 4c must carry the approved board into the research dispatch"
    ).toContain("screenshot_paths")

    // Stage 2 accepts a directory for convenience, so the handover has to
    // expand it. research-collector has no `Bash` to list a directory and
    // `Read` cannot open one, which makes a directory string a source that is
    // silently never read — the "value is right, the place is wrong" failure
    // this PR documents elsewhere. Both halves are asserted: if the agent ever
    // gains `Bash`, the first fails and whoever added it reads this comment
    // before deciding the prose can relax.
    const collectorTools = /^tools: (.+)$/m.exec(
      readRepoFile(".claude/agents/research-collector.md")
    )?.[1]
    expect(
      collectorTools,
      "research-collector must declare a tool list"
    ).toBeDefined()
    expect(
      collectorTools,
      "research-collector gained Bash — Stage 4c's directory expansion may no longer be load-bearing"
    ).not.toContain("Bash")
    // Scoped to the handover paragraph, not the whole stage: 4c's preflight
    // already says "a directory is listed and its files read", so a
    // stage-wide match stayed green with the handover's own sentence deleted.
    // The mutation that proved it: replacing the paragraph with "Append every
    // approved path to `screenshot_paths`" left all assertions passing.
    const handover = /\*\*On approval[\s\S]*?(?=\n\n)/.exec(gate)?.[0] ?? ""
    expect(handover, "Stage 4c must have an on-approval handover").not.toBe("")
    expect(
      handover,
      "the handover must say a directory is expanded to files before it is appended"
    ).toMatch(/director(?:y|ies)/)
  })

  // Issue #404, the other half. The same instruction produced three procedures
  // and the skill absorbed two. The third — comparing the finished preview back
  // against the board — left a mark anyway: 4c's asymmetry note said approving
  // a board "pays off at Stage 12", and the audit:oklch caveat said checking the
  // application site was "Stage 12's work and a human's", while `## Stage 12`
  // held no such step. Prose naming a stage is the only pointer a reader has;
  // when the stage does not carry it, the reader believes the comparison is
  // automatic and stops looking. The test above pins the upstream half (Stage 2
  // asks, Stage 4c gates); this one pins the downstream half.
  it("keeps the board cross-check the prose promises inside Stage 12", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)

    const gate = skill.slice(
      skill.indexOf("### Stage 4c"),
      skill.indexOf("## Stage 5")
    )
    expect(
      gate,
      "Stage 4c must say where approving the board pays off"
    ).toContain("Stage 12")

    const stage12 = skill.slice(
      skill.indexOf("## Stage 12 —"),
      skill.indexOf("## Stage 13 —")
    )
    expect(stage12, "Stage 12 must exist ahead of Stage 13").not.toBe("")

    // Scoped to the step, not the stage: step 11 already sweeps both themes at
    // four widths, so a stage-wide match for "theme" or "board" would stay
    // green with the cross-check deleted — the vacuous-assertion failure this
    // file has already hit once (see the dark-swap anchor note).
    const step =
      /^\d+\. \*\*Design-board cross-check[\s\S]*?(?=^\d+\. )/m.exec(
        stage12
      )?.[0] ?? ""
    expect(step, "the cross-check must be its own numbered step").not.toBe("")

    // The same intake variable as 4c, not a second one: two variables would let
    // the halves be skipped independently, which is how they drifted apart.
    expect(
      step,
      "the step must key on the intake variable Stage 4c already uses"
    ).toContain("design_board_paths")
    expect(
      step,
      "the step must set a result the Stage 13 report can read"
    ).toContain("board_result")

    // What it measures is the whole point. `audit:oklch` and the drift gate
    // both answered "is this value right?" correctly on remember; the finding
    // was that a right value sat on six elements where one was observed. A step
    // that re-checks values would restore the pointer and keep the blind spot.
    expect(
      step,
      "the step must measure where a value landed, not whether it is right"
    ).toMatch(/audit:oklch/)

    // And its cross-reference has to resolve. The first draft of this sentence
    // said the blind spot was noted "under Stage 9"; it is under Stage 10's
    // `### Preview token alias registration`. A pointer naming a stage that
    // does not hold the thing is the exact defect this step exists to end, and
    // it got reproduced inside the fix for it — so the pointer is checked here
    // instead of being left to a reader who will believe it.
    const pointer = /see \*\*([^*]+)\*\* in (Stage \d+)/.exec(step)
    if (pointer === null)
      throw new Error(
        "the step must name the heading stating the WHERE blind spot, and the stage that holds it"
      )
    const [, heading, stage] = pointer
    const headingAt = skill.indexOf(`### ${heading}`)
    expect(
      headingAt,
      `the step points at "${heading}", which is not a heading in the skill`
    ).toBeGreaterThan(-1)
    const stageAt = skill.indexOf(`## ${stage} —`)
    expect(
      stageAt,
      `the step points into ${stage}, which is not a stage heading in the skill`
    ).toBeGreaterThan(-1)
    const nextStageAt = skill.indexOf("\n## Stage ", stageAt + 1)
    expect(
      headingAt > stageAt && (nextStageAt === -1 || headingAt < nextStageAt),
      `the step says "${heading}" is in ${stage}, but that heading sits outside it`
    ).toBe(true)
  })

  // Issue #442 / ADR 0009: Stage 9a3 renders the staged preview and writes its
  // contrast observation into the machine report 9a2 just wrote. Each check
  // here joins the skill's command to something outside the prose — the script
  // package.json runs, the flags that script parses, the report path the
  // reviewer is handed — so editing the wording leaves them alone and breaking
  // the wiring does not.
  it("wires the render observation (9a3) between the preview gate and the reviewer", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const at9a2 = skill.indexOf("### 9a2.")
    const at9a3 = skill.indexOf("### 9a3.")
    const at9b = skill.indexOf("### 9b.")
    expect(
      at9a2 < at9a3 && at9a3 < at9b,
      "9a3 must sit between the preview gate (9a2) and the reviewer dispatch (9b)"
    ).toBe(true)
    const gate = skill.slice(at9a2, at9a3)
    const observe = skill.slice(at9a3, at9b)
    expect(observe, "Stage 9a3 must exist").not.toBe("")

    // Both ways out of 9a2 that reach the reviewer go through 9a3. A route
    // that skipped it would hand the reviewer a report with no `render`.
    for (const route of ["- **Exit 0**", "- **K exhausted"]) {
      const line = /^.*/.exec(gate.slice(gate.indexOf(route)))?.[0] ?? ""
      expect(line, `9a2 route ${route}`).not.toBe("")
      expect(line, `9a2 route ${route} must pass through 9a3`).toContain("9a3")
    }

    const script = /pnpm ([a-z:-]+)/.exec(observe)?.[1]
    expect(script, "9a3 must run a pnpm script").toBeDefined()
    const pkg = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>
    }
    const command = pkg.scripts[script as string]
    expect(command, `package.json has no "${script}" script`).toBeDefined()
    const source = /scripts\/[\w-]+\.ts/.exec(command)?.[0]
    expect(source, `"${script}" must run a script under scripts/`).toBeDefined()
    const cli = readRepoFile(source as string)
    const flags = [...new Set(observe.match(/--[a-z][a-z-]*/g) ?? [])]
    expect(flags.length).toBeGreaterThan(0)
    for (const flag of flags) {
      expect(cli, `${source} does not parse ${flag}`).toContain(`"${flag}"`)
    }

    // Same file as 9a2's report, which is the file the reviewer is handed —
    // that sameness is the whole "no second channel" decision.
    const reportOf = (text: string): string | undefined =>
      /--json-out "([^"]+)"/.exec(text)?.[1]
    expect(reportOf(observe)).toBeDefined()
    expect(reportOf(observe)).toBe(reportOf(gate))
    expect(reportOf(observe)?.endsWith("preview-review-machine-{M}.json")).toBe(
      true
    )
  })

  // The reviewer reads both its own prompt and the rubric (`rubric_path`), so a
  // scoring rule written in each drifts into two rules that score the same
  // measurement in opposite directions — PR #513's first draft did exactly
  // that. The rule lives once, in the rubric's Item 5; the prompt only points
  // at it, and this pins that the pointer lands inside Item 5.
  it("points the reviewer at the rubric's render-observation rule instead of restating it", () => {
    const reviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)
    const label = /the rubric's \*\*([^*]+)\*\* paragraph under Item 5/.exec(
      reviewer
    )?.[1]
    expect(
      label,
      "the reviewer's Item 5 must point at a rubric paragraph"
    ).toBeDefined()

    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const start = rubric.indexOf("## Item 5")
    const item5 = rubric.slice(start, rubric.indexOf("\n## ", start + 1))
    expect(item5, "rubric Item 5 must exist").not.toBe("")
    expect(
      item5,
      `rubric Item 5 has no **${label}** paragraph for the reviewer's pointer to land on`
    ).toContain(`**${label}.**`)
  })

  // The skill, the rubric and both preview agents tell a model to read named
  // fields of the 9a3 report (`render.observed.omittedDarkText` decides
  // whether the reviewer goes back to the CSS). A field renamed in code would
  // leave those instructions pointing at nothing, and the model would read
  // the absence as zero. Every field the docs name must be one the code emits.
  it("names only render-report fields the 9a3 report actually carries", () => {
    const emitted = {
      observed: Object.keys(
        observedRender([], { widths: [], themes: [], states: [] }).render
          .observed
      ),
      skipped: Object.keys(skippedRender("x").render.skipped),
    }
    const docs = [
      DESIGN_MD_SKILL,
      DESIGN_MD_RUBRIC_PREVIEW,
      PREVIEW_HTML_AUTHOR_AGENT,
      PREVIEW_HTML_REVIEWER_AGENT,
    ]
    let named = 0
    for (const doc of docs) {
      const text = readRepoFile(doc)
      for (const m of text.matchAll(/render\.(observed|skipped)\.(\w+)/g)) {
        named += 1
        const outcome = m[1] as keyof typeof emitted
        expect(
          emitted[outcome],
          `${doc} names render.${outcome}.${m[2]}, which the 9a3 report does not carry`
        ).toContain(m[2])
      }
    }
    // A pattern that matched nothing would make this test vacuous.
    expect(named).toBeGreaterThan(2)
  })

  // A skipped observation, an empty one and a clean one all add zero items.
  // If Stage 13 printed them alike, "no Chromium" or "collected nothing" would
  // read as "nothing fell short".
  it("reports the render observation's four states distinctly", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const report = skill.slice(
      skill.indexOf("## Stage 13 —"),
      skill.indexOf("## Edge cases")
    )
    expect(report, "Stage 13 must precede the edge cases").not.toBe("")
    const outputsOf = (variable: string): Array<string | undefined> =>
      (report.match(new RegExp(`^ {2}- \`${variable} = .*$`, "gm")) ?? []).map(
        (line) => /→ `([^`]+)`/.exec(line)?.[1]
      )

    const render = outputsOf("render_result")
    expect(render.length, "four states: ok, warn, empty, skipped").toBe(4)
    expect(render.every((o) => o !== undefined)).toBe(true)
    expect(new Set(render).size).toBe(4)

    // Nor may one of them borrow another step's line.
    const others = [
      ...outputsOf("responsive_result"),
      ...outputsOf("board_result"),
    ]
    expect(others.length).toBeGreaterThan(0)
    for (const line of render) expect(others).not.toContain(line)
  })

  // The report is the only place this step's output reaches a person, and three
  // of its four states are non-findings that read identically if they collapse:
  // "no board existed", "compared, nothing disagreed", "never ran". Reporting a
  // skipped run as silence is the repeated failure this repository records.
  it("reports the board cross-check's four states distinctly", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const report = skill.slice(
      skill.indexOf("## Stage 13 —"),
      skill.indexOf("## Edge cases")
    )
    expect(report, "Stage 13 must precede the edge cases").not.toBe("")

    const lines = report.match(/^ {2}- `board_result = [^\n]*$/gm) ?? []
    expect(
      lines.length,
      "four states: ok, discrepancies, skipped (no board), skipped (no preview MCP)"
    ).toBe(4)

    const outputs = lines.map((line) => /→ `([^`]+)`/.exec(line)?.[1])
    expect(
      outputs.filter((o) => o !== undefined).length,
      "every state must name the line it prints"
    ).toBe(4)
    expect(
      new Set(outputs).size,
      "two states printing the same line makes a skipped run read as a clean one"
    ).toBe(4)

    // The closing residue paragraph tells the person what the machines did not
    // check. Once this step runs, application site is no longer residue — and
    // when it is skipped it still is. A paragraph that never mentions the
    // result contradicts whichever line the report just printed.
    const residue =
      /- \*\*What is left for the person to look at\.\*\*[\s\S]*?(?=\n\n)/.exec(
        report
      )?.[0] ?? ""
    expect(residue, "Stage 13 must close with the residue paragraph").not.toBe(
      ""
    )
    expect(
      residue,
      "the residue paragraph must branch on the cross-check's result"
    ).toContain("board_result")
  })

  // Issue #396 put a prose axis on three surfaces (write it / score it / emit
  // it), because all five scored items score what the preview RENDERS: remember
  // shipped 61% of its rendered text as explanation and scored 10/10. Issue #499
  // turned the axis from a duplication test into a presence ban. The old
  // question — "can the design.md say this?" — kept five kinds of sentence the
  // md has no screen for, and that list is how the captions came back:
  // lg-electronics carried twelve such notes (which token a demo borrowed, how
  // the dark theme was read), answered a review asking it to admit an
  // assumption by extending one of them, and the next round deleted all twelve.
  // So each surface now carries the same closed list of what may stay, and an
  // assumption is marked with a short label rather than a sentence. Fixing one
  // surface and forgetting the others is the drift this pins.
  it("puts the design-explanation caption ban on the author, the rubric, and the reviewer", () => {
    const author = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const reviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)

    // The allow-list IS the check — anything outside it is a caption to drop.
    // A surface that loses one entry starts flagging the element it names, and
    // one that loses the ban keeps its heading and stops testing anything.
    const ALLOWED = [
      "catalog-disclaimer",
      "catalog-dummy",
      "catalog-attribution",
      "component and state labels",
      // Item 3 asks for two or three scale steps named inside a component
      // spec; a list without them reads as banning the labels Item 3 scores.
      "spec and value labels",
      "interaction hints",
      "image placeholders",
    ] as const
    // Each surface is read only inside its own prose section: the three class
    // names also appear in the disclosure and dummy-data sections, so a check
    // over the whole file would pass with the list itself gone.
    // Ends at whichever end marker comes first: a list item's next sibling,
    // or — when it is the last item — the blank line before the next heading.
    const section = (text: string, from: string, ...ends: Array<string>) => {
      const start = text.indexOf(from)
      if (start === -1) throw new Error(`section "${from}" not found`)
      const found = ends
        .map((to) => text.indexOf(to, start + from.length))
        .filter((i) => i !== -1)
      return text.slice(
        start,
        found.length > 0 ? Math.min(...found) : undefined
      )
    }
    for (const [name, text, prose] of [
      [
        "preview-html-author.md",
        author,
        section(author, "**Write no design-explanation caption.**", "\n## "),
      ],
      // The halt checklist restates the list, and an author self-checks
      // against it — an entry missing there is deleted as surely as one
      // missing from the section above.
      [
        "preview-html-author.md (halt condition)",
        author,
        section(author, "- No design-explanation caption.", "\n- ", "\n\n"),
      ],
      [
        "rubric-preview.md",
        rubric,
        section(rubric, "## Explanatory prose", "\n## "),
      ],
      [
        "preview-html-reviewer.md",
        reviewer,
        section(reviewer, "**Explanatory prose", "\n   - **"),
      ],
    ] as const) {
      expect(prose, `${name} must name the ban`).toContain(
        "design-explanation caption"
      )
      // The other half of the boundary: without it the list reads as banning
      // the hero tagline and the mock's own copy along with the captions.
      expect(prose, `${name} must exempt the demo's own text`).toContain(
        "demo's own text"
      )
      for (const entry of ALLOWED)
        expect(prose, `${name} must list "${entry}" as allowed`).toContain(
          entry
        )
      // The answer to "say this is an assumption" — without it the author's
      // only way to comply with a review is the sentence the ban removes.
      expect(prose, `${name} must mark assumptions with a label`).toContain(
        "(가정)"
      )
      // The escape hatch #499 closed, checked over the whole file. Its wording
      // is what a later edit would most likely restore.
      for (const phrase of ["has no screen for", "Legitimately kept"])
        expect(
          text,
          `${name} reopens the escape hatch #499 closed`
        ).not.toContain(phrase)
    }

    // The two Korean copies. CLAUDE.md is the only surface the CI review bot
    // reads, so a stale list there is how the bot would start asking for notes
    // again; the audit skill is what a person reads before trimming prose. The
    // entries are the Korean names of the same list, matched inside each
    // copy's own paragraph for the same reason as above.
    const ALLOWED_KO = [
      "catalog-disclaimer",
      "catalog-dummy",
      "catalog-attribution",
      "컴포넌트·상태 이름표(스펙·값 라벨 포함)",
      "조작 안내",
      "이미지 자리 표시",
    ] as const
    for (const [name, prose] of [
      [
        "CLAUDE.md",
        section(
          readRepoFile("CLAUDE.md"),
          "**디자인 설명 캡션을 쓰지 않는다**",
          "\n- ",
          "\n\n"
        ),
      ],
      [
        "preview-prose-audit/SKILL.md",
        section(
          readRepoFile(PREVIEW_PROSE_AUDIT_SKILL),
          "**닫힌 허용 목록**",
          "\n\n리멤버가"
        ),
      ],
    ] as const) {
      expect(prose, `${name} must exempt the demo's own text`).toContain(
        "시연 자체의 글"
      )
      for (const entry of ALLOWED_KO)
        expect(prose, `${name} must list "${entry}" as allowed`).toContain(
          entry
        )
      expect(prose, `${name} must mark assumptions with a label`).toContain(
        "(가정)"
      )
      // The Korean wording of the escape hatch — the line the audit skill
      // carried before #499 ("못 하면 남긴다 — md 에는 화면이 없어서 …"). Checked
      // inside the copy's own paragraph, so the skill's retrospective sentence
      // ("예전 기준은 …") does not trip it.
      expect(
        prose,
        `${name} reopens the escape hatch #499 closed`
      ).not.toContain("못 하면 남긴다")
    }

    // Advisory, like the content checks around it: it appends warns and leaves
    // the 10-point total alone, so the entries already scored keep their
    // scores. How many advisory sections there are is not pinned here — the
    // roll-call test below holds the full list against what SKILL.md reports,
    // so a new section is one edit there rather than a count in two places.
    const advisory = [...rubric.matchAll(ADVISORY_HEADING)].map((m) => m[1])
    expect(
      advisory,
      "the prose section must be declared advisory in the same form as the others"
    ).toContain("Explanatory prose")

    // Placement is load-bearing, not cosmetic: the pattern-count test above
    // slices the file between `## Mobile overflow` and `## Dummy-data
    // labelling` and counts every bold bullet in between. Wedging this section
    // there would add its bullets to that count and fail a test that has
    // nothing to do with prose.
    expect(
      rubric.indexOf("## Explanatory prose"),
      "the prose section must follow Dummy-data labelling, whose bullet count is sliced by the test above"
    ).toBeGreaterThan(rubric.indexOf("## Dummy-data labelling"))

    // Author: it has to be told not to write the sentence, or the rubric only
    // ever catches it after the fact and the loop spends an iteration on it.
    expect(author).toContain("do not rebuild it in sentences")
    // Reviewer: the surface that writes the JSON must emit the warn, and must
    // do it before writing — a step appended after step 5 reaches nothing.
    expect(reviewer).toContain("Emit one `warn` per caption")
    expect(
      reviewer.indexOf("Explanatory prose"),
      "the prose step must come before the JSON is written"
    ).toBeLessThan(reviewer.indexOf("Write the JSON"))
  })

  // Stage 12 reports every advisory warn because those sections add no points
  // — a preview can carry all of them and still pass on the first iteration.
  // The closing report names them, so a section the rubric adds and the skill
  // does not name is a warn the report has no line for. The roll call is
  // derived from the rubric's own headings, so the next section is caught too.
  it("names every advisory rubric section where the skill reports their warns", () => {
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const headings = [...rubric.matchAll(ADVISORY_HEADING)].map((m) => m[1])
    // A heading regex that silently matched nothing would make this vacuous.
    expect(headings.length).toBeGreaterThan(0)

    const rollCall = /The rubric's (\w+) advisory sections — (.+?) — /.exec(
      skill
    )
    if (rollCall === null)
      throw new Error(
        "SKILL.md must name the rubric's advisory sections where it reports their warns"
      )
    const stated = NUMBER_WORDS[rollCall[1]]
    if (stated === undefined)
      throw new Error(
        `SKILL.md says "${rollCall[1]} advisory sections" — a count this test cannot read; extend NUMBER_WORDS`
      )
    expect(
      stated,
      `SKILL.md says "${rollCall[1]} advisory sections" but the rubric declares ${headings.length}`
    ).toBe(headings.length)
    expect(
      [...rollCall[2].matchAll(/`([^`]+)`/g)].map((m) => m[1]),
      "SKILL.md must name the rubric's advisory sections, in the rubric's order"
    ).toEqual(headings)
  })

  // Issue #394. The skill never mentioned reduced motion, so new previews
  // arrived running infinite animations for readers who asked for none — #393
  // fixed eight by hand. Triage settled on ONE form: a single global
  // `!important` reset outside the dark sheet, spinners included. Two facts
  // carry it. `!important` beats any ordinary `[data-theme="dark"]` rule that
  // sets motion, whatever the specificity, so the block need not be written
  // twice — which is why no motion declaration is itself `!important`.
  // And the contrast sweep renders under reduce: toss's loading dots, left
  // pulsing, changed its non-text row count from run to run, which is why
  // there are no exceptions. The block's content is held to that decision
  // below; the rubric and the reviewer are compared against the author's fence
  // rather than against a third copy kept here.
  it("teaches one reduced-motion form on the author, the rubric, and the reviewer", () => {
    const author = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const block = reducedMotionBlock(author, "preview-html-author.md")

    const shape =
      /^@media \(prefers-reduced-motion: reduce\) \{ ([^{}]+?) \{ ([^{}]+?) \} \}$/.exec(
        block
      )
    if (shape === null)
      throw new Error(
        `the author's block must be one reduce media query around one rule, got: ${block}`
      )
    const [, selector, body] = shape
    // Global, not named: a named rule loses to any dark-sheet rule that sets
    // motion on the same element, so it holds only until the next dark-only
    // restyle — or until it is written a second time in that sheet.
    expect(selector, "the reset must reach every element").toBe(
      "*, *::before, *::after"
    )
    // No exceptions: every declaration stops motion outright. A slowed
    // spinner (`animation-duration: 3s`, the form codeit shipped before #443) is the exception that
    // would come back first.
    const declarations = body
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean)
    expect(
      declarations,
      "animation and transition, each `none !important` and nothing else"
    ).toEqual(["animation: none !important", "transition: none !important"])

    // The rubric is what the reviewer scores against, so it has to ask for
    // the block the author was told to write — the same fence, not a
    // paraphrase of it.
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    expect(
      reducedMotionBlock(rubric, "rubric-preview.md"),
      "the rubric must prescribe the author's block exactly"
    ).toBe(block)

    // The reviewer is sent to the rubric for the conditions, but it is the
    // surface that writes the warn, so it carries the declarations itself —
    // the line all three surfaces share, as the prose question is above. And
    // the step must run before the JSON is written, or it reaches nothing.
    const reviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)
    expect(
      reviewer,
      "the reviewer must check for the author's declarations"
    ).toContain(declarations.join("; "))
    const step = reviewer.indexOf("**Reduced motion")
    expect(
      step,
      "the reviewer must have a Reduced motion step"
    ).toBeGreaterThan(-1)
    expect(
      step,
      "the reduced-motion step must come before the JSON is written"
    ).toBeLessThan(reviewer.indexOf("Write the JSON"))

    // The "no exceptions" reason is that the sweep renders under reduce. If
    // the sweep stops doing that, the prompt is defending a rule with a reason
    // that no longer exists — this is where that becomes visible.
    expect(
      readRepoFile("scripts/audit-contrast-sweep.ts"),
      "the author prompt justifies no exceptions by the contrast sweep rendering under reduce"
    ).toMatch(/reducedMotion: "reduce"/)
  })
})
