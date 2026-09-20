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

import { execFileSync } from "node:child_process"
import { measureOne, serveStatic } from "./audit-contrast-sweep"
import type { Finding, Theme } from "../src/lib/contrast-report"

/** The commit the fixture predates. Its parent is the fixture. */
const FIX_COMMIT = "2ead71d"
const FIXTURE_PATH = "public/preview/samsung-one-ui/preview.html"
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
  },
  {
    id: "dark off-state toggle track",
    pathEnds: "div.li > span.switch",
    theme: "dark",
    state: "default",
    kind: "non-text",
    before: 1.98,
    after: 3.6,
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
  anchor: Anchor
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

interface CheckResult {
  ok: boolean
  lines: Array<string>
}

export async function selfCheck(root: string): Promise<CheckResult> {
  const { chromium } = await import("playwright")
  const fixture = execFileSync(
    "git",
    ["show", `${FIX_COMMIT}^:${FIXTURE_PATH}`],
    { cwd: root, encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }
  )
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

    lines.push(
      `fixture: ${FIX_COMMIT}^:${FIXTURE_PATH} (${fixture.length} bytes)`
    )
    lines.push("")
    lines.push(
      "--- the defects the fix removed, as the fixture still shows them ---"
    )
    for (const anchor of ANCHORS) {
      const found = atAnchor(before, anchor)
      if (found === undefined) {
        note(false, `${anchor.id}: not measured at all (${anchor.pathEnds})`)
        continue
      }
      const delta = Math.abs(found.ratio - anchor.before)
      note(
        delta <= TOLERANCE,
        `${anchor.id}: ${found.ratio.toFixed(2)} vs ${anchor.before} expected` +
          (delta <= TOLERANCE ? "" : ` (off by ${delta.toFixed(2)})`)
      )
    }

    lines.push("")
    lines.push("--- and the same elements on the shipped file ---")
    for (const anchor of ANCHORS) {
      const found = atAnchor(after, anchor)
      if (found === undefined) {
        note(false, `${anchor.id}: not measured at all (${anchor.pathEnds})`)
        continue
      }
      const delta = Math.abs(found.ratio - anchor.after)
      note(
        delta <= TOLERANCE,
        `${anchor.id}: ${found.ratio.toFixed(2)} vs ${anchor.after} expected` +
          (delta <= TOLERANCE ? "" : ` (off by ${delta.toFixed(2)})`)
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
