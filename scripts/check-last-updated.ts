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
import { checkLastUpdated } from "../src/lib/last-updated-check"
import type { LastUpdatedIssue } from "../src/lib/last-updated-check"

function git(...args: Array<string>): string {
  return execFileSync("git", args, { encoding: "utf8", maxBuffer: 64 << 20 })
}

/** `git` that yields null instead of throwing — for "may not exist" lookups. */
function gitOrNull(...args: Array<string>): string | null {
  try {
    return git(...args)
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

  // Three-dot: compare against the merge base, so commits that landed on main
  // after this branch started are not counted as this branch's changes.
  const changed = (
    git("diff", "--name-only", `${base}...HEAD`, "--", "services") +
    "\n" +
    git("diff", "--name-only", "HEAD", "--", "services")
  )
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
  // message rather than a CLI flag so a PR author can reach it (CI owns the
  // invocation) and a reviewer can see it in the diff.
  const range = git("log", "--format=%B", `${base}..HEAD`)
  const exempt = /\[skip last_updated\]/i.test(range)

  const issues: Array<LastUpdatedIssue> = []
  for (const file of files) {
    // Deleted in this branch: nothing left to date.
    if (!existsSync(file)) continue

    // An uncommitted edit happened now, whatever the last commit says. Checking
    // the working tree is what makes this runnable before you commit.
    const dirty = git("status", "--porcelain", "--", file).trim() !== ""
    const committedOn = git(
      "log",
      "-1",
      "--format=%as",
      `${base}..HEAD`,
      "--",
      file
    ).trim()
    const changedOn = dirty || !committedOn ? today() : committedOn

    const issue = checkLastUpdated({
      file,
      raw: readFileSync(file, "utf8"),
      baseRaw: gitOrNull("show", `${base}:${file}`),
      changedOn,
    })
    if (issue) issues.push(issue)
  }

  for (const i of issues) {
    console.error(`  ${i.file}\n    [${i.rule}] ${i.message}`)
  }
  console.log(
    `\n[last-updated] ${files.length} changed file(s) — ${issues.length} issue(s).`
  )
  if (issues.length > 0 && exempt) {
    // Loudly, and still listing every file above: an exemption that reads as a
    // clean pass is how a sweep quietly ages the whole catalog.
    console.log(
      `EXEMPT: a commit in range carries [skip last_updated], so the ` +
        `${issues.length} issue(s) above are reported but not enforced.`
    )
    return
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
