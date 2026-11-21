import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

// `docs/preview-contrast-baseline.md` keeps a checklist of the input branches
// a change that releases a held pseudo-element reading has to be checked
// against, each with the self-check panels that guard it (`CODING_STANDARDS.md`
// 「보류 풀기」). It says a new panel adds its branch there. That is a rule a
// diff can break silently: a panel added to the fixture and left off the list
// leaves a reviewer checking against a list that misses its branch.
//
// The panels are the ones the fixture's header describes, one bullet each,
// named as `` `.name` `` (or `` `.name::before` ``, several joined by "and").
const ROOT = process.cwd()
const read = (file: string): string => readFileSync(join(ROOT, file), "utf8")

const fixture = read("scripts/fixtures/pseudo-background.html")
const header = fixture.slice(0, fixture.indexOf("-->"))
const NAME = /`\.([a-z-]+)(?:::[a-z]+)?`/g
const described = new Set(
  [
    ...header.matchAll(
      /^\s*- (`\.[a-z-]+(?:::[a-z]+)?`(?:(?:,| and|, and) `\.[a-z-]+(?:::[a-z]+)?`)*)/gm
    ),
  ].flatMap((m) => [...m[1].matchAll(NAME)].map((n) => n[1]))
)

const doc = read("docs/preview-contrast-baseline.md")
const from = doc.indexOf("## 보류를 푸는 변경의 점검 목록")
const to = doc.indexOf("## Known gaps", from)
const listed = new Set([...doc.slice(from, to).matchAll(NAME)].map((n) => n[1]))

describe("the hold-release checklist", () => {
  it("is found in the baseline document", () => {
    expect(from).toBeGreaterThan(-1)
    expect(to).toBeGreaterThan(from)
    expect(described.size).toBeGreaterThan(0)
  })

  it("names every panel the pseudo-background fixture describes", () => {
    expect([...described].filter((name) => !listed.has(name))).toEqual([])
  })

  it("names no panel the fixture does not describe", () => {
    expect([...listed].filter((name) => !described.has(name))).toEqual([])
  })
})
