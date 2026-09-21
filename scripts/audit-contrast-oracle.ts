// Does the measurement still work?
//
// A sweep that reports no failures is either good news or a broken collector,
// and nothing in the numbers tells the two apart. So the audit is pointed at a
// file whose defects are already known: samsung-one-ui as it stood before
// `2ead71d`, the commit that fixed the seven rows issue #359 tabulates.
//
// The table below is that commit's own accounting — its message and the issue
// body, not this file's output. Each row names WHERE the value has to appear,
// because "3.01 turned up somewhere among a few hundred readings" is not a
// check anything can fail.
//
// WHAT THIS FIXTURE CANNOT COVER. One branch of the collector has no anchor and
// cannot get one here: the `paintBlockers` run over the layers BEHIND a
// non-text surface, which is where a filtered ancestor's pre-filter
// `background-color` was once judged as though it were the colour on screen.
// Reaching it needs a `filter` or a wide inset `box-shadow` on something behind
// a measured surface, and samsung's file has neither. Adding one would end the
// fixture's only claim to authority — that it is a file whose defects are
// already known, unedited — so the gap is recorded instead. Covering it needs a
// second committed fixture from a preview that does filter, and toss, which
// hovers every button with `filter: brightness(0.96)`, is the candidate.

import { readFileSync } from "node:fs"
import { join } from "node:path"
import { measureOne, serveStatic } from "./audit-contrast-sweep"
import type { Blocker } from "../src/lib/contrast"
import type { Finding, Judgement, Theme } from "../src/lib/contrast-report"

// The fixture is a committed file, not a `git show` of history.
//
// `2ead71d` is a commit on PR #291's branch and this catalogue merges with
// squash, so it never became an ancestor of `main`: `git merge-base
// --is-ancestor 2ead71d HEAD` says no and `git rev-list --all` does not list
// it. Reading it out of history worked only in a clone that still held the
// branch's objects — which is to say, on the machine that wrote this, and
// nowhere else. See `scripts/fixtures/README.md`.
const FIXTURE_FILE = join(
  "scripts",
  "fixtures",
  "samsung-one-ui-2ead71d-parent.html"
)
const ORACLE_URL_PATH = "/__oracle/preview.html"
const ORACLE_WIDTH = 976
/** Wide enough to absorb 8-bit quantisation, tight enough to catch a drift. */
const TOLERANCE = 0.05

interface Anchor {
  id: string
  /** The tail of the element path, so a change further up does not break it. */
  pathEnds: string
  theme: Theme
  state: "default" | "hover"
  kind: "text" | "non-text"
  /** What the fixture measured before the fix, per the issue and the commit. */
  before: number
  /** What the same element measures on the shipped file. */
  after: number
  /**
   * Which boundary has to carry the ratio.
   *
   * Fixed from the fixture's CSS, not from a reading: `.switch` declares a
   * background and no border, and `.radio` a 2px border and no background, so
   * `evaluateNonText` has exactly one candidate in each case. Without this the
   * fill and border branches could swap — their two ratios are close on these
   * elements — and every number here would still land inside TOLERANCE.
   */
  basis?: "fill" | "border"
}

const ANCHORS: Array<Anchor> = [
  // Issue #359's table, seven rows — the hover row covers both themes, so eight
  // readings.
  {
    id: "dark accent button label",
    pathEnds: "button.btn.btn-contained-high",
    theme: "dark",
    state: "default",
    kind: "text",
    before: 3.01,
    after: 6.39,
  },
  {
    id: "light accent button label, hovered",
    pathEnds: "button.btn.btn-contained-high",
    theme: "light",
    state: "hover",
    kind: "text",
    before: 3.6,
    after: 6.44,
  },
  {
    id: "dark accent button label, hovered",
    pathEnds: "button.btn.btn-contained-high",
    theme: "dark",
    state: "hover",
    kind: "text",
    before: 3.6,
    after: 7.72,
  },
  {
    id: "light action toast action text",
    pathEnds: "span.toast > span.act",
    theme: "light",
    state: "default",
    kind: "text",
    before: 3.76,
    after: 5.26,
  },
  {
    id: "dark action toast action text",
    pathEnds: "span.toast > span.act",
    theme: "dark",
    state: "default",
    kind: "text",
    before: 4.03,
    after: 4.83,
  },
  {
    id: "light secondary text on an inset",
    pathEnds: "div.panes > div.p",
    theme: "light",
    state: "default",
    kind: "text",
    before: 3.84,
    after: 4.65,
  },
  {
    id: "light multi-pane label",
    pathEnds: "div.panes > div.p.first",
    theme: "light",
    state: "default",
    kind: "text",
    before: 3.88,
    after: 17.34,
  },
  {
    id: "light off-state toggle track",
    pathEnds: "div.li > span.switch",
    theme: "light",
    state: "default",
    kind: "non-text",
    before: 1.64,
    after: 3.58,
    basis: "fill",
  },
  // Two more the commit message accounts for that the issue table folded away.
  {
    id: "light radio border",
    pathEnds: "div.li > span.radio",
    theme: "light",
    state: "default",
    kind: "non-text",
    before: 2.63,
    after: 3.6,
    basis: "border",
  },
  {
    id: "dark off-state toggle track",
    pathEnds: "div.li > span.switch",
    theme: "dark",
    state: "default",
    kind: "non-text",
    before: 1.98,
    after: 3.6,
    basis: "fill",
  },
]

/**
 * A claim about the PATH a reading takes, rather than the number it lands on.
 *
 * Every anchor above is a reading that produced a verdict, so the branches that
 * WITHHOLD one — the half of the collector that exists to stop a colour nobody
 * can read from being reported as a pass — are not exercised at all. Nor is the
 * branch where a surface has both a fill and a border and the two have to be
 * compared.
 *
 * Each field below is settled by the fixture's markup and CSS, not by a
 * measurement:
 *
 * - `span.halo` and its sibling `span.th` are both `position: absolute` under
 *   `div.sl` at the same `left` and `top: 18px`, with no `z-index` and no
 *   `pointer-events` anywhere in the file. The thumb comes second in the DOM,
 *   so it paints over the halo's own centre — which is the point the collector
 *   samples — and it is not a descendant of the halo. That is the `overlay`
 *   branch, and an overlay holds the verdict.
 * - The halo's transparency lives in its `background` (`color-mix(…,
 *   transparent)`), not in an `opacity` property, so nothing about it is an
 *   approximation: `opacityApprox` has to be false. No other anchor tells those
 *   two kinds of transparency apart.
 * - `span.radio.on` sets `border-color` and `background` to the same token, so
 *   the border separates from the fill at 1.00 and the fill has to win. It is
 *   the only element here with both.
 *
 * No ratio is claimed. The claim IS the path, and a number would only make the
 * assertion look stronger than the derivation behind it.
 */
interface PathAnchor {
  id: string
  pathEnds: string
  theme: Theme
  state: "default" | "hover"
  kind: "text" | "non-text"
  basis?: "fill" | "border"
  verdict?: Judgement
  blockers?: Array<Blocker>
  opacityApprox?: boolean
}

const PATH_ANCHORS: Array<PathAnchor> = [
  {
    id: "light slider halo, covered by its own thumb",
    // `div.sl > span.halo` and not `span.halo`: the Click demo is
    // `div.sl.sl-click > span.halo`, which this tail does not match.
    pathEnds: "div.sl > span.halo",
    theme: "light",
    state: "default",
    kind: "non-text",
    basis: "fill",
    verdict: "indeterminate",
    blockers: ["overlay"],
    opacityApprox: false,
  },
  {
    id: "dark slider halo, covered by its own thumb",
    pathEnds: "div.sl > span.halo",
    theme: "dark",
    state: "default",
    kind: "non-text",
    basis: "fill",
    verdict: "indeterminate",
    blockers: ["overlay"],
    opacityApprox: false,
  },
  {
    id: "light selected radio, fill and border on the same token",
    pathEnds: "div.li.sel > span.radio.on",
    theme: "light",
    state: "default",
    kind: "non-text",
    basis: "fill",
  },
  {
    id: "dark selected radio, fill and border on the same token",
    pathEnds: "div.li.sel > span.radio.on",
    theme: "dark",
    state: "default",
    kind: "non-text",
    basis: "fill",
  },
]

/**
 * The weakest reading at an anchor.
 *
 * An anchor names a kind of element, not one node: samsung renders the accent
 * button three times. They agree, and taking the worst is what a reader would
 * do anyway.
 */
function atAnchor(
  findings: Array<Finding>,
  anchor: Pick<Anchor, "kind" | "theme" | "state" | "pathEnds">
): Finding | undefined {
  const matches = findings.filter(
    (f) =>
      f.kind === anchor.kind &&
      f.theme === anchor.theme &&
      f.state === anchor.state &&
      f.path.endsWith(anchor.pathEnds)
  )
  return matches.sort((a, b) => a.ratio - b.ratio).at(0)
}

/** What a path anchor claims, in the words the check would print. */
function describePath(anchor: PathAnchor, found: Finding): string {
  const parts: Array<string> = []
  if (anchor.basis !== undefined) parts.push(`carried by ${found.basis}`)
  if (anchor.verdict !== undefined) parts.push(found.verdict)
  if (anchor.blockers !== undefined) {
    parts.push(`held for ${found.blockers.join("+") || "nothing"}`)
  }
  if (anchor.opacityApprox !== undefined) {
    parts.push(found.opacityApprox ? "approximated" : "exact")
  }
  return parts.join(", ")
}

interface CheckResult {
  ok: boolean
  lines: Array<string>
}

export async function selfCheck(root: string): Promise<CheckResult> {
  const { chromium } = await import("playwright")
  const fixture = readFileSync(join(root, FIXTURE_FILE), "utf8")
  const server = await serveStatic(`${root}/public`)
  server.setOracle(fixture)
  const browser = await chromium.launch()
  const lines: Array<string> = []
  let ok = true
  const note = (pass: boolean, text: string): void => {
    if (!pass) ok = false
    lines.push(`${pass ? "ok  " : "FAIL"} ${text}`)
  }

  try {
    const context = await browser.newContext({
      viewport: { width: ORACLE_WIDTH, height: 800 },
      reducedMotion: "reduce",
    })
    await context.route("**/*", (route) =>
      new URL(route.request().url()).hostname === "127.0.0.1"
        ? route.continue()
        : route.abort()
    )
    await context.addInitScript(() => {
      const g = globalThis as unknown as Record<string, unknown>
      if (g.__name === undefined) g.__name = (fn: unknown) => fn
    })
    const page = await context.newPage()

    const collect = async (
      url: string,
      slug: string
    ): Promise<Array<Finding>> => {
      const out: Array<Finding> = []
      for (const theme of ["light", "dark"] as const) {
        const measured = await measureOne(context, page, url, {
          slug,
          theme,
          width: ORACLE_WIDTH,
          withHover: true,
        })
        out.push(...measured.findings)
      }
      return out
    }

    const base = `http://127.0.0.1:${server.port}`
    const before = await collect(`${base}${ORACLE_URL_PATH}`, "oracle")
    const after = await collect(
      `${base}/preview/samsung-one-ui/preview.html`,
      "samsung-one-ui"
    )

    // Ratio and basis are judged together rather than in two passes: a reading
    // that lands on the right number through the wrong boundary is one finding,
    // and a fix for it would have to move a different colour than the number
    // alone suggests.
    const checkAnchor = (
      findings: Array<Finding>,
      anchor: Anchor,
      expected: number
    ): void => {
      const found = atAnchor(findings, anchor)
      if (found === undefined) {
        note(false, `${anchor.id}: not measured at all (${anchor.pathEnds})`)
        return
      }
      const delta = Math.abs(found.ratio - expected)
      const basisOk = anchor.basis === undefined || found.basis === anchor.basis
      const why =
        (delta <= TOLERANCE ? "" : ` (off by ${delta.toFixed(2)})`) +
        (basisOk
          ? ""
          : ` (carried by ${found.basis ?? "neither"}, expected ${anchor.basis})`)
      note(
        delta <= TOLERANCE && basisOk,
        `${anchor.id}: ${found.ratio.toFixed(2)} vs ${expected} expected${why}`
      )
    }

    lines.push(`fixture: ${FIXTURE_FILE} (${fixture.length} bytes)`)
    lines.push("")
    lines.push(
      "--- the defects the fix removed, as the fixture still shows them ---"
    )
    for (const anchor of ANCHORS) checkAnchor(before, anchor, anchor.before)

    lines.push("")
    lines.push("--- and the same elements on the shipped file ---")
    for (const anchor of ANCHORS) checkAnchor(after, anchor, anchor.after)

    lines.push("")
    lines.push("--- paths a ratio alone does not pin ---")
    for (const anchor of PATH_ANCHORS) {
      const found = atAnchor(after, anchor)
      if (found === undefined) {
        note(false, `${anchor.id}: not measured at all (${anchor.pathEnds})`)
        continue
      }
      const wrong: Array<string> = []
      if (anchor.basis !== undefined && found.basis !== anchor.basis) {
        wrong.push(
          `basis ${found.basis ?? "neither"}, expected ${anchor.basis}`
        )
      }
      if (anchor.verdict !== undefined && found.verdict !== anchor.verdict) {
        wrong.push(`verdict ${found.verdict}, expected ${anchor.verdict}`)
      }
      if (anchor.blockers !== undefined) {
        const got = [...found.blockers].sort().join("+") || "none"
        const want = [...anchor.blockers].sort().join("+")
        if (got !== want) wrong.push(`held for ${got}, expected ${want}`)
      }
      if (
        anchor.opacityApprox !== undefined &&
        found.opacityApprox !== anchor.opacityApprox
      ) {
        wrong.push(
          `opacityApprox ${String(found.opacityApprox)}, expected ${String(anchor.opacityApprox)}`
        )
      }
      note(
        wrong.length === 0,
        `${anchor.id}: ${describePath(anchor, found)}` +
          (wrong.length === 0 ? "" : ` — ${wrong.join("; ")}`)
      )
    }

    // `CSS.forcePseudoState` is accepted and ignored when it is handed a node
    // id the document no longer has, so a hover pass can look like it ran and
    // measure nothing. The fixture's light accent button reads 4.51 at rest and
    // 3.60 hovered; if those come back equal the forcing did not take, and the
    // anchor checks above would have been comparing the resting value.
    lines.push("")
    const rest = atAnchor(before, {
      ...ANCHORS[1],
      state: "default",
    })
    const hovered = atAnchor(before, ANCHORS[1])
    const restText = rest === undefined ? "not measured" : rest.ratio.toFixed(2)
    const hoverText =
      hovered === undefined ? "not measured" : hovered.ratio.toFixed(2)
    note(
      rest !== undefined &&
        hovered !== undefined &&
        Math.abs(rest.ratio - hovered.ratio) > TOLERANCE,
      `hover was really forced: at rest ${restText}, hovered ${hoverText}`
    )

    // Every anchor on the shipped file clears its threshold. This is about the
    // ten rows the fix moved, not about the file as a whole: "the catalogue has
    // no failures" is a claim the sweep's report makes, and wiring it in here
    // would break the self-check every time the sweep found something new —
    // which it did, the first time hover worked, on a `.btn-flat:hover` pair
    // issue #359 never listed.
    const unfixed = ANCHORS.filter((anchor) => {
      const found = atAnchor(after, anchor)
      return found === undefined || found.verdict === "fail"
    })
    note(
      unfixed.length === 0,
      `every anchor clears its threshold on the shipped file` +
        (unfixed.length === 0
          ? ""
          : ` (still failing: ${unfixed.map((a) => a.id).join(", ")})`)
    )
    // And the file still carries the one borderline its own guard comment
    // describes: white on the published primary-dark, a pair that cannot be
    // moved without changing a published colour.
    const guarded = atAnchor(after, {
      ...ANCHORS[1],
      theme: "light",
      state: "default",
    })
    note(
      guarded !== undefined && guarded.verdict === "borderline",
      `the guarded light accent button is still borderline: ` +
        (guarded === undefined
          ? "not measured"
          : `${guarded.ratio.toFixed(2)} (${guarded.verdict})`)
    )
  } finally {
    await browser.close()
    await server.close()
  }

  return { ok, lines }
}
