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

// Which of the two shapes a slug is in, and nothing more. An earlier draft also
// carried the filenames, but no caller read them — `lightScopeFile` answers the
// only question asked so far. The pair validator will want both halves; it can
// add that when its merged-file semantics are settled, rather than inheriting a
// field shaped by a guess.
export type PreviewLayout = "merged" | "split"

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
  // Split wins while both halves exist, because split is what the site
  // actually serves: the iframe builds `/preview/{slug}/{theme}.html`
  // (`src/routes/services/-components/preview-frame.tsx`) and the Vite plugin
  // only discovers a slug that has a `light.html` (`vite.config.ts`). Judging a
  // `preview.html` that nothing serves would let the shipped halves drift while
  // the gate stayed green — this module's own failure mode, pointed backwards.
  //
  // Flip this preference in the same change that migrates those two serving
  // sites, not before.
  //
  // The corollary binds the conversion step: writing a `preview.html` while
  // leaving the halves in place means this keeps judging the halves, so a slug
  // whose real content moved would be checked against stale files. Convert and
  // delete in one commit.
  //
  // Both halves are required. A lone `light.html` is a half-generated slug, and
  // reporting it as a usable split layout would hide that.
  if (exists(LIGHT_PREVIEW_FILE) && exists(DARK_PREVIEW_FILE)) return "split"
  if (exists(MERGED_PREVIEW_FILE)) return "merged"
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
  return layout === "merged" ? MERGED_PREVIEW_FILE : LIGHT_PREVIEW_FILE
}
