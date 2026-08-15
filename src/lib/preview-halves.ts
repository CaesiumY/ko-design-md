import { existsSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { JSDOM } from "jsdom"
import {
  DARK_PREVIEW_FILE,
  LIGHT_PREVIEW_FILE,
  MERGED_PREVIEW_FILE,
  resolvePreviewLayout,
} from "./preview-layout"

// Give a caller two theme documents whichever layout is on disk.
//
// The split layout hands over its two files. The merged one (issue #235) is
// rendered twice — once with the dark variants left inert in their templates,
// once with them applied — and its two stylesheets are dealt out, the `:root`
// one to light and the `[data-theme="dark"]` one to dark.
//
// Reconstructing here rather than teaching each rule about templates keeps
// every existing pair rule meaningful. `identical-style-blocks` above all: it
// asks whether dark is a considered adaptation or a copy of light, and that
// question is about the two scopes, which is what the deal-out compares. A
// rule fed the same merged document twice would answer "copy" for every slug.
//
// This module is for build-time callers — the validator script and its tests.
// It uses jsdom, which `preview-validator.ts` deliberately does not; that file
// stays dependency-free so the gate cannot fail on a devDependency.

export interface PreviewHalves {
  light: string
  dark: string
  /** What is actually served. The merged layout reports one file, twice. */
  lightBytes: number
  darkBytes: number
}

export function readPreviewHalves(dir: string): PreviewHalves | null {
  const layout = resolvePreviewLayout((file) => existsSync(join(dir, file)))
  if (layout === null) return null

  if (layout === "split") {
    const lightPath = join(dir, LIGHT_PREVIEW_FILE)
    const darkPath = join(dir, DARK_PREVIEW_FILE)
    return {
      light: readFileSync(lightPath, "utf8"),
      dark: readFileSync(darkPath, "utf8"),
      lightBytes: statSync(lightPath).size,
      darkBytes: statSync(darkPath).size,
    }
  }

  // The deal-out below assumes the converter's shape: exactly two <style>
  // elements, the first carrying the page's structural CSS and the light
  // tokens, the second carrying only `[data-theme="dark"]` overrides. A third
  // block, or structural rules mixed into the dark one, would quietly split
  // the wrong way — the counts still line up, so nothing would fail loudly.
  const mergedPath = join(dir, MERGED_PREVIEW_FILE)
  return splitMergedPreview(
    readFileSync(mergedPath, "utf8"),
    statSync(mergedPath).size
  )
}

/**
 * The merged-file half of `readPreviewHalves`, exposed for the staging path:
 * the skill pipeline validates a file the author just wrote, before it has a
 * slug directory to live in.
 */
export function splitMergedPreview(raw: string, bytes: number): PreviewHalves {
  const lightDom = new JSDOM(raw)
  const lightDoc = lightDom.window.document
  const lightStyles = [...lightDoc.querySelectorAll("style")]
  // The converter appends exactly one dark sheet, so the invariant is "the last
  // block is dark, everything before it is light" — not "there are two".
  // baemin's light half ships two blocks of its own, which a stricter count
  // would reject. Fewer than two means no dark sheet at all, and dealing the
  // blocks out from that would silently hand back two light documents.
  if (lightStyles.length < 2) {
    throw new Error(
      `${MERGED_PREVIEW_FILE} carries ${lightStyles.length} <style> block(s); ` +
        `the merged layout needs the page's own CSS plus a trailing ` +
        `[data-theme="dark"] sheet.`
    )
  }
  lightStyles[lightStyles.length - 1].remove()
  removeDarkVariants(lightDoc)

  const darkDom = new JSDOM(raw)
  const darkDoc = darkDom.window.document
  applyDarkVariants(darkDoc)
  const darkStyles = [...darkDoc.querySelectorAll("style")]
  for (const el of darkStyles.slice(0, -1)) el.remove()
  darkDoc.documentElement.setAttribute("data-theme", "dark")

  return {
    light: lightDom.serialize(),
    dark: darkDom.serialize(),
    lightBytes: bytes,
    darkBytes: bytes,
  }
}

function variantTemplates(doc: Document): Array<HTMLTemplateElement> {
  return [
    ...doc.querySelectorAll<HTMLTemplateElement>(
      'template[data-theme-variant="dark"]'
    ),
  ]
}

/** The light rendering: every dark variant stays unused and the anchor goes. */
export function removeDarkVariants(doc: Document): void {
  for (const tpl of variantTemplates(doc)) tpl.remove()
}

/**
 * The dark rendering. `data-theme-op` names which of the two moves applies:
 * `insert` for content light has no counterpart for, `swap` otherwise — and a
 * swap with empty content means the light node is simply absent in dark.
 */
export function applyDarkVariants(doc: Document): void {
  for (const tpl of variantTemplates(doc)) {
    const content = tpl.content.firstChild
    if (tpl.getAttribute("data-theme-op") === "insert") {
      if (content !== null) tpl.parentNode?.insertBefore(content, tpl)
    } else {
      const light = tpl.previousSibling
      if (light !== null) {
        if (content !== null) light.parentNode?.replaceChild(content, light)
        else light.parentNode?.removeChild(light)
      }
    }
    tpl.remove()
  }
}
