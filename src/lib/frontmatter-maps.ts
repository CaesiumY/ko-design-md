// Every frontmatter map, and what each reader does with it — written ONCE.
//
// The map names used to be listed by hand in five places (the extractor's path
// switch, the unknown-key allowlist, the reference namespaces, the block-scalar
// rule and the row rules). Adding `elevation:` meant editing four of them, and a
// map missing from one list was skipped in silence: left out of the
// block-scalar rule, a `>` value dropped its token from the sidecar while every
// gate passed (#432). Each list is now a filter over this table.
//
// No imports, on purpose: `content-parser` is in the client bundle, and
// `frontmatter-map`, `content-parser` and `draft-validator` all read this, so
// it must sit below all three.

export interface FrontmatterMapTraits {
  /** One of the four spec token maps. Declaring any of them sends the
   *  extractor down the frontmatter path. Not "becomes sidecar tokens":
   *  `elevation:` does that too, but must not decide the colours' path. */
  tokenMap: boolean
  /** A map the spec schema knows. False is catalog-only — values the spec has
   *  no field for, which its linter ignores. */
  spec: boolean
  /** A namespace a body `{map.name}` reference can point into
   *  (`unresolved-token-ref`). */
  reference: boolean
  /** A block scalar (`>`, `|`) is blocked (`block-scalar-token-value`): every
   *  reader of the map is line-based. */
  noBlockScalar: boolean
  /** Flat map whose rows get the indent, quoting and OKLCH rules
   *  (`scanFrontmatterTokens`). Typography and components nest, so they are
   *  judged elsewhere. */
  rowScan: boolean
}

/** Key order is the order the unknown-key advice lists them in. */
export const FRONTMATTER_MAPS = {
  colors: {
    tokenMap: true,
    spec: true,
    reference: true,
    noBlockScalar: true,
    rowScan: true,
  },
  typography: {
    tokenMap: true,
    spec: true,
    reference: true,
    noBlockScalar: true,
    rowScan: false,
  },
  spacing: {
    tokenMap: true,
    spec: true,
    reference: true,
    noBlockScalar: true,
    rowScan: true,
  },
  rounded: {
    tokenMap: true,
    spec: true,
    reference: true,
    noBlockScalar: true,
    rowScan: true,
  },
  // The spec's component map. Not a sidecar token map: only the spec linter
  // reads it, straight from the file (#384).
  components: {
    tokenMap: false,
    spec: true,
    reference: true,
    noBlockScalar: true,
    rowScan: false,
  },
  // Shadows. The spec model has no elevation category, so the linter resolves
  // nothing from it — but it lints clean, and the sidecar reads it (#421). Its
  // rows used to sit in a body fence the row rules judged; moving them into
  // frontmatter must not move them out of reach.
  elevation: {
    tokenMap: false,
    spec: false,
    reference: true,
    noBlockScalar: true,
    rowScan: true,
  },
  // Catalog-only maps, for values the spec schema has no field for.
  gradients: {
    tokenMap: false,
    spec: false,
    reference: true,
    noBlockScalar: false,
    rowScan: false,
  },
  opacity: {
    tokenMap: false,
    spec: false,
    reference: true,
    noBlockScalar: false,
    rowScan: false,
  },
  grid: {
    tokenMap: false,
    spec: false,
    reference: true,
    noBlockScalar: false,
    rowScan: false,
  },
  fonts: {
    tokenMap: false,
    spec: false,
    reference: true,
    noBlockScalar: false,
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

export const TOKEN_MAP_KEYS = mapsWhere("tokenMap")
export const REFERENCE_MAP_KEYS = mapsWhere("reference")
export const NO_BLOCK_SCALAR_MAP_KEYS = mapsWhere("noBlockScalar")
export const ROW_SCAN_MAP_KEYS = mapsWhere("rowScan")
