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
// WHAT THIS FIXTURE CANNOT COVER, AND WHAT DOES. One branch of the collector
// cannot get an anchor here: the `paintBlockers` run over the layers BEHIND a
// non-text surface, which is where a filtered ancestor's pre-filter
// `background-color` was once judged as though it were the colour on screen.
// Reaching it needs a `filter` or a wide inset `box-shadow` on something behind
// a measured surface, and samsung's file has neither. Adding one would end the
// fixture's only claim to authority — that it is a file whose defects are
// already known, unedited.
//
// No shipped preview has the shape either. Six of them declare `filter` and
// none puts it behind a small text-free surface — toss filters its buttons,
// which carry their own label, so its filter is caught on the TEXT path. So
// the branch is covered by a second, synthetic fixture (#399), written for
// this check alone. Its authority is of a different kind and the two are kept
// apart: nothing in it is a record of a past defect, and every expectation on
// it is derived from its CSS by hand, next to the anchor that claims it.

import { readFileSync } from "node:fs"
import { join } from "node:path"
import {
  measureOne,
  newMeasuringContext,
  serveStatic,
} from "./audit-contrast-sweep"
import type { Blocker, ControlTextSource } from "../src/lib/contrast"
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
const SYNTHETIC_FILE = join(
  "scripts",
  "fixtures",
  "nontext-behind-paint-blockers.html"
)
const FORM_FILE = join("scripts", "fixtures", "form-control-text.html")
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
  /**
   * A ratio, claimed only where it is derived by hand from the document's own
   * CSS — the derivation sits next to the anchor that claims it.
   */
  ratio?: number
  /** Where a text reading's text came from (#400); see `Finding.source`. */
  source?: ControlTextSource
  /**
   * The claim is that NO reading of this kind exists at the path — an empty
   * field shows no text, and a reading there would be text nobody can see.
   */
  absent?: true
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
 * The synthetic fixture's claims (#399): the same dot over three panels, and
 * only the panel differs.
 *
 * The control is there so the other two cannot pass by the dot not being
 * measured in the way they assume. It claims a ratio, derived by hand: an
 * achromatic OKLCH colour has relative luminance Y = L³, so the dot at
 * `oklch(0.6 0 0)` is 0.6³ = 0.216 and the white panel is 1, giving
 * (1 + 0.05) / (0.216 + 0.05) = 3.947. Quantised to 8 bits the dot is 0x80,
 * Y 0.2159, and the ratio still rounds to 3.95. Over 3:1, so it passes.
 *
 * The other two claim the path and no number, for the reason the samsung path
 * anchors give: what they assert is that the verdict is WITHHELD, and the
 * ratio a withheld reading still carries is computed from the pre-filter
 * colour nobody sees. The blocker each panel must produce is its CSS — a
 * `filter: brightness(0.5)`, and an inset shadow with a 999px spread against a
 * 120px-tall box, past the half-height the collector requires.
 */
const SYNTHETIC_ANCHORS: Array<PathAnchor> = [
  {
    id: "dot on a plain panel (control)",
    pathEnds: "div.plain > span.dot",
    theme: "light",
    state: "default",
    kind: "non-text",
    basis: "fill",
    verdict: "pass",
    blockers: [],
    opacityApprox: false,
    ratio: 3.95,
  },
  {
    id: "dot on a filtered panel",
    pathEnds: "div.filtered > span.dot",
    theme: "light",
    state: "default",
    kind: "non-text",
    verdict: "indeterminate",
    blockers: ["filter"],
  },
  {
    id: "dot on a panel an inset shadow paints over",
    pathEnds: "div.shadowed > span.dot",
    theme: "light",
    state: "default",
    kind: "non-text",
    verdict: "indeterminate",
    blockers: ["inset-shadow"],
  },
]

/**
 * The form-control fixture's claims (#400): text that is on screen but is not
 * a text node, so the collector has to read it from the control.
 *
 * Every control has a white surface on the white page, and every colour is an
 * achromatic OKLCH, whose relative luminance is L³ — so each ratio is derived
 * by hand, as (1 + 0.05) / (L³ + 0.05):
 *
 * - the placeholder, `oklch(0.6 0 0)`: L³ = 0.216 → 3.947, and 3.949 after the
 *   8-bit round to 0x80. Under 4.5 at 16px, so it fails; the value it is
 *   painted in is the field's `oklch(0.5 0 0)` if the `::placeholder` colour
 *   is ignored, which reads 6.00 and passes — the anchor tells the two apart.
 * - the large placeholder: the same colour at a `::placeholder` font-size of
 *   24px, large text at any weight, so the bar is 3:1 and 3.95 passes. The
 *   field itself stays 16px: only the pseudo-element's size can move the bar.
 * - the value and the select's first option, `oklch(0.5 0 0)`: L³ = 0.125 →
 *   6.000, and 6.008 after the round to 0x63.
 * - the empty field has neither, and must produce no reading at all.
 * - the faded field shows its placeholder at `opacity: 0` — the floating-label
 *   idiom — so nothing is on screen and it too must produce no reading. It is
 *   what tells an opacity read as `parseFloat(…) || 1` from one that keeps 0.
 */
const FORM_ANCHORS: Array<PathAnchor> = [
  {
    id: "placeholder, in the ::placeholder colour",
    pathEnds: "input.ph",
    theme: "light",
    state: "default",
    kind: "text",
    source: "placeholder",
    ratio: 3.95,
    verdict: "fail",
    blockers: [],
  },
  {
    id: "large placeholder, judged on its own size",
    pathEnds: "input.ph-large",
    theme: "light",
    state: "default",
    kind: "text",
    source: "placeholder",
    ratio: 3.95,
    verdict: "pass",
    blockers: [],
  },
  {
    id: "value",
    pathEnds: "input.val",
    theme: "light",
    state: "default",
    kind: "text",
    source: "value",
    ratio: 6.0,
    verdict: "pass",
    blockers: [],
  },
  {
    id: "closed select, its chosen option",
    pathEnds: "select.opt",
    theme: "light",
    state: "default",
    kind: "text",
    source: "option",
    ratio: 6.0,
    verdict: "pass",
    blockers: [],
  },
  {
    id: "empty field",
    pathEnds: "input.empty",
    theme: "light",
    state: "default",
    kind: "text",
    absent: true,
  },
  {
    id: "placeholder faded out by its own opacity",
    pathEnds: "input.ph-hidden",
    theme: "light",
    state: "default",
    kind: "text",
    absent: true,
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
  anchor: Pick<Anchor, "kind" | "theme" | "state" | "pathEnds"> & {
    source?: ControlTextSource
  }
): Finding | undefined {
  const matches = findings.filter(
    (f) =>
      f.kind === anchor.kind &&
      f.theme === anchor.theme &&
      f.state === anchor.state &&
      f.path.endsWith(anchor.pathEnds) &&
      (anchor.source === undefined || f.source === anchor.source)
  )
  return matches.sort((a, b) => a.ratio - b.ratio).at(0)
}

/** What a path anchor claims, in the words the check would print. */
function describePath(anchor: PathAnchor, found: Finding): string {
  const parts: Array<string> = []
  if (anchor.source !== undefined)
    parts.push(`from ${found.source ?? "a text node"}`)
  if (anchor.ratio !== undefined) parts.push(found.ratio.toFixed(2))
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

/**
 * The same anchors, measured once as the documents stand and once with a
 * declaration added that the catalogue does not use.
 *
 * The collector scrolls an off-screen element into view and reads its rect on
 * the next line. Left to the document's `scroll-behavior`, a preview that asked
 * for `smooth` would turn that scroll into an animation the synchronous
 * collector never waits for, and every reading below the first screen would be
 * taken from where the page was, not where it went. No preview declares it
 * (#490), so the default pass alone cannot tell a collector that ignores the
 * declaration from one that obeys it. The second pass can.
 *
 * Expected values are the same records as the default pass — the issue and the
 * commit, never the default pass's own output — so a collector that broke in
 * both passes alike would still fail here.
 *
 * What it pins is the default-state collection. The hover re-collection does
 * scroll — a working default collection leaves the fixture about 1,900px
 * down, so the accent button every hover anchor names starts above the
 * viewport — but a collector whose scrolls never land also never leaves the
 * top of the page, and then that button is on screen anyway. Measured: with
 * the scroll left to `smooth`, the default collection ended at `scrollY` 0 and
 * every hover anchor still passed. So the hover re-collection is held only
 * because it runs the same `collectContrast` and the same `bringIntoView`.
 */
interface Variant {
  name: string
  /** Added with `measureOne`'s `extraStyle`; the fixture file is not edited. */
  style?: string
  /** What the root's computed `scroll-behavior` must be once `style` is in. */
  scrollBehavior?: string
}

const VARIANTS: Array<Variant> = [
  { name: "default" },
  {
    name: "smooth-scroll",
    style: "* { scroll-behavior: smooth !important; }",
    scrollBehavior: "smooth",
  },
]

interface CheckResult {
  ok: boolean
  lines: Array<string>
}

export async function selfCheck(root: string): Promise<CheckResult> {
  const { chromium } = await import("playwright")
  const fixture = readFileSync(join(root, FIXTURE_FILE), "utf8")
  const syntheticFixture = readFileSync(join(root, SYNTHETIC_FILE), "utf8")
  const formFixture = readFileSync(join(root, FORM_FILE), "utf8")
  const server = await serveStatic(`${root}/public`)
  const browser = await chromium.launch()
  const lines: Array<string> = []
  let ok = true
  // Every line names its pass, so a failure says at once whether it is the
  // collector itself or only its handling of the injected declaration.
  let variant: Variant = VARIANTS[0]
  const note = (passed: boolean, text: string): void => {
    if (!passed) ok = false
    lines.push(`${passed ? "ok  " : "FAIL"} [${variant.name}] ${text}`)
  }
  const heading = (text: string): void => {
    lines.push("")
    lines.push(`--- [${variant.name}] ${text} ---`)
  }

  try {
    const context = await newMeasuringContext(browser, {
      width: ORACLE_WIDTH,
      online: false,
    })
    const page = await context.newPage()

    // The two fixtures take turns at the one virtual path, so every collection
    // says what must be served there — the document, or `null` for a page under
    // `public/` that does not use the path. It is required and always set —
    // `null` empties the path, which then answers 404 — so a call cannot
    // measure whichever fixture the previous one left behind. Each fixture also
    // gets its own query string, which the server ignores: nothing here sends
    // caching headers, so this only guards against a cache keeping one document
    // under the other's URL.
    const collect = async (
      url: string,
      slug: string,
      oracle: string | null
    ): Promise<Array<Finding>> => {
      server.setOracle(oracle)
      const out: Array<Finding> = []
      for (const theme of ["light", "dark"] as const) {
        const measured = await measureOne(context, page, url, {
          slug,
          theme,
          width: ORACLE_WIDTH,
          withHover: true,
          extraStyle: variant.style,
        })
        out.push(...measured.findings)
        // Asked after every load, not once per pass: each theme is a fresh
        // `goto`, and an injection that missed one of them would leave that
        // half of the pass a silent copy of the default.
        if (variant.scrollBehavior !== undefined) {
          const got = await page.evaluate(
            () => getComputedStyle(document.documentElement).scrollBehavior
          )
          note(
            got === variant.scrollBehavior,
            `${slug} ${theme} was measured with scroll-behavior ${got}, ` +
              `expected ${variant.scrollBehavior}`
          )
        }
      }
      return out
    }

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

    const checkPath = (findings: Array<Finding>, anchor: PathAnchor): void => {
      const found = atAnchor(findings, anchor)
      if (anchor.absent === true) {
        note(
          found === undefined,
          `${anchor.id}: ` +
            (found === undefined
              ? "no reading, as expected"
              : `read as ${found.source ?? "text"} "${found.sample}", expected none`)
        )
        return
      }
      if (found === undefined) {
        note(false, `${anchor.id}: not measured at all (${anchor.pathEnds})`)
        return
      }
      const wrong: Array<string> = []
      if (anchor.source !== undefined && found.source !== anchor.source) {
        wrong.push(
          `source ${found.source ?? "text node"}, expected ${anchor.source}`
        )
      }
      if (anchor.ratio !== undefined) {
        const delta = Math.abs(found.ratio - anchor.ratio)
        if (delta > TOLERANCE) {
          wrong.push(
            `${found.ratio.toFixed(2)} vs ${anchor.ratio} expected (off by ${delta.toFixed(2)})`
          )
        }
      }
      if (anchor.basis !== undefined && found.basis !== anchor.basis) {
        wrong.push(
          `basis ${found.basis ?? "neither"}, expected ${anchor.basis}`
        )
      }
      if (anchor.verdict !== undefined && found.verdict !== anchor.verdict) {
        wrong.push(`verdict ${found.verdict}, expected ${anchor.verdict}`)
      }
      if (anchor.blockers !== undefined) {
        // Both sides spell an empty set `none`: the control claims one, and
        // `""` against `"none"` would fail an anchor that is right.
        const got = [...found.blockers].sort().join("+") || "none"
        const want = [...anchor.blockers].sort().join("+") || "none"
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

    lines.push(`fixture: ${FIXTURE_FILE} (${fixture.length} bytes)`)
    lines.push(
      `fixture: ${SYNTHETIC_FILE} (${syntheticFixture.length} bytes, synthetic)`
    )
    lines.push(`fixture: ${FORM_FILE} (${formFixture.length} bytes, synthetic)`)
    const base = `http://127.0.0.1:${server.port}`
    for (const current of VARIANTS) {
      variant = current
      if (variant.style !== undefined)
        heading(`with ${variant.style.trim()} added`)
      const before = await collect(
        `${base}${ORACLE_URL_PATH}?fixture=samsung`,
        "oracle",
        fixture
      )
      const after = await collect(
        `${base}/preview/samsung-one-ui/preview.html`,
        "samsung-one-ui",
        null
      )

      heading("the defects the fix removed, as the fixture still shows them")
      for (const anchor of ANCHORS) checkAnchor(before, anchor, anchor.before)

      heading("and the same elements on the shipped file")
      for (const anchor of ANCHORS) checkAnchor(after, anchor, anchor.after)

      heading("paths a ratio alone does not pin")
      for (const anchor of PATH_ANCHORS) checkPath(after, anchor)

      heading(
        "a layer behind a non-text surface that paints over its own colour"
      )
      const synthetic = await collect(
        `${base}${ORACLE_URL_PATH}?fixture=synthetic`,
        "oracle-synthetic",
        syntheticFixture
      )
      for (const anchor of SYNTHETIC_ANCHORS) checkPath(synthetic, anchor)

      heading("text a form control shows that the text pass does not measure")
      const form = await collect(
        `${base}${ORACLE_URL_PATH}?fixture=form`,
        "oracle-form",
        formFixture
      )
      for (const anchor of FORM_ANCHORS) checkPath(form, anchor)

      // `CSS.forcePseudoState` is accepted and ignored when it is handed a
      // node id the document no longer has, so a hover pass can look like it
      // ran and measure nothing. The fixture's light accent button reads 4.51
      // at rest and 3.60 hovered; if those come back equal the forcing did not
      // take, and the anchor checks above would have been comparing the
      // resting value.
      lines.push("")
      const rest = atAnchor(before, {
        ...ANCHORS[1],
        state: "default",
      })
      const hovered = atAnchor(before, ANCHORS[1])
      const restText =
        rest === undefined ? "not measured" : rest.ratio.toFixed(2)
      const hoverText =
        hovered === undefined ? "not measured" : hovered.ratio.toFixed(2)
      note(
        rest !== undefined &&
          hovered !== undefined &&
          Math.abs(rest.ratio - hovered.ratio) > TOLERANCE,
        `hover was really forced: at rest ${restText}, hovered ${hoverText}`
      )

      // Every anchor on the shipped file clears its threshold. This is about
      // the ten rows the fix moved, not about the file as a whole: "the
      // catalogue has no failures" is a claim the sweep's report makes, and
      // wiring it in here would break the self-check every time the sweep found
      // something new — which it did, the first time hover worked, on a
      // `.btn-flat:hover` pair issue #359 never listed.
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
    }
  } finally {
    await browser.close()
    await server.close()
  }

  return { ok, lines }
}
