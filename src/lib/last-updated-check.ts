// Freshness gate for `last_updated`. CI-only, like draft-validator — never
// imported by the runtime.
//
// `last_updated` drives sitemap `lastmod`, RSS ordering, and the home Updated
// badge, so an entry edited without bumping it sorts as though nothing changed.
// CLAUDE.md states the rule; this file is the half of it a machine can judge.
//
// The comparison is against the DATE THE FILE CHANGED, not against whether the
// `last_updated` line shows up in the diff. Both halves of that choice were
// calibrated by replaying the catalog's own history:
//   • Three same-day follow-up edits (#203, #204, #205) already carried the
//     correct date, so no diff line appeared. A line-based check fails all three.
//   • `be494be` bumped three entries to 2026-07-27 while committing on 07-29 —
//     the date was written from memory, exactly what CLAUDE.md warns against.
//     A line-based check sees a bump and waves it through.
// The value comparison gets all four right, so it is strictly the better rule
// rather than merely the stricter one.

/**
 * Is a repo-wide mechanical sweep exempted by a commit in range?
 *
 * A git trailer, not a bracket tag in prose. The first draft matched
 * `[skip last_updated]` anywhere in the message and promptly exempted its own
 * introducing commit, whose body *explained* the escape hatch — a marker loose
 * enough to appear in a sentence about itself eventually will. The trailer
 * borrows the repo's existing `Signed-off-by:` convention: it must start a line
 * and must carry a reason, so writing one is a deliberate act, not a turn of
 * phrase.
 */
export function isExempt(commitMessages: string): boolean {
  return /^Skip-Last-Updated:[ \t]*\S/m.test(commitMessages)
}

export interface LastUpdatedIssue {
  file: string
  rule: "stale-last-updated" | "last-updated-regressed"
  message: string
}

export interface LastUpdatedInput {
  /** Repo-relative path, used only in the message. */
  file: string
  /** File contents after the change. */
  raw: string
  /** Contents at the comparison base; null when the file is newly added. */
  baseRaw: string | null
  /** `YYYY-MM-DD` author date of the latest in-range commit touching the file. */
  changedOn: string
}

/**
 * Frontmatter `last_updated`, or null when absent or unparseable.
 *
 * Deliberately a regex rather than `buildDoc` from content-parser: this gate
 * needs one date out of a file that may be mid-edit, and must stay silent on
 * anything malformed, which validate:catalog already blocks. Routing it through
 * the real parser would couple a freshness check to full document validity.
 *
 * Quotes are optional in YAML, so both `last_updated: "2026-08-02"` and the
 * bare form are accepted; anything that is not a plain ISO date reads as absent.
 */
function readLastUpdated(raw: string): string | null {
  const m = raw.match(/^last_updated:\s*"?(\d{4}-\d{2}-\d{2})"?\s*$/m)
  return m ? m[1] : null
}

/**
 * Judge one changed catalog file. Returns the issue, or null when the date is
 * fine — or when there is no date to judge.
 *
 * ISO dates compare correctly as strings, so no Date parsing is involved; that
 * also keeps the timezone the author wrote in out of the comparison, which is
 * what we want, since `changedOn` is the author's local date too.
 */
export function checkLastUpdated(
  input: LastUpdatedInput
): LastUpdatedIssue | null {
  const current = readLastUpdated(input.raw)
  // A missing date is already a `missing-last-updated` block in
  // validate:catalog. Reporting it here too makes one fix look like two.
  if (!current) return null

  const previous = input.baseRaw ? readLastUpdated(input.baseRaw) : null
  if (previous && current < previous) {
    return {
      file: input.file,
      rule: "last-updated-regressed",
      message: `\`last_updated\` moved backwards: ${previous} → ${current}. RSS ordering and the home Updated badge assume it only ever advances.`,
    }
  }

  if (current < input.changedOn) {
    return {
      file: input.file,
      rule: "stale-last-updated",
      message: `\`last_updated\` is ${current} but the file changed on ${input.changedOn}. Look the date up rather than recalling it (\`date +%F\`), then set it to the day you actually edited.`,
    }
  }

  return null
}
