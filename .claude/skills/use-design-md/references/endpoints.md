# Endpoints — ko-design-md catalog (getdesign.kr)

Fetch order and fallbacks for the consumer skill. The getdesign.kr endpoints in §1–§2b are
`text/plain`, CORS-open (`access-control-allow-origin: *`), and CDN-cached ~1h.

## 1. Catalog index (discover)

```
GET https://www.getdesign.kr/llms.txt
```

llms.txt format — a header plus one markdown link per entry:

```
- [<name>](https://www.getdesign.kr/services/<slug>/llms.txt): <category>[ · <design system name>] — <tagline>
```

` · <design system name>` is present only when the entry publishes one. The metadata
starts after `/llms.txt): ` — where the link's URL ends, since a name may itself contain
`): ` — and ends at the first ` — ` after it: a tagline is prose and may contain ` — `
itself, so split there, not at the last one. `[` and `]` in both the name
and the design-system name are backslash-escaped (`\[` `\]`); unescape them before
comparing with what the user typed.

Use it to resolve a brand or design-system name to a slug and to browse by category.
It is generated server-side from the live catalog, so it is always current.

## 2. Single entry (fetch)

```
GET https://www.getdesign.kr/services/<slug>/llms.txt
```

Returns the entry's DESIGN.md verbatim, in the catalog format: Stitch's section
structure, DESIGN.md-spec token maps in YAML frontmatter, and the catalog's own
`[src:N]` citation convention. Fetch it as SKILL.md "Fetching" says — to a file, failing
on HTTP errors, read to the end. A slug that isn't in the catalog returns `404`.

The entry carries `[src:N]` citations, provenance notes and audit blockquotes — the
evidence that lets you tell a published value from a reconstructed one. §2b serves the
same bytes.

## 2b. Same entry, spec filename

```
GET https://www.getdesign.kr/services/<slug>/DESIGN.md
```

The same bytes as §2, under the filename Google's published DESIGN.md spec uses
(`github.com/google-labs-code/design.md`, spec `alpha`). The entry file is itself a
spec document — `colors` / `typography` / `spacing` / `rounded`
maps and shadows under `elevation:` in YAML frontmatter, no yaml fence in the body
(motion tokens and component specs sit in `text` fences, readable but outside the
token model). Use this URL when a tool expects the standard filename — Stitch, the
official `design.md` CLI. The catalog's own frontmatter keys (`slug`, dates,
`logo`) ride along; the linter ignores them.

One caveat worth knowing before you rely on a value: values the `alpha` schema
cannot express are reported as errors by its own linter and may resolve oddly —
`border-radius: 50%` (spec Dimensions are px/em/rem only). Multi-stop gradients sit
in a catalog-only `gradients:` map the spec does not read.

## 3. Token sidecar (optional, structured tokens)

```
GET https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.tokens.json
```

Fetch it as SKILL.md "Fetching" says (the full command is in the Example below).

JSON shape: `{ colors[], typography[], spacing[], radius[], elevation?[] }`. Each color
has `name`/`value` (value usually OKLCH) plus optional `note`/`group`. `elevation` holds
ready-to-paste CSS `box-shadow` values (comma-joined when a token stacks layers) and is
**omitted** for entries that publish no shadow values in their frontmatter
`elevation:` map — read it with `?? []`, not as a guaranteed array. getdesign.kr
doesn't serve tokens; GitHub raw is the source of record.

## Fallbacks

- If getdesign.kr fails with anything other than a 404 (unreachable, 5xx, 403/429…), the same
  markdown is on GitHub raw. Fetch it the same way (SKILL.md "Fetching"). Any failure here — a
  404 included — means the fallback failed too: tell the user you couldn't fetch the entry,
  not that the brand is missing (SKILL.md Step 2). Only getdesign.kr's own 404 means "not in
  the catalog".
  ```
  curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/<slug>.md" https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.md
  ```
- The index has no GitHub-raw equivalent (it's generated server-side). To list entries
  without the index, read the repo's `services/` directory via the GitHub API, or fall
  back to `https://www.getdesign.kr/sitemap.xml` (URLs only — no names/categories/taglines).

## Example

```bash
# one plain curl per fetch; --create-dirs makes the per-user cache directory
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/index.txt" https://www.getdesign.kr/llms.txt            # find the slug
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/toss.md" https://www.getdesign.kr/services/toss/llms.txt # the entry, verbatim
wc -lc "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/toss.md"                       # then read it to its last line
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/toss.tokens.json" https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/toss.tokens.json  # tokens (optional)
```
