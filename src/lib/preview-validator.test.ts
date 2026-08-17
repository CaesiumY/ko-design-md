import { readFileSync } from "node:fs"
import { join } from "node:path"
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
  /** Replace the strip wholesale — pass "" to drop it, or partial prose. */
  disclaimer?: string
}

const FULL_DISCLAIMER =
  '<div class="catalog-disclaimer" role="note">이 카탈로그는 어떤 브랜드와도 ' +
  "제휴·후원 관계가 없습니다. 표시된 정보는 레이아웃 시연용 더미 데이터입니다.</div>"

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
    `<body>${opts.disclaimer ?? FULL_DISCLAIMER}${body}</body>`,
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

  it("does not block or warn on raw size alone below the raw safety net", () => {
    // 크기 게이트는 이제 brotli 기준이다 (Task 4). raw 바이트는 안전망 전용이라
    // 256 KiB 아래에서는 아무 이슈도 만들지 않는다 — 실제 전송량이 아니기 때문.
    const rawHeavy = makeInput({ lightBytes: 130 * 1024 })
    expect(rulesOf(rawHeavy, "block")).not.toContain("file-too-large")
    expect(rulesOf(rawHeavy, "block")).not.toContain("file-too-large-raw")
    expect(rulesOf(rawHeavy, "warn")).not.toContain("file-size-budget")
  })
})

// ── size gate (brotli) ───────────────────────────────────────────────────────

describe("validatePreviewPair — size gate (brotli)", () => {
  /**
   * Deterministic high-entropy bytes rendered as base64 — what an inline
   * `<img src="data:image/png;base64,…">` actually looks like, and the payload
   * shape this gate exists to catch. Compresses to a flat 75% at every size
   * (base64's 4/3 expansion is all brotli can recover), with no plateau.
   * xorshift32 stays in 32-bit integer math, so unlike an LCG it never loses
   * precision and degenerate into a short repeating cycle.
   */
  function inlineAssetPayload(bytes: number): string {
    const raw = Buffer.alloc(Math.ceil((bytes * 3) / 4))
    let x = 0x9e3779b9
    for (let i = 0; i < raw.length; i++) {
      x ^= x << 13
      x >>>= 0
      x ^= x >> 17
      x ^= x << 5
      x >>>= 0
      raw[i] = x & 0xff
    }
    return raw.toString("base64").slice(0, bytes)
  }

  it("does not warn on a large but highly repetitive file", () => {
    // Repeated markup compresses to a few KiB — exactly the "duplicated
    // markup" case the old raw cap punished for no user cost. Repeat count is
    // pinned well below BLOCK_RAW_BYTES (256 KiB): at .repeat(6000) this
    // fixture's raw size sat ~252.1 KiB, a 1.5% margin that a small bump in
    // the fixture or in makeHtml's boilerplate could silently cross — the
    // test would keep passing green while testing the block path instead of
    // "large raw, tiny brotli, passes clean". .repeat(4000) restores headroom
    // (measured ~168.5 KiB raw), and the explicit file-too-large-raw
    // assertion below makes the raw-safety-net boundary a visible failure
    // instead of a silent scope change if it's ever crossed again.
    const repeated = '<div class="row"><span>본문</span></div>\n'.repeat(4000)
    const html = makeHtml({ body: `<main>${repeated}</main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main>${repeated}</main>` }),
      lightBytes: Buffer.byteLength(html),
      darkBytes: Buffer.byteLength(html),
    })
    expect(rulesOf(input)).not.toContain("file-size-budget")
    expect(rulesOf(input)).not.toContain("file-too-large")
    expect(rulesOf(input)).not.toContain("file-too-large-raw")
  })

  it("blocks when an inline-asset-shaped payload exceeds the brotli hard cap", () => {
    // 64 KiB of base64-encoded high-entropy bytes — models an inline
    // `data:` asset, the failure mode this gate exists to catch. Compresses
    // to a flat 75% (base64's own 4/3 expansion is all brotli recovers),
    // landing ~48 KiB brotli — 20% above the 40 KiB cap, with no plateau to
    // worry about as the fixture scales.
    const blob = inlineAssetPayload(64 * 1024)
    const html = makeHtml({ body: `<main><p>${blob}</p></main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main><p>${blob}</p></main>` }),
      lightBytes: Buffer.byteLength(html),
      darkBytes: Buffer.byteLength(html),
    })
    expect(rulesOf(input, "block")).toContain("file-too-large")
  })

  it("warns between the brotli budget and the hard cap", () => {
    // 40 KiB of the same inline-asset-shaped payload lands ~30 KiB brotli —
    // 25% above the 24 KiB budget and 25% below the 40 KiB cap.
    const blob = inlineAssetPayload(40 * 1024)
    const html = makeHtml({ body: `<main><p>${blob}</p></main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main><p>${blob}</p></main>` }),
      lightBytes: Buffer.byteLength(html),
      darkBytes: Buffer.byteLength(html),
    })
    expect(rulesOf(input, "warn")).toContain("file-size-budget")
    expect(rulesOf(input, "block")).not.toContain("file-too-large")
  })

  it("keeps a raw safety net for runaway generated markup", () => {
    const repeated = '<div class="row"><span>본문</span></div>\n'.repeat(8000)
    const html = makeHtml({ body: `<main>${repeated}</main>` })
    const input = makeInput({
      lightRaw: html,
      darkRaw: makeHtml({ theme: "dark", body: `<main>${repeated}</main>` }),
      lightBytes: 300 * 1024,
      darkBytes: 300 * 1024,
    })
    expect(rulesOf(input, "block")).toContain("file-too-large-raw")
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

// ── catalog disclosure strip ─────────────────────────────────────────────────

describe("validatePreviewPair — disclosure banner", () => {
  const bothThemes = (disclaimer: string, lang = "ko") =>
    makeInput({
      lightRaw: makeHtml({ disclaimer, lang }),
      darkRaw: makeHtml({ theme: "dark", disclaimer, lang }),
    })

  it("flags a preview with no disclosure strip at all", () => {
    expect(rulesOf(bothThemes(""), "block")).toContain(
      "missing-disclaimer-banner"
    )
  })

  it("flags a strip that dropped the non-affiliation sentence", () => {
    const partial =
      '<div class="catalog-disclaimer" role="note">표시된 정보는 레이아웃 시연용 더미 데이터입니다.</div>'
    expect(rulesOf(bothThemes(partial), "block")).toContain(
      "disclaimer-banner-incomplete"
    )
  })

  it("flags a strip that dropped the dummy-data sentence", () => {
    const partial =
      '<div class="catalog-disclaimer" role="note">이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다.</div>'
    expect(rulesOf(bothThemes(partial), "block")).toContain(
      "disclaimer-banner-incomplete"
    )
  })

  // The wording has to be checked inside the strip, not across the document:
  // five previews carry .catalog-dummy captions that also say "더미 데이터", so a
  // document-wide search keeps passing after the sentence leaves the strip.
  it("flags a gutted strip even when a caption elsewhere repeats the wording", () => {
    const gutted =
      '<div class="catalog-disclaimer" role="note">이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다.</div>'
    const captionBelow =
      '<p class="catalog-dummy">가격은 레이아웃 시연용 더미 데이터입니다.</p>'
    const input = makeInput({
      lightRaw: makeHtml({
        disclaimer: gutted,
        body: `${captionBelow}<main class="hero"><h1>데모</h1></main>`,
      }),
      darkRaw: makeHtml({
        theme: "dark",
        disclaimer: gutted,
        body: `${captionBelow}<main class="hero"><h1>데모</h1></main>`,
      }),
    })
    expect(rulesOf(input, "block")).toContain("disclaimer-banner-incomplete")
  })

  // The mirror case: a class name that merely ends in the token must not count
  // as the strip (a hyphen is a non-word character, so \b would match inside).
  it("does not accept a class that only ends with the disclosure token", () => {
    const lookalike =
      '<div class="page-catalog-disclaimer">이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다. 더미 데이터입니다.</div>'
    expect(rulesOf(bothThemes(lookalike), "block")).toContain(
      "missing-disclaimer-banner"
    )
  })

  it("does not hold a lang: en preview to the Korean wording", () => {
    const english =
      '<div class="catalog-disclaimer" role="note">This catalog is not affiliated with any brand. Values shown are dummy data.</div>'
    const input = makeInput({
      lightRaw: makeHtml({ disclaimer: english, lang: "en" }),
      darkRaw: makeHtml({ theme: "dark", disclaimer: english, lang: "en" }),
      designMdRaw: makeDesignMd().replace("lang: ko", "lang: en"),
    })
    expect(rulesOf(input)).not.toContain("disclaimer-banner-incomplete")
  })

  it("accepts a complete strip", () => {
    const rules = rulesOf(makeInput())
    expect(rules).not.toContain("missing-disclaimer-banner")
    expect(rules).not.toContain("disclaimer-banner-misplaced")
    expect(rules).not.toContain("disclaimer-banner-incomplete")
  })

  // A strip below the fold satisfies the letter of the rule and none of its
  // purpose — it misses the first screen and the hero crop screenshots take.
  it("flags a complete strip that is not the first child of <body>", () => {
    const buried = makeInput({
      lightRaw: makeHtml({ disclaimer: "" }).replace(
        "</body>",
        `${FULL_DISCLAIMER}</body>`
      ),
      darkRaw: makeHtml({ theme: "dark", disclaimer: "" }).replace(
        "</body>",
        `${FULL_DISCLAIMER}</body>`
      ),
    })
    const rules = rulesOf(buried, "block")
    expect(rules).toContain("disclaimer-banner-misplaced")
    // Present and complete — only its position is wrong.
    expect(rules).not.toContain("missing-disclaimer-banner")
  })

  // Promoted to `block` in D-2, together with the skill files that teach the
  // strip. The dependency is asserted, not just commented: a `block` rule landing
  // before preview-html-author.md knows about the strip leaves the pipeline unable
  // to satisfy its own Stage 9a2 gate — the author cannot fix what it was never
  // told about, K=2 exhausts, Stage 9c ships anyway, and main fails. If someone
  // ever strips the guidance back out of the author, this fails loudly here rather
  // than silently on the next onboarding.
  it("blocks, and the author prompt it depends on teaches the strip", () => {
    expect(rulesOf(bothThemes(""), "block")).toContain(
      "missing-disclaimer-banner"
    )

    const author = readFileSync(
      join(process.cwd(), ".claude/agents/preview-html-author.md"),
      "utf8"
    )
    expect(author).toContain('class="catalog-disclaimer"')
    expect(author).toContain("제휴·후원 관계가 없습니다")
    expect(author).toContain("더미 데이터")
  })
})

// ── government identifiers ───────────────────────────────────────────────────

describe("validatePreviewPair — government identifiers", () => {
  const GOV_BODY =
    '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>' +
    '<main class="hero"><h1>데모</h1></main>'

  it("blocks a government identifier that carries no dummy-data caption", () => {
    const input = makeInput({
      lightRaw: makeHtml({ body: GOV_BODY }),
      darkRaw: makeHtml({ theme: "dark", body: GOV_BODY }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  it("accepts a government identifier captioned inside the same container", () => {
    const captioned =
      "<section>" +
      '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>' +
      '<p class="catalog-dummy">위 문장은 표시 예시입니다.</p>' +
      "</section>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: captioned }),
      darkRaw: makeHtml({ theme: "dark", body: captioned }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  it("leaves previews with no government identifier alone", () => {
    expect(rulesOf(makeInput(), "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // The change this rule exists for. A caption that is merely a following
  // sibling under <body> shares no container with the identifier, so it labels
  // nothing — a reader of the strip sees the government sentence and no
  // qualifier. Counting captions document-wide accepted this; structure does
  // not. `public/preview/krds` was in exactly this shape.
  it("rejects a caption that only shares <body> with the identifier", () => {
    const siblings =
      '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>' +
      '<div><p class="catalog-dummy">위 문장은 표시 예시입니다.</p></div>' +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: siblings }),
      darkRaw: makeHtml({ theme: "dark", body: siblings }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  // services/krds.md:486 makes the footer the one sanctioned slot for source
  // attribution, so the footer heading naming the publisher is true. Captioning
  // it "표시 예시" would write a falsehood, which is why the exemption is a
  // marker rather than a caption.
  it("accepts an identifier marked as the catalog's own attribution", () => {
    const attributed =
      "<footer><div>" +
      "<h4>대한민국정부 — 데모</h4>" +
      '<p class="catalog-attribution">이 화면은 카탈로그가 만든 비공식 재현입니다.</p>' +
      "</div></footer>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: attributed }),
      darkRaw: makeHtml({ theme: "dark", body: attributed }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // The identifier's own element counts as a container, so a caption nested
  // directly inside it labels it. Nothing in the catalogue is written this way;
  // the fixture exists so the choice is a decision rather than an accident.
  it("accepts a caption nested inside the identifier's own element", () => {
    const nested =
      '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.' +
      '<span class="catalog-dummy">표시 예시입니다.</span></div>' +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: nested }),
      darkRaw: makeHtml({ theme: "dark", body: nested }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // An identifier can live in an attribute rather than in prose. A screen
  // reader announces `alt`, and a crawler indexes it, so a standalone copy of
  // the file carries the claim just as plainly. The old raw-string search
  // caught these by accident; reading only text nodes would have narrowed the
  // rule silently.
  it("blocks an identifier that only appears in an attribute value", () => {
    const inAlt =
      '<img src="/logos/demo.svg" alt="대한민국정부 상징">' +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: inAlt }),
      darkRaw: makeHtml({ theme: "dark", body: inAlt }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  it("accepts an attribute identifier captioned in the same container", () => {
    const captioned =
      "<section>" +
      '<img src="/logos/demo.svg" alt="대한민국정부 상징">' +
      '<p class="catalog-dummy">위 이미지는 표시 예시입니다.</p>' +
      "</section>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: captioned }),
      darkRaw: makeHtml({ theme: "dark", body: captioned }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // The most unlabelled a phrase can be: bare text under <body> with no element
  // around it. It has no container, so no caption can ever share an ancestor
  // with it — which is exactly why an ancestor-based rule can skip it by
  // accident. It must be reported, not ignored for lack of a node to blame.
  it("blocks an identifier in bare text directly under body", () => {
    const bare =
      "이 누리집은 대한민국 공식 전자정부 누리집입니다." +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: bare }),
      darkRaw: makeHtml({ theme: "dark", body: bare }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  // The other half of the scope change: the old check searched the raw file, so
  // an identifier inside a <style> body counted. Nobody reads a CSS comment, so
  // this one is dropped on purpose.
  it("does not count an identifier that only appears inside a style block", () => {
    const inStyle =
      "<style>/* 대한민국정부 워드마크 자리 */ .x { color: red }</style>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: inStyle }),
      darkRaw: makeHtml({ theme: "dark", body: inStyle }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // Reproduces the historical miss: krds/light.html at b0d88f5 (pre-branch)
  // carried "공식 전자정부 누리집" captioned in the disclosure strip and
  // "대한민국정부" uncaptioned in the masthead, 458 chars away. A document-wide
  // presence check (`html.includes(DUMMY_CAPTION_CLASS)`) was already true
  // because of the first caption, so the rule stayed silent on the second,
  // uncaptioned identifier — exactly the case it exists to catch.
  it("blocks when one identifier is captioned and another is not", () => {
    const twoIdentifiersOneCaption =
      '<div class="gov-strip">이 누리집은 대한민국 공식 전자정부 누리집입니다.</div>' +
      '<p class="catalog-dummy">위 문장은 표시 예시입니다.</p>' +
      "<footer>대한민국정부 — 데모</footer>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body: twoIdentifiersOneCaption }),
      darkRaw: makeHtml({ theme: "dark", body: twoIdentifiersOneCaption }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  // The self-reference case: a caption's own prose names the identifier it is
  // labelling ("대한민국정부 워드마크는 표시 예시입니다."). Naive whole-document
  // counting sees 2 identifier occurrences (the wordmark itself + the mention
  // inside the caption) against 1 caption, and warns on a preview that is
  // already correctly captioned. The caption's inner text must be excluded
  // from the identifier count before comparing against the caption count.
  it("does not block when the caption's own prose names the identifier it labels", () => {
    const body =
      "<section>" +
      '<span class="wordmark">대한민국정부</span>' +
      '<p class="catalog-dummy">대한민국정부 워드마크는 표시 예시입니다.</p>' +
      "</section>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // The masthead seal (services/krds.md:236) is a 44×44 circular emblem
  // rendered as `<div class="seal" aria-hidden="true"><img … alt=""></div>` —
  // no text at all. None of the literal phrases can ever match it, so a
  // preview that renders the seal with zero captions produced
  // `govIdentifierCount === 0` and the guard never fired. `class="seal"` is a
  // structural signal that counts the emblem whether or not any text names it.
  it('counts the masthead seal via class="seal" even though it renders no identifying text', () => {
    const body =
      '<div class="seal" aria-hidden="true"><img src="/logos/demo.svg" alt=""></div>' +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  it("accepts a masthead seal captioned inside the same container", () => {
    const body =
      "<section>" +
      '<div class="seal" aria-hidden="true"><img src="/logos/demo.svg" alt=""></div>' +
      '<p class="catalog-dummy">정부상징 표시 예시입니다.</p>' +
      "</section>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain(
      "government-identifier-unlabelled"
    )
  })

  // A raw string literal `'class="seal"'` (the first form this rule used) only
  // matches that exact spelling — it misses a class list like `seal
  // brand-mark`. A regex over the raw attribute (`classAttrPattern`) fixed that
  // and was itself replaced by #214: the walk parses attributes, so the class
  // is a token in a list rather than a substring in a string, and quote style
  // stops being a variable at all. Three mechanisms, one behaviour — this must
  // block exactly like the plain `class="seal"` case above.
  it("counts a seal written as part of a class list the same as a bare seal class", () => {
    const body =
      '<div class="seal brand-mark" aria-hidden="true"><img src="/logos/demo.svg" alt=""></div>' +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  // The disclosure banner is a fixed, page-level notice present in all 34
  // previews and says nothing about government identifiers — it is not a
  // per-identifier label, and an identifier inside its own prose is as
  // unlabelled as one anywhere else. The counting rule had a version of this
  // bug for a different reason (it erased banner prose from the identifier side
  // while never counting the banner on the caption side, so the identifier
  // vanished from both); the structural rule cannot repeat that, because
  // `.catalog-disclaimer` is simply not one of the two classes that make a
  // label host. The fixture stays either way: this markup has no
  // `.catalog-dummy` anywhere, so the rule must block.
  it("blocks a government identifier that appears only inside the disclosure banner's own prose", () => {
    const disclaimerWithIdentifier =
      '<div class="catalog-disclaimer" role="note">이 카탈로그는 대한민국정부 누리집과 ' +
      "제휴·후원 관계가 없습니다. 표시된 정보는 레이아웃 시연용 더미 데이터입니다.</div>"
    const input = makeInput({
      lightRaw: makeHtml({ disclaimer: disclaimerWithIdentifier }),
      darkRaw: makeHtml({
        theme: "dark",
        disclaimer: disclaimerWithIdentifier,
      }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )
  })

  // This shipped as a warn on purpose: a block would have left the pipeline
  // unable to satisfy its own Stage 9a2 gate, because preview-html-author.md
  // said nothing about government identity and no author could fix what it had
  // never been told. Both halves of that transition are done — the prompt now
  // teaches the axis and `public/preview` is at zero occurrences — so the two
  // assertions live in one test. If the guidance is ever stripped back out of
  // the author, this fails here rather than silently on the next onboarding.
  it("blocks, and the author prompt it depends on teaches the axis", () => {
    const input = makeInput({
      lightRaw: makeHtml({ body: GOV_BODY }),
      darkRaw: makeHtml({ theme: "dark", body: GOV_BODY }),
    })
    expect(rulesOf(input, "block")).toContain(
      "government-identifier-unlabelled"
    )

    const author = readFileSync(
      join(process.cwd(), ".claude/agents/preview-html-author.md"),
      "utf8"
    )
    // The three literals the rule keys on, so the author can recognise them…
    expect(author).toContain("대한민국정부")
    expect(author).toContain("공식 전자정부 누리집")
    // …the containment requirement, which is the whole structural rule…
    expect(author).toContain("inside the same container as the identifier")
    // …and the exemption, or an author faced with a true attribution has no
    // move that is not a falsehood.
    expect(author).toContain('class="catalog-attribution"')
  })
})

describe("rights-reserved-claim", () => {
  // krds carried `© Ministry of the Interior and Safety, Republic of Korea. All
  // rights reserved.` in a footer this repository wrote. Bucket E removed it, so
  // public/preview is at zero — this rule exists to keep it there.
  it("blocks a reservation of rights in a brand's voice", () => {
    const body =
      "<footer>© Demo Ministry, Republic of Korea. All rights reserved.</footer>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain("rights-reserved-claim")
  })

  // The narrowness is the point. `bezier` credits `© Channel Corp.` beside
  // Apache-2.0 and the upstream repo — correct attribution, not a claim over
  // this file. A rule that fired on any `©` would demand deleting it.
  it("leaves an accurate third-party copyright credit alone", () => {
    const body =
      "<footer><p>Apache-2.0</p><p>© Demo Corp.</p><p>demo/demo-react</p></footer>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("rights-reserved-claim")
  })

  // Both evasions are idioms these files already use: `&nbsp;` is a separator in
  // greeting's own note prose, and `<b>` appears inside most cards' notes. A
  // footer written to avoid wrapping would take exactly this shape.
  it("sees through &nbsp; separators and inline markup", () => {
    for (const line of [
      "<footer>© Demo Corp. All&nbsp;rights&nbsp;reserved.</footer>",
      "<footer>© Demo Corp. All <b>rights reserved</b>.</footer>",
    ]) {
      const body = `${line}<main class="hero"><h1>데모</h1></main>`
      const input = makeInput({
        lightRaw: makeHtml({ body }),
        darkRaw: makeHtml({ theme: "dark", body }),
      })
      expect(rulesOf(input, "block")).toContain("rights-reserved-claim")
    }
  })

  // Font license headers carry the phrase as a matter of routine, and this rule
  // is `block` — a preview that inlines an @font-face would fail CI on its own
  // license comment. Neither <style> nor <script> content is rendered prose.
  it("ignores the phrase inside <style> and <script> bodies", () => {
    for (const block of [
      "<style>/* Demo Sans © Demo Foundry. All rights reserved. */</style>",
      '<script>const notice = "All rights reserved"</script>',
    ]) {
      const body = `${block}<main class="hero"><h1>데모</h1></main>`
      const input = makeInput({
        lightRaw: makeHtml({ body }),
        darkRaw: makeHtml({ theme: "dark", body }),
      })
      expect(rulesOf(input, "block")).not.toContain("rights-reserved-claim")
    }
  })

  // A comment warning future authors off the phrase must not itself trip the
  // rule — otherwise the only way to document the rule is to not document it.
  it("ignores the phrase inside an HTML comment", () => {
    const body =
      "<!-- 이 자리에 All rights reserved 를 쓰지 말 것 -->" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("rights-reserved-claim")
  })

  // The phrase is prose, not a prescribed literal, so casing and inter-word
  // spacing vary with whoever typed it.
  it("matches across casing and inter-word spacing", () => {
    const body =
      "<footer>ALL   RIGHTS\n  Reserved</footer>" +
      '<main class="hero"><h1>데모</h1></main>'
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain("rights-reserved-claim")
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
        // Single-quoted here too — this is the suite's only single-quote fixture,
        // so it is also what covers the disclosure regexes' `["']` handling.
        "<body><div class='catalog-disclaimer' role='note'>이 카탈로그는 어떤 브랜드와도 제휴·후원 관계가 없습니다. 표시된 정보는 레이아웃 시연용 더미 데이터입니다.</div><main><img src='/logos/demo.png' alt=''><h1>데모</h1></main></body>",
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

// ── 루브릭 조항 기계화 ────────────────────────────────────────────────────────

/** design.md with N typography tokens named scale1..scaleN. */
function makeScaleDesignMd(count: number): string {
  const rows = Array.from(
    { length: count },
    (_, i) => `scale${i + 1}: 1${i}px / 1.5`
  )
  return [
    "---",
    "name: 데모",
    "slug: demo",
    "category: finance",
    'last_updated: "2026-07-03"',
    "sources:",
    "  - https://example.com/a",
    "lang: ko",
    "logo: https://getdesign.kr/logos/demo.png",
    "---",
    "",
    "# 데모",
    "",
    "## Colors",
    "",
    "```yaml",
    "primary: oklch(0.62 0.18 250)",
    "```",
    "",
    "## Typography",
    "",
    "```yaml",
    ...rows,
    "```",
    "",
    "## Components",
    "",
    "버튼과 카드가 있다.",
  ].join("\n")
}

describe("validatePreviewPair — type-scale-showcase", () => {
  /** N rows, each naming `scale1`..`scaleN` in visible text. */
  function labelRows(n: number): string {
    return Array.from(
      { length: n },
      (_, i) => `<div class="row"><span>scale${i + 1}</span><p>본문</p></div>`
    ).join("")
  }

  it("blocks when the scale is enumerated (8 of 8 names)", () => {
    const body = `<main>${labelRows(8)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(8),
    })
    expect(rulesOf(input, "block")).toContain("type-scale-showcase")
  })

  it("allows a handful named in component context (6 of 22 names)", () => {
    // Mirrors the real catalog case this threshold was calibrated on: naming a
    // few scales where a component uses them is exactly what the rubric wants.
    const body = `<main>${labelRows(6)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(22),
    })
    expect(rulesOf(input, "block")).not.toContain("type-scale-showcase")
  })

  it("allows a small scale below the floor even at 100% (4 of 4 names)", () => {
    // The floor keeps a 4-token system from tripping on incidental mentions.
    const body = `<main>${labelRows(4)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(4),
    })
    expect(rulesOf(input, "block")).not.toContain("type-scale-showcase")
  })

  it("blocks a small scale that is fully enumerated at the floor (7 of 7)", () => {
    // Absolute-count thresholds miss this shape; the ratio catches it.
    const body = `<main>${labelRows(7)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(7),
    })
    expect(rulesOf(input, "block")).toContain("type-scale-showcase")
  })

  it("does not count a token name that only appears inside a longer word", () => {
    // `scale1` must not be found inside `scale10`, and a name mentioned only
    // in an attribute (not visible text) must not count either.
    const body =
      "<main>" +
      Array.from(
        { length: 8 },
        (_, i) => `<div data-token="scale${i + 1}">scale1${i}</div>`
      ).join("") +
      "</main>"
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(8),
    })
    expect(rulesOf(input, "block")).not.toContain("type-scale-showcase")
  })

  it("counts a name a Korean particle is attached to", () => {
    // Previews in this catalog are Korean prose, where `title1은 60px` is the
    // natural phrasing — not `title1 은`. Without Hangul in the trailing
    // boundary the rule goes blind to its own subject language, and a full
    // enumeration escapes on a particle.
    const body =
      "<main>" +
      Array.from(
        { length: 8 },
        (_, i) => `<p>scale${i + 1}은 본문에 쓰는 단계다.</p>`
      ).join("") +
      "</main>"
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
      designMdRaw: makeScaleDesignMd(8),
    })
    expect(rulesOf(input, "block")).toContain("type-scale-showcase")
  })
})

describe("validatePreviewPair — swatch-catalog", () => {
  /** N fill-only elements: inline background, no text of their own. */
  function fills(n: number, themeOnly?: "light" | "dark"): string {
    const attr = themeOnly ? ` data-theme-only="${themeOnly}"` : ""
    return Array.from(
      { length: n },
      (_, i) =>
        `<div class="sw"${attr}><div class="chip" style="background:oklch(0.6 0.1 ${i})"></div></div>`
    ).join("\n")
  }

  it("counts fills painted on void elements", () => {
    // A void element has no closing tag, so the paired-tag pattern never sees
    // it. Left unhandled that is a trivial bypass of the whole gate.
    const body = Array.from(
      { length: 24 },
      (_, i) => `<hr class="sw" style="background:oklch(0.6 0.1 ${i})">`
    ).join("\n")
    const input = makeInput({
      lightRaw: makeHtml({ body: `<main>${body}</main>` }),
      darkRaw: makeHtml({ theme: "dark", body: `<main>${body}</main>` }),
    })
    expect(rulesOf(input, "block")).toContain("swatch-catalog")
  })

  it("blocks at 24 or more fill-only elements", () => {
    const body = `<main>${fills(24)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain("swatch-catalog")
  })

  it("allows 23", () => {
    const body = `<main>${fills(23)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("swatch-catalog")
  })

  it("does not count an element that has text of its own", () => {
    const labelled = Array.from(
      { length: 30 },
      (_, i) =>
        `<div class="sw" style="background:oklch(0.6 0.1 ${i})">토큰 ${i}</div>`
    ).join("\n")
    const body = `<main>${labelled}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("swatch-catalog")
  })

  it("counts per rendered theme, not the sum, when both themes are inlined", () => {
    // A merged single-file preview carries both themes and hides one with CSS.
    // 12 shared + 12 light-only + 12 dark-only renders 24 per theme — over the
    // limit — while a naive total would say 36 and a per-theme count says 24.
    const over = `<main>${fills(12)}${fills(12, "light")}${fills(12, "dark")}</main>`
    const overInput = makeInput({
      lightRaw: makeHtml({ body: over }),
      darkRaw: makeHtml({ theme: "dark", body: over }),
    })
    expect(rulesOf(overInput, "block")).toContain("swatch-catalog")

    // 9 + 9 + 9 renders 18 per theme — under the limit — but totals 27, which
    // a naive count would wrongly block.
    const under = `<main>${fills(9)}${fills(9, "light")}${fills(9, "dark")}</main>`
    const underInput = makeInput({
      lightRaw: makeHtml({ body: under }),
      darkRaw: makeHtml({ theme: "dark", body: under }),
    })
    expect(rulesOf(underInput, "block")).not.toContain("swatch-catalog")
  })

  it("attributes each fill to its own data-theme-only ancestor, not a sibling's", () => {
    // Serializing a merged preview can put both themes' wrappers on one line.
    // Each fill belongs to the wrapper it sits inside, so 12 light + 12 dark
    // renders 12 per theme — pass.
    const mixedOneLine =
      Array.from(
        { length: 12 },
        (_, i) =>
          `<div data-theme-only="light"><div class="chip" style="background:oklch(0.6 0.1 ${i})"></div></div>`
      ).join("") +
      Array.from(
        { length: 12 },
        (_, i) =>
          `<div data-theme-only="dark"><div class="chip" style="background:oklch(0.6 0.1 ${i + 12})"></div></div>`
      ).join("")
    const body = `<main>${mixedOneLine}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("swatch-catalog")
  })

  // ── issue #222: the four escape paths of the old line-based scan ───────────
  // Each fixture flips the verdict. They are written before the fix so the
  // failures are visible in history — `git show` on the test commit reproduces
  // the old behaviour of every path.

  /** A single fill-only chip. */
  function chip(i: number): string {
    return `<div class="chip" style="background:oklch(0.6 0.1 ${i})"></div>`
  }

  it("counts a fill whose start tag is wrapped across lines", () => {
    // Path 1. A line-based scan cannot match an element whose open tag, style,
    // and close tag land on different lines, so it read 24 as 0 — a false pass:
    // the gate went green while the swatch catalogue rendered.
    const body = Array.from(
      { length: 24 },
      (_, i) =>
        `<div\n  class="chip"\n  style="background:oklch(0.6 0.1 ${i})"\n></div>`
    ).join("\n")
    const input = makeInput({
      lightRaw: makeHtml({ body: `<main>${body}</main>` }),
      darkRaw: makeHtml({ theme: "dark", body: `<main>${body}</main>` }),
    })
    expect(rulesOf(input, "block")).toContain("swatch-catalog")
  })

  it("does not over-count when a data-theme-only wrapper is wrapped across lines", () => {
    // Path 2, and the one that errs the other way. 9 shared + 9 light + 9 dark
    // renders 18 per theme and must pass, but splitting the wrapper attribute
    // from its fill broke attribution and read 27 — the false block that the
    // `shared + max` formula exists to prevent.
    const group = (n: number, theme?: "light" | "dark", offset = 0): string => {
      const attr = theme ? `\n  data-theme-only="${theme}"` : ""
      return Array.from(
        { length: n },
        (_, i) => `<div\n  class="sw"${attr}\n>\n${chip(i + offset)}\n</div>`
      ).join("\n")
    }
    const body = `<main>${group(9)}${group(9, "light", 9)}${group(9, "dark", 18)}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).not.toContain("swatch-catalog")
  })

  it("attributes a fill that follows a closed wrapper to no theme", () => {
    // Path 3. Six lines of light1 + shared1 + dark3 render shared 6 +
    // max(6, 18) = 24 and must block. The old scan never checked whether the
    // wrapper had already closed, so it bound each shared chip to the light
    // wrapper before it and read 18.
    const line = (i: number): string =>
      `<div data-theme-only="light">${chip(i)}</div>${chip(i + 100)}` +
      `<div data-theme-only="dark">${chip(i + 200)}${chip(i + 300)}${chip(i + 400)}</div>`
    const body = `<main>${Array.from({ length: 6 }, (_, i) => line(i)).join("\n")}</main>`
    const input = makeInput({
      lightRaw: makeHtml({ body }),
      darkRaw: makeHtml({ theme: "dark", body }),
    })
    expect(rulesOf(input, "block")).toContain("swatch-catalog")
  })

  it("counts both elements when the same tag nests on one line", () => {
    // Path 4, and the only one already live in a shipped file: bezier uses
    // `<span class="av" …><span class="ic" …>`. Non-greedy matching stopped at
    // the inner close tag, so the outer fill was never counted — bezier read 7
    // by scan and 12 by DOM. 12 nested pairs render 24 and must block.
    const body = Array.from(
      { length: 12 },
      (_, i) =>
        `<span class="av" style="background:oklch(0.6 0.1 ${i})">` +
        `<span class="ic" style="background:oklch(0.7 0.1 ${i})"></span></span>`
    ).join("")
    const input = makeInput({
      lightRaw: makeHtml({ body: `<main>${body}</main>` }),
      darkRaw: makeHtml({ theme: "dark", body: `<main>${body}</main>` }),
    })
    expect(rulesOf(input, "block")).toContain("swatch-catalog")
  })
})
