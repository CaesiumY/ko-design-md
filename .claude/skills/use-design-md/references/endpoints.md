# Endpoints — ko-design-md catalog (getdesign.kr)

Fetch order and fallbacks for the consumer skill. All getdesign.kr endpoints below are
`text/plain`, CORS-open (`access-control-allow-origin: *`), and CDN-cached ~1h.

## 1. Catalog index (discover)

```
GET https://getdesign.kr/llms.txt
```

llms.txt format — a header plus one markdown link per entry:

```
- [<name>](https://getdesign.kr/services/<slug>/llms.txt): <category> — <tagline>
```

Use it to resolve a brand name to a slug and to browse by category. It is generated
server-side from the live catalog, so it is always current — no stale hardcoded list.

## 2. Single entry (fetch)

```
GET https://getdesign.kr/services/<slug>/llms.txt
```

Returns the entry's DESIGN.md verbatim, in the catalog format: Stitch's section
structure, DESIGN.md-spec token maps in YAML frontmatter, and the catalog's own
`[src:N]` citation convention. Prefer `curl -s` over WebFetch to preserve exact
token values (see SKILL.md Step 2 for why).

**This is the endpoint to use for applying a design system.** It carries the
`[src:N]` citations, provenance notes and audit blockquotes — the evidence that lets
you tell a published value from a reconstructed one.

## 2b. Same entry, spec filename

```
GET https://getdesign.kr/services/<slug>/DESIGN.md
```

The same bytes as §2, under the filename Google's published DESIGN.md spec uses
(`github.com/google-labs-code/design.md`, spec `alpha`). No transform: the entry
file is itself a spec document — `colors` / `typography` / `spacing` / `rounded`
maps and shadows under `elevation:` in YAML frontmatter, no yaml fence in the body
(motion tokens and component specs sit in `text` fences, readable but outside the
token model). Use this URL when a tool expects the standard filename — Stitch, the
official `design.md` CLI. The catalog's own frontmatter keys (`slug`, dates,
`logo`) ride along; the linter ignores them.

One caveat worth knowing before you rely on a value: values the `alpha` schema
cannot express are reported as errors by its own linter and may resolve oddly —
`border-radius: 50%` (spec Dimensions are px/em/rem only) and multi-stop gradients
stored as colours (`seed-design`).

## 3. Token sidecar (optional, structured tokens)

```
GET https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.tokens.json
```

JSON shape: `{ colors[], typography[], spacing[], radius[], elevation?[] }`. Each color
has `name`/`value` (value usually OKLCH) plus optional `note`/`group`. `elevation` holds
ready-to-paste CSS `box-shadow` values (comma-joined when a token stacks layers) and is
**omitted** for entries that publish no shadow values in their frontmatter
`elevation:` map — read it with `?? []`, not as a guaranteed array. There is no
getdesign.kr endpoint for tokens yet — GitHub raw is the source of record. If a tokens
endpoint appears on getdesign.kr later, prefer it and update this file.

## Fallbacks

- If getdesign.kr is unreachable, the same markdown is on GitHub raw:
  `https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.md`
- The index has no GitHub-raw equivalent (it's generated server-side). To list entries
  without the index, read the repo's `services/` directory via the GitHub API, or fall
  back to `https://getdesign.kr/sitemap.xml` (URLs only — no names/categories/taglines).

## Example

```bash
slug=toss
curl -s https://getdesign.kr/llms.txt                                                   # find the slug
curl -s https://getdesign.kr/services/$slug/llms.txt                                     # the entry's DESIGN.md, verbatim
curl -s https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/$slug.tokens.json  # tokens (optional)
curl -s https://getdesign.kr/services/$slug/DESIGN.md                                    # same bytes, spec filename
```
