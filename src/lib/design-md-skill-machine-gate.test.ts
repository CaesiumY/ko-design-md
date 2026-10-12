import { describe, expect, it } from "vitest"
// Derived, not restated: the skeleton is checked against the same list the
// section gate enforces, so adding a required section can never leave the
// template behind.
import { REQUIRED_SECTIONS } from "./draft-validator"
import { BASELINE_WIDTHS } from "./contrast-baseline"
import { reducedMotionBlock } from "./reduced-motion-block"
import {
  STAGED_CONTRAST_RULE,
  observedRender,
  skippedRender,
} from "./staged-contrast-report"
import {
  DESIGN_MD_AGENT_PATHS,
  DESIGN_MD_AUTHOR_AGENT,
  DESIGN_MD_RUBRIC_DESIGN,
  DESIGN_MD_RUBRIC_PREVIEW,
  DESIGN_MD_SKILL,
  DESIGN_MD_STITCH_FORMAT,
  DESIGN_MD_TEMPLATE,
  PREVIEW_HTML_AUTHOR_AGENT,
  PREVIEW_HTML_REVIEWER_AGENT,
  RESEARCH_COLLECTOR_AGENT,
  readRepoFile,
} from "./skill-asset-paths"

// Contract tests pinning the /design-md machine-gate WIRING: each one holds
// something the skill prose says — a threshold, a rule id, a command, a file
// path, a code identifier — against the code or repo fact it names, so a
// change on the code side makes the prompt follow. Sentences that merely have
// to be present are not pinned here (#424): rewording a prompt should not
// break a test, and keeping a rule is the job of the validators and the
// reviewer agents.

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
// heading form. The roll-call test holds SKILL.md's list to the headings found.
const ADVISORY_HEADING =
  /^## (.+?) \(advisory [^)]*emits `warn` issues, does NOT change the 10-point score\)$/gm

describe("/design-md machine gates", () => {
  it("names the gate commands the skill runs", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    // The commands the skill runs; the next test holds them to package.json.
    expect(skill).toContain("pnpm validate:draft")
    expect(skill).toContain("pnpm validate:previews")
  })

  it("keeps the CLI entrypoints the skill invokes available in package.json", () => {
    const pkg = JSON.parse(readRepoFile("package.json")) as {
      scripts: Record<string, string>
    }
    expect(pkg.scripts["validate:draft"]).toContain("validate-draft")
    expect(pkg.scripts["validate:catalog"]).toContain("--services")
    expect(pkg.scripts["validate:previews"]).toContain("validate-preview")
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

  // Issue #448: the template invites `{{semantic-alias}}: "{colors.x}"` rows,
  // and an alias named like a role in the entry's own `## Colors` table trips
  // the role-reference-rows guard, which wants a hand-written comparison in
  // CASES. Pinned at both ends: the skill and the format reference name the
  // table and its file, and the table still exists under that name.
  it("tells onboarding when role reference rows owe a CASES comparison", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const format = readRepoFile(DESIGN_MD_STITCH_FORMAT)

    // The symbol and its file on one line, so an unrelated "CASES" or a file
    // path named elsewhere cannot keep this green after the pointer is gone.
    for (const doc of [skill, format]) {
      expect(doc).toMatch(/`CASES`[^\n]*role-reference-rows\.test\.ts/)
    }
    expect(readRepoFile("src/lib/role-reference-rows.test.ts")).toContain(
      "const CASES"
    )
  })

  // The section said "Four more tables" while listing four, then the list grew
  // and the word stayed (#448). Count the bullets instead of trusting the word.
  it("states how many remaining per-slug registries it lists", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const section =
      /^### The rest of the per-slug rows\n([\s\S]*?)^#{2,3} /m.exec(skill)
    if (section === null)
      throw new Error(
        "SKILL.md must keep its 'The rest of the per-slug rows' section"
      )
    const stated = /\b(\w+) more registries remain/.exec(section[1])
    if (stated === null)
      throw new Error("the section must state how many registries remain")
    const expected = NUMBER_WORDS[stated[1].toLowerCase()]
    if (expected === undefined)
      throw new Error(
        `the section says "${stated[1]} more registries" — a count this test cannot read; extend NUMBER_WORDS`
      )
    const bullets = section[1].match(/^- \*\*/gm) ?? []
    expect(
      bullets.length,
      `the section says "${stated[1]} more registries" but lists ${bullets.length}`
    ).toBe(expected)
  })

  it("tells onboarding to record a components map's count", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    // Same line: the missing-primary bullet already names this file.
    expect(skill).toMatch(
      /`COMPONENT_COUNTS`[^\n]*google-designmd-corpus\.test\.ts/
    )
    expect(readRepoFile("src/lib/google-designmd-corpus.test.ts")).toContain(
      "COMPONENT_COUNTS"
    )
  })

  // #389. The authoring spec names the properties a `components:` row may
  // carry; the pinned linter decides which it reads — any other is reported
  // as "not a recognized component sub-token" and dropped by standard tools.
  // Read from the linter's own spec config, so an upgrade that changes the
  // list fails here until the prompt follows. The examples the template and
  // the spec show must stay inside it too.
  it("names the component properties the pinned linter reads", () => {
    const specConfig = readRepoFile(
      "node_modules/@google/design.md/dist/linter/spec-config.yaml"
    )
    const block = /^component_sub_tokens:\r?\n((?:[ \t]+.*\r?\n)+)/m.exec(
      specConfig
    )?.[1]
    expect(
      block,
      "the linter config must list component_sub_tokens"
    ).toBeDefined()
    const linter = [...(block ?? "").matchAll(/- name: (\w+)/g)].map(
      (m) => m[1]
    )
    expect(linter.length).toBeGreaterThan(0)

    const stitch = readRepoFile(DESIGN_MD_STITCH_FORMAT)
    const stated = /\*\*Only the spec's \w+ properties:\*\* ([^\n]+?)\. /.exec(
      stitch
    )?.[1]
    expect(stated, "stitch-format must list the eight properties").toBeDefined()
    const named = [...(stated ?? "").matchAll(/`(\w+)`/g)].map((m) => m[1])
    expect([...named].sort()).toEqual([...linter].sort())

    // Every property an example `components:` block uses is one of them.
    for (const [doc, text] of [
      [DESIGN_MD_STITCH_FORMAT, stitch],
      [DESIGN_MD_TEMPLATE, readRepoFile(DESIGN_MD_TEMPLATE)],
    ] as const) {
      const example = /^components:\r?\n((?: {2}.*\r?\n)+)/m.exec(text)?.[1]
      expect(example, `${doc} must show a components: example`).toBeDefined()
      const used = [...(example ?? "").matchAll(/^ {4}(\w+):/gm)].map(
        (m) => m[1]
      )
      expect(used.length).toBeGreaterThan(0)
      for (const p of used) expect(linter, `${doc} uses ${p}`).toContain(p)
    }
  })

  // created_at is the catalog's sort key, but nothing in the pipeline would
  // notice its absence: an entry missing it still renders, just pinned to the
  // bottom of the list. Four entries shipped that way before the field became
  // required (#194), all because the author template never emitted it. These
  // assertions pin the three places that have to agree.
  it("wires created_at through the author template, the rubric, and the draft gate", () => {
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_DESIGN)
    const validator = readRepoFile("src/lib/draft-validator.ts")

    // The frontmatter template must emit the field, or every skill-onboarded
    // entry lands undated.
    expect(author).toMatch(/^created_at:/m)
    // The reviewer scores against the required-key list, so it must include it.
    expect(rubric).toMatch(/All required keys present:.*created_at/)
    // And the deterministic gate must actually block a draft that omits it.
    expect(validator).toContain("missing-created-at")
  })

  // The draft gate blocks a `lang` other than the one it accepts, but a draft
  // with no `lang:` line passes it — only the rubric asks for the key. So the
  // author template's line is what puts the value in every onboarded entry,
  // and it has to be the value the gate compares against.
  it("has the author template emit the lang the draft gate accepts", () => {
    const author = readRepoFile(DESIGN_MD_AUTHOR_AGENT)
    const validator = readRepoFile("src/lib/draft-validator.ts")
    const emitted = /^lang: (\S+)$/m.exec(author)?.[1]
    expect(emitted, "the author template must emit a lang: line").toBeDefined()
    const accepted = /sees\("lang"\) && lang !== "([^"]+)"/.exec(validator)?.[1]
    expect(
      accepted,
      "draft-validator must keep its bad-lang check"
    ).toBeDefined()
    expect(emitted).toBe(accepted)
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

  // Two stages render the preview at the catalog's widths — 976, the detail
  // page's embed width and the historical overflow blind spot, among them:
  // Stage 9a3 measures contrast with the CI harness, and Stage 12's responsive
  // sweep probes for overflow by hand. Those widths are a code constant, so both
  // lists are held to it rather than to numbers written here.
  it("names the widths the contrast and overflow sweeps render", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const contrast = /same widths \(([\d/]+)\)/.exec(skill)?.[1]
    expect(contrast, "SKILL.md must state the 9a3 widths").toBeDefined()
    expect(contrast).toBe(BASELINE_WIDTHS.join("/"))

    // `**375 (mobile) / 768 (tablet) / 976 (…) / 1440 (desktop)**` — each
    // width is the number before its parenthesised label.
    const overflow = /\*\*(\d+ \(mobile\)[^*]*)\*\*/.exec(skill)?.[1]
    expect(overflow, "SKILL.md must state the Stage 12 widths").toBeDefined()
    const widths = [...(overflow ?? "").matchAll(/(\d+) \(/g)].map((m) => m[1])
    expect(widths.join("/")).toBe(BASELINE_WIDTHS.join("/"))
  })

  // PR #221 moved the preview size gate from raw bytes to brotli. The byte
  // figures the prompts give are read out of the gate, so a recalibration
  // that leaves a prompt citing the old number fails here.
  it("states the size gate's own thresholds in the rubric and author prompt", () => {
    const previewAuthor = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    const validator = readRepoFile("src/lib/preview-validator.ts")

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
  it("joins the swatch-catalog and type-scale blocks to the rubric and author", () => {
    const previewAuthor = readRepoFile(PREVIEW_HTML_AUTHOR_AGENT)
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
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

  // The rubric states how many static-scan patterns it lists. A bullet added
  // without the count is the drift nobody would notice, and it happened in
  // the very change that added the sixth.
  it("keeps the rubric's stated static-scan pattern count equal to its bullet count", () => {
    const rubric = readRepoFile(DESIGN_MD_RUBRIC_PREVIEW)
    // The section runs to the next heading, whichever it is, so a section
    // inserted after it cannot lend its own bold bullets to the count.
    const start = rubric.indexOf("## Mobile overflow")
    expect(start, "the Mobile overflow section must exist").toBeGreaterThan(-1)
    const next = rubric.indexOf("\n## ", start + 1)
    const section = rubric.slice(start, next === -1 ? undefined : next)
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

  // Issue #404. Two facts the prose states that something else decides: the
  // number of Stage 2 follow-up questions (an intake agent asks as many as the
  // sentence says, so a stale count drops the last one — the board question,
  // when #404 added it), and the research-collector's tool list, which is why
  // Stage 4c's handover has to expand a directory into files.
  it("keeps Stage 2's question count and the Stage 4c directory expansion honest", () => {
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

    const gate = skill.slice(
      skill.indexOf("### Stage 4c"),
      skill.indexOf("## Stage 5")
    )
    expect(gate, "Stage 4c must exist ahead of Stage 5").not.toBe("")

    // Stage 2 accepts a directory for convenience, so the handover has to
    // expand it. research-collector has no `Bash` to list a directory and
    // `Read` cannot open one, which makes a directory string a source that is
    // silently never read — the "value is right, the place is wrong" failure
    // this PR documents elsewhere. Both halves are asserted: if the agent ever
    // gains `Bash`, the first fails and whoever added it reads this comment
    // before deciding the prose can relax.
    const collectorTools = /^tools: (.+)$/m.exec(
      readRepoFile(RESEARCH_COLLECTOR_AGENT)
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
    // already says a directory is expanded and its files read, so a
    // stage-wide match stayed green with the handover's own sentence deleted.
    // The mutation that proved it: replacing the paragraph with "Append every
    // approved path to `screenshot_paths`" left all assertions passing.
    const handover = /\*\*On approval[\s\S]*?(?=\n\n)/.exec(gate)?.[0] ?? ""
    expect(handover, "Stage 4c must have an on-approval handover").not.toBe("")
    expect(
      handover,
      "the handover must say a directory is expanded into its files"
    ).toMatch(/director(?:y|ies)/)
  })

  it("expects as many research.md sections as research-collector declares", () => {
    // Stage 5 counts `^## ` lines in research.md to catch a malformed file.
    // The collector lists ten sections — nine content sections and
    // `## Sources` — while the skill expected nine, so a well-formed file
    // never matched the number it was checked against. Derived, not
    // restated: the expected count is read from the collector's own list.
    const declared = readRepoFile(RESEARCH_COLLECTOR_AGENT).match(
      /^\d+\. `## /gm
    )
    expect(declared, "research-collector must list its sections").not.toBeNull()
    const skill = readRepoFile(DESIGN_MD_SKILL)
    const expected = /Expected output is `(\d+)`/.exec(skill)?.[1]
    expect(expected, "Stage 5 must state the expected section count").toBe(
      String(declared?.length)
    )
  })

  // Issue #404, the other half. The same instruction produced three procedures
  // and the skill absorbed two. The third — comparing the finished preview back
  // against the board — left a mark anyway: 4c's asymmetry note said approving
  // a board "pays off at Stage 12", and the audit:oklch caveat said checking the
  // application site was "Stage 12's work and a human's", while `## Stage 12`
  // held no such step. Prose naming a stage is the only pointer a reader has;
  // when the stage does not carry it, the reader believes the comparison is
  // automatic and stops looking. This pins that Stage 12 holds the step and that
  // its pointer resolves.
  it("keeps the board cross-check the prose promises inside Stage 12", () => {
    const skill = readRepoFile(DESIGN_MD_SKILL)

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

    // Its cross-reference has to resolve. The first draft of this sentence
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

  // The report is the only place the board cross-check's output reaches a
  // person, and three of its four states are non-findings that read identically
  // if they collapse: "no board existed", "compared, nothing disagreed", "never
  // ran". SKILL.md hands this rule to this test in so many words ("that is what
  // the contract test pins"), so it stays though it reads the skill alone — with
  // it gone, nothing would hold the rule the prompt says is held (#424).
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
    // the ones read out of the author's fence above.
    const reviewer = readRepoFile(PREVIEW_HTML_REVIEWER_AGENT)
    expect(
      reviewer,
      "the reviewer must check for the author's declarations"
    ).toContain(declarations.join("; "))

    // The "no exceptions" reason is that the sweep renders under reduce. If
    // the sweep stops doing that, the prompt is defending a rule with a reason
    // that no longer exists — this is where that becomes visible.
    expect(
      readRepoFile("scripts/audit-contrast-sweep.ts"),
      "the author prompt justifies no exceptions by the contrast sweep rendering under reduce"
    ).toMatch(/reducedMotion: "reduce"/)
  })
})
