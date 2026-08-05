import { brotliCompressSync, constants } from "node:zlib"
import { buildDoc } from "./content-parser"
import { extractTokensFromMarkdown } from "./token-extractor"
import type { ValidationIssue } from "./draft-validator"

// Deterministic validator for preview HTML pairs — CODEGEN/CI ONLY. Encodes
// the mechanically checkable half of
// `.claude/skills/design-md/references/rubric-preview.md` (Item 1 structure
// checks and the static slices of Items 2-5). Rendering-dependent checks
// (actual overflow, visual dark adaptation) stay with the /design-md skill's
// Stage 12 dev-server sweep and the preview-html-reviewer subagent.

export interface PreviewValidationInput {
  slug: string
  lightRaw: string
  darkRaw: string
  // Byte sizes come from the caller (fs.stat) so the core stays fs-free.
  lightBytes: number
  darkBytes: number
  designMdRaw: string
  // Skill mode: the orchestrator's resolved site-relative logo paths. When
  // either is present the hero-logo check is a block, mirroring the Stage 10
  // deterministic grep. When both are absent (CI bulk mode) only the softer
  // logo-img-missing warn applies.
  expectedLogoSrc?: string
  expectedWordmarkSrc?: string
}

export interface CoverageMetric {
  matched: number
  total: number
}

export interface PreviewValidationResult {
  issues: Array<ValidationIssue>
  passed: boolean
  metrics: { light: CoverageMetric; dark: CoverageMetric }
}

const IFRAME_JS_SRC = "/preview/_runtime/iframe.js"
const TOKENS_CSS_HREF = "/preview/_runtime/tokens.css"

// 크기 게이트는 실제로 배포되는 형태(brotli)를 잰다. Vercel 이 프리뷰 HTML 을
// `content-encoding: br` 로 서빙하므로 raw 바이트는 전송 비용이 아니다 —
// bezier 는 raw 106 KiB 인데 실제 다운로드는 21 KiB 다.
//
// 이 단위가 게이트의 자체 문구("inline assets or duplicated markup have run
// away")와 실제로 일치한다: 반복 마크업은 압축돼 사라지고, base64 인라인
// 자산은 압축이 안 돼 그대로 남는다. 그리고 들여쓰기·가독성에 세금을 물리지
// 않는다 — 프리뷰는 사람이 읽고 고치는 산출물이고 prettier 대상이 아니다.
//
// q11 은 "호스트가 내보내는 정확한 바이트"의 약속이 아니라 결정론적 프록시다.
// 코퍼스 실측 분포: min 5.2 / p50 11.3 / max 19.4 KiB.
const BROTLI_QUALITY = 11
const BLOCK_BROTLI_BYTES = 40 * 1024
const WARN_BROTLI_BYTES = 24 * 1024
// raw 안전망. 압축이 잘 되는 폭주(생성 루프가 같은 마크업을 무한 반복하는
// 종류)는 brotli 기준을 통과하므로 별도로 막는다.
const BLOCK_RAW_BYTES = 256 * 1024

// design.md `## Typography` 토큰 이름이 프리뷰 본문에 텍스트 라벨로 몇 개
// 등장하는가. 스탠드얼론 타입 스케일 쇼케이스는 필연적으로 각 단계에 이름을
// 달기 때문에, 마크업 구조나 클래스명과 무관하게 그 형태를 잡는다.
// rubric-preview.md L34 의 기계화. 코퍼스 실측: greeting 22, 그 외 전부 0~1.
// 위반의 정체는 "스케일을 통째로 열거"하는 것이므로 본질적으로 비율 문제다.
// 절대 개수만으로는 타입 토큰이 7개인 시스템이 7개를 다 열거해도 통과하고,
// 22개인 시스템이 6개만 적용 맥락에서 언급해도 걸린다.
//
// 바닥(5)만으로는 작은 스케일을 보호하지 못한다 — 바닥 5·비율 0.5 조합에서는
// 타입 토큰이 10개 이하인 시스템이 이름 5개만 등장해도 즉시 block 된다.
// 카탈로그 17개 중 5개(gmarket 7·kyobobook 8·line-design-system 10·
// teamsparta 10·seed-design 10)가 이 구간에 있다. 그런데 이 브랜치의 전제
// 자체가 "컴포넌트 맥락에서 6개 안팎을 이름 붙이는 것"을 루브릭이 원한다는
// 것이다 — 정리된 그리팅 항목이 6개를 그대로 남긴 이유가 그것이고, 그
// 항목이 걸리지 않는 것은 순전히 분모가 22라서 27%에 머물기 때문이다.
// 비율을 0.7로 올리면 위 5개 항목의 거짓 block 여지가 사라지면서도 실측된
// 진짜 위반은 전부 유지된다 — 100%(8/8), 8분의8, 7분의7 모두 여전히 70%
// 이상이다. "맥락 속에서 몇 개만 이름 붙임"이 10개 스케일에서 block 구간에
// 들어오지 않게 하는 것이 0.7의 목적이다.
//
// 코퍼스 실측: 그리팅이 정리 전 22/22(100%)로 위반, 정리 후 6/22(27%)로
// 통과 — 남은 6개는 Line-height roles 카드의 논지와 컴포넌트 스펙이라
// 루브릭이 오히려 요구하는 적용 맥락이다. socar 1/18(6%), 나머지 15개는 0.
const TYPE_SCALE_LABEL_FLOOR = 5
const TYPE_SCALE_LABEL_RATIO = 0.7

// 인라인 background 를 칠하고 자기 텍스트가 없는 요소 — 오직 색을 보여주려고
// 존재하는 요소의 수. rubric-preview.md L23 의 기계화("component demo, not a
// swatch catalog"). 이 규칙이 실제로 보장하는 것은 "인라인 style= 로 칠한
// fill-only 요소가 적다"이지, 스와치 자체를 잡는 게 아니다 — 정규식이 인라인
// style= 속성만 읽으므로 클래스 기반 스와치 그리드(배경색을 CSS 클래스로
// 칠하는 경우)는 이 검사에 보이지 않는다.
// 코퍼스 실측(PR-1 정리 후): 최댓값은 여전히 greeting 18, 2위 bezier 7이다.
// 한도 24 까지 실제 여유는 6개(1.33배) — 정리 전 82/7의 12배 격차는 지금의
// 상태가 아니다.
const SWATCH_FILL_LIMIT = 24

// The disclosure strip has to be static markup: _runtime/iframe.js returns early
// when `window.parent === window`, so a standalone open, a screenshot, or a CC BY
// redistributed copy would get nothing injected at runtime.
const DISCLAIMER_CLASS = "catalog-disclaimer"
// The class value is matched as a whole token, not with \b — a hyphen is a
// non-word character, so \b would also match inside `page-catalog-disclaimer`.
function classAttrPattern(cls: string): string {
  return `class=["'](?:[^"']*\\s)?${cls}(?:\\s[^"']*)?["']`
}
const DISCLAIMER_CLASS_ATTR = classAttrPattern(DISCLAIMER_CLASS)
const DISCLAIMER_PRESENT = new RegExp(DISCLAIMER_CLASS_ATTR, "i")
// Position is load-bearing, not cosmetic: the strip has to land in the first
// screen and in the hero crop that screenshots usually take. A strip anywhere
// else satisfies the letter of the rule and none of its purpose, so presence
// and placement are separate findings with separate fixes.
// `(?:\s|<!--[\s\S]*?-->)*` rather than `\s*`: an HTML comment between <body>
// and the strip is still a strip-first document, and flagging it as misplaced
// would be a false positive on markup that is doing nothing wrong.
const DISCLAIMER_FIRST_CHILD = new RegExp(
  `<body\\b[^>]*>(?:\\s|<!--[\\s\\S]*?-->)*<[a-z][a-z0-9]*\\b[^>]*${DISCLAIMER_CLASS_ATTR}`,
  "i"
)
// Captures the strip's own inner HTML (group 2) so the wording below is checked
// *inside it* rather than anywhere in the document. That distinction matters:
// five previews carry .catalog-dummy captions that also say "더미 데이터", so a
// document-wide search would keep passing after the sentence is deleted from the
// strip itself. Non-greedy up to the matching close tag — the strip nests only
// inline markup, and a nested same-tag element would truncate the capture and
// warn, which is the safe direction.
const DISCLAIMER_ELEMENT = new RegExp(
  `<([a-z][a-z0-9]*)\\b[^>]*${DISCLAIMER_CLASS_ATTR}[^>]*>([\\s\\S]*?)</\\1>`,
  "i"
)
// Two sentences carrying two different jobs, so they are checked separately —
// matching the whole paragraph would freeze every word, and matching only the
// class would pass an empty strip.
//   부정경쟁방지법 제2조 제1호 나목 (영업주체 혼동) — same sentence as the site
//   footer, pinned there by src/lib/license-notice-consistency.test.ts.
const DISCLAIMER_NON_AFFILIATION = "제휴·후원 관계가 없습니다"
//   형법 제313·314조 / 제307조 제2항 — all require 허위의 사실.
const DISCLAIMER_DUMMY_DATA = "더미 데이터"

// A preview may legitimately render a government identifier — KRDS documents the
// seal and the official-site strip as components (services/krds.md:236, :331), and
// removing them would stop the preview demonstrating what it exists to show. What
// it must not do is render one with nothing saying it is a display sample: the
// same file is a standalone, indexable page that a non-government site hosts.
// Kept to a few high-signal literals so this does not fire on ordinary prose.
// The check below counts occurrences rather than testing presence, and does not
// use a distance threshold either. Presence was tried first and measured to fail:
// krds/light.html at b0d88f5 (pre-branch) had 3 identifier occurrences and only 1
// `.catalog-dummy` caption — the masthead's "대한민국정부" sat 458 chars from its
// nearest caption with nothing labelling it — but `html.includes(DUMMY_CAPTION_CLASS)`
// was already true because of an unrelated caption elsewhere, so the rule stayed
// silent on the exact state it exists to catch. A distance threshold was measured
// and rejected too: tight enough to catch that 458-char gap, it also fires on the
// current, correct state's footer heading ("대한민국정부 — KRDS"), whose nearest
// caption is 8,406 chars away — a false positive the catalog cannot satisfy.
// Counting sidesteps both — but the count itself has two more failure modes,
// both measured against krds/light.html:
//   1. Caption prose that names its own subject inflates the numerator. A
//      caption reading "정부상징과 워드마크는 … 표시 예시입니다" contains the
//      literal "정부상징", so a whole-document count treats the caption as
//      both a label and a second thing needing a label — self-referential and
//      literally uncatchable, since the literal can never be captioned enough
//      to satisfy itself. Fix: strip every `.catalog-dummy` element's
//      content out of the haystack (see `stripCaptionProse`) before counting
//      identifiers; count captions on the untouched html as before. Only
//      `.catalog-dummy` — the denominator counts only that class, so
//      stripping `.catalog-disclaimer` too would make the two sides mean
//      different things; `stripCaptionProse`'s own comment has the detail.
//   2. The masthead seal (`<div class="seal" aria-hidden="true"><img … alt="">
//      </div>`, services/krds.md:236) carries no text at all, so none of the
//      three phrase literals can ever match it — a preview rendering the seal
//      with zero captions produced govIdentifierCount === 0 and the guard
//      never fired. Fix: `class="seal"` is a structural (non-text) signal,
//      counted separately from the text literals so the emblem is counted
//      whether or not any prose names it. A raw string `'class="seal"'` was
//      tried first and rejected: it matches only that exact spelling, missing
//      `class="seal brand-mark"` (class list) and `class='seal'` (single
//      quotes). `classAttrPattern` — already used below for DISCLAIMER_CLASS —
//      matches the class as a whole token in any position and with either
//      quote style, so it is reused here instead.
// Re-derived with both fixes applied: krds/light.html at b0d88f5 (pre-branch)
// has 4 identifier occurrences outside caption prose against 1 caption (warns,
// as it must); at HEAD it has 4 against 7 (captions >= identifiers, no warn).
const GOVERNMENT_IDENTIFIER_TEXT = [
  "공식 전자정부 누리집",
  "대한민국정부",
  "정부상징",
]
// Structural (non-text) signals — matched as a regex rather than a literal
// string precisely so class-list and quote-style variants still count.
const GOVERNMENT_IDENTIFIER_PATTERNS = [
  new RegExp(classAttrPattern("seal"), "g"),
]
const DUMMY_CAPTION_CLASS = "catalog-dummy"

// Deliberately narrower than "any ©". A copyright line can be exactly right:
// `bezier` credits `© Channel Corp.` beside Apache-2.0 and the upstream repo, and
// `line-design-system` renders one inside the app-footer component it is
// demonstrating — the copyright slot *is* the thing on display. What cannot be
// right in a file this catalog authored is the active reservation of rights in
// someone else's voice, so that phrase alone is the trigger.
//
// It matches the phrase, not the assertion — rendered prose that *negates* it
// ("원본에는 All rights reserved 문구가 없다") blocks too, and the message will
// read as a non sequitur there. Put that observation in the design.md or a
// comment instead; neither is scanned.
const RIGHTS_RESERVED = /all\s+rights\s+reserved/i

// The phrase is prose, not a literal the pipeline prescribes, so it survives being
// broken up the way prose is: `All&nbsp;rights&nbsp;reserved` (the natural way to
// keep a footer credit from wrapping — `&nbsp;` is already a separator in these
// files) and `All <b>rights reserved</b>` both slip past a raw-source regex.
// Dropping comments also means a note *about* this rule doesn't trip it.
// `<style>`/`<script>` bodies must go before tags are stripped, or their contents
// survive as text. That is a false-block waiting to happen at `block` severity:
// font license headers carry `All rights reserved` as a matter of routine, and a
// preview that inlines an `@font-face` would ship one in a CSS comment.
function visibleText(html: string): string {
  return html
    .replace(/<(style|script)\b[^>]*>[\s\S]*?<\/\1>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;|&#160;|&#xa0;/gi, " ")
    .replace(/\s+/g, " ")
}

function bodyOf(html: string): string {
  return html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html
}

// 병합 단일 파일은 양 테마의 fill 을 둘 다 싣고 한쪽을 CSS 로 숨긴다. 단순
// 합계로 세면 규칙을 지킨 파일이 두 배로 세어져 자기 자신을 block 하므로,
// "한 테마가 실제로 렌더하는 수"로 정의한다.
//
// 줄 단위 귀속이 DOM 순회와 같은 답을 내는 것은, `data-theme-only` 요소가
// 자기완결 균형 줄(여는 태그·내용·닫는 태그가 한 줄 안에서 끝남)이라는
// 불변식이 성립하는 동안만이다 — 이 저장소 안에는 그것을 강제하는 장치가
// 없고, 그 확인은 실제 그리팅 파일에서 getComputedStyle 기반 측정과
// 대조해 리포지토리 밖에서 한 번 검증한 것이다. 각 fill 을 그 앞의 가장
// 가까운 data-theme-only 에 귀속하므로 한 줄에 양 태그 혼재시 각각의
// 태그에 올바르게 배정된다.
//
// 이 불변식이 깨지는 경우: 앞으로 어떤 생성기가 `data-theme-only` 요소를
// 여러 줄에 걸친 래퍼로 내보내면, 그 attribute가 달린 줄과 실제 fill 이
// 등장하는 줄이 갈라진다. `beforeFill`(같은 줄 안에서만 앞쪽을 본다)에는
// 그 data-theme-only 가 잡히지 않으므로 fill 이 `shared` 로 새어 들어가고,
// 규칙을 지킨 병합 파일이 18이 아니라 27로 세어져 — 바로 이 공식이 막으려던
// 거짓 block 이 재현된다.
//
// 같은 줄에 같은 태그가 중첩된 경우 non-greedy 매칭이 첫 닫는 태그에서
// 끊겨 내부 텍스트를 보게 되므로 그 요소는 세지 않는다. 과소 계수 방향이라
// 오탐(정상 파일을 block)을 만들지 않는 안전한 쪽이다.
//
// 같은 이유로 **fill 요소 자체가 여러 줄에 걸치면 아예 보이지 않는다** —
// 위 불변식은 `data-theme-only` 귀속에 관한 것이고, 이건 그보다 한 층 앞의
// 문제다. 여는 태그·style·닫는 태그가 줄바꿈으로 갈리면 한 줄 안에서 매칭이
// 성립하지 않아 그 요소는 계수에서 통째로 빠진다. 속성을 줄바꿈해 쓴 스와치
// 그리드 30개를 넣어 실측하면 30 이 아니라 0 이 나온다.
//
// 방향이 반대라는 점에 주의: 귀속 실패는 과다 계수(거짓 block)였지만 이건
// 과소 계수, 즉 **거짓 통과**다. 정상 파일을 막지는 않으므로 게이트로서는
// 안전하지만 규칙의 목적은 무력해진다. 현재 34개 프리뷰가 전부 "한 줄 =
// 한 엘리먼트"로 생성돼 있어 지금은 문제가 되지 않으나, 이를 강제하는 장치는
// 없다. 게이트가 통과했는데 스와치가 눈에 보인다면 여기를 먼저 의심할 것.
function swatchFillCount(html: string): number {
  let shared = 0
  let light = 0
  let dark = 0
  for (const line of bodyOf(html).split("\n")) {
    const fillMatches = [
      ...line.matchAll(
        /<([a-z][a-z0-9]*)\b[^>]*\sstyle=["'][^"']*background[^"']*["'][^>]*>([\s\S]*?)<\/\1>/gi
      ),
    ]

    for (const m of fillMatches) {
      // Check if this is a fill-only element (no text)
      if (m[2].replace(/<[^>]*>/g, "").trim() !== "") continue

      // Find the nearest preceding data-theme-only attribute by looking
      // at text before this fill on the line
      const beforeFill = line.substring(0, m.index)
      const themeMatches = [
        ...beforeFill.matchAll(/data-theme-only=["'](light|dark)["']/g),
      ]
      const theme =
        themeMatches.length > 0
          ? themeMatches[themeMatches.length - 1][1]
          : null

      if (theme === "light") light++
      else if (theme === "dark") dark++
      else shared++
    }
  }
  return shared + Math.max(light, dark)
}

// 이름이 "단독 라벨"로 등장한 경우만 센다. 앞뒤를 공백이나 구두점으로 묶어
// `scale1` 이 `scale10` 안에서 매칭되는 것을 막는다. visibleText 가 태그를
// 공백으로 치환하므로 태그 경계도 자연히 경계로 잡히고, 속성값은 제거된다.
function labelledTokenNames(html: string, names: Array<string>): number {
  const text = visibleText(bodyOf(html))
  let found = 0
  for (const raw of new Set(names)) {
    const name = raw.trim()
    if (name.length < 2) continue
    const re = new RegExp(
      `(?:^|[\\s(·|,/])${escapeRegExp(name)}(?:$|[\\s)·|,/:])`,
      "u"
    )
    if (re.test(text)) found++
  }
  return found
}

// Same dedup as `labelledTokenNames`'s numerator — a design.md that declares a
// typography token name twice must not deflate the ratio by counting it twice
// in the denominator while the numerator (a Set) counts it once.
function uniqueTokenNameCount(names: Array<string>): number {
  return new Set(names.map((n) => n.trim())).size
}

// Strips the inner content of every `.catalog-dummy` element so caption prose
// that happens to name a government identifier (e.g. "대한민국정부 워드마크는
// 표시 예시입니다.") does not count as an unlabelled occurrence of the thing it
// is labelling. Global, non-greedy up to the matching close tag, mirroring
// DISCLAIMER_ELEMENT's approach — a nested same-tag element would truncate
// the match and leave a partial caption behind, which only shrinks the
// stripped region rather than growing it, so it is the safe direction here
// too.
//
// `.catalog-disclaimer` is deliberately NOT stripped here, even though it is
// prose too. The denominator this numerator is compared against —
// `countOccurrences(html, DUMMY_CAPTION_CLASS)` below — only ever counts
// `.catalog-dummy`, because that is the per-block label this rule is about.
// The disclosure banner is a fixed, page-level notice present in all 34
// previews and says nothing about government identifiers; treating it as a
// per-identifier label on either side of the comparison would be wrong in
// opposite ways — counting it in the denominator would hand every page a
// free caption regardless of content, and stripping it from the numerator
// (the prior behavior) hides identifiers it never actually labelled. Only
// `.catalog-dummy` is stripped, so both sides of the comparison mean the same
// thing.
function stripCaptionProse(html: string): string {
  const pattern = new RegExp(
    `<([a-z][a-z0-9]*)\\b[^>]*${classAttrPattern(DUMMY_CAPTION_CLASS)}[^>]*>[\\s\\S]*?</\\1>`,
    "gi"
  )
  return html.replace(pattern, "")
}

function block(rule: string, section: string, fix: string): ValidationIssue {
  return { severity: "block", rule, section, fix }
}

function warn(rule: string, section: string, fix: string): ValidationIssue {
  return { severity: "warn", rule, section, fix }
}

// Non-overlapping occurrence count of a literal substring. All call sites pass
// fixed Korean phrases/class names that don't self-overlap, so split-based
// counting is exact for this use, not just an approximation.
function countOccurrences(haystack: string, needle: string): number {
  if (needle.length === 0) return 0
  return haystack.split(needle).length - 1
}

function brotliBytes(html: string): number {
  return brotliCompressSync(Buffer.from(html, "utf8"), {
    params: { [constants.BROTLI_PARAM_QUALITY]: BROTLI_QUALITY },
  }).length
}

// ── CSS segmentation (comment-stripped, depth-tracked) ───────────────────────

interface CssRule {
  selector: string
  declarations: string
  inMedia: boolean
}

function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, " ")
}

// Minimal rule splitter: enough to attribute `grid-template-columns`
// declarations to selectors inside vs outside @media blocks. Conditional
// group rules (@media/@supports/@container) recurse; other at-rules
// (@font-face, @keyframes) are skipped wholesale.
function parseCssRules(css: string, inMedia = false): Array<CssRule> {
  const out: Array<CssRule> = []
  let i = 0
  while (i < css.length) {
    const open = css.indexOf("{", i)
    if (open === -1) break
    const selector = css.slice(i, open).trim()
    let depth = 1
    let j = open + 1
    // Braces inside string literals (`content: "{"`, data URIs) must not
    // distort the depth count — otherwise one such declaration swallows every
    // later rule (including @media collapse redeclarations) into this rule.
    let inString: '"' | "'" | null = null
    while (j < css.length && depth > 0) {
      const ch = css[j]
      if (inString) {
        if (ch === inString && css[j - 1] !== "\\") inString = null
      } else if (ch === '"' || ch === "'") {
        inString = ch
      } else if (ch === "{") {
        depth++
      } else if (ch === "}") {
        depth--
      }
      j++
    }
    const inner = css.slice(open + 1, j - 1)
    if (/^@(media|supports|container)\b/.test(selector)) {
      out.push(...parseCssRules(inner, true))
    } else if (!selector.startsWith("@")) {
      out.push({ selector, declarations: inner, inMedia })
    }
    i = j
  }
  return out
}

function styleContent(html: string): string {
  return [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)]
    .map((m) => m[1])
    .join("\n")
}

// Track counting for `grid-template-columns` values. `repeat(auto-fill|fit,…)`
// self-collapses, so it never counts as a fixed multi-column layout. Numeric
// repeat() expands into its full track list so mixed values
// (`repeat(1, minmax(0,1fr)) minmax(0,1fr)`) count correctly.
function countTracks(value: string): number {
  let v = value.trim()
  if (/repeat\(\s*(auto-fill|auto-fit)/.test(v)) return 1
  v = v.replace(/minmax\([^)]*\)/g, "T")
  v = v.replace(
    /repeat\(\s*(\d+)\s*,([^)]*)\)/g,
    (_, n: string, body: string) => {
      const perRepeat = body.trim().split(/\s+/).filter(Boolean).length || 1
      return Array<string>(Number(n) * perRepeat)
        .fill("T")
        .join(" ")
    }
  )
  return v.split(/\s+/).filter(Boolean).length
}

interface FileScan {
  bareOneFr: number
  uncollapsedSelectors: Array<string>
}

function scanCss(css: string): FileScan {
  const rules = parseCssRules(stripCssComments(css))
  let bareOneFr = 0
  const multiColRoot = new Map<string, string>()
  const mediaRedeclared = new Set<string>()

  for (const rule of rules) {
    // A rule's selector may be a grouped list (`.two-up, .comp-grid`) — the
    // collapse bookkeeping must work per individual selector.
    const selectors = rule.selector.split(/\s*,\s*/).filter(Boolean)
    for (const decl of rule.declarations.matchAll(
      /grid-template-columns\s*:\s*([^;]+)/g
    )) {
      const value = decl[1]
      const bare = value.replace(/minmax\([^)]*\)/g, "")
      if (/\b1fr\b/.test(bare)) bareOneFr++
      if (rule.inMedia) {
        for (const sel of selectors) mediaRedeclared.add(sel)
      } else if (countTracks(value) >= 2) {
        for (const sel of selectors) multiColRoot.set(sel, value.trim())
      }
    }
  }

  const uncollapsedSelectors = [...multiColRoot.keys()].filter(
    (sel) => !mediaRedeclared.has(sel)
  )
  return { bareOneFr, uncollapsedSelectors }
}

// ── color hygiene ────────────────────────────────────────────────────────────

const ACHROMATIC_HEX = new Set(["#fff", "#ffffff", "#000", "#000000"])

// Color hygiene scans only CSS-bearing surfaces: <style> blocks plus
// style/fill/stroke attributes. Display text may legitimately QUOTE a hex
// (bezier's hero copy and stat cards show "#6157ea" as content, mirroring the
// design.md prose-provenance convention), and ids/anchors must never match.
function cssSurfaces(html: string): string {
  // The attribute name must follow whitespace or a quote — a bare \b would
  // also match hyphenated attributes (`data-style=`), since a hyphen is a
  // non-word character. The value runs lazily to the SAME quote that opened
  // it (backreference) so nested quotes (`url('…')` inside a double-quoted
  // style) don't cut the capture short and let later hex values escape.
  const attrValues = [
    ...html.matchAll(/[\s"'](?:style|fill|stroke)=(["'])(.*?)\1/gi),
  ]
    .map((m) => m[2])
    .join("\n")
  return `${styleContent(html)}\n${attrValues}`
}

function chromaticHexValues(css: string): Array<string> {
  const found = new Set<string>()
  for (const m of css.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
    const v = m[0].toLowerCase()
    if (!ACHROMATIC_HEX.has(v)) found.add(v)
  }
  return [...found]
}

function chromaticRgbaValues(css: string): Array<string> {
  const found = new Set<string>()
  for (const m of css.matchAll(
    /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)[^)]*\)/g
  )) {
    const [r, g, b] = [m[1], m[2], m[3]].map(Number)
    const achromatic =
      (r === 0 && g === 0 && b === 0) || (r === 255 && g === 255 && b === 255)
    if (!achromatic) found.add(m[0].replace(/\s+/g, ""))
  }
  return [...found]
}

// ── quote-agnostic attribute matching ────────────────────────────────────────
// Generated previews use double quotes, but hand-authored entries
// (CONTRIBUTING allows them) may use single quotes — block-level rules must
// not false-positive on quote style.

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function hasAttrValue(
  html: string,
  attr: "href" | "src",
  value: string
): boolean {
  // `[\s"']` (not \b) so `data-src=` / `data-href=` can never satisfy the
  // check — a hyphen is a non-word character, so \b matches inside them.
  return new RegExp(`[\\s"']${attr}=["']${escapeRegExp(value)}["']`).test(html)
}

// ── design.md helpers ────────────────────────────────────────────────────────

function findFontDisplaySrc(body: string): string | null {
  let inTypography = false
  let inYaml = false
  for (const line of body.split(/\r?\n/)) {
    const h2 = line.match(/^##\s+(.+?)\s*$/)
    if (h2) {
      inTypography = h2[1] === "Typography"
      inYaml = false
      continue
    }
    if (!inTypography) continue
    if (/^\s*```/.test(line)) {
      inYaml = !inYaml
      continue
    }
    const m = line.match(/^\s*font-display-src:\s+(\S+)/)
    if (m) return m[1]
  }
  return null
}

function coverage(html: string, values: Array<string>): CoverageMetric {
  const haystack = html.replace(/\s+/g, " ")
  const matched = values.filter((v) => haystack.includes(v)).length
  return { matched, total: values.length }
}

// ── per-file checks ──────────────────────────────────────────────────────────

function checkFile(
  name: "light.html" | "dark.html",
  html: string,
  bytes: number,
  expectedTheme: "light" | "dark",
  expectedLang: string,
  heroSrc: string | undefined,
  typographyNames: Array<string>,
  issues: Array<ValidationIssue>
): void {
  const theme = html.match(/<html\b[^>]*\sdata-theme=["']([^"']*)["']/)?.[1]
  if (theme !== expectedTheme) {
    issues.push(
      block(
        "data-theme-mismatch",
        name,
        `<html data-theme="${theme ?? "(none)"}"> must be "${expectedTheme}" in ${name}.`
      )
    )
  }
  // \s (not \b) so `xml:lang=` / `data-lang=` never shadow the real lang.
  const lang = html.match(/<html\b[^>]*\slang=["']([^"']*)["']/)?.[1]
  if (lang !== expectedLang) {
    issues.push(
      block(
        "lang-mismatch",
        name,
        `<html lang="${lang ?? "(none)"}"> must match the design.md lang "${expectedLang}".`
      )
    )
  }
  if (!hasAttrValue(html, "href", TOKENS_CSS_HREF)) {
    issues.push(
      block(
        "missing-tokens-css",
        name,
        `${name} must load the shared runtime via <link rel="stylesheet" href="${TOKENS_CSS_HREF}"> (absolute path).`
      )
    )
  }
  const scriptSrcs = [
    ...html.matchAll(/<script\b[^>]*\ssrc=["']([^"']*)["'][^>]*>/gi),
  ]
  const iframeTag = scriptSrcs.find((m) => m[1] === IFRAME_JS_SRC)
  if (!iframeTag) {
    issues.push(
      block(
        "missing-iframe-js",
        name,
        `${name} must load <script src="${IFRAME_JS_SRC}" defer></script> for the height-messaging contract.`
      )
    )
  } else if (!/\bdefer\b/.test(iframeTag[0])) {
    issues.push(
      warn(
        "iframe-js-defer",
        name,
        `${name} loads iframe.js without \`defer\` — add it so the script never blocks parsing.`
      )
    )
  }
  for (const m of scriptSrcs) {
    if (m[1] !== IFRAME_JS_SRC) {
      issues.push(
        block(
          "foreign-script",
          name,
          `${name} loads a script other than the shared runtime: \`${m[1]}\`. Previews must stay self-contained (no frameworks, no per-slug runtime copies).`
        )
      )
    }
  }
  if (bytes > BLOCK_RAW_BYTES) {
    issues.push(
      block(
        "file-too-large-raw",
        name,
        `${name} is ${Math.round(bytes / 1024)}KB raw (> ${BLOCK_RAW_BYTES / 1024}KB) — generated markup has run away. Compressed size is not the issue here; the source itself is unreviewable.`
      )
    )
  }
  const wire = brotliBytes(html)
  if (wire > BLOCK_BROTLI_BYTES) {
    issues.push(
      block(
        "file-too-large",
        name,
        `${name} compresses to ${Math.round(wire / 1024)}KB brotli (> ${BLOCK_BROTLI_BYTES / 1024}KB hard cap) — inline assets have run away. Repetitive markup compresses away, so this size means real payload.`
      )
    )
  } else if (wire > WARN_BROTLI_BYTES) {
    issues.push(
      warn(
        "file-size-budget",
        name,
        `${name} compresses to ${Math.round(wire / 1024)}KB brotli (> ${WARN_BROTLI_BYTES / 1024}KB budget) — consider trimming showcase markup.`
      )
    )
  }
  const surfaces = cssSurfaces(html)
  const hex = chromaticHexValues(surfaces)
  if (hex.length > 0) {
    issues.push(
      warn(
        "hex-colors-present",
        name,
        `${name} carries ${hex.length} chromatic hex value(s) (${hex.slice(0, 5).join(", ")}${hex.length > 5 ? ", …" : ""}) — brand colors must be the design.md OKLCH values.`
      )
    )
  }
  const rgba = chromaticRgbaValues(surfaces)
  if (rgba.length > 0) {
    issues.push(
      warn(
        "rgba-colors-present",
        name,
        `${name} carries ${rgba.length} chromatic rgb/rgba value(s) (${rgba.slice(0, 5).join(", ")}${rgba.length > 5 ? ", …" : ""}) — express chromatic colors in OKLCH (achromatic shadow alphas are fine).`
      )
    )
  }
  if (heroSrc && !hasAttrValue(html, "src", heroSrc)) {
    issues.push(
      block(
        "hero-logo-missing",
        name,
        `${name} must render the hero logo <img src="${heroSrc}"> (site-relative form, both themes).`
      )
    )
  }

  const scaleLabels = labelledTokenNames(html, typographyNames)
  const scaleTotal = uniqueTokenNameCount(typographyNames)
  const scaleShare = scaleTotal ? scaleLabels / scaleTotal : 0
  if (
    scaleLabels >= TYPE_SCALE_LABEL_FLOOR &&
    scaleShare >= TYPE_SCALE_LABEL_RATIO
  ) {
    issues.push(
      block(
        "type-scale-showcase",
        name,
        `${name} prints ${scaleLabels} of the design.md's ${scaleTotal} typography token names as text labels (${Math.round(scaleShare * 100)}% — limit is ${TYPE_SCALE_LABEL_RATIO * 100}% once ${TYPE_SCALE_LABEL_FLOOR} names appear) — rubric-preview.md forbids a standalone type-scale showcase; the documented scale lives in {slug}.tokens.json. Naming a few scales in component context is fine; enumerating the scale is not.`
      )
    )
  }

  const swatchFills = swatchFillCount(html)
  if (swatchFills >= SWATCH_FILL_LIMIT) {
    issues.push(
      block(
        "swatch-catalog",
        name,
        `${name} renders ${swatchFills} fill-only elements per theme (limit ${SWATCH_FILL_LIMIT}) — rubric-preview.md says the preview is a component demo, not a swatch catalog. The ramp catalogue belongs in {slug}.tokens.json; show colours applied to components instead.`
      )
    )
  }

  // `block`, matching the sibling structural rules (missing-tokens-css,
  // missing-iframe-js, hero-logo-missing). D-1 shipped these at `warn` only as a
  // transition: promoting before .claude/agents/preview-html-author.md taught the
  // strip would have left the pipeline unable to satisfy its own Stage 9a2 gate.
  // That file now carries the verbatim strip and its halt conditions, so the
  // false-positive rate is zero and the fix is mechanical.
  if (!DISCLAIMER_PRESENT.test(html)) {
    issues.push(
      block(
        "missing-disclaimer-banner",
        name,
        `${name} must open <body> with <div class="${DISCLAIMER_CLASS}" role="note">…</div> — iframe.js cannot inject it into a standalone or redistributed copy.`
      )
    )
  } else {
    if (!DISCLAIMER_FIRST_CHILD.test(html)) {
      issues.push(
        block(
          "disclaimer-banner-misplaced",
          name,
          `${name} has a .${DISCLAIMER_CLASS} strip but it is not the first child of <body> — move it there so it lands in the first screen and in the hero crop a screenshot takes.`
        )
      )
    }
    // Only Korean previews are held to the Korean wording; `lang: en` is a valid
    // pipeline output and must not be forced into Korean prose.
    if (lang === "ko") {
      const strip = html.match(DISCLAIMER_ELEMENT)?.[2] ?? ""
      const missing = [
        DISCLAIMER_NON_AFFILIATION,
        DISCLAIMER_DUMMY_DATA,
      ].filter((phrase) => !strip.includes(phrase))
      if (missing.length > 0) {
        // Separate rule from `missing-disclaimer-banner`, for the same reason
        // `disclaimer-banner-misplaced` is separate: "there is no strip" and
        // "the strip lost a sentence" are different fixes, and a consumer
        // filtering by rule name should not have to parse the message to tell
        // them apart.
        issues.push(
          block(
            "disclaimer-banner-incomplete",
            name,
            `${name} has a .${DISCLAIMER_CLASS} strip but is missing ${missing.map((p) => `"${p}"`).join(" and ")} — the non-affiliation and dummy-data sentences each carry a separate claim and both must survive edits.`
          )
        )
      }
    }
  }

  const identifierHaystack = stripCaptionProse(html)
  const govIdentifierCount =
    GOVERNMENT_IDENTIFIER_TEXT.reduce(
      (sum, term) => sum + countOccurrences(identifierHaystack, term),
      0
    ) +
    GOVERNMENT_IDENTIFIER_PATTERNS.reduce(
      (sum, pattern) => sum + (identifierHaystack.match(pattern) ?? []).length,
      0
    )
  const dummyCaptionCount = countOccurrences(html, DUMMY_CAPTION_CLASS)
  if (govIdentifierCount > 0 && dummyCaptionCount < govIdentifierCount) {
    issues.push(
      warn(
        "government-identifier-unlabelled",
        name,
        `${name} renders ${govIdentifierCount} government identifier occurrence(s) but only ${dummyCaptionCount} .${DUMMY_CAPTION_CLASS} caption(s) — at least one is uncaptioned, and a standalone, indexable copy of this file would read as an official government page.`
      )
    )
  }

  // `block` on the first pass, unlike `missing-disclaimer-banner` (D-1) and
  // `government-identifier-unlabelled` (E), which both shipped at `warn` first.
  // Those two needed a transition because existing files violated them and the
  // author prompt did not yet teach the axis. Neither holds here: bucket E
  // removed the last occurrence, so `public/preview` is at zero, and the
  // pipeline has never prescribed this phrase — no author can emit it and then
  // be unable to fix itself against a Stage 9a2 block.
  //
  // No `.catalog-dummy` exemption, unlike the government-identifier rule above.
  // That rule asks "is this identifier labelled?", so a caption answers it. This
  // one asks something a label cannot answer: bucket E's finding was that the
  // phrase is wrong in a file this catalog wrote *regardless* of how it is
  // framed, because the reservation is asserted in a brand's voice either way.
  // The fix is to rewrite it, and the message below says which way.
  if (RIGHTS_RESERVED.test(visibleText(html))) {
    issues.push(
      block(
        "rights-reserved-claim",
        name,
        `${name} contains "All rights reserved" — this catalog authored the markup, so a reservation of rights in a brand's voice cannot be accurate here. Name who publishes the design system instead.`
      )
    )
  }

  const scan = scanCss(styleContent(html))
  if (scan.bareOneFr > 0) {
    issues.push(
      warn(
        "bare-1fr",
        name,
        `${name} has ${scan.bareOneFr} bare \`1fr\` grid track(s) — prefer \`minmax(0, 1fr)\` so a wide child can't floor the track at min-content and overflow.`
      )
    )
  }
  if (scan.uncollapsedSelectors.length > 0) {
    const list = scan.uncollapsedSelectors.slice(0, 5).join(", ")
    issues.push(
      warn(
        "no-mobile-collapse",
        name,
        `${name} has multi-column grid(s) with no @media grid-template-columns redeclaration: ${list} — add a mobile collapse rule.`
      )
    )
  }
}

// ── entry point ──────────────────────────────────────────────────────────────

export function validatePreviewPair(
  input: PreviewValidationInput
): PreviewValidationResult {
  const issues: Array<ValidationIssue> = []

  let expectedLang = "ko"
  let mdLogo: string | undefined
  let colorValues: Array<string> = []
  let typographyNames: Array<string> = []
  let fontDisplaySrc: string | null = null
  try {
    const doc = buildDoc(`/services/${input.slug}.md`, input.designMdRaw)
    expectedLang = doc.frontmatter.lang
    mdLogo = doc.frontmatter.logo
    const tokens = extractTokensFromMarkdown(doc.body)
    colorValues = tokens.colors.map((c) => c.value)
    typographyNames = tokens.typography.map((t) => t.name)
    fontDisplaySrc = findFontDisplaySrc(doc.body)
  } catch (e) {
    issues.push(
      block(
        "design-md-unreadable",
        "design.md",
        `The paired design.md failed to parse: ${e instanceof Error ? e.message : String(e)}`
      )
    )
  }

  const heroSrc = input.expectedWordmarkSrc ?? input.expectedLogoSrc

  checkFile(
    "light.html",
    input.lightRaw,
    input.lightBytes,
    "light",
    expectedLang,
    heroSrc,
    typographyNames,
    issues
  )
  checkFile(
    "dark.html",
    input.darkRaw,
    input.darkBytes,
    "dark",
    expectedLang,
    heroSrc,
    typographyNames,
    issues
  )

  // CI bulk mode has no orchestrator-resolved logo paths; fall back to a soft
  // "renders any /logos/ image" check driven by the design.md frontmatter.
  if (!heroSrc && mdLogo) {
    for (const [name, html] of [
      ["light.html", input.lightRaw],
      ["dark.html", input.darkRaw],
    ] as const) {
      if (!/<img\b[^>]*\ssrc=["']\/logos\//.test(html)) {
        issues.push(
          warn(
            "logo-img-missing",
            name,
            `${name} renders no /logos/* image although the design.md frontmatter declares a logo — the hero should carry the brand mark.`
          )
        )
      }
    }
  }

  if (fontDisplaySrc) {
    for (const [name, html] of [
      ["light.html", input.lightRaw],
      ["dark.html", input.darkRaw],
    ] as const) {
      if (!hasAttrValue(html, "href", fontDisplaySrc)) {
        issues.push(
          warn(
            "font-display-link-missing",
            name,
            `${name} does not <link> the design.md font-display-src (${fontDisplaySrc}) — the hero display face will silently fall back to Pretendard.`
          )
        )
      }
    }
  }

  // Compare styles after stripping comments and collapsing whitespace — a
  // dark file that differs only by a `/* dark */` comment is still a copy.
  const normalizeStyle = (css: string): string =>
    stripCssComments(css).replace(/\s+/g, " ").trim()
  const lightStyle = normalizeStyle(styleContent(input.lightRaw))
  const darkStyle = normalizeStyle(styleContent(input.darkRaw))
  if (lightStyle !== "" && lightStyle === darkStyle) {
    issues.push(
      warn(
        "identical-style-blocks",
        "pair",
        "light.html and dark.html carry byte-identical <style> blocks — dark must be a considered adaptation (surface hue, primary lightness shift), not a copy."
      )
    )
  }

  return {
    issues,
    passed: !issues.some((i) => i.severity === "block"),
    metrics: {
      light: coverage(input.lightRaw, colorValues),
      dark: coverage(input.darkRaw, colorValues),
    },
  }
}
