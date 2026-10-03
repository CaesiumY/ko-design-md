---
name: use-design-md
description: Apply a Korean brand's published DESIGN.md from the ko-design-md catalog (getdesign.kr) — colors, typography, spacing, radius, components, do's & don'ts — to the UI you are building in the CURRENT project. Use this skill whenever the user wants UI built or restyled in the *style of* a catalogued Korean service — "토스 디자인으로 만들어줘", "당근 스타일로 이 화면 다시 꾸며줘", "getdesign 카탈로그에서 배민 디자인 가져와서 적용", "KRDS 톤으로 폼 잡아줘", "make this look like Toss". Works in any repository over the network. Do NOT use it to add or edit catalog entries (that is the separate `design-md` producer skill), to explain the DESIGN.md format itself — there is no UI to restyle there — or to build a quiz or exam page.
---

# use-design-md — consumer skill for the ko/design.md catalog

## Mental model

The ko-design-md catalog (https://www.getdesign.kr) publishes one `DESIGN.md` per Korean
brand — a compact, machine-readable description of that brand's visual language:
colors in OKLCH, typography, spacing, radius, signature components, and do's & don'ts.
This skill is the **consumer** side: it pulls the right entry and uses it as the design
brief for UI work in **whatever project you are currently in**.

It does three things, in order:

1. **Discover** — resolve the brand the user named to a catalog `slug`.
2. **Fetch** — download that entry's DESIGN.md verbatim (and, if useful, its token sidecar).
3. **Apply** — translate that design language into the current project's styling system.

Invoked by name, it is `/use-design-md` when installed with skills.sh and
`/ko-design-md:use-design-md` when installed from the Claude Code plugin marketplace
(plugin skills are namespaced by their plugin).

## Fetching — files, failures, the whole document

Every catalog fetch below (index, entry, token sidecar, and the GitHub raw fallback)
follows the same three rules
(WebFetch can't — that's why it's only a last resort, see Step 2):

1. **Save to a file, don't print to the terminal.** Many entries are tens of kilobytes, and a
   shell tool truncates long output (often around 30,000 characters) — silently dropping the
   back half: components, do's & don'ts, known gaps. Download into your own per-user cache,
   outside the user's project and not a shared `/tmp` directory another user could have
   created — `"${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/"` below; `--create-dirs` makes
   it, so each fetch stays one plain `curl` command. After a non-zero exit the file may be
   an older copy or a partial download — don't read it.

2. **Make HTTP failures fail.** Use `curl -fsSL --create-dirs -o <file> <url>`. `-f` turns a
   404/5xx into a non-zero exit instead of saving the error page — a missing slug returns `404`
   with a one-line `Not found: <slug>` body, which plain `curl -s` hands you as if it
   were the document. If curl exits non-zero, you did not get the file.

3. **Read the file to the end.** Check its size first (`wc -lc <file>`), then read it with
   your file-reading tool — in chunks (offset/limit) when one read doesn't reach the end
   (file readers cap a single read too). You're done when you've seen the last line
   number `wc -l` reported. On Windows (Git Bash), give the file-reading tool the
   Windows form of the path (`cygpath -w <file>`).

## This skill vs. `design-md` (don't mix them up)

- **`use-design-md` (this skill)** — CONSUME an existing entry. Runs in any repo.
  "Make my dashboard look like Toss", "apply Karrot's style to this screen".
- **`design-md` (the other skill)** — PRODUCE a new entry, adding a brand to the catalog.
  Only runs inside the ko-design-md repo.

If the user wants to *add* or *edit* a catalog entry, stop and point them at `design-md`.
That is a different job in a different place.

## Step 1 — Discover: resolve the brand to a slug

Fetch the catalog index (llms.txt format, ~one line per entry):

```
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/index.txt" https://www.getdesign.kr/llms.txt
```

If this fails, you have no index — that is not a **No match**. Use the index fallbacks in
`references/endpoints.md` (the repo's `services/` listing, or the sitemap); if those fail
too, tell the user you couldn't reach the catalog — don't report the brand as missing.

Each entry line looks like:

```
- [토스](https://www.getdesign.kr/services/toss/llms.txt): finance — <tagline>
```

Match the user's mention to a slug. The user may say a Korean name ("토스", "당근"), an
English name ("Toss", "Karrot"), a design-system name ("SEED Design", "Vapor UI"), or the
slug itself ("seed-design"). Match against the link text (name) AND the slug in the URL;
the tagline often names the design system, which helps disambiguate. Most index names
are Korean and some slugs are design-system names (당근 → `seed-design`, 구름 → `vapor-ui`),
so an English brand name may match neither — translate it to the Korean name first
(Karrot → 당근).

Outcomes:
- **One clear match** → take its slug, go to Step 2.
- **Several plausible matches** → ask which one with `AskUserQuestion`.
- **No match** → the brand isn't in the catalog. Tell the user plainly, optionally list a
  few catalogued brands in the nearest category, and mention that *adding* it is a
  separate job (the `design-md` skill, inside the ko-design-md repo). Don't write a
  DESIGN.md for it yourself — see Scope guardrails.

See `references/endpoints.md` for the full endpoint map and fallbacks.

## Step 2 — Fetch the DESIGN.md (and tokens if needed)

Fetch the raw entry:

```
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/<slug>.md" https://www.getdesign.kr/services/<slug>/llms.txt
```

If this exits non-zero with a 404, the slug isn't in the catalog — take the **No match**
path from Step 1 rather than guessing another slug. Any other failure (network error,
5xx, another 4xx such as 403/429) says nothing about the catalog: try the GitHub raw
fallback in `references/endpoints.md`, and if that fails too, tell the user you couldn't
fetch the entry — don't report the brand as missing.

`/services/<slug>/DESIGN.md` returns the same bytes under the DESIGN.md spec's
filename — the entry file is itself a spec document, so either URL works
(see `references/endpoints.md` §2b).

**Use `curl` (Bash), not WebFetch, for the entry.** WebFetch summarizes and transforms
content through a model, which silently drops exact token values — an OKLCH triple, a
13px spacing step, a specific weight. The whole reason to pull from the catalog is
fidelity to the brand's *real* numbers, so fetch the bytes verbatim. WebFetch is an
acceptable last resort only when Bash/curl is genuinely unavailable.

If you need tokens as structured data (e.g. to generate a Tailwind theme or a CSS
variable block programmatically), also fetch the sidecar from GitHub raw (getdesign.kr
doesn't serve it):

```
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/<slug>.tokens.json" https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.tokens.json
```

Read the DESIGN.md to its last line before applying anything. The prose carries intent — the do's &
don'ts, the voice — that the token JSON alone doesn't capture.

## Step 3 — Apply to the current project

This is the real work, and it's project-specific. Read `references/apply-guide.md` and
follow it. In short:

1. **Detect the target styling system first** (Tailwind config, CSS custom properties,
   CSS-in-JS, plain CSS) before changing anything.
2. **Map tokens onto that system** rather than pasting raw values everywhere — change
   them at the source so the whole surface moves together.
3. **Honor the Do's & Don'ts.** They're the brand's guardrails, not decoration.
4. **Verify** the result before claiming done — apply-guide §5 says how.

## Scope guardrails

- Don't gate on the current repo — this skill is meant to run anywhere.
- **Don't invent the design.** The catalog covers Korean services; a brand that isn't
  listed isn't available here. Say so instead of writing a DESIGN.md for it or
  approximating it from memory — citing a real source is the point. For a listed brand,
  don't invent values the fetched DESIGN.md doesn't have: if the user wants something its
  tokens don't cover, say so and propose an extension marked as *your* inference, not
  the brand's spec.
- **Stay vendor-neutral:** keep the source's name — brand or design system — out of the
  UI you generate. The rule and its one exception are in `references/apply-guide.md` §6.
