// Which slugs the contrast sweep can read, and which it had to leave out.
//
// Its own module so `src/lib/audit-contrast-slugs.test.ts` can call it against
// a temporary directory: `audit-contrast.ts` runs `main()` at the top level, so
// importing it would start a sweep, and putting this in the sweep module would
// pull the collector into the CLI's argument-checking path.

import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"
import {
  DARK_PREVIEW_FILE,
  LIGHT_PREVIEW_FILE,
  MERGED_PREVIEW_FILE,
  resolvePreviewLayout,
} from "../src/lib/preview-layout"

export interface PreviewSlugs {
  /** Ready to sweep: they ship the merged layout. */
  slugs: Array<string>
  /** Readable by other tools, but not by this one — see below. */
  split: Array<string>
  /** No usable preview at all: nothing to read, and not nothing to say. */
  unusable: Array<string>
}

/**
 * Sort `public/preview/` into what this audit can sweep and what it cannot.
 *
 * Both of the "cannot" lists are returned rather than filtered away, and the
 * caller prints them. `resolvePreviewLayout` states the reason in its own
 * contract — "Callers must treat `null` as an error, never as 'nothing to
 * check'" — and the repository's other two callers keep it: `audit-oklch.ts`
 * prints and sets an exit code, `validate-preview.ts` raises a
 * `missing-preview-file` block. A reader that quietly drops such a slug makes a
 * tool that calls itself an exhaustive sweep report a clean run over a
 * catalogue it did not finish reading.
 *
 * The split layout is separate from that: it is a usable preview, just not one
 * this audit can read. The sweep asks for `/preview/{slug}/preview.html` and
 * switches themes on that one document, so a split slug would answer 404 and be
 * reported with no findings — a zero indistinguishable from a clean bill.
 * Every slug is merged today (#235 converted them).
 */
export function readPreviewSlugs(previewDir: string): PreviewSlugs {
  const dirs = readdirSync(previewDir, { withFileTypes: true })
    // A leading underscore marks shared machinery (`_runtime`), not an entry —
    // the same filter `scripts/validate-preview.ts` uses.
    .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
    .map((d) => d.name)
    .sort()

  const out: PreviewSlugs = { slugs: [], split: [], unusable: [] }
  for (const slug of dirs) {
    const layout = resolvePreviewLayout((file) =>
      existsSync(join(previewDir, slug, file))
    )
    if (layout === "merged") out.slugs.push(slug)
    else if (layout === "split") out.split.push(slug)
    else out.unusable.push(slug)
  }
  return out
}

/** What to print for the slugs the sweep left out. Empty when it left none. */
export function skippedNotices(found: PreviewSlugs): Array<string> {
  const notices: Array<string> = []
  if (found.unusable.length > 0) {
    notices.push(
      `${found.unusable.length} slug(s) under public/preview/ have no usable ` +
        `preview, so the sweep is not exhaustive: ${found.unusable.join(", ")}. ` +
        `Each needs either ${MERGED_PREVIEW_FILE} or both ${LIGHT_PREVIEW_FILE} ` +
        `and ${DARK_PREVIEW_FILE}. Most likely their preview files have not been ` +
        `generated yet.`
    )
  }
  if (found.split.length > 0) {
    notices.push(
      `${found.split.length} slug(s) ship the split layout, which this audit ` +
        `cannot read — it asks for ${MERGED_PREVIEW_FILE} and switches themes ` +
        `on that one document: ${found.split.join(", ")}.`
    )
  }
  return notices
}
