// Which contrast shortfalls are pairs of brand colours (#397).
//
// A preview's colours come from the brand's own values, so a `fail` or a
// `borderline` row is not always something the preview can fix: when both
// sides of the pair are colours the brand published, a fix either drops a
// published value or swaps in a token the brand did not use there — a role
// judgement this does not make. samsung's light emphasis button (4.51:1, white on
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
 * The `fail` readings did NOT leave that band empty when they were first
 * classified (2026-10-16); the classifier prints how many sit in it beside
 * each table, on its `readings …` line. It is kept
 * anyway — #397 fixed it — and it errs in the same direction as compositing
 * does (one of the two errors the document's caveat names): a stricter match
 * counts fewer pairs as published.
 */
export const PUBLISHED_PAIR_TOLERANCE = 0.002

/** Where an entry says its values were OBSERVED rather than published. */
export interface ObservedColours {
  /** `## …` headings in the `colors:` map, written exactly as the entry does. */
  groups?: ReadonlyArray<string>
  /** Single tokens the entry marks observed inside an otherwise published group. */
  tokens?: ReadonlyArray<string>
}

/**
 * Colours each entry OBSERVED on the brand's live site rather than found
 * published — whole `colors:` groups, or single tokens.
 *
 * Listed by hand because "published" is the entry's claim, not a pattern: lg's
 * domestic group says "운영 CSS 이름" and never "미발행", while the document
 * still treats those names as observed; gs-shop marks tokens one by one
 * ("라이브 실측 · 공식 문서와 불일치", "공식 문서에 없는 신규 토큰") inside
 * groups that are otherwise published. A heading or token renamed in the entry
 * makes `paletteOf` throw rather than quietly move it back to published, and
 * the corpus test reads every name here against its entry.
 */
export const OBSERVED_COLOURS: Readonly<Record<string, ObservedColours>> =
  Object.freeze({
    "gs-shop": {
      tokens: [
        "notice-dark",
        "notice-middle",
        "notice-light",
        "content-tertiary",
        "content-accent",
      ],
    },
    "lg-electronics": {
      groups: [
        "(b) EI 커머스 — lg.com/us 관측(미발행)",
        "(c) 국내 — lge.co.kr :root --color-set--* (국내 운영 CSS 이름)",
      ],
    },
    nol: {
      groups: [
        "서비스 UI 관측(미발행) — 프라이머리 (nol.yanolja.com CSS 번들)",
        "서비스 UI 관측(미발행) — 강조·위험·경고",
        "서비스 UI 관측(미발행) — 멤버십·별점",
        "서비스 UI 관측(미발행) — 뉴트럴",
        "서비스 UI 관측(미발행) — 투명도",
      ],
    },
  })

export interface PaletteEntry {
  name: string
  lab: Oklab
  /** Listed for the entry in `OBSERVED_COLOURS`, by group or by name. */
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
 * The entry's `colors:` tokens, each marked published or observed.
 *
 * Values come from `readDefinitions`, so a name the entry defines twice with
 * different values is left out here exactly as it is everywhere else. That
 * function reads every `name: oklch(` line in the frontmatter, which includes
 * a `gradients:` row's first stop — not a colour the entry declared — so only
 * names whose first definition sits in the `colors:` map are kept. A
 * translucent token is left out too: a measured reading is already composited
 * onto what is behind it, so matching its opaque colour to `oklch(0 0 0 / 5%)`
 * would call a shadow tint "black".
 */
export function paletteOf(
  markdown: string,
  observed: ObservedColours
): Palette {
  const observedGroups = observed.groups ?? []
  const observedTokens = observed.tokens ?? []
  // Split on `\r?\n`: a `w/crlf` checkout (CLAUDE.md, Windows) would otherwise
  // leave a `\r` on every heading and no listed group would ever match.
  const lines = frontmatterBlock(markdown).split(/\r?\n/)
  // Where each definition sits: which top-level map, under which heading. A
  // heading belongs to the map it is written in, so a new map clears it.
  const placeOf = new Map<
    string,
    { map: string | null; group: string | null }
  >()
  const colourGroups = new Set<string>()
  let map: string | null = null
  let group: string | null = null
  for (const line of lines) {
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
    if (def && !placeOf.has(def[1])) placeOf.set(def[1], { map, group })
  }
  const missing = [
    ...observedGroups.filter((g) => !colourGroups.has(g)),
    ...observedTokens.filter((t) => placeOf.get(t)?.map !== "colors"),
  ]
  if (missing.length > 0) {
    throw new Error(
      `observed colour groups or tokens not found in the colors map: ${missing.map((g) => JSON.stringify(g)).join(", ")}`
    )
  }

  const entries: Array<PaletteEntry> = []
  const unreadable: Array<string> = []
  for (const [name, value] of readDefinitions(markdown)) {
    const place = placeOf.get(name)
    if (place?.map !== "colors") continue
    const parsed = parseOklch(value)
    if (parsed === null) {
      unreadable.push(name)
      continue
    }
    if (parsed.alpha !== null && parsed.alpha < 1) continue
    entries.push({
      name,
      lab: parsed.lab,
      observed:
        observedTokens.includes(name) ||
        (place.group !== null && observedGroups.includes(place.group)),
    })
  }
  return { entries, unreadable }
}

/** Distance from a measured colour to the nearest token; Infinity for none. */
function nearestDistance(hex: string, palette: Palette): number {
  const lab = hexToOklab(hex)?.lab
  if (lab === undefined) return Infinity
  return Math.min(Infinity, ...palette.entries.map((e) => deltaE(lab, e.lab)))
}

/**
 * How many colour readings of one verdict's rows there are, and how many have
 * their nearest token at a distance in `(lo, hi]`.
 *
 * The tolerance was read off an empty `(0.002, 0.005]` band, and whether that
 * band stays empty is the thing to look at again when the numbers move — the
 * CLI prints the count beside the tables, and this is how it is produced.
 */
export function toleranceBand(
  rows: Array<DedupedFinding>,
  paletteFor: (slug: string) => Palette,
  verdict: Judgement,
  [lo, hi]: [number, number]
): { readings: number; inBand: number } {
  let readings = 0
  let inBand = 0
  for (const r of rows) {
    if (r.verdict !== verdict) continue
    for (const hex of [r.fg, r.bg]) {
      readings++
      const d = nearestDistance(hex, paletteFor(r.slug))
      if (d > lo && d <= hi) inBand++
    }
  }
  return { readings, inBand }
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
 * a fix cannot keep both published values as they are; `observed-pair` is
 * kept apart so a reader can put the observed values on whichever side they
 * believe.
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

type PairCount = Exclude<keyof PairTally, "slug" | "kind" | "total">

const FIELD: Record<PairClass, PairCount> = {
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
    t[field]++
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
 * A table `renderPairTable` wrote, read back. The header is checked, every row
 * must have its seven cells, a known kind, and add up, and no slug and kind may
 * appear twice — a merge that kept an old row beside its replacement would
 * otherwise be read as one of them. A hand edit is an error here rather than a
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
  const seen = new Set<string>()
  return lines.slice(2).map((l) => {
    const c = cellsOf(l)
    if (c.length !== PAIR_COLUMNS.length) {
      throw new Error(
        `pair table row ${JSON.stringify(l)} has ${c.length} cells, expected ${PAIR_COLUMNS.length}`
      )
    }
    if (c[1] !== "text" && c[1] !== "non-text") {
      throw new Error(
        `pair table row for ${c[0]} has kind ${JSON.stringify(c[1])}, expected text or non-text`
      )
    }
    const key = `${c[0]} ${c[1]}`
    if (seen.has(key)) {
      throw new Error(`pair table row for ${key} is written twice`)
    }
    seen.add(key)
    const count = (i: number): number => {
      // `Number("")` is 0, so a blank cell is refused by shape, not by value.
      const n = /^\d+$/.test(c[i]) ? Number(c[i]) : NaN
      if (!Number.isInteger(n) || n < 0) {
        throw new Error(
          `pair table row for ${c[0]} ${c[1]} has ${PAIR_COLUMNS[i]} = ${JSON.stringify(c[i])}, expected a whole number`
        )
      }
      return n
    }
    const t: PairTally = {
      slug: c[0],
      kind: c[1],
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
 * would be classified by whichever width came first. No `borderline` or
 * `fail` row does in CI run 38463871450; the classifier refuses to run if one
 * appears.
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
