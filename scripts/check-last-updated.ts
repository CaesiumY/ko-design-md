// Freshness gate for `last_updated` — CI and local:
//
//   pnpm check:last-updated [--base <ref>]
//
// Judges only the services/*.md files this branch changed against `--base`
// (default `origin/main`), so an entry with an old date that nobody touched is
// left alone. That is what makes a hard failure safe here: the gate can never
// block a PR over a file the PR did not edit.
//
// The judgment itself lives in src/lib/last-updated-check.ts, which is pure and
// unit-tested; this file is the git plumbing around it.
//
// Exits 1 when any file fails.
import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { checkLastUpdated, isExempt } from "../src/lib/last-updated-check"
import type { LastUpdatedIssue } from "../src/lib/last-updated-check"

function git(...args: Array<string>): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 << 20 })
}

/**
 * `git` that yields null instead of throwing — for "may not exist" lookups.
 * stderr is discarded because the expected miss (`git show base:new-file.md`
 * for an entry this branch adds) prints `fatal: path … exists on disk, but not
 * in …`, which would appear in every new-entry PR's log as if something broke.
 */
function gitOrNull(...args: Array<string>): string | null {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      maxBuffer: 64 << 20,
      stdio: ["ignore", "pipe", "ignore"],
    })
  } catch {
    return null
  }
}

function parseBase(argv: Array<string>): string {
  const i = argv.indexOf("--base")
  return i !== -1 && argv[i + 1] ? argv[i + 1] : "origin/main"
}

/** Today in the local timezone — the date an author would write by hand. */
function today(): string {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function main(): void {
  const base = parseBase(process.argv.slice(2))
  if (gitOrNull("rev-parse", "--verify", `${base}^{commit}`) === null) {
    // A shallow clone that never fetched the base would otherwise report zero
    // changed files and pass — the silent-empty-run failure this repo has been
    // bitten by before (audit:oklch, #188). Fail loudly instead.
    console.error(
      `FAILED: base ref \`${base}\` is not available. In CI, check out with ` +
        `\`fetch-depth: 0\`; locally, run \`git fetch origin main\`.`
    )
    process.exit(1)
  }

  // Three-dot assumes `base` is an ancestor of HEAD. A force-push to main can
  // break that — main is unprotected — and the merge base then sits further
  // back, so the run reports more changed files than the push introduced. Noisy
  // rather than wrong, and rare enough not to special-case; noted so the next
  // person reading a surprising file list knows where to look.
  //
  // Three sources, because each misses what the others catch:
  //   • three-dot vs base — this branch's commits, excluding main's newer ones;
  //   • diff vs HEAD — uncommitted edits to tracked files;
  //   • ls-files --others — a brand-new entry not yet `git add`ed, which is
  //     exactly what /design-md produces when it onboards a slug.
  const changed = [
    git("diff", "--name-only", `${base}...HEAD`, "--", "services"),
    git("diff", "--name-only", "HEAD", "--", "services"),
    git("ls-files", "--others", "--exclude-standard", "--", "services"),
  ]
    .join("\n")
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.endsWith(".md"))

  const files = [...new Set(changed)].sort()
  if (files.length === 0) {
    console.log("[last-updated] no services/*.md changed — nothing to check.")
    return
  }

  // Escape hatch for repo-wide mechanical sweeps. Replaying 24 commits found
  // two — a vendor-neutrality line added to 9 entries, a `created_at` backfill
  // across 4 — where bumping every date would push the whole catalog to the top
  // of the RSS feed for an edit no reader is tracking. It lives in the commit
  // message rather than a CLI flag because CI owns the invocation, putting a
  // flag out of a PR author's reach. `isExempt` is unit-tested; its doc comment
  // explains why it insists on a trailer instead of a tag anywhere in the text.
  //
  // Collected per commit, not as one range-wide boolean. A PR that carries a
  // marked sweep alongside an ordinary catalog edit would otherwise exempt the
  // ordinary edit too — one legitimate use of the hatch silently disarming the
  // gate for everything beside it.
  const marked = new Set<string>()
  for (const entry of git(
    "log",
    "--format=%H%x1f%B%x1e",
    `${base}..HEAD`
  ).split("\x1e")) {
    const sep = entry.indexOf("\x1f")
    if (sep !== -1 && isExempt(entry.slice(sep + 1))) {
      marked.add(entry.slice(0, sep).trim())
    }
  }

  const issues: Array<LastUpdatedIssue> = []
  const exempted: Array<LastUpdatedIssue> = []
  for (const file of files) {
    // Deleted in this branch: nothing left to date.
    if (!existsSync(file)) continue

    // `--no-merges`: on a `pull_request` event, checkout tests the synthetic
    // merge commit, not the PR head. When both the base branch and the PR touch
    // the same entry, that merge commit touches it too — and its author date is
    // whenever GitHub generated it, so a correctly dated PR would start failing
    // because the base moved on a later day.
    //
    // `%as` (author date), not `%cs`: the question is when the person wrote the
    // content, which is also what they type into `last_updated`. A committer
    // date shifts on rebase and on merge, so a PR held open for a week would
    // need its dates re-bumped for no editorial reason.
    const touching = git(
      "log",
      "--format=%H %as",
      "--no-merges",
      `${base}..HEAD`,
      "--",
      file
    )
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
      .map((l) => l.split(" "))

    // An uncommitted edit happened now, whatever the last commit says. Checking
    // the working tree is what makes this runnable before you commit.
    const dirty = git("status", "--porcelain", "--", file).trim() !== ""
    const changedOn = dirty || !touching[0] ? today() : touching[0][1]

    const issue = checkLastUpdated({
      file,
      raw: readFileSync(file, "utf8"),
      baseRaw: gitOrNull("show", `${base}:${file}`),
      changedOn,
    })
    if (!issue) continue

    // Exempt only when every commit that touched this file is marked. One
    // unmarked commit means somebody edited it for a reason a reader tracks.
    // A file with no in-range commits (uncommitted work) is never exempt —
    // there is no marked commit to stand behind it yet.
    const covered =
      touching.length > 0 && touching.every(([sha]) => marked.has(sha))
    ;(covered ? exempted : issues).push(issue)
  }

  // Exempted findings are printed too, never swallowed: an exemption that reads
  // as a clean pass is how a sweep quietly ages the whole catalog.
  for (const i of [...issues, ...exempted]) {
    console.error(`  ${i.file}\n    [${i.rule}] ${i.message}`)
  }
  console.log(
    `\n[last-updated] ${files.length} changed file(s) — ` +
      `${issues.length} issue(s)` +
      (exempted.length > 0 ? `, ${exempted.length} exempted.` : ".")
  )
  if (exempted.length > 0) {
    console.log(
      `EXEMPT: ${exempted.length} file(s) were touched only by commits carrying ` +
        `a Skip-Last-Updated trailer — reported above, not enforced.`
    )
  }
  if (issues.length > 0) {
    console.error(
      `\nFAILED: bump \`last_updated\` on the file(s) above. It drives sitemap ` +
        `lastmod, RSS ordering, and the home Updated badge.`
    )
    process.exit(1)
  }
  console.log("PASSED: every changed entry carries a current date.")
}

main()
