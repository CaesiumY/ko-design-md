import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// `docs/preview-contrast-baseline.md` keeps a checklist of the input branches
// a change that releases a held pseudo-element reading has to be checked
// against, each with the self-check panels that guard it (`CODING_STANDARDS.md`
// 「보류 풀기」). It says a new panel adds its branch there. That is a rule a
// diff can break silently: a panel added to the fixture and left off the list
// leaves a reviewer checking against a list that misses its branch.
//
// The panels are read from two places. The machine-read one is the oracle's
// `PSEUDO_ANCHORS`: the first `div.<panel>` of each `pathEnds`. The fixture's
// header describes each panel in a bullet that opens with its name, as
// `` `.name` `` (or `` `.name::before` ``, several joined by "and"); the two are
// held equal, so a panel described in some other shape is caught by its anchor.
// A name is read to its end, whatever it holds — `.past2` is not `.past` — so
// a name cut short cannot stand in for one already there. The canvas
// fixtures are a document each, one panel apiece: they are held by file name.
const ROOT = process.cwd()
const read = (file: string): string => readFileSync(join(ROOT, file), "utf8")

const oracle = read("scripts/audit-contrast-oracle.ts")
const anchorsFrom = oracle.indexOf("const PSEUDO_ANCHORS")
const anchorsTo = oracle.indexOf("\n]\n", anchorsFrom)
const anchored = new Set(
  [
    ...oracle
      .slice(anchorsFrom, anchorsTo)
      .matchAll(/pathEnds: "div\.([^\s.>:#[\]"]+)/g),
  ].map((m) => m[1])
)

const fixture = read("scripts/fixtures/pseudo-background.html")
const header = fixture.slice(0, fixture.indexOf("-->"))
const NAME = /`\.([\w-]+)(?:::[\w-]+)?`/g
const described = new Set(
  [
    ...header.matchAll(
      /^\s*- (`\.[\w-]+(?:::[\w-]+)?`(?:(?:,| and|, and) `\.[\w-]+(?:::[\w-]+)?`)*)/gm
    ),
  ].flatMap((m) => [...m[1].matchAll(NAME)].map((n) => n[1]))
)

const doc = read("docs/preview-contrast-baseline.md")
const from = doc.indexOf("## 보류를 푸는 변경의 점검 목록")
const to = doc.indexOf("## Known gaps", from)
const section = doc.slice(from, to)
const firstBranch = section.indexOf("\n- **")
const names = (text: string): Set<string> =>
  new Set([...text.matchAll(NAME)].map((n) => n[1]))
// The panels the section names before its first branch are the basic ones it
// says it leaves out; a panel counts as listed only under a branch, a bullet
// opening `- **…**`.
const basic = names(section.slice(0, firstBranch))
const listed = names(section.slice(firstBranch))

const canvases = readdirSync(join(ROOT, "scripts/fixtures")).filter((f) =>
  /^pseudo-canvas-.*\.html$/.test(f)
)

const missing = (want: Set<string>, have: Set<string>): Array<string> =>
  [...want].filter((name) => !have.has(name)).sort()

describe("the hold-release checklist", () => {
  it("is found, with the panels it is held to", () => {
    expect(from).toBeGreaterThan(-1)
    expect(to).toBeGreaterThan(from)
    expect(anchorsFrom).toBeGreaterThan(-1)
    expect(anchored.size).toBeGreaterThan(0)
  })

  it("has every anchored panel described in the fixture's header, and no other", () => {
    expect(missing(anchored, described)).toEqual([])
    expect(missing(described, anchored)).toEqual([])
  })

  it("names every anchored panel under a branch, or among the basic ones it leaves out", () => {
    expect(firstBranch).toBeGreaterThan(-1)
    expect(missing(anchored, new Set([...listed, ...basic]))).toEqual([])
  })

  it("leaves out only the basic panels that judge the composing itself", () => {
    // A closed list: moving a panel out of the branches is a choice a diff to
    // this test has to make in sight.
    expect([...basic].sort()).toEqual(["cover", "opaque", "under", "veil"])
  })

  it("names no panel both under a branch and among the basic ones", () => {
    expect([...basic].filter((name) => listed.has(name)).sort()).toEqual([])
  })

  it("names every canvas fixture under a branch", () => {
    expect(canvases.length).toBeGreaterThan(0)
    const branches = section.slice(firstBranch)
    expect(canvases.filter((f) => !branches.includes(f))).toEqual([])
  })

  it("names no panel that has no anchor", () => {
    expect(missing(new Set([...listed, ...basic]), anchored)).toEqual([])
  })
})
