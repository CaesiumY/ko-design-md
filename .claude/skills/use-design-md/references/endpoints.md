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

Returns the raw `design.md` (Stitch v0.1 markdown with YAML frontmatter). Prefer
`curl -s` over WebFetch to preserve exact token values (see SKILL.md Step 2 for why).

**This is the endpoint to use for applying a design system.** It carries the
`[src:N]` citations, provenance notes and audit blockquotes — the evidence that lets
you tell a published value from a reconstructed one.

## 2b. Same entry, Google DESIGN.md format

```
GET https://getdesign.kr/services/<slug>/DESIGN.md
```

The same entry rendered in Google's published DESIGN.md format
(`github.com/google-labs-code/design.md`, spec `alpha`): design tokens as
`colors` / `typography` / `spacing` / `rounded` maps in YAML frontmatter, prose
sections kept, token fences dropped. Generated per request from the same source,
so it can never be stale.

Use it when a consumer expects the standard shape — Stitch, the official
`design.md` CLI, or tooling built against that schema. **Do not use it as the
citation source**: the standard schema has no slot for `[src:N]`, so fence-level
provenance comments do not survive the conversion. Fetch `llms.txt` for that.

Two caveats worth knowing before you rely on a value:

- Values the `alpha` schema cannot express are reported as errors by its own
  linter and may resolve oddly — `border-radius: 50%` (spec Dimensions are
  px/em/rem only) and multi-stop gradients stored as colours (`seed-design`).
- Where an entry declares one token name per theme, only the first survives, since
  frontmatter keys must be unique. Catalog entries prefix the dark scale
  (`dark-bg-canvas`), so both are present — but a future entry that does not would
  silently lose its dark values here while `llms.txt` keeps them.

## 3. Token sidecar (optional, structured tokens)

```
GET https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.tokens.json
```

JSON shape: `{ colors[], typography[], spacing[], radius[] }`. Each color has
`name`/`value` (value usually OKLCH) plus optional `note`/`group`. There is no
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
curl -s https://getdesign.kr/services/$slug/llms.txt                                     # the design.md
curl -s https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/$slug.tokens.json  # tokens (optional)
curl -s https://getdesign.kr/services/$slug/DESIGN.md                                    # Google DESIGN.md format
```
