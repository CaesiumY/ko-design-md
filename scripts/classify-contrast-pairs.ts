// Classify the recorded contrast shortfalls by whether they are pairs of brand
// colours (#397), and print the three tables `docs/preview-contrast-baseline.md`
// publishes from one artifact — `borderline` and `fail`, and the reasons rows
// were held for with the held-row count under it (#654) — to read. Writing
// them into the record is `pnpm audit:contrast:rebaseline <run id>` (#656),
// which makes the same tables with the same functions and reads the palettes
// the same way (`readArtifactPalettes`); this command also prints the
// tolerance bands the document describes, which that one does not.
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
// Exit 2 for a bad invocation, unreadable input, or input this checkout cannot
// classify (a slug with no entry, a listed observed heading or token gone from its
// entry); exit 1 when a folded `borderline` or `fail` row read different
// colour pairs at different widths, because then the row has no one pair to
// classify and picking the first width's would be a guess.

import {
  CLASSIFIED_VERDICTS,
  PUBLISHED_PAIR_TOLERANCE,
  paletteLookup,
  readArtifactPalettes,
  renderPairTable,
  sumPairTally,
  tallyPairs,
  toleranceBand,
} from "../src/lib/contrast-pairs"
import {
  dedupeFindings,
  heldReasons,
  measuredSlugs,
  renderHeldReasons,
} from "../src/lib/contrast-report"
import { fail, readEntries, readFindings } from "./contrast-artifact-io"

// The upper edge of the band the tolerance was read off (see
// `PUBLISHED_PAIR_TOLERANCE`): where the next cluster of distances began.
const WIDER_TOLERANCE = 0.005

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

function main(): void {
  const args = parseArgs(process.argv.slice(2))
  const raw = readFindings(args.findings)
  const slugs = measuredSlugs(raw)
  const read = readArtifactPalettes(raw, readEntries(slugs))

  // Only the rows this classifies have to carry one pair (see
  // `readArtifactPalettes`), so a `pass` or held row whose widths disagree is
  // no reason to refuse the run.
  if (read.split.length > 0) {
    console.error(
      `Error: ${read.split.length} folded row(s) read different colour pairs at different widths, so there is no one pair to classify:`
    )
    for (const key of read.split) console.error(`  ${key}`)
    process.exit(1)
  }
  // A slug the artifact names but this checkout has no entry for, or a listed
  // observed heading or token the entry no longer has, is the wrong input for
  // this checkout — exit 2 with the reason, not a stack trace.
  if (read.problems.length > 0) {
    fail(read.problems.map((p) => `Error: ${p}`).join("\n"))
  }
  for (const note of read.notes) console.error(note)
  const paletteFor = paletteLookup(read.palettes)

  const rows = dedupeFindings(raw)
  // Every slug the artifact measured, for `src/lib/contrast-classified-run.json`:
  // the entries classified by this run, held from then on even when their rows
  // later leave both tables. The run id is not in the findings, so it is left
  // for whoever pastes this to fill in.
  console.log(
    `classified run (src/lib/contrast-classified-run.json):\n${JSON.stringify({ run: "<run id>", slugs }, null, 2)}\n`
  )
  for (const verdict of CLASSIFIED_VERDICTS) {
    const tally = tallyPairs(rows, paletteFor, verdict)
    const t = sumPairTally(tally)
    console.log(`### ${verdict}\n`)
    console.log(renderPairTable(tally))
    console.log(
      `\ntotal ${t.total}: both-published ${t.bothPublished} · observed-pair ${t.observedPair} · one-token ${t.oneToken} · no-token ${t.noToken}`
    )
    // What the document's tolerance paragraphs describe without a number —
    // the band the tolerance was read off, and how much a wider one would
    // move — printed so whoever reruns this sees whether that still holds.
    // The composite count is the same band for the second way a reading can
    // match (#551): a translucent token over what the collector laid it on.
    const band = toleranceBand(rows, paletteFor, verdict, [
      PUBLISHED_PAIR_TOLERANCE,
      WIDER_TOLERANCE,
    ])
    const wider = sumPairTally(
      tallyPairs(rows, paletteFor, verdict, WIDER_TOLERANCE)
    )
    console.log(
      `readings ${band.readings}, nearest token in (${PUBLISHED_PAIR_TOLERANCE}, ${WIDER_TOLERANCE}]: ${band.inBand} · nearest composite there, no token matched: ${band.compositeInBand} · both-published at ${WIDER_TOLERANCE}: ${wider.bothPublished}\n`
    )
  }
  // The same fold and tally as the sweep's `held for:` line, so this table and
  // that line cannot disagree. The run id is left for whoever pastes it, as on
  // the `classified run` line above.
  console.log(`### indeterminate\n`)
  console.log(renderHeldReasons({ ...heldReasons(rows), run: "<run id>" }))
}

main()
