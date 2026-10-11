---
name: use-design-md
description: Apply a Korean brand's published DESIGN.md from the ko-design-md catalog (getdesign.kr) — colors, typography, spacing, radius, components, do's & don'ts — to the UI you are building in the CURRENT project. Use this skill whenever the user wants UI built or restyled in the *style of* a catalogued Korean service — "토스 디자인으로 만들어줘", "당근 스타일로 이 화면 다시 꾸며줘", "getdesign 카탈로그에서 배민 디자인 가져와서 적용", "KRDS 톤으로 폼 잡아줘", "make this look like Toss". Works in any repository over the network. Do NOT use it to add or edit catalog entries (that is the separate `design-md` producer skill), to explain the DESIGN.md format itself — there is no UI to restyle there — or to build a quiz or exam page that only borrows a brand's tone.
---

# use-design-md — consumer skill for the ko/design.md catalog

The ko-design-md catalog (https://www.getdesign.kr) publishes one `DESIGN.md` per Korean
brand: colors in OKLCH, typography, spacing, radius, components, and do's & don'ts. This
skill pulls the right entry and uses it as the design brief for UI work in the current
project. Invoked by name it is `/use-design-md` (skills.sh) or
`/ko-design-md:use-design-md` (Claude Code plugin marketplace).

## Fetching — files, failures, the whole document

Every catalog fetch (index, entry, token sidecar, GitHub raw fallback) follows these
rules. Fetch with `curl`, which writes the response body to a file byte for byte. A
web-reading tool that passes the page through a model (Claude Code: `WebFetch`)
summarizes and drops exact values (an OKLCH triple, a 13px step); use one only when you
have no shell at all.

1. **Save to a file, don't print to the terminal.** Entries run to tens of kilobytes, and
   a shell tool caps the output it hands back (Claude Code: around 30,000 characters),
   silently dropping the back half — components, do's & don'ts, known gaps. Download into
   your per-user cache, `"${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/"` (not the user's
   project, not a shared `/tmp`); `--create-dirs` makes it, so each fetch stays one plain
   `curl` command (a compound `mkdir …; curl …` is refused where only `curl` is allowed
   to run).
2. **Make HTTP failures fail.** `curl -fsSL --create-dirs -o <file> <url>`. `-f` turns a
   404/5xx into a non-zero exit — without it a missing slug's one-line `Not found: <slug>`
   body arrives as if it were the document. After a non-zero exit you did not get the
   file; what's on disk may be stale or partial — don't read it.
3. **Read the file to the end.** Check its size (`wc -lc <file>`), then read it with your
   file-reading tool. That tool may cap a single read too, so when one read doesn't
   reach the end, read the rest in chunks (Claude Code: `offset`/`limit`). You're done
   when you've seen the last line number `wc -l` reported. If your file reader expects a
   different path form than your shell prints, convert it (Git Bash on Windows:
   `cygpath -w <file>`).

The `references/` files this skill points to sit beside it. If you have only this file
(e.g. loaded from getdesign.kr's `/.well-known/agent-skills/`), fetch them the same way
from `https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/.claude/skills/use-design-md/references/<name>.md`.

## Step 1 — Discover: resolve the brand to a slug

```
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/index.txt" https://www.getdesign.kr/llms.txt
```

If this fails you have no index — that is not a **No match**. Use the index fallbacks in
`references/endpoints.md`; if those fail too, tell the user you couldn't reach the
catalog — don't report the brand as missing.

Each entry line looks like:

```
- [당근](https://www.getdesign.kr/services/seed-design/llms.txt): community · SEED Design — <tagline>
```

An entry that publishes a design-system name carries it after the category, as above;
one that doesn't has the category alone (`: finance — <tagline>`). Match the user's
mention against the link text (name), the design-system name, AND the slug in the URL.
Most names are Korean and some slugs are design-system names (당근 → `seed-design`,
구름 → `vapor-ui`), so translate an English brand name to the Korean name first
(Karrot → 당근).

- **One clear match** → Step 2.
- **Several plausible matches** → ask the user which one they mean (Claude Code:
  `AskUserQuestion`).
- **No match** → tell the user plainly the brand isn't in the catalog, optionally list a
  few catalogued brands in the nearest category, and note that adding it is the
  `design-md` skill's job (see Scope guardrails).

## Step 2 — Fetch the DESIGN.md

```
curl -fsSL --create-dirs -o "${XDG_CACHE_HOME:-$HOME/.cache}/use-design-md/<slug>.md" https://www.getdesign.kr/services/<slug>/llms.txt
```

- **404** → the slug isn't in the catalog: take the **No match** path rather than
  guessing another slug.
- **Any other failure** (network, 5xx, 403/429) says nothing about the catalog: try the
  GitHub raw fallback in `references/endpoints.md`; if that fails too, tell the user you
  couldn't fetch the entry — don't report the brand as missing.

Read it to its last line before applying anything — the prose carries intent (do's &
don'ts, known gaps) that the tokens alone don't. If you need tokens as structured data
(to generate a theme programmatically), fetch the JSON sidecar the same way — it is on
GitHub raw, not getdesign.kr (`references/endpoints.md` §3).

## Step 3 — Apply to the current project

Before editing anything, read `references/apply-guide.md` and follow it. Three parts are
never optional: the entry's Known Gaps come first (apply-guide §2), its Do's and Don'ts are
hard constraints, and you verify the result (apply-guide §5) before calling it done.

## Scope guardrails

- Don't gate on the current repo — this skill runs anywhere.
- **Adding or editing a catalog entry** is the `design-md` producer skill's job, inside
  the ko-design-md repo. Stop and point the user there.
- **Don't invent the design.** A brand that isn't listed isn't available here — say so
  instead of writing a DESIGN.md for it or approximating it from memory. For a listed
  brand, don't invent values its DESIGN.md doesn't have: propose an extension marked as
  *your* inference, not the brand's spec.
- **Loaded for a page that only wants a brand's tone** ("토스 앱처럼 깔끔한 퀴즈")? Still
  fetch the entry rather than approximating the brand from memory.
- **Stay vendor-neutral:** keep the source's name — brand or design system — out of the
  generated UI (`references/apply-guide.md` §6).
