import { describe, expect, it } from "vitest"
import { validatePreviewPair } from "./preview-validator"
import type { PreviewValidationInput } from "./preview-validator"

// ── fixtures ─────────────────────────────────────────────────────────────────

function makeDesignMd(opts: { fontDisplaySrc?: string; logo?: boolean } = {}) {
  const logoLine =
    opts.logo === false ? "" : "logo: https://getdesign.kr/logos/demo.png\n"
  const fontSrc = opts.fontDisplaySrc
    ? `font-display-src: ${opts.fontDisplaySrc}\n`
    : ""
  return [
    "---",
    "name: 데모",
    "slug: demo",
    "category: finance",
    'last_updated: "2026-07-03"',
    "sources:",
    "  - https://example.com/a",
    "related_services: []",
    "lang: ko",
    logoLine.trim(),
    "---",
    "",
    "# 데모",
    "",
    "## Colors",
    "",
    "```yaml",
    "primary: oklch(0.62 0.18 250)",
    "surface: oklch(0.98 0.005 250)",
    "```",
    "",
    "## Typography",
    "",
    "```yaml",
    "font-sans: Pretendard Variable, sans-serif",
    fontSrc.trim(),
    "```",
    "",
    "## Components",
    "",
    "버튼과 카드가 있다.",
  ]
    .filter((l) => l !== "")
    .join("\n")
}

interface HtmlOpts {
  theme?: "light" | "dark"
  lang?: string
  tokensCss?: boolean
  iframeJs?: boolean
  extraHead?: string
  style?: string
  body?: string
}

function makeHtml(opts: HtmlOpts = {}): string {
  const theme = opts.theme ?? "light"
  const lang = opts.lang ?? "ko"
  const tokensCss =
    opts.tokensCss === false
      ? ""
      : '<link rel="stylesheet" href="/preview/_runtime/tokens.css">'
  const iframeJs =
    opts.iframeJs === false
      ? ""
      : '<script src="/preview/_runtime/iframe.js" defer></script>'
  const style =
    opts.style ??
    `:root { --primary: oklch(0.62 0.18 250); --surface: ${
      theme === "dark" ? "oklch(0.22 0.01 250)" : "oklch(0.98 0.005 250)"
    }; } .hero { color: var(--primary); }`
  const body =
    opts.body ??
    '<main class="hero"><img src="/logos/demo.png" alt="데모"><h1>데모</h1></main>'
  return [
    "<!doctype html>",
    `<html lang="${lang}" data-theme="${theme}">`,
    "<head>",
    '<meta charset="utf-8">',
    tokensCss,
    opts.extraHead ?? "",
    iframeJs,
    `<style>${style}</style>`,
    "</head>",
    `<body>${body}</body>`,
    "</html>",
  ].join("\n")
}

function makeInput(
  overrides: Partial<PreviewValidationInput> = {}
): PreviewValidationInput {
  const light = overrides.lightRaw ?? makeHtml({ theme: "light" })
  const dark = overrides.darkRaw ?? makeHtml({ theme: "dark" })
  return {
    slug: "demo",
    lightRaw: light,
    darkRaw: dark,
    lightBytes: Buffer.byteLength(light),
    darkBytes: Buffer.byteLength(dark),
    designMdRaw: makeDesignMd(),
    ...overrides,
  }
}

function rulesOf(
  input: PreviewValidationInput,
  severity?: "block" | "warn"
): Array<string> {
  return validatePreviewPair(input)
    .issues.filter((i) => !severity || i.severity === severity)
    .map((i) => i.rule)
}

// ── structure blocks ─────────────────────────────────────────────────────────

describe("validatePreviewPair — structure", () => {
  it("passes a valid pair with zero block issues", () => {
    const result = validatePreviewPair(makeInput())
    expect(result.issues.filter((i) => i.severity === "block")).toEqual([])
    expect(result.passed).toBe(true)
  })

  it("blocks when data-theme does not match the file role", () => {
    const input = makeInput({ darkRaw: makeHtml({ theme: "light" }) })
    expect(rulesOf(input, "block")).toContain("data-theme-mismatch")
  })

  it("blocks when <html lang> differs from the design.md lang", () => {
    const input = makeInput({ lightRaw: makeHtml({ lang: "en" }) })
    expect(rulesOf(input, "block")).toContain("lang-mismatch")
  })

  it("blocks a missing tokens.css link", () => {
    const input = makeInput({ lightRaw: makeHtml({ tokensCss: false }) })
    expect(rulesOf(input, "block")).toContain("missing-tokens-css")
  })

  it("blocks a missing iframe.js script", () => {
    const input = makeInput({ darkRaw: makeHtml({ iframeJs: false }) })
    expect(rulesOf(input, "block")).toContain("missing-iframe-js")
  })

  it("blocks any script src other than the shared iframe.js", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        extraHead:
          '<script src="https://unpkg.com/react@18/umd/react.js"></script>',
      }),
    })
    expect(rulesOf(input, "block")).toContain("foreign-script")
  })

  it("blocks a file above 128KB and warns above 100KB", () => {
    const oversized = makeInput({ lightBytes: 130 * 1024 })
    expect(rulesOf(oversized, "block")).toContain("file-too-large")

    const budget = makeInput({ lightBytes: 108 * 1024 })
    expect(rulesOf(budget, "block")).not.toContain("file-too-large")
    expect(rulesOf(budget, "warn")).toContain("file-size-budget")
  })
})

// ── color hygiene warns ──────────────────────────────────────────────────────

describe("validatePreviewPair — color hygiene", () => {
  it("does not warn for achromatic shorthand (#fff, rgba(0,0,0,.05))", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          ".a { color: #fff; background: #000000; box-shadow: 0 1px rgba(0,0,0,.05); border-color: rgba(255, 255, 255, .12); }",
      }),
    })
    const rules = rulesOf(input, "warn")
    expect(rules).not.toContain("hex-colors-present")
    expect(rules).not.toContain("rgba-colors-present")
  })

  it("warns for chromatic hex and rgba values", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        style: ".a { color: #6157ea; outline-color: rgba(97, 87, 234, .3); }",
      }),
    })
    const rules = rulesOf(input, "warn")
    expect(rules).toContain("hex-colors-present")
    expect(rules).toContain("rgba-colors-present")
  })
})

// ── logo rules ───────────────────────────────────────────────────────────────

describe("validatePreviewPair — logo", () => {
  it("blocks a missing expected hero logo (skill mode)", () => {
    const input = makeInput({
      expectedLogoSrc: "/logos/demo.png",
      darkRaw: makeHtml({ theme: "dark", body: "<main><h1>데모</h1></main>" }),
    })
    expect(rulesOf(input, "block")).toContain("hero-logo-missing")
  })

  it("requires the wordmark (not the symbol) in the hero when both are expected", () => {
    const withWordmark = makeInput({
      expectedLogoSrc: "/logos/demo.png",
      expectedWordmarkSrc: "/logos/demo-logotype.svg",
      lightRaw: makeHtml({
        body: '<main><img src="/logos/demo-logotype.svg" alt=""><h1>데모</h1></main>',
      }),
      darkRaw: makeHtml({
        theme: "dark",
        body: '<main><img src="/logos/demo-logotype.svg" alt=""><h1>데모</h1></main>',
      }),
    })
    expect(rulesOf(withWordmark, "block")).not.toContain("hero-logo-missing")
  })

  it("warns (CI mode) when the design.md has a logo but the HTML renders none", () => {
    const input = makeInput({
      lightRaw: makeHtml({ body: "<main><h1>데모</h1></main>" }),
      darkRaw: makeHtml({ theme: "dark", body: "<main><h1>데모</h1></main>" }),
    })
    expect(rulesOf(input, "warn")).toContain("logo-img-missing")
  })
})

// ── typography & theme warns ─────────────────────────────────────────────────

describe("validatePreviewPair — typography and themes", () => {
  it("warns when the design.md names a font-display-src that no <link> loads", () => {
    const src = "https://cdn.example.com/wanted-sans.css"
    const input = makeInput({
      designMdRaw: makeDesignMd({ fontDisplaySrc: src }),
    })
    expect(rulesOf(input, "warn")).toContain("font-display-link-missing")
  })

  it("does not warn when the font-display-src is loaded via <link>", () => {
    const src = "https://cdn.example.com/wanted-sans.css"
    const link = `<link rel="stylesheet" href="${src}">`
    const input = makeInput({
      designMdRaw: makeDesignMd({ fontDisplaySrc: src }),
      lightRaw: makeHtml({ extraHead: link }),
      darkRaw: makeHtml({ theme: "dark", extraHead: link }),
    })
    expect(rulesOf(input, "warn")).not.toContain("font-display-link-missing")
  })

  it("warns when light and dark carry byte-identical <style> blocks", () => {
    const style = ":root { --primary: oklch(0.62 0.18 250); }"
    const input = makeInput({
      lightRaw: makeHtml({ style }),
      darkRaw: makeHtml({ theme: "dark", style }),
    })
    expect(rulesOf(input, "warn")).toContain("identical-style-blocks")
  })
})

// ── responsive heuristics ────────────────────────────────────────────────────

describe("validatePreviewPair — responsive heuristics", () => {
  it("warns on bare 1fr tracks but not on minmax(0, 1fr)", () => {
    const bare = makeInput({
      lightRaw: makeHtml({
        style:
          ".grid { display: grid; grid-template-columns: 1fr 1fr; } @media (max-width: 720px) { .grid { grid-template-columns: 1fr; } }",
      }),
    })
    expect(rulesOf(bare, "warn")).toContain("bare-1fr")

    const guarded = makeInput({
      lightRaw: makeHtml({
        style:
          ".grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); } @media (max-width: 720px) { .grid { grid-template-columns: minmax(0, 1fr); } }",
      }),
    })
    expect(rulesOf(guarded, "warn")).not.toContain("bare-1fr")
  })

  it("warns on a multi-column grid with no @media redeclaration", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          ".cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }",
      }),
    })
    expect(rulesOf(input, "warn")).toContain("no-mobile-collapse")
  })

  it("recognizes a collapse declared through a grouped selector list", () => {
    // toss convention: `@media … { .two-up, .comp-grid { grid-template-columns: 1fr; } }`
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          ".two-up { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); } .comp-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); } @media (max-width: 720px) { .two-up, .comp-grid { grid-template-columns: minmax(0, 1fr); } }",
      }),
    })
    expect(rulesOf(input, "warn")).not.toContain("no-mobile-collapse")
  })

  it("does not warn when the multi-column grid collapses in a media query", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          ".cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); } @media (max-width: 720px) { .cols { grid-template-columns: minmax(0, 1fr); } }",
      }),
    })
    expect(rulesOf(input, "warn")).not.toContain("no-mobile-collapse")
  })
})

// ── review-hardening regressions (PR #166 Gemini feedback) ───────────────────

describe("validatePreviewPair — review hardening", () => {
  it("accepts single-quoted attributes in structural checks", () => {
    const single = (theme: "light" | "dark") =>
      [
        "<!doctype html>",
        `<html lang='ko' data-theme='${theme}'>`,
        "<head><meta charset='utf-8'>",
        "<link rel='stylesheet' href='/preview/_runtime/tokens.css'>",
        "<script src='/preview/_runtime/iframe.js' defer></script>",
        `<style>:root { --surface: ${
          theme === "dark" ? "oklch(0.22 0.01 250)" : "oklch(0.98 0.005 250)"
        }; }</style>`,
        "</head>",
        "<body><main><img src='/logos/demo.png' alt=''><h1>데모</h1></main></body>",
        "</html>",
      ].join("\n")
    const input = makeInput({
      lightRaw: single("light"),
      darkRaw: single("dark"),
      expectedLogoSrc: "/logos/demo.png",
    })
    expect(rulesOf(input, "block")).toEqual([])
  })

  it("keeps CSS rule attribution sane when a declaration embeds a brace in a string", () => {
    // Without string-aware depth tracking, `content: "{"` swallows the whole
    // @media block into the .badge rule, losing the collapse redeclaration
    // and firing a false no-mobile-collapse on a properly-collapsed file.
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          '.cols { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); } .badge::before { content: "{"; } @media (max-width: 720px) { .cols { grid-template-columns: minmax(0, 1fr); } }',
      }),
    })
    expect(rulesOf(input, "warn")).not.toContain("no-mobile-collapse")
  })

  it("counts tracks across mixed repeat() and standalone track values", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          ".mix { display: grid; grid-template-columns: repeat(1, minmax(0, 1fr)) minmax(0, 1fr); }",
      }),
    })
    expect(rulesOf(input, "warn")).toContain("no-mobile-collapse")
  })

  it("scopes color hygiene to CSS surfaces, not display text", () => {
    // bezier precedent: hero copy and stat cards legitimately *display* the
    // brand hex as text — only CSS-bearing surfaces (style blocks, style/fill/
    // stroke attributes) are hygiene targets.
    const textOnly = makeInput({
      lightRaw: makeHtml({
        body: '<main><img src="/logos/demo.png" alt=""><p>Primary #6157ea</p></main>',
      }),
    })
    expect(rulesOf(textOnly, "warn")).not.toContain("hex-colors-present")

    const attrColor = makeInput({
      lightRaw: makeHtml({
        body: '<main><img src="/logos/demo.png" alt=""><i style="color:#6157ea">x</i></main>',
      }),
    })
    expect(rulesOf(attrColor, "warn")).toContain("hex-colors-present")
  })

  it("does not let data-* attributes satisfy attribute checks (hyphen boundary)", () => {
    // `\bsrc=` also matches `data-src=` (a hyphen is a non-word character), so
    // a lazy-load attribute must not satisfy the hero-logo block…
    const lazyOnly = makeInput({
      expectedLogoSrc: "/logos/demo.png",
      lightRaw: makeHtml({
        body: '<main><img data-src="/logos/demo.png" alt=""><h1>데모</h1></main>',
      }),
      darkRaw: makeHtml({
        theme: "dark",
        body: '<main><img data-src="/logos/demo.png" alt=""><h1>데모</h1></main>',
      }),
    })
    expect(rulesOf(lazyOnly, "block")).toContain("hero-logo-missing")

    // …and a data-style attribute is not a CSS surface.
    const dataStyle = makeInput({
      lightRaw: makeHtml({
        body: '<main><img src="/logos/demo.png" alt=""><i data-style="color:#6157ea">x</i></main>',
      }),
    })
    expect(rulesOf(dataStyle, "warn")).not.toContain("hex-colors-present")
  })

  it("captures the full style attribute across nested quotes", () => {
    // `[^"']*` stops at the inner quote of url('…'), letting everything after
    // it (the chromatic hex) escape the CSS-surface scan.
    const nestedQuotes = makeInput({
      lightRaw: makeHtml({
        body: '<main><img src="/logos/demo.png" alt=""><i style="background-image: url(\'/foo.png\'); color: #6157ea;">x</i></main>',
      }),
    })
    expect(rulesOf(nestedQuotes, "warn")).toContain("hex-colors-present")
  })

  it("flags styles identical after comment/whitespace normalization", () => {
    const base = ":root { --primary: oklch(0.62 0.18 250); }"
    const input = makeInput({
      lightRaw: makeHtml({ style: `${base} /* light */` }),
      darkRaw: makeHtml({ theme: "dark", style: `${base}  /* dark */` }),
    })
    expect(rulesOf(input, "warn")).toContain("identical-style-blocks")
  })
})

// ── metrics ──────────────────────────────────────────────────────────────────

describe("validatePreviewPair — OKLCH coverage metrics", () => {
  it("reports per-file coverage of design.md color values without raising issues", () => {
    const input = makeInput({
      lightRaw: makeHtml({
        style:
          ":root { --primary: oklch(0.62 0.18 250); --other: oklch(0.5 0.1 30); }",
      }),
      darkRaw: makeHtml({
        theme: "dark",
        style: ":root { --primary: oklch(0.3 0.1 250); }",
      }),
    })
    const result = validatePreviewPair(input)
    expect(result.metrics.light).toEqual({ matched: 1, total: 2 })
    expect(result.metrics.dark).toEqual({ matched: 0, total: 2 })
    const coverageRules = result.issues.filter((i) =>
      i.rule.includes("coverage")
    )
    expect(coverageRules).toEqual([])
  })
})
