import { describe, expect, it } from "vitest"
import {
  FORCED_STATES,
  compareDomPasses,
  selfCheckProblems,
  stateTargetSelectors,
} from "./preview-dom-diff"
import type { DomDiff, DomPasses, DomRow } from "./preview-dom-diff"

// The judging half of the screen comparison tool (`pnpm preview:dom-diff`):
// two captures in, differences out. The capturing half needs a browser and is
// held by the tool's own `--self-check`, which CI runs where Chromium is.

function row(who: string, overrides: Partial<DomRow> = {}): DomRow {
  return {
    who,
    text: "",
    rect: [0, 0, 100, 40],
    style: { color: "rgb(0, 0, 0)", display: "block" },
    ...overrides,
  }
}

function passes(entries: Record<string, Array<DomRow>>): DomPasses {
  return new Map(Object.entries(entries))
}

const PAGE = [
  row("body"),
  row("main.hero"),
  row("button.btn", { text: "확인" }),
]

describe("compareDomPasses", () => {
  it("finds nothing between two captures of the same rendering", () => {
    expect(
      compareDomPasses(
        passes({ "light @375": PAGE, "dark @375": PAGE }),
        passes({ "light @375": PAGE, "dark @375": PAGE })
      )
    ).toEqual([])
  })

  it("names the pass, the element, the property and both values", () => {
    const changed = [
      PAGE[0],
      PAGE[1],
      row("button.btn", {
        text: "확인",
        style: { color: "rgb(255, 255, 255)", display: "block" },
      }),
    ]
    expect(
      compareDomPasses(
        passes({ "light @375": PAGE, "dark @375": PAGE }),
        passes({ "light @375": PAGE, "dark @375": changed })
      )
    ).toEqual([
      {
        pass: "dark @375",
        index: 2,
        who: "button.btn",
        what: "color",
        a: "rgb(0, 0, 0)",
        b: "rgb(255, 255, 255)",
      },
    ])
  })

  it("reports a property only one side computed", () => {
    const withPseudo = [
      PAGE[0],
      row("main.hero", {
        style: {
          color: "rgb(0, 0, 0)",
          display: "block",
          "::before content": '"•"',
        },
      }),
      PAGE[2],
    ]
    const [diff] = compareDomPasses(
      passes({ "light @375": PAGE }),
      passes({ "light @375": withPseudo })
    )
    expect(diff).toMatchObject({
      who: "main.hero",
      what: "::before content",
      a: "(absent)",
      b: '"•"',
    })
  })

  it("reports changed text", () => {
    const relabelled = [PAGE[0], PAGE[1], row("button.btn", { text: "취소" })]
    expect(
      compareDomPasses(
        passes({ "light @375": PAGE }),
        passes({ "light @375": relabelled })
      )
    ).toMatchObject([{ what: "text", a: "확인", b: "취소" }])
  })

  // Boxes are rounded to half a pixel when captured, and sub-pixel layout can
  // land either side of a rounding edge between two runs of the same page.
  it("lets a box move by half a pixel and no more", () => {
    const moved = (dx: number) => [
      PAGE[0],
      PAGE[1],
      row("button.btn", { text: "확인", rect: [dx, 0, 100, 40] }),
    ]
    const diffsFor = (dx: number) =>
      compareDomPasses(
        passes({ "light @375": PAGE }),
        passes({ "light @375": moved(dx) })
      )
    expect(diffsFor(0.5)).toEqual([])
    expect(diffsFor(1)).toMatchObject([{ what: "box x", a: "0", b: "1" }])
  })

  // Rows are paired by position. Past the first element that is not the same
  // element, every later pair is two unrelated elements, and listing their
  // differences would bury the one finding under hundreds of false ones.
  it("stops a pass at the first element that does not line up", () => {
    const extra = [PAGE[0], row("div.banner"), PAGE[1], PAGE[2]]
    expect(
      compareDomPasses(
        passes({ "light @375": PAGE }),
        passes({ "light @375": extra })
      ).map((d) => d.what)
    ).toEqual(["element count", "element"])
  })

  // A pass one side has and the other lacks is a finding, never a skip: the
  // forced-state passes carry how many elements were forced in their name, so
  // this is how "a :hover rule disappeared" shows up.
  it("reports a pass that only one side has, in either direction", () => {
    const a = passes({
      "light @976": PAGE,
      "light @976 :hover (2 forced)": PAGE,
    })
    const b = passes({
      "light @976": PAGE,
      "light @976 :hover (1 forced)": PAGE,
    })
    expect(compareDomPasses(a, b).map((d) => `${d.pass} — ${d.what}`)).toEqual([
      "light @976 :hover (2 forced) — pass missing on side b",
      "light @976 :hover (1 forced) — pass missing on side a",
    ])
  })
})

// A forced state lands on one node and does not reach its ancestors the way a
// real pointer does, so the element to force is the one the pseudo-class is
// written on — not the one the rule ends up styling.
describe("stateTargetSelectors", () => {
  it("names the element itself when the pseudo-class is on the subject", () => {
    expect(stateTargetSelectors(".btn:hover")).toEqual([".btn"])
  })

  it("names the ancestor a descendant rule hangs its state on", () => {
    expect(stateTargetSelectors(".tbl tr:hover td")).toEqual([".tbl tr"])
    expect(stateTargetSelectors(".cell:hover > .toast")).toEqual([".cell"])
  })

  it("names every element that carries a state, each with what leads to it", () => {
    expect(stateTargetSelectors(".a:hover .b:focus-visible i")).toEqual([
      ".a",
      ".a .b",
    ])
  })

  it("reads each selector of a list, and not the commas inside one", () => {
    expect(
      stateTargetSelectors(
        ".tbl tr:hover td, .tbl tr:hover td.col-no, .x:is(.a, .b):active"
      )
    ).toEqual([".tbl tr", ".x:is(.a, .b)"])
  })

  it("drops a pseudo-element, which names no element of its own", () => {
    expect(stateTargetSelectors(".thumb:hover::before")).toEqual([".thumb"])
  })

  it("does not cut inside an attribute value or a functional pseudo-class", () => {
    expect(stateTargetSelectors('a[title="x > y"]:focus span')).toEqual([
      'a[title="x > y"]',
    ])
    expect(stateTargetSelectors("li:nth-child(2n + 1):hover b")).toEqual([
      "li:nth-child(2n + 1)",
    ])
  })

  it("names nothing for a selector with no state, or a state on no named element", () => {
    expect(stateTargetSelectors(".btn")).toEqual([])
    expect(stateTargetSelectors(":focus-visible")).toEqual([])
    expect(stateTargetSelectors(".menu :hover")).toEqual([])
  })

  it("names the element a :focus-within rule hangs its state on", () => {
    expect(stateTargetSelectors(".sbar:focus-within input")).toEqual([".sbar"])
  })

  it("takes a longer state name whole, not the :focus it starts with", () => {
    expect(stateTargetSelectors(".a:focus-visible")).toEqual([".a"])
    expect(stateTargetSelectors(".a:focus-within")).toEqual([".a"])
    expect(stateTargetSelectors(".a:focused")).toEqual([])
  })
})

describe("FORCED_STATES", () => {
  // An element is found for a state and then put into it. A state found and
  // not forced is the tool saying "no difference" about a rule it never ran.
  it("forces, in the focus pass, all three states a real focus brings", () => {
    const focus = FORCED_STATES.find((pass) => pass.name === "focus")
    expect(focus?.forced).toEqual(["focus", "focus-visible", "focus-within"])
  })

  it("finds an element for every state a pass forces", () => {
    for (const state of FORCED_STATES.flatMap((pass) => pass.forced)) {
      expect(stateTargetSelectors(`.a:${state} .b`), state).toEqual([".a"])
    }
  })
})

describe("selfCheckProblems", () => {
  const EXPECTED = [
    {
      pass: "dark @976 :hover",
      who: "button.btn",
      what: "background-color",
    },
    { pass: "dark @976 :hover", who: "p.label", what: "background-color" },
  ]
  const hit: DomDiff = {
    pass: "dark @976 :hover (2 forced)",
    index: 3,
    who: "button.btn",
    what: "background-color",
    a: "rgb(119, 170, 255)",
    b: "rgb(153, 204, 255)",
  }
  const ancestorHit: DomDiff = {
    ...hit,
    index: 2,
    who: "p.label",
  }

  it("is satisfied by no difference against itself and every planted difference", () => {
    expect(selfCheckProblems([], [hit, ancestorHit], EXPECTED)).toEqual([])
  })

  it("fails when the same document differs from itself", () => {
    expect(selfCheckProblems([hit], [hit, ancestorHit], EXPECTED)).toHaveLength(
      1
    )
  })

  // The failure that matters most: a tool that sees nothing says "no
  // difference" about everything.
  it("fails when no planted difference is found", () => {
    expect(selfCheckProblems([], [], EXPECTED)).toHaveLength(2)
  })

  // Each shape is its own blind spot: a tool that still forces `.btn:hover`
  // can have stopped reaching the state an ancestor carries.
  it("fails for the one planted difference that is missing, by name", () => {
    const problems = selfCheckProblems([], [hit], EXPECTED)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain("p.label")
  })

  it("fails when a difference shows up outside the planted ones", () => {
    const stray: DomDiff = { ...hit, pass: "light @976 :hover (2 forced)" }
    const problems = selfCheckProblems([], [hit, ancestorHit, stray], EXPECTED)
    expect(problems).toHaveLength(1)
    expect(problems[0]).toContain("light @976 :hover (2 forced)")
  })
})
