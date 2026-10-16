// Which contrast shortfalls are pairs of brand colours (#397).
//
// A preview's colours come from the brand's own values, so a `fail` or a
// `borderline` row is not always something the preview can fix: when both
// sides of the pair are colours the brand published, moving either one means
// dropping a published value. samsung's light emphasis button (4.51:1, white on
// the published `primary-dark`) is that case, and it was left alone with a
// guard comment rather than recoloured.
//
// This is the procedure `docs/preview-contrast-baseline.md` first ran by hand
// on the `borderline` rows, now in code so the same question can be answered
// for `fail` and asked again when the numbers move: read the entry's OKLCH
// definitions (`readDefinitions`), carry each measured hex into Oklab
// (`hexToOklab`), and call it a token when the nearest one is within
// `PUBLISHED_PAIR_TOLERANCE`. Run over the artifact CI uploads, never a local
// sweep — the recorded tables describe CI's rendering.

import { keyOf } from "./contrast-report"
import { deltaE, hexToOklab, parseOklch } from "./oklch-convert"
import { frontmatterBlock, readDefinitions } from "./oklch-drift"
import type { Oklab } from "./oklch-convert"
import type { DedupedFinding, Finding, Judgement } from "./contrast-report"

/**
 * How close a measured colour must be to a definition to count as that token.
 *
 * Read off the data, not chosen: when the section was first written, the 514
 * colour readings of the then 258 `borderline` rows had their nearest-token
 * distance bunched at or under 0.002 with nothing between 0.002 and 0.005 —
 * 8-bit quantisation below, a nearby-but-different colour above. 0.01 would
 * glue samsung's `#fdfdfd` to `white` (#fafafa).
 *
 * The `fail` readings do NOT leave that band empty (the section of the
 * document that classifies them records how many sit in it). It is kept
 * anyway — #397 fixed it — and it errs in the direction the section's other
 * caveat already does: a stricter match counts fewer pairs as published.
 */
export const PUBLISHED_PAIR_TOLERANCE = 0.002

/**
 * Colour groups whose values the entry OBSERVED on the brand's live site rather
 * than found published, by the group's `## …` heading in the `colors:` map,
 * written exactly as the entry writes it.
 *
 * Listed by hand because "published" is the entry's claim, not a pattern: lg's
 * domestic group says "운영 CSS 이름" and never "미발행", while the document
 * still treats those names as observed. A heading renamed in the entry makes
 * `paletteOf` throw rather than quietly move its tokens back to published,
 * and the corpus test reads every heading here against its entry.
 */
export const OBSERVED_COLOUR_GROUPS: Readonly<
  Record<string, ReadonlyArray<string>>
> = Object.freeze({
  "lg-electronics": [
    "(b) EI 커머스 — lg.com/us 관측(미발행)",
    "(c) 국내 — lge.co.kr :root --color-set--* (국내 운영 CSS 이름)",
  ],
  nol: [
    "서비스 UI 관측(미발행) — 프라이머리 (nol.yanolja.com CSS 번들)",
    "서비스 UI 관측(미발행) — 강조·위험·경고",
    "서비스 UI 관측(미발행) — 멤버십·별점",
    "서비스 UI 관측(미발행) — 뉴트럴",
    "서비스 UI 관측(미발행) — 투명도",
  ],
})

export interface PaletteEntry {
  name: string
  lab: Oklab
  /** Defined under one of the entry's `OBSERVED_COLOUR_GROUPS`. */
  observed: boolean
}

export interface Palette {
  entries: Array<PaletteEntry>
  /** Definitions `parseOklch` could not read — said, not dropped. */
  unreadable: Array<string>
}

const MAP_KEY = /^([a-z][\w-]*):/
const GROUP = /^\s+## (.*)$/
const DEFINITION = /^\s+([a-z][\w-]*):\s+oklch\(/

/**
 * The entry's colour tokens, each marked published or observed.
 *
 * Values come from `readDefinitions`, so a name the entry defines twice with
 * different values is left out here exactly as it is everywhere else. A
 * translucent token is left out too: a measured reading is already composited
 * onto what is behind it, so matching its opaque colour to `oklch(0 0 0 / 5%)`
 * would call a shadow tint "black".
 */
export function paletteOf(
  markdown: string,
  observedGroups: ReadonlyArray<string>
): Palette {
  const front = frontmatterBlock(markdown)
  // Where each definition sits: which top-level map, under which heading. A
  // heading belongs to the map it is written in, so a new map clears it.
  const groupOf = new Map<string, string | null>()
  const colourGroups = new Set<string>()
  let map: string | null = null
  let group: string | null = null
  for (const line of front.split("\n")) {
    const key = MAP_KEY.exec(line)
    if (key) {
      map = key[1]
      group = null
      continue
    }
    const heading = GROUP.exec(line)
    if (heading) {
      group = heading[1].trim()
      if (map === "colors") colourGroups.add(group)
      continue
    }
    const def = DEFINITION.exec(line)
    if (def && !groupOf.has(def[1])) {
      groupOf.set(def[1], map === "colors" ? group : null)
    }
  }
  const missing = observedGroups.filter((g) => !colourGroups.has(g))
  if (missing.length > 0) {
    throw new Error(
      `observed colour groups not found in the colors map: ${missing.map((g) => JSON.stringify(g)).join(", ")}`
    )
  }

  const entries: Array<PaletteEntry> = []
  const unreadable: Array<string> = []
  for (const [name, value] of readDefinitions(markdown)) {
    const parsed = parseOklch(value)
    if (parsed === null) {
      unreadable.push(name)
      continue
    }
    if (parsed.alpha !== null && parsed.alpha < 1) continue
    const g = groupOf.get(name) ?? null
    entries.push({
      name,
      lab: parsed.lab,
      observed: g !== null && observedGroups.includes(g),
    })
  }
  return { entries, unreadable }
}

/**
 * What a measured colour is: a published token, an observed one, or neither.
 * A value the entry carries as both counts as published — NOL's observed
 * `membership-dia-main` is the published `nol-blue`.
 */
export function readingClass(
  hex: string,
  palette: Palette,
  tolerance = PUBLISHED_PAIR_TOLERANCE
): "published" | "observed" | null {
  const lab = hexToOklab(hex)?.lab
  if (lab === undefined) return null
  let observed = false
  for (const e of palette.entries) {
    if (deltaE(lab, e.lab) > tolerance) continue
    if (!e.observed) return "published"
    observed = true
  }
  return observed ? "observed" : null
}

export type PairClass =
  "both-published" | "observed-pair" | "one-token" | "no-token"

/**
 * Four ways a pair can sit against the entry's palette. Only the first says
 * a fix would drop published values; `observed-pair` is kept apart so a
 * reader can put the observed values on whichever side they believe.
 */
export function pairClass(
  fg: string,
  bg: string,
  palette: Palette,
  tolerance = PUBLISHED_PAIR_TOLERANCE
): PairClass {
  const a = readingClass(fg, palette, tolerance)
  const b = readingClass(bg, palette, tolerance)
  if (a === null && b === null) return "no-token"
  if (a === null || b === null) return "one-token"
  return a === "published" && b === "published"
    ? "both-published"
    : "observed-pair"
}

export interface PairTally {
  slug: string
  kind: "text" | "non-text"
  bothPublished: number
  observedPair: number
  oneToken: number
  noToken: number
  total: number
}

const FIELD: Record<PairClass, keyof PairTally> = {
  "both-published": "bothPublished",
  "observed-pair": "observedPair",
  "one-token": "oneToken",
  "no-token": "noToken",
}

const KIND_ORDER = { text: 0, "non-text": 1 }

/**
 * The rows of one verdict, classified and counted by slug and kind. Themes are
 * summed: the question is which entry a fix would touch, and a pair's two
 * themes are usually two pairs of the same tokens.
 */
export function tallyPairs(
  rows: Array<DedupedFinding>,
  paletteFor: (slug: string) => Palette,
  verdict: Judgement,
  tolerance = PUBLISHED_PAIR_TOLERANCE
): Array<PairTally> {
  const byKey = new Map<string, PairTally>()
  for (const r of rows) {
    if (r.verdict !== verdict) continue
    const key = `${r.slug}|${r.kind}`
    let t = byKey.get(key)
    if (t === undefined) {
      t = {
        slug: r.slug,
        kind: r.kind,
        bothPublished: 0,
        observedPair: 0,
        oneToken: 0,
        noToken: 0,
        total: 0,
      }
      byKey.set(key, t)
    }
    const field = FIELD[pairClass(r.fg, r.bg, paletteFor(r.slug), tolerance)]
    ;(t[field] as number)++
    t.total++
  }
  return [...byKey.values()].sort(
    (a, b) =>
      a.slug.localeCompare(b.slug) || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]
  )
}

const PAIR_COLUMNS = [
  "slug",
  "kind",
  "both-published",
  "observed-pair",
  "one-token",
  "no-token",
  "total",
]

const line = (cells: Array<string | number>): string =>
  `| ${cells.join(" | ")} |`

export function renderPairTable(tally: Array<PairTally>): string {
  return [
    line(PAIR_COLUMNS),
    line(PAIR_COLUMNS.map(() => "---")),
    ...tally.map((t) =>
      line([
        t.slug,
        t.kind,
        t.bothPublished,
        t.observedPair,
        t.oneToken,
        t.noToken,
        t.total,
      ])
    ),
  ].join("\n")
}

/**
 * A table `renderPairTable` wrote, read back. The header is checked and every
 * row must add up, so a hand edit to one cell is an error here rather than a
 * number the corpus test compares in good faith.
 */
export function parsePairTable(table: string): Array<PairTally> {
  const lines = table
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"))
  const cellsOf = (l: string): Array<string> =>
    l
      .slice(1, -1)
      .split("|")
      .map((c) => c.trim())
  const header = cellsOf(lines[0] ?? "")
  if (header.join("|") !== PAIR_COLUMNS.join("|")) {
    throw new Error(
      `pair table header is ${JSON.stringify(header)}, expected ${JSON.stringify(PAIR_COLUMNS)}`
    )
  }
  return lines.slice(2).map((l) => {
    const c = cellsOf(l)
    const count = (i: number): number => {
      const n = Number(c[i])
      if (!Number.isInteger(n) || n < 0) {
        throw new Error(
          `pair table row for ${c[0]} ${c[1]} has ${PAIR_COLUMNS[i]} = ${JSON.stringify(c[i])}, expected a whole number`
        )
      }
      return n
    }
    const t: PairTally = {
      slug: c[0],
      kind: c[1] as PairTally["kind"],
      bothPublished: count(2),
      observedPair: count(3),
      oneToken: count(4),
      noToken: count(5),
      total: count(6),
    }
    if (t.bothPublished + t.observedPair + t.oneToken + t.noToken !== t.total) {
      throw new Error(
        `pair table row for ${t.slug} ${t.kind} does not add up to its total ${t.total}`
      )
    }
    return t
  })
}

/**
 * Folded rows whose widths read DIFFERENT colour pairs, by fold key.
 *
 * `keyOf` leaves the pair out — the ratio stands in for it — so such a row
 * would be classified by whichever width came first. None do in the artifact
 * this was written against; the classifier refuses to run if one appears.
 */
export function splitColourPairs(findings: Array<Finding>): Array<string> {
  const pairs = new Map<string, Set<string>>()
  for (const f of findings) {
    const key = keyOf(f)
    const seen = pairs.get(key) ?? new Set<string>()
    seen.add(`${f.fg} ${f.bg}`)
    pairs.set(key, seen)
  }
  return [...pairs].filter(([, s]) => s.size > 1).map(([k]) => k)
}
