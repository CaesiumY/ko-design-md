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
// `PUBLISHED_PAIR_TOLERANCE` — or, for a translucent token, when laying it over
// what the collector laid it over — with tokens the row's theme can paint —
// lands within that distance (#551). Run over
// the artifact CI uploads, never a local sweep — the recorded tables describe
// CI's rendering.

import { compositeOver } from "./contrast"
import { keyOf } from "./contrast-report"
import {
  deltaE,
  hexToOklab,
  hexToRgb,
  oklabToRgb,
  parseOklch,
  rgbToOklab,
} from "./oklch-convert"
import { readFrontmatter, tokenText } from "./frontmatter"
import { readDefinitions } from "./oklch-drift"
import { oklchValue } from "./oklch-sync"
import type { FrontmatterRow } from "./frontmatter"
import type { Rgb, Rgba } from "./contrast"
import type { Oklab } from "./oklch-convert"
import type {
  DedupedFinding,
  Finding,
  Judgement,
  Theme,
} from "./contrast-report"

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
 * each table, on its `readings …` line — distances to opaque tokens as
 * `nearest token in`, and, for the readings no token matches directly,
 * translucent composites as `nearest composite there` (`toleranceBand`).
 * It is kept
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

/**
 * Which preview theme a token can be painted in, read off the catalogue's
 * naming (CLAUDE.md 「테마별 팔레트는 이름을 갈라 쓴다」): a `dark-` name is
 * the dark side; its light side is the unprefixed name with a declared `dark-`
 * twin, or a `light-` name when the twin drops that prefix (codeit's
 * `light-gray-00` beside `dark-gray-00`); any other name — a ramp step, a
 * theme-free token — serves both. A twin that is a reference back to the token
 * itself (`dark-veil: "{colors.veil}"`) is not a twin: the dark theme paints
 * that token too.
 * Read off names, this misses two things, and no entry has either. A `dark-`
 * name that only means a deeper shade of a light-theme colour is taken for
 * the dark side. And a reference row never changes the theme of the token it
 * points at, so when a reference makes one theme paint a token read as the
 * other's, that token stays out of the first theme's composites —
 * `veil: "{colors.dark-veil}"` (the light theme paints `dark-veil`), or
 * `dark-veil: "{colors.ink}"` beside a declared `dark-ink` (the dark theme
 * paints `ink`, read as light).
 * Any other way of naming a theme reads as `both`, which keeps the classifier
 * as wide as it was: a `-dark` suffix whether it marks a theme (samsung-one-ui's
 * `black-dark`, the dark theme's black beside a light `black`) or only a darker
 * shade (gs-shop's `positive-dark`).
 */
export type TokenTheme = Theme | "both"

const DARK_PREFIX = "dark-"
const LIGHT_PREFIX = "light-"
/** A colors row whose whole value is a `{colors.name}` reference. */
const COLOUR_REFERENCE = /^\{colors\.([a-zA-Z0-9._-]+)\}$/

export interface PaletteEntry {
  name: string
  lab: Oklab
  /** Listed for the entry in `OBSERVED_COLOURS`, by group or by name. */
  observed: boolean
  theme: TokenTheme
}

/**
 * A translucent token, held as the paint the browser lays down for it: 8-bit
 * channels and an alpha in 255ths. Never matched to a reading directly — a
 * reading is already composited onto what is behind it — only composited the
 * way the collector composites one (see `pairClass`).
 */
export interface TranslucentEntry {
  name: string
  paint: Rgba
  observed: boolean
  theme: TokenTheme
}

export interface Palette {
  /** Opaque tokens, matched to a reading directly. */
  entries: Array<PaletteEntry>
  translucent: Array<TranslucentEntry>
  /** Definitions `parseOklch` could not read — said, not dropped. */
  unreadable: Array<string>
}

/**
 * The entry's `colors:` tokens, each marked published or observed.
 *
 * Values come from `readDefinitions`, so a name the entry defines twice with
 * different values is left out here exactly as it is everywhere else. That
 * function reads every `name: oklch(` line in the frontmatter, which includes
 * a `gradients:` row's first stop — not a colour the entry declared — so only
 * names whose first definition sits in the `colors:` map are kept. A
 * translucent token goes to `translucent`, not `entries`: a measured reading is
 * already composited onto what is behind it, so matching it to
 * `oklch(0 0 0 / 5%)` directly would call a shadow tint "black".
 */
export function paletteOf(
  markdown: string,
  observed: ObservedColours
): Palette {
  const observedGroups = observed.groups ?? []
  const observedTokens = observed.tokens ?? []
  // Where each definition sits: which top-level map, under which `## Label`
  // heading — as the one frontmatter reader reads it (docs/adr/0011). A
  // heading belongs to the map it is written in.
  const placeOf = new Map<
    string,
    { map: string | null; group: string | null }
  >()
  const colourGroups = new Set<string>()
  // Every key the colors map declares, whatever its value: a token's `dark-`
  // twin may be a reference row (`"{colors.x}"`), which `placeOf` leaves out.
  const colourKeys = new Set<string>()
  // Where each of those reference rows points, so a twin that comes back to
  // the token itself is not read as a second theme of it.
  const referenceOf = new Map<string, string>()
  const read = readFrontmatter(markdown)
  const walk = (
    map: string,
    rows: ReadonlyArray<FrontmatterRow>,
    outer: string | null
  ): void => {
    for (const row of rows) {
      if (row.kind === "group") {
        if (map === "colors") colourGroups.add(row.label)
        continue
      }
      const group = row.group ?? outer
      if (map === "colors") {
        colourKeys.add(row.key)
        const target = COLOUR_REFERENCE.exec(tokenText(row) ?? "")?.[1]
        if (target !== undefined) referenceOf.set(row.key, target)
      }
      // The colour readers' one selection, so a value that opens with blanks
      // (`"  oklch(…)"`) is placed as `readDefinitions` reads it.
      if (oklchValue(row) !== undefined && !placeOf.has(row.key)) {
        placeOf.set(row.key, { map, group })
      }
      if (row.rows) walk(map, row.rows, group)
    }
  }
  for (const top of read.ok ? read.keys : []) {
    if (top.rows) walk(top.key, top.rows, null)
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
  const translucent: Array<TranslucentEntry> = []
  const unreadable: Array<string> = []
  // The row a chain of references ends on; a cycle ends where it closes.
  const resolved = (name: string): string => {
    const seen = new Set<string>()
    let at = name
    while (!seen.has(at)) {
      seen.add(at)
      const next = referenceOf.get(at)
      if (next === undefined) break
      at = next
    }
    return at
  }
  // A declared `dark-` row that paints something other than `name` itself —
  // `dark-veil: "{colors.veil}"` says the dark theme paints `veil` too.
  const isTwin = (twin: string, name: string): boolean =>
    colourKeys.has(twin) && resolved(twin) !== name
  const themeOf = (name: string): TokenTheme =>
    name.startsWith(DARK_PREFIX)
      ? "dark"
      : isTwin(DARK_PREFIX + name, name) ||
          (name.startsWith(LIGHT_PREFIX) &&
            isTwin(DARK_PREFIX + name.slice(LIGHT_PREFIX.length), name))
        ? "light"
        : "both"
  for (const [name, value] of readDefinitions(markdown)) {
    const place = placeOf.get(name)
    if (place?.map !== "colors") continue
    const parsed = parseOklch(value)
    if (parsed === null) {
      unreadable.push(name)
      continue
    }
    const seen =
      observedTokens.includes(name) ||
      (place.group !== null && observedGroups.includes(place.group))
    if (parsed.alpha !== null && parsed.alpha < 1) {
      // Fully transparent paint leaves whatever is behind it unchanged; it
      // would "explain" every reading that is already a token.
      const a = Math.round(parsed.alpha * 255) / 255
      if (a > 0) {
        const { r, g, b } = paintOf(parsed.lab)
        translucent.push({
          name,
          paint: { r, g, b, a },
          observed: seen,
          theme: themeOf(name),
        })
      }
      continue
    }
    entries.push({
      name,
      lab: parsed.lab,
      observed: seen,
      theme: themeOf(name),
    })
  }
  return { entries, translucent, unreadable }
}

/** Whether a token of `token`'s theme can be painted in a row of `row`'s. */
const paintableIn = (token: TokenTheme, row: Theme | undefined): boolean =>
  row === undefined || token === "both" || token === row

/** A token's colour as the browser paints it: 8-bit sRGB channels. */
function paintOf(lab: Oklab): Rgb {
  const { r, g, b } = oklabToRgb(lab)
  return { r: Math.round(r), g: Math.round(g), b: Math.round(b) }
}

/** Distance from a measured colour to the nearest token; Infinity for none. */
function nearestDistance(hex: string, palette: Palette): number {
  const lab = hexToOklab(hex)?.lab
  if (lab === undefined) return Infinity
  return Math.min(Infinity, ...palette.entries.map((e) => deltaE(lab, e.lab)))
}

/**
 * How many colour readings of one verdict's rows there are, how many have
 * their nearest token at a distance in `(lo, hi]`, and how many of the
 * readings no token matches directly have their nearest translucent composite
 * (the candidates `pairClass` tries, with `lo` as the tolerance — so "no
 * token matches directly" means the same thing as `inBand`'s lower edge) in
 * that band.
 *
 * The tolerance was read off an empty `(0.002, 0.005]` band, and whether that
 * band stays empty is the thing to look at again when the numbers move — the
 * CLI prints the counts beside the tables, and this is how they are produced.
 * The composite count is separate because it is a second way to match (#551):
 * readings bunching just outside it would be a reason to look again too.
 */
export function toleranceBand(
  rows: Array<DedupedFinding>,
  paletteFor: (slug: string) => Palette,
  verdict: Judgement,
  [lo, hi]: [number, number]
): { readings: number; inBand: number; compositeInBand: number } {
  let readings = 0
  let inBand = 0
  let compositeInBand = 0
  const within = (d: number): boolean => d > lo && d <= hi
  for (const r of rows) {
    if (r.verdict !== verdict) continue
    const palette = paletteFor(r.slug)
    for (const hex of [r.fg, r.bg]) {
      readings++
      if (within(nearestDistance(hex, palette))) inBand++
    }
    const read = readPair(r.fg, r.bg, palette, lo, r.theme)
    for (const side of [read.fg, read.bg]) {
      if (side.direct === null && within(side.composite.any)) compositeInBand++
    }
  }
  return { readings, inBand, compositeInBand }
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

type ReadingClass = ReturnType<typeof readingClass>

type Base = { rgb: Rgb; observed: boolean; theme: TokenTheme }

// Every opaque token as paint, once per palette rather than once per row: a
// background reading is tried against those its row's theme can paint (see
// `paintableIn`).
const basesOf = new WeakMap<Palette, Array<Base>>()
function opaqueBases(palette: Palette): Array<Base> {
  let bases = basesOf.get(palette)
  if (bases === undefined) {
    bases = palette.entries.map((e) => ({
      rgb: paintOf(e.lab),
      observed: e.observed,
      theme: e.theme,
    }))
    basesOf.set(palette, bases)
  }
  return bases
}

/** Published over observed over nothing — the more the brand vouches for. */
const strongerClass = (x: ReadingClass, y: ReadingClass): ReadingClass =>
  x === "published" || y === "published" ? "published" : (x ?? y)

/**
 * How close a reading comes to one of the entry's translucent tokens laid
 * over one of `bases`, composited the way the collector does it
 * (`compositeOver`): the nearest such composite of any kind, and the nearest
 * whose token and base are both published. Infinity when there is none.
 *
 * The composite is compared in the reals, NOT rounded with `toHex` first. The
 * reading was already rounded once, after an alpha the collector recovered by
 * averaging; rounding the prediction too stacks a second half-unit on that.
 * When this was written (2026-10-16, CI run 38463871450) that pushed 9 of
 * wanted's `fg-secondary`·`fg-tertiary` text rows past the tolerance the
 * unrounded composite keeps them inside — a one-off check, not something the
 * classifier prints.
 */
function compositeDistance(
  hex: string,
  palette: Palette,
  bases: Array<Base>,
  theme: Theme | undefined
): CompositeDistance {
  const lab = hexToOklab(hex)?.lab
  if (lab === undefined) return NO_COMPOSITE
  let any = Infinity
  let published = Infinity
  for (const t of palette.translucent) {
    if (!paintableIn(t.theme, theme)) continue
    for (const base of bases) {
      if (!paintableIn(base.theme, theme)) continue
      const d = deltaE(lab, rgbToOklab(compositeOver(t.paint, base.rgb)))
      any = Math.min(any, d)
      if (!t.observed && !base.observed) published = Math.min(published, d)
    }
  }
  return { any, published }
}

interface CompositeDistance {
  any: number
  published: number
}

const NO_COMPOSITE: CompositeDistance = { any: Infinity, published: Infinity }

/** A composite's class: published if a published one is close enough. */
const compositeClass = (
  d: CompositeDistance,
  tolerance: number
): ReadingClass =>
  d.published <= tolerance
    ? "published"
    : d.any <= tolerance
      ? "observed"
      : null

interface Reading {
  /** Matched to an opaque token directly. */
  direct: ReadingClass
  /** Nearest composites; not looked for when `direct` is already published. */
  composite: CompositeDistance
  class: ReadingClass
}

/**
 * Both readings of a pair, by the rule `pairClass` describes. The background
 * is read first because the front reading's composite rests on it.
 */
function readPair(
  fg: string,
  bg: string,
  palette: Palette,
  tolerance: number,
  theme: Theme | undefined
): { fg: Reading; bg: Reading } {
  const read = (hex: string, bases: () => Array<Base>): Reading => {
    const direct = readingClass(hex, palette, tolerance)
    if (direct === "published") {
      return { direct, composite: NO_COMPOSITE, class: direct }
    }
    const composite = compositeDistance(hex, palette, bases(), theme)
    return {
      direct,
      composite,
      class: strongerClass(direct, compositeClass(composite, tolerance)),
    }
  }
  const back = read(bg, () => opaqueBases(palette))
  const bgRgb = hexToRgb(bg)
  const front = read(fg, () =>
    back.class === null || bgRgb === null
      ? []
      : // The backdrop the collector read, whatever theme its token is.
        [{ rgb: bgRgb, observed: back.class === "observed", theme: "both" }]
  )
  return { fg: front, bg: back }
}

/**
 * Four ways a pair can sit against the entry's palette. Only the first says
 * a fix cannot keep both published values as they are; `observed-pair` is
 * kept apart so a reader can put the observed values on whichever side they
 * believe.
 *
 * A reading is a token when it matches one directly, or when it is one of the
 * entry's translucent tokens composited over what the collector composited it
 * over (#551). For the pair's front reading — text, a border, or a non-text
 * row's fill (the collector — `evaluateText`, `evaluateNonText` — composites
 * each over the colour it reports as `bg`) — that is the pair's own background, and only when that background
 * is itself a token: a published translucent over the preview's own fill is
 * not a colour the brand chose. For the background it is the layer beneath,
 * which the reading does not name, so any opaque token of the entry that the
 * row's theme can paint (see `theme` below).
 *
 * The two sides differ because what is known differs. The collector
 * composites the front reading over the backdrop it recorded, so its base is
 * that reading and nothing else — any other token would be a colour the collector
 * could not have produced, and trying them all only adds chances to land near
 * a grey by accident. A background's base is not recorded, so every opaque
 * token is a candidate; that is a wider net, and it was sized: shifting every
 * translucent token's alpha by ±0.03 or ±0.06, which keeps the same token ×
 * base combinations but breaks the real ones, moved at most 4 `fail`
 * non-text rows into a token class where the true alphas moved 63 (CI run
 * 38463871450, a one-off check recorded in the baseline document — taken
 * before composites were narrowed to the row's theme).
 *
 * Given the row's `theme`, a composite uses only tokens that can be painted in
 * it (`TokenTheme`) — both the translucent token and, for a background, the
 * opaque base. Without that the net reached across themes: wanted's dark
 * footer (`#0a0b0c`) matched the LIGHT interaction overlay laid over a dark
 * grey, a colour no dark render can produce. A direct match is not narrowed —
 * a row that paints the other theme's token exactly made that choice, it did
 * not fall near it by accident.
 */
export function pairClass(
  fg: string,
  bg: string,
  palette: Palette,
  tolerance = PUBLISHED_PAIR_TOLERANCE,
  theme?: Theme
): PairClass {
  const read = readPair(fg, bg, palette, tolerance, theme)
  const a = read.fg.class
  const b = read.bg.class
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
 * The rows of one verdict, classified and counted by slug and kind. Each row
 * is classified in its own theme; the themes are then summed: the question is
 * which entry a fix would touch, and a pair's two themes are usually two pairs
 * of the same tokens.
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
    const field =
      FIELD[pairClass(r.fg, r.bg, paletteFor(r.slug), tolerance, r.theme)]
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
