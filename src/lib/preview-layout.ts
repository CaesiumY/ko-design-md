// Which files hold a slug's preview.
//
// Two layouts exist. The catalogue ships the split one — `light.html` and
// `dark.html`, near-duplicates that differ only in `data-theme`, the palette
// block and a title. The merged one puts both themes in a single `preview.html`
// so the ~89% of shared markup has one copy instead of two (issue #235).
//
// Readers ask here rather than joining a filename themselves. That is the whole
// point: a reader that hardcodes `light.html` does not fail when the layout
// changes, it silently checks nothing — the failure mode `scripts/audit-oklch.ts`
// already warns about in its drift loop, and the one that let that same gate
// compare 22 of 650 declarations without anyone noticing.
//
// The drift check needs no other change to read a merged file. It walks brace
// depth and skips declarations scoped under `[data-theme="dark"]`, so a merged
// document yields exactly the findings its light half would
// (measured across all 17 slugs, with both mutation directions controlled).
// That is a CONTRACT, not a coincidence: the merged file must scope its dark
// tokens under `[data-theme="dark"]` and not at `:root`. Redefining them at
// `:root` — the way `dark.html` legitimately does today, being a wholly dark
// document — produces 138 false drift findings across the catalogue.

export const MERGED_PREVIEW_FILE = "preview.html"
export const LIGHT_PREVIEW_FILE = "light.html"
export const DARK_PREVIEW_FILE = "dark.html"

export type PreviewLayout =
  | { kind: "merged"; files: readonly [string] }
  | { kind: "split"; files: readonly [string, string] }

/**
 * Resolve the preview layout for one slug, given a predicate that answers
 * whether a filename exists in that slug's directory.
 *
 * Taking `exists` as an argument rather than touching `fs` keeps this testable
 * without a fixture tree, and lets the two callers keep their own base paths
 * (they resolve the preview directory differently).
 *
 * Returns `null` when neither layout is present. Callers must treat that as an
 * error — never as "nothing to check".
 */
export function resolvePreviewLayout(
  exists: (file: string) => boolean
): PreviewLayout | null {
  if (exists(MERGED_PREVIEW_FILE)) {
    return { kind: "merged", files: [MERGED_PREVIEW_FILE] }
  }
  // Both halves are required. A lone `light.html` is a half-generated slug, and
  // reporting it as a usable split layout would hide that.
  if (exists(LIGHT_PREVIEW_FILE) && exists(DARK_PREVIEW_FILE)) {
    return { kind: "split", files: [LIGHT_PREVIEW_FILE, DARK_PREVIEW_FILE] }
  }
  return null
}

/**
 * The file whose light-scope token definitions the drift check should read.
 *
 * For the split layout that is `light.html`: `dark.html` redefines the same
 * tokens at `:root` by design, so comparing it against the md's light values
 * reports drift that is not drift. For the merged layout it is the one file —
 * its dark block is scoped and therefore skipped by the drift walker.
 */
export function lightScopeFile(layout: PreviewLayout): string {
  return layout.kind === "merged" ? MERGED_PREVIEW_FILE : LIGHT_PREVIEW_FILE
}
