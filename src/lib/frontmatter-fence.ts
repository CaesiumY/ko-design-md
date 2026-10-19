// Where an entry's frontmatter block ends and its body begins — the fences
// only, never the block's contents. Kept apart from the reader
// (`frontmatter.ts`) because the site needs the body in the browser bundle,
// where the YAML library must not go (docs/adr/0011). No imports, on purpose.

/**
 * The frontmatter block and the body that follows it, or null when the document
 * has no frontmatter.
 *
 * One definition because five places kept their own copy of this regex and they
 * did not agree: a YAML check returned nothing at all for a BOM-prefixed file,
 * so it switched itself off for anyone whose editor emits one. Found in review,
 * and the sort of divergence that only shows up once someone writes the odd
 * file.
 *
 * The boundary is the FIRST standalone `---`, which is also where YAML itself
 * ends the document — a column-0 `---` closes even an open block scalar, so a
 * long prose value cannot smuggle one past this.
 */
export function splitFrontmatter(
  raw: string
): { frontmatter: string; body: string } | null {
  const source = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw
  const m = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  return m ? { frontmatter: m[1], body: m[2] } : null
}
