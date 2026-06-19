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
```
