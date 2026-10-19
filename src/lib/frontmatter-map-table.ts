// Every frontmatter map, and what each reader does with it — written ONCE.
//
// The map names used to be listed by hand in five places (the extractor's path
// switch, the unknown-key allowlist, the reference namespaces, a block-scalar
// rule and the row rules). Adding `elevation:` meant editing four of them, and a
// map missing from one list was skipped in silence (#432). The extractor's path
// switch went with its body fallback (#429), the block-scalar rule with the
// line-based readers (#589); the other lists are filters over this table.
//
// No imports, on purpose: the frontmatter reader and the draft validator both
// read this, so it must sit below them.

export interface FrontmatterMapTraits {
  /** A map the spec schema knows. False is catalog-only — values the spec has
   *  no field for, which its linter ignores. No reader filters on it yet; it
   *  stays because #432 asked for it and it tells a contributor what a spec
   *  tool will see. (The extractor-path trait went instead: its only reader was
   *  removed with the body fallback, #429.) */
  spec: boolean
  /** A namespace a body `{map.name}` reference can point into
   *  (`unresolved-token-ref`). */
  reference: boolean
  /** Flat map: each row is one token, judged by the OKLCH rules, and a map
   *  under a row is blocked (`scanFrontmatterTokens`). Typography and
   *  components nest, so they are judged elsewhere. */
  rowScan: boolean
}

/** Key order is the order the unknown-key advice lists them in. */
export const FRONTMATTER_MAPS = {
  colors: {
    spec: true,
    reference: true,
    rowScan: true,
  },
  typography: {
    spec: true,
    reference: true,
    rowScan: false,
  },
  spacing: {
    spec: true,
    reference: true,
    rowScan: true,
  },
  rounded: {
    spec: true,
    reference: true,
    rowScan: true,
  },
  // The spec's component map. Not a sidecar token map: only the spec linter
  // reads it, straight from the file (#384).
  components: {
    spec: true,
    reference: true,
    rowScan: false,
  },
  // Shadows. The spec model has no elevation category, so the linter resolves
  // nothing from it — but it lints clean, and the sidecar reads it (#421). Its
  // rows used to sit in a body fence the row rules judged; moving them into
  // frontmatter must not move them out of reach.
  elevation: {
    spec: false,
    reference: true,
    rowScan: true,
  },
  // Catalog-only maps, for values the spec schema has no field for.
  gradients: {
    spec: false,
    reference: true,
    rowScan: false,
  },
  opacity: {
    spec: false,
    reference: true,
    rowScan: false,
  },
  grid: {
    spec: false,
    reference: true,
    rowScan: false,
  },
  fonts: {
    spec: false,
    reference: true,
    rowScan: false,
  },
} as const satisfies Record<string, FrontmatterMapTraits>

export type FrontmatterMapName = keyof typeof FRONTMATTER_MAPS

/** Every map name, in table order. */
export const FRONTMATTER_MAP_KEYS = Object.keys(
  FRONTMATTER_MAPS
) as ReadonlyArray<FrontmatterMapName>

function mapsWhere(
  trait: keyof FrontmatterMapTraits
): ReadonlyArray<FrontmatterMapName> {
  return FRONTMATTER_MAP_KEYS.filter((name) => FRONTMATTER_MAPS[name][trait])
}

export const REFERENCE_MAP_KEYS = mapsWhere("reference")
export const ROW_SCAN_MAP_KEYS = mapsWhere("rowScan")
