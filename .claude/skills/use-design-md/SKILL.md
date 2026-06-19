---
name: use-design-md
description: Pull a Korean brand's published design.md from the ko-design-md catalog (getdesign.kr) and apply its design language — colors, typography, spacing, radius, components, do's & don'ts — to the UI you are building in the CURRENT project. Use this skill whenever the user wants to build or restyle UI in the *style of* a catalogued Korean service: phrases like "토스 디자인으로 만들어줘", "당근 스타일로 이 화면 다시 꾸며줘", "getdesign 카탈로그에서 배민 디자인 가져와서 적용", "KRDS 톤으로 폼 잡아줘", "make this look like Toss", "use the Karrot design system here", or "/use-design-md". Works in ANY repository — it fetches over the network, no local catalog needed. Do NOT use this to ADD a brand to the catalog or edit catalog entries — that is the separate `design-md` producer skill, which only runs inside the ko-design-md repo. If the requested brand isn't in the catalog, say so plainly rather than inventing a design.md.
---

# use-design-md — consumer skill for the ko/design.md catalog

## Mental model

The ko-design-md catalog (https://getdesign.kr) publishes one `design.md` per Korean
service — a compact, machine-readable description of that brand's visual language:
colors in OKLCH, typography, spacing, radius, signature components, and do's & don'ts.
This skill is the **consumer** side: it pulls the right entry and uses it as the design
brief for UI work in **whatever project you are currently in**.

It does three things, in order:

1. **Discover** — resolve the brand the user named to a catalog `slug`.
2. **Fetch** — download that entry's raw `design.md` (and, if useful, its token sidecar).
3. **Apply** — translate that design language into the current project's styling system.

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
curl -s https://getdesign.kr/llms.txt
```

Each entry line looks like:

```
- [토스](https://getdesign.kr/services/toss/llms.txt): finance — <tagline>
```

Match the user's mention to a slug. The user may say a Korean name ("토스", "당근"), an
English name ("Toss", "Karrot"), a design-system name ("SEED Design", "Vapor UI"), or the
slug itself ("seed-design"). Match against the link text (name) AND the slug in the URL;
the tagline often names the design system, which helps disambiguate.

Outcomes:
- **One clear match** → take its slug, go to Step 2.
- **Several plausible matches** → ask which one with `AskUserQuestion`.
- **No match** → the brand isn't in the catalog. Tell the user plainly, optionally list a
  few catalogued brands in the nearest category, and mention that *adding* it is a
  separate job (the `design-md` skill, inside the ko-design-md repo). Do not fabricate a
  design.md for an uncatalogued brand — that defeats the point of citing a real source.

See `references/endpoints.md` for the full endpoint map and fallbacks.

## Step 2 — Fetch the design.md (and tokens if needed)

Fetch the raw entry:

```
curl -s https://getdesign.kr/services/<slug>/llms.txt
```

**Use `curl` (Bash), not WebFetch, for the entry.** WebFetch summarizes and transforms
content through a model, which silently drops exact token values — an OKLCH triple, a
13px spacing step, a specific weight. The whole reason to pull from the catalog is
fidelity to the brand's *real* numbers, so fetch the bytes verbatim. WebFetch is an
acceptable last resort only when Bash/curl is genuinely unavailable.

If you need tokens as structured data (e.g. to generate a Tailwind theme or a CSS
variable block programmatically), also fetch the sidecar from GitHub raw — there is no
getdesign.kr endpoint for it yet:

```
curl -s https://raw.githubusercontent.com/CaesiumY/ko-design-md/main/services/<slug>.tokens.json
```

Read the design.md fully before applying anything. The prose carries intent — the do's &
don'ts, the voice — that the token JSON alone doesn't capture.

## Step 3 — Apply to the current project

This is the real work, and it's project-specific. Read `references/apply-guide.md` and
follow it. In short:

1. **Detect the target styling system first** (Tailwind config, CSS custom properties,
   CSS-in-JS, plain CSS) before changing anything.
2. **Map tokens onto that system** rather than pasting raw values everywhere — change
   them at the source so the whole surface moves together.
3. **Honor the Do's & Don'ts.** They're the brand's guardrails, not decoration.
4. For a large or structural change, route through `superpowers:brainstorming` first;
   for a small restyle, just go.
5. **Verify** the result (preview/screenshot, or the project's tests) before claiming done
   (`superpowers:verification-before-completion`).

## Scope guardrails

- Don't gate on the current repo — this skill is meant to run anywhere.
- Don't invent values absent from the fetched design.md. If the user wants something the
  brand's tokens don't cover, say so and propose a reasonable extension marked as *your*
  inference, not the brand's spec.
- The catalog covers Korean services. A brand that isn't listed simply isn't available
  here — be honest about that instead of approximating from memory.
