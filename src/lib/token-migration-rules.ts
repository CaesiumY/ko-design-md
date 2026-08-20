import type { ServiceTokens } from "./content-types"

// Where each fence row that the token extractor SKIPS is supposed to land once
// tokens move into frontmatter.
//
// The extractor puts 1,894 rows into the sidecars and passes over 206 more.
// Those 206 are not noise — they are aliases, font stacks, weight constants,
// gradients and component rules that readers rely on. They are also invisible to
// `pnpm tokens:check`, which compares sidecars: delete one and every gate still
// reports success. So they get classified here, explicitly, and anything this
// file cannot place stops the migration rather than being guessed at.
//
// Two kinds of rule live here:
//   - MECHANICAL, applied to every entry (a resolving alias, a gradient, a bare
//     number, a URL). These are decidable from the value alone.
//   - DIRECTED, listed per slug below. These needed a human to read the
//     surrounding prose, so they are written down rather than inferred. A row
//     that matches neither is an error.

export type Destination =
  | { kind: "reference"; group: "colors" | "spacing" | "rounded" }
  | {
      kind: "catalog-map"
      map: "gradients" | "opacity" | "grid" | "fonts" | "preview_css_vars"
    }
  | { kind: "catalog-key" }
  | { kind: "typography-property"; property: string }
  | { kind: "theme-pair"; darkResolves: boolean }
  | { kind: "prose" }
  | { kind: "drop"; because: string }

export interface FenceRow {
  key: string
  value: string
  note?: string
  section: string
}

const FONT_FAMILY: Destination = {
  kind: "typography-property",
  property: "fontFamily",
}
const FONTS: Destination = { kind: "catalog-map", map: "fonts" }
const PROSE: Destination = { kind: "prose" }

/** Rows a human classified, keyed by slug then by the row key. */
export const DIRECTIVES: Record<string, Record<string, Destination>> = {
  "11st": {
    // The array every numeric spacing token was expanded from; all 19 members
    // survive as their own tokens, so the source array is redundant.
    "spacing-scale": {
      kind: "drop",
      because: "19개 spacing 토큰으로 이미 전개됨",
    },
    "grid-standard": { kind: "catalog-map", map: "grid" },
    "grid-narrow": { kind: "catalog-map", map: "grid" },
  },
  baemin: {
    // Compound CSS rules for one component, not tokens — no schema slot.
    price: PROSE,
    "price--sale": PROSE,
    strike: PROSE,
    display: PROSE,
    "font-body": FONT_FAMILY,
    "font-display": FONTS,
    "font-display-thin": FONTS,
    "font-display-rounded": FONTS,
    "font-display-bold": FONTS,
    "font-display-script": FONTS,
    "font-display-cursive": FONTS,
  },
  bezier: {
    "font-family-sans-kr": FONT_FAMILY,
    "weight-400": PROSE,
    "weight-700": PROSE,
    "line-height-16": PROSE,
    "line-height-44": PROSE,
    "letter-spacing-1": PROSE,
    "letter-spacing-2": PROSE,
  },
  codeit: {
    "font-body": FONT_FAMILY,
    "font-display": FONTS,
    "font-code": FONTS,
  },
  gmarket: {
    "font-heading": FONTS,
    "font-body": FONT_FAMILY,
    "font-latin": FONTS,
    "weight-regular": PROSE,
    "weight-medium": PROSE,
    "weight-bold": PROSE,
    "line-tight": PROSE,
    "line-normal": PROSE,
    "line-relaxed": PROSE,
    // Seven of the eight named sizes are byte-identical to a ramp entry's
    // fontSize, verified against the sidecar: 24→heading-1 … 12→detail.
    "size-xxxl": { kind: "drop", because: "heading-1 24px 와 동일" },
    "size-xxl": { kind: "drop", because: "heading-2 22px 와 동일" },
    "size-xl": { kind: "drop", because: "heading-3 20px 와 동일" },
    "size-l": { kind: "drop", because: "heading-4 18px 와 동일" },
    "size-m": { kind: "drop", because: "body-1 16px 와 동일" },
    "size-s": { kind: "drop", because: "body-2 14px 와 동일" },
    "size-xs": { kind: "drop", because: "detail 12px 와 동일" },
    // 11px matches no ramp entry — the one that would actually be lost.
    "size-xxs": PROSE,
  },
  greeting: {
    "font-sans": FONT_FAMILY,
    "font-weight-regular": PROSE,
    "font-weight-medium": PROSE,
    "font-weight-bold": PROSE,
    "line-height-title": PROSE,
    "line-height-body": PROSE,
    "line-height-item": PROSE,
  },
  kyobobook: {
    "font-family": FONT_FAMILY,
    "letter-spacing": PROSE,
    "weight-regular": PROSE,
    "weight-medium": PROSE,
    "weight-bold": PROSE,
  },
  "seed-design": {
    "font-sans": FONT_FAMILY,
    "weight-regular": PROSE,
    "weight-medium": PROSE,
    "weight-bold": PROSE,
  },
  socar: {
    "font-family": FONT_FAMILY,
    "weight-regular": PROSE,
    "weight-medium": PROSE,
    "weight-semibold": PROSE,
    "weight-bold": PROSE,
  },
  teamsparta: {
    "font-family-sans": FONT_FAMILY,
    "font-family-mono": FONTS,
  },
  toss: {
    "font-family-sans": FONT_FAMILY,
    "font-family-emoji": FONTS,
    "font-feature-numeric-tabular": PROSE,
    "font-feature-numeric-proportional": PROSE,
  },
  wanted: {
    "font-sans": FONT_FAMILY,
    "font-display": FONTS,
    "font-mono": FONTS,
  },
  yeogi: {
    "font-sans": FONT_FAMILY,
    "font-display": FONTS,
  },
}

const GRADIENT = /^"?(?:linear|radial|conic)-gradient\(/
const BARE_NUMBER = /^-?\d*\.?\d+$/
const URL_VALUE = /^https?:\/\//
const MAP_OR_ARRAY = /^[[{](?!\s*[a-z][\w-]*\.)/
/** `{colors.red}` — the spec's own reference syntax, already used in some fences. */
const REFERENCE_FORM = /^\{[a-z][\w-]*\.[^}]+\}$/

/** A light→dark pair, written with an arrow between two token names.
 *
 *  Two different arrows appear in the catalog and they do NOT mean the same
 *  thing. `→` (U+2192) separates a light value from its dark counterpart
 *  (vapor-ui). `->` (ASCII) separates a gradient's start from its end (yeogi,
 *  `NeutralDark48 -> NeutralDark0`). Matching on "an arrow" would flatten
 *  yeogi's gradients into bogus `-dark` keys, so only the wide arrow counts. */
const THEME_PAIR = /^(\S+)\s*→\s*(\S.*)$/
const GRADIENT_PAIR = /^(\S+)\s*->\s*(\S.*)$/

/** Index lookup that admits it can miss. A bare `DIRECTIVES[slug][key]` types
 *  as always-present, which hides the case this whole module exists to catch. */
function directiveFor(slug: string, key: string): Destination | undefined {
  const bySlug = new Map(Object.entries(DIRECTIVES)).get(slug)
  return bySlug === undefined
    ? undefined
    : new Map(Object.entries(bySlug)).get(key)
}

function referenceTarget(value: string): string {
  return value.replace(/[{}]/g, "").trim().split(".").pop() ?? ""
}

/**
 * Token names a reference can resolve to, grown to a fixed point so a two-hop
 * alias resolves as well (`tds-bg-brand: fill-brand`, where `fill-brand`
 * itself points at `blue-500`).
 *
 * Resolution has to be settled here rather than left to the spec linter,
 * because the linter does not complain about a reference that resolves to
 * nothing — the token simply disappears from the model, with no finding and a
 * zero exit code.
 */
export function resolvableNames(
  tokens: ServiceTokens,
  rows: ReadonlyArray<FenceRow>
): { colors: Set<string>; spacing: Set<string>; rounded: Set<string> } {
  const sets = {
    colors: new Set(tokens.colors.map((t) => t.name)),
    spacing: new Set(tokens.spacing.map((t) => t.name)),
    rounded: new Set(tokens.radius.map((t) => t.name)),
  }
  for (let pass = 0; pass < 10; pass++) {
    let grew = false
    for (const row of rows) {
      const target = referenceTarget(row.value)
      for (const group of ["colors", "spacing", "rounded"] as const) {
        if (sets[group].has(target) && !sets[group].has(row.key)) {
          sets[group].add(row.key)
          grew = true
        }
      }
    }
    if (!grew) break
  }
  return sets
}

/**
 * Decide where one row goes. Returns null when nothing covers it — the caller
 * must treat that as a failure, never as "drop it". Silence here would delete
 * authored content that no gate is watching.
 */
export function classify(
  slug: string,
  row: FenceRow,
  resolvable: ReturnType<typeof resolvableNames>
): Destination | null {
  const directed = directiveFor(slug, row.key)
  if (directed !== undefined) return directed

  if (URL_VALUE.test(row.value)) return { kind: "catalog-key" }
  if (GRADIENT.test(row.value)) return { kind: "catalog-map", map: "gradients" }
  // `A -> B` names a gradient's two stops, not two themes. Checked before the
  // theme-pair rule so the ASCII arrow can never be read as one.
  if (GRADIENT_PAIR.test(row.value))
    return { kind: "catalog-map", map: "gradients" }

  const pair = row.value.match(THEME_PAIR)
  if (pair) {
    // The dark half is sometimes prose ("custom dark") rather than a token
    // name. That entry's `## Known Gaps` states the dark value is unpublished,
    // and the user chose to leave that absence claim standing — so only the
    // light half migrates and no `-dark` key is invented.
    const dark = resolvable.colors.has(referenceTarget(pair[2]))
    return { kind: "theme-pair", darkResolves: dark }
  }

  // A reference written in the spec's own `{group.name}` form. This must be
  // tested before the map/array guard, or `{colors.red}` reads as a YAML flow
  // mapping and the row falls through unplaced.
  if (REFERENCE_FORM.test(row.value)) {
    const group = row.value.slice(1).split(".")[0]
    if (group === "colors" || group === "spacing" || group === "rounded") {
      return { kind: "reference", group }
    }
  }
  if (MAP_OR_ARRAY.test(row.value)) return null
  if (BARE_NUMBER.test(row.value))
    return { kind: "catalog-map", map: "opacity" }

  const target = referenceTarget(row.value)
  for (const group of ["colors", "spacing", "rounded"] as const) {
    if (resolvable[group].has(target)) return { kind: "reference", group }
  }
  return null
}
