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

import { findKey, readFrontmatter } from "./frontmatter"

/**
 * Is a repo-wide mechanical sweep exempted by a commit in range?
 *
 * Trailer-shaped, not a bracket tag in prose. The first draft matched
 * `[skip last_updated]` anywhere in the message and promptly exempted its own
 * introducing commit, whose body *explained* the escape hatch — a marker loose
 * enough to appear in a sentence about itself eventually will. Borrowing the
 * repo's `Signed-off-by:` shape means it must start a line and must carry a
 * reason, so writing one is a deliberate act rather than a turn of phrase.
 *
 * Shape only: unlike `git interpret-trailers` this does not require the line to
 * sit in the message's final paragraph, so a mid-body line in the same form
 * counts. Tightening that would buy little — anyone typing this exact form is
 * already being deliberate — but the looser rule is what the name should be
 * read against.
 */
export function isExempt(commitMessages: string): boolean {
  return /^Skip-Last-Updated:[ \t]*\S/m.test(commitMessages)
}

export interface LastUpdatedIssue {
  file: string
  rule:
    | "unreadable-frontmatter"
    | "stale-last-updated"
    | "last-updated-regressed"
    | "future-last-updated"
    | "carried-future-last-updated"
  message: string
  /** Reported but not enforced — the caller prints it and does not fail. */
  warn?: true
}

export interface LastUpdatedInput {
  /** Repo-relative path, used only in the message. */
  file: string
  /** File contents after the change. */
  raw: string
  /** Contents at the comparison base; null when the file is newly added. */
  baseRaw: string | null
  /**
   * `YYYY-MM-DD` author date of the latest in-range non-merge commit touching the
   * file (today when the working tree has uncommitted edits to it).
   */
  changedOn: string
  /**
   * The runner's `YYYY-MM-DD` today. Only a carried-over date more than a day
   * past it is reported (as a warning); omit it and no such warning is produced.
   */
  today?: string
}

/** `YYYY-MM-DD` one day after `iso`. UTC arithmetic keeps DST out of it. */
function nextDay(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.toISOString().slice(0, 10)
}

type DateReading =
  | { ok: true; date: string | null }
  | { ok: false; message: string; line: number }

/**
 * Frontmatter `last_updated`, through the one frontmatter reader (ADR 0011).
 *
 * The value is what YAML reads: quotes are optional, a trailing ` # comment`
 * is not part of it, and `"2026-01-01 # x"` or `2026-01-01#x` keep the `#` in
 * the string. Anything that is not a plain ISO date reads as absent — that is
 * validate:catalog's `missing-last-updated` to report, not this gate's.
 *
 * Only the frontmatter is read: a body line in the same shape (a template
 * excerpt in a text fence) is an example, not the entry's date.
 *
 * A frontmatter YAML cannot read is not "no date". This gate used to go silent
 * on it, which let the one check that blocks on the date pass a file it never
 * judged; it now comes back as unreadable, with the reader's line.
 */
function readLastUpdated(raw: string): DateReading {
  const read = readFrontmatter(raw)
  if (!read.ok) return { ok: false, ...read.errors[0] }
  const value = findKey(read.keys, "last_updated")?.value
  const date =
    typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? value
      : null
  return { ok: true, date }
}

/**
 * Judge one changed catalog file. Returns the issue, or null when the date is
 * fine — or when there is no date to judge.
 *
 * A non-null result is not always a failure: when `warn` is set it is to be
 * reported and not counted (`carried-future-last-updated`). Counting it would
 * bring back the stacked-PR false positive this function exists to avoid.
 *
 * Dates are compared as ISO strings, which order correctly, so the author's
 * timezone stays out of every comparison — `changedOn` is the author's local
 * date too. The one Date object is in `nextDay`, which adds the day of slack to
 * `today` and computes it in UTC.
 */
export function checkLastUpdated(
  input: LastUpdatedInput
): LastUpdatedIssue | null {
  const reading = readLastUpdated(input.raw)
  if (!reading.ok) {
    return {
      file: input.file,
      rule: "unreadable-frontmatter",
      message: `the frontmatter could not be read as YAML (line ${reading.line}: ${reading.message}), so \`last_updated\` could not be judged. Fix the YAML first.`,
    }
  }
  const current = reading.date
  // A missing date is already a `missing-last-updated` block in
  // validate:catalog. Reporting it here too makes one fix look like two.
  if (!current) return null

  // A base this change cannot read is not this change's to fix: it reads as
  // having no date, as an added file does.
  const base = input.baseRaw ? readLastUpdated(input.baseRaw) : null
  const previous = base?.ok ? base.date : null
  if (previous && current < previous) {
    return {
      file: input.file,
      rule: "last-updated-regressed",
      message: `\`last_updated\` moved backwards: ${previous} → ${current}. RSS ordering and the home Updated badge assume it only ever advances.`,
    }
  }

  // Both directions, not just the stale one. A mistyped year is a real ISO date,
  // so validate:catalog accepts it, and it then sorts ahead of every genuine
  // update in RSS and publishes a future sitemap `lastmod` for as long as it
  // stands. Comparing against the author's own date keeps timezones out of it:
  // `changedOn` is the author date of the commit, written in the same local
  // frame as the value being judged.
  //
  // Only when this change moved the date, though. A value carried over
  // unchanged from the base was set by the base, and `changedOn` cannot see why:
  // on a stacked PR the base branch edits the entry on a later day and bumps the
  // date, while the PR's own non-merge commits touching the file are older and
  // its same-day work on it lives in a merge commit, which `--no-merges` skips.
  // Retargeting to main does not help — `main..HEAD` still holds the parent's
  // pre-rebase commits, and the date now arrives with main's squash (#436).
  // Blaming the PR there forced a revert-and-reapply commit whose only purpose
  // was to move a date the PR never wrote. A typo this change writes still
  // differs from the base value and is still caught. The stale check below keeps
  // running for a carried-over date — editing an entry later than its date still
  // fails.
  //
  // A carried-over value was judged when it entered the base only if it came in
  // through an enforced path. Two paths skip that: a `Skip-Last-Updated` sweep
  // (the script reports exempted findings but does not fail), and a direct push
  // to main, which is unprotected and whose gate runs after the value has landed.
  // Blocking the PR for those would bring the stacked false positive back, and
  // the PR's author could not fix the value in an ordinary commit anyway.
  // Lowering it is `last-updated-regressed`, which is exempted only when every
  // commit touching the file carries a `Skip-Last-Updated:` trailer, so the fix
  // has to be a separate change that does nothing else to the file.
  //
  // So it is reported, not enforced, and only when it is more than a day past
  // today: a stacked base's date is later than the PR's commits but never later
  // than the real date, so the warning stays quiet there.
  //
  // "Today" gets a day of slack. The value is written in the author's local
  // frame (KST here) while CI runners are UTC, so for the first hours of a KST
  // day the runner's today is still yesterday — a base bumped at 01:35 KST
  // (`60f422c`) would read as a day in the future. No author's zone is a full
  // day ahead of UTC, so one day covers every frame without hiding a real typo.
  if (current > input.changedOn && current === previous) {
    if (input.today && current > nextDay(input.today)) {
      return {
        file: input.file,
        rule: "carried-future-last-updated",
        message: `\`last_updated\` is ${current}, more than a day past today (${input.today}). This change did not write it — it came in from the base, likely through a Skip-Last-Updated sweep or a direct push. Lowering it trips \`last-updated-regressed\`, which is exempted only when every commit touching the file in that change carries a \`Skip-Last-Updated:\` trailer (the squash message too) — so lower it in a separate change that does nothing else to the file. Not enforced here.`,
        warn: true,
      }
    }
    return null
  }
  if (current > input.changedOn) {
    return {
      file: input.file,
      rule: "future-last-updated",
      message: `\`last_updated\` is ${current}, later than the ${input.changedOn} the file changed on. A future date sorts ahead of real updates and publishes a future sitemap lastmod — check for a mistyped year.`,
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
