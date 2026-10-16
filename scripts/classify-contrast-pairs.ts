// Classify the recorded contrast shortfalls by whether they are pairs of brand
// colours (#397), and print the two tables `docs/preview-contrast-baseline.md`
// publishes — `borderline` and `fail` — ready to paste.
//
//   pnpm audit:contrast:pairs --findings <contrast-findings.json>
//
// The input is the `contrast-findings.json` CI's `contrast` job uploads as the
// `contrast-report` artifact (`gh run download <run> -n contrast-report`). It is
// uploaded whichever way the gate went, so a PR that moves the counts has the
// file it needs to update these tables in the same run it reads the new
// baseline from. A local sweep is not accepted as a substitute: the recorded
// tables describe CI's rendering, and fonts fall back differently elsewhere.
//
// Exit 2 for a bad invocation or unreadable input; exit 1 when a folded
// `borderline` or `fail` row read different colour pairs at different widths, because then the row has no
// one pair to classify and picking the first width's would be a guess.

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import {
  OBSERVED_COLOUR_GROUPS,
  paletteOf,
  renderPairTable,
  splitColourPairs,
  tallyPairs,
} from "../src/lib/contrast-pairs"
import { dedupeFindings } from "../src/lib/contrast-report"
import type { PairTally, Palette } from "../src/lib/contrast-pairs"
import type { Finding } from "../src/lib/contrast-report"

const VERDICTS = ["borderline", "fail"] as const

const ROOT = fileURLToPath(new URL("..", import.meta.url))

function fail(message: string): never {
  console.error(message)
  process.exit(2)
}

function parseArgs(argv: Array<string>): { findings: string } {
  let findings: string | undefined
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === "--findings") {
      const val = argv.at(++i)
      if (val === undefined || val.startsWith("--")) {
        fail("Error: --findings requires a value")
      }
      findings = val
    } else fail(`Unknown argument: ${a}`)
  }
  if (findings === undefined) {
    fail(
      "Error: --findings <contrast-findings.json> is required — the file CI's contrast job uploads as the contrast-report artifact"
    )
  }
  return { findings }
}

function readFindings(path: string): Array<Finding> {
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(path, "utf8"))
  } catch (e) {
    fail(`Error: could not read ${path}: ${(e as Error).message}`)
  }
  if (!Array.isArray(parsed)) fail(`Error: ${path} is not a findings array`)
  return parsed as Array<Finding>
}

const totals = (tally: Array<PairTally>) =>
  tally.reduce(
    (s, t) => ({
      bothPublished: s.bothPublished + t.bothPublished,
      observedPair: s.observedPair + t.observedPair,
      oneToken: s.oneToken + t.oneToken,
      noToken: s.noToken + t.noToken,
      total: s.total + t.total,
    }),
    { bothPublished: 0, observedPair: 0, oneToken: 0, noToken: 0, total: 0 }
  )

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const raw = readFindings(args.findings)

  // Only the rows this classifies have to carry one pair. A `pass` or an
  // `indeterminate` row whose widths disagree about the pair is not counted
  // here (three are, in the artifact this was written against), so it is no
  // reason to refuse the run.
  const split = splitColourPairs(
    raw.filter((f) => VERDICTS.some((v) => v === f.verdict))
  )
  if (split.length > 0) {
    console.error(
      `Error: ${split.length} folded row(s) read different colour pairs at different widths, so there is no one pair to classify:`
    )
    for (const key of split) console.error(`  ${key}`)
    process.exit(1)
  }

  const palettes = new Map<string, Palette>()
  const paletteFor = (slug: string): Palette => {
    let p = palettes.get(slug)
    if (p === undefined) {
      const md = readFileSync(join(ROOT, "services", `${slug}.md`), "utf8")
      p = paletteOf(md, OBSERVED_COLOUR_GROUPS[slug] ?? [])
      for (const name of p.unreadable) {
        console.error(
          `Note: ${slug} defines \`${name}\` in a form this cannot read; it is not in the palette`
        )
      }
      palettes.set(slug, p)
    }
    return p
  }

  const rows = dedupeFindings(raw)
  for (const verdict of VERDICTS) {
    const tally = tallyPairs(rows, paletteFor, verdict)
    const t = totals(tally)
    console.log(`### ${verdict}\n`)
    console.log(renderPairTable(tally))
    console.log(
      `\ntotal ${t.total}: both-published ${t.bothPublished} · observed-pair ${t.observedPair} · one-token ${t.oneToken} · no-token ${t.noToken}\n`
    )
  }
}

main()
