declare module "virtual:site-frontmatter" {
  import type { SiteFrontmatter } from "@/lib/content-types"
  /** Each entry's consumed frontmatter keys, keyed by its
   *  `import.meta.glob` path (`/services/{file}.md`). */
  export const siteFrontmatter: Readonly<
    Partial<Record<string, SiteFrontmatter>>
  >
}
