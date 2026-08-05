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
//
// ⚠️ 아래 두 임계값을 재조정하면 문서의 **150 KiB 자가 점검선도 함께 다시
// 계산할 것.** 프리뷰를 쓰는 에이전트는 brotli 를 계산할 수 없어서
// rubric-preview.md · preview-html-author.md · preview-html-reviewer.md 가
// raw 프록시를 주는데, 그 숫자는 최저 압축률(코퍼스 실측 23%)로 역산한
// 값이다 — 40 KiB brotli ≈ raw 174 KiB, 24 KiB ≈ raw 104 KiB 이므로 150 이
// 두 하드캡 안쪽이면서 실제 최대 파일보다 위인 지점이다. 계약 테스트는 이
// 파생값을 검사하지 않으므로(상수와 직접 연결돼 있지 않다) 여기서만
// 놓치지 않을 수 있다.
const BROTLI_QUALITY = 11
const BLOCK_BROTLI_BYTES = 40 * 1024
const WARN_BROTLI_BYTES = 24 * 1024
// raw 안전망. 압축이 잘 되는 폭주(생성 루프가 같은 마크업을 무한 반복하는
// 종류)는 brotli 기준을 통과하므로 별도로 막는다.
const BLOCK_RAW_BYTES = 256 * 1024

// design.md `## Typography` 토큰 이름이 프리뷰 본문에 텍스트 라벨로 몇 개
// 등장하는가. 스탠드얼론 타입 스케일 쇼케이스는 필연적으로 각 단계에 이름을
// 달기 때문에, 마크업 구조나 클래스명과 무관하게 그 형태를 잡는다.
// rubric-preview.md Item 3(Typography hierarchy)의 "No standalone type-scale
// showcase" 조항을 기계화한 것이다. 줄 번호가 아니라 항목으로 가리키는 이유는
// 루브릭 본문이 편집되면 줄이 밀리기 때문이다 — 실제로 #202 문서 동기화에서
// 밀렸다. 코퍼스 실측: greeting 22, 그 외 전부 0~1.
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
// 존재하는 요소의 수. rubric-preview.md Item 2(Color fidelity)의 "component
// demo, not a swatch catalog" 조항을 기계화한 것이다(줄 번호가 아니라 항목으로
// 가리키는 이유는 위 TYPE_SCALE 주석 참조). 이 규칙이 실제로 보장하는 것은
// "인라인 style= 로 칠한 fill-only 요소가 적다"이지, 스와치 자체를 잡는 게
// 아니다 — 이 계수가 인라인 style= 속성만 읽으므로 클래스 기반 스와치
// 그리드(배경색을 CSS 클래스로 칠하는 경우)는 이 검사에 보이지 않는다.
// 코퍼스 실측(PR-1 정리 후): 최댓값은 greeting 18, 2위 bezier 다. 한도 24 까지
// 실제 여유는 6개(1.33배) — 정리 전의 12배 격차는 지금의 상태가 아니다.
//
// 계수와 브라우저가 세는 수는 이제 일치한다(이슈 #222). 그전에는 bezier 를
// 7 로 셌지만 실제 렌더는 12 였고, preview-validator-corpus.test.ts 가
// 배포본 34개 전부에서 두 수의 **일치**를 매 커밋 검사하므로 그 종류의
// 조용한 오차는 다시 생기면 그 자리에서 실패한다.
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
// 계수는 문서를 한 번 훑으며 열린 요소 스택을 유지하는 방식이다. 이슈 #222
// 이전에는 줄 단위 정규식 스캔이었고, "한 줄 = 한 엘리먼트"라는 — 이 저장소가
// 강제하지 않고 format:check 가 프리뷰 HTML 을 보지도 않는(CLAUDE.md) —
// 불변식 위에 서 있었다. 같은 내용이 줄 배치만 달라져도 다른 답이 나왔고,
// 실측된 이탈 경로 넷이 전부 그 하나의 뿌리에서 나왔다:
//   1. fill 요소의 여는 태그가 여러 줄에 걸치면 통째로 안 보였다 — 속성을
//      줄바꿈해 쓴 스와치 24개가 24 가 아니라 0.
//   2. data-theme-only 래퍼가 여러 줄에 걸치면 속성과 fill 이 갈라져 fill 이
//      shared 로 샜다 — 9/9/9 배치가 18 이 아니라 27, 곧 규칙을 지킨 파일을
//      막는 거짓 block.
//   3. 래퍼가 줄 중간에서 닫힌 뒤 이어지는 테마 무관 fill 이 그 래퍼의 테마로
//      귀속됐다 — light1+shared1+dark3 을 여섯 줄 두면 24 가 아니라 18.
//   4. 같은 태그가 한 줄에 중첩되면 non-greedy 매칭이 안쪽 닫는 태그에서 끊겨
//      바깥 요소를 놓쳤다 — bezier 가 12 가 아니라 7. 넷 중 유일하게 배포된
//      파일에서 이미 일어나고 있던 경로다.
// 방향이 양쪽(거짓 통과·거짓 block)으로 다 났으므로 "안전한 쪽으로만 틀린다"가
// 애초에 성립하지 않았다. 태그 닫힘 추적을 덧대면 3·4 만 막히므로 구조를 읽는
// 쪽으로 다시 썼다.
//
// 기준 의미는 preview-validator-corpus.test.ts 의 `domFillCount`(jsdom)와
// 글자 그대로 같게 맞췄다: `<body>` 아래에서 인라인 style 에 background 가
// 있고 자손을 포함한 텍스트가 비어 있는 요소를, 자기 자신을 포함해 가장 가까운
// data-theme-only 조상에 귀속시킨다(= `closest()`). 그 테스트가 배포본 34개
// 파일에서 두 계수의 **일치**를 검사하므로 의미가 어긋나는 순간 CI 가 잡는다.
// jsdom 을 런타임 의존성으로 올리지 않은 이유는 이 파일이 node:zlib 외에는
// 의존성이 없는 코어이기 때문이다(파일 상단 주석) — 정확성은 devDependency 인
// jsdom 과의 대조로 얻고 배포 그래프는 건드리지 않는다.
//
// 남는 한계 둘:
//   - 인라인 style= 만 읽는다. CSS 클래스로 칠한 스와치 그리드는 여전히 이
//     검사에 보이지 않는다(SWATCH_FILL_LIMIT 주석 참조). 규칙의 정의이지 이
//     함수의 결함이 아니다.
//   - 닫는 태그를 생략하는 서법(`<li>`·`<p>` 를 닫지 않는 HTML)은 파서의
//     암묵적 종료 규칙을 따르지 않으므로 DOM 과 어긋날 수 있다. 배포본 34개는
//     li·p 가 전부 명시적으로 닫혀 있어 실측 오차 0 이고, 어긋나는 순간
//     코퍼스 테스트가 그 파일 이름과 함께 실패한다.

// 닫는 태그가 없는 요소들 — 워커가 스택에 **쌓지 않아야** 하는 목록이다.
// 쌓으면 `<hr>` 이 조상으로 남아 그 뒤 텍스트가 전부 거기 붙고, 그러면 `<hr>`
// 이 "텍스트를 가진 요소"가 되어 fill 계수에서 조용히 빠진다.
// `base`·`link`·`meta`·`param` 은 `<body>` 안에서는 파스 에러지만 파서가 void
// 로 회복하므로, 빠뜨리면 그 지점부터 스택이 DOM 과 어긋난다.
const VOID_ELEMENTS = new Set([
  "img",
  "hr",
  "br",
  "input",
  "source",
  "area",
  "col",
  "embed",
  "track",
  "wbr",
  "base",
  "link",
  "meta",
  "param",
])

// 내용이 요소로 파싱되지 않는 요소들 — 닫는 태그까지 통째로 건너뛴다.
// 앞 넷은 raw text 라 안쪽 `<div>` 가 문자열이지 요소가 아니고, `template` 은
// 내용이 별도 fragment 로 가서 `querySelectorAll` 에 안 잡힌다(= 렌더되지
// 않는다). 이유는 다르지만 "안쪽을 요소로 세지 않는다"가 둘 다 DOM 과 맞다.
const OPAQUE_ELEMENTS = new Set([
  "script",
  "style",
  "textarea",
  "title",
  "template",
])

// 디코딩하면 JS `trim()` 이 지우는 문자가 되는 명명 엔티티들. 실제 문자를
// 소스에 두지 않고 이름만 나열한 이유는 nbsp 류가 코드에 들어가면 눈으로
// 구분되지 않아 편집 중에 조용히 옮겨 다니기 때문이다 — 판정에 쓰는 건
// "공백인가"뿐이라 평범한 스페이스로 치환해도 결과가 같다.
const WHITESPACE_ENTITIES = new Set([
  "nbsp",
  "NonBreakingSpace",
  "ensp",
  "emsp",
  "emsp13",
  "emsp14",
  "numsp",
  "puncsp",
  "thinsp",
  "ThinSpace",
  "hairsp",
  "VeryThinSpace",
  "MediumSpace",
])

// jsdom 은 `textContent.trim()` 을 보므로 엔티티가 **디코딩된 뒤** 공백인지가
// 기준이다. nbsp 하나만 든 자식은 렌더상 빈 칸이고 JS `trim()` 이 그 문자를
// 지우므로 여전히 fill 로 세어야 한다. 반대로 `&amp;` 는 글자다.
// 알 수 없는 명명 엔티티는 글자로 본다 — 임의로 안전한 쪽을 고른 게 아니라,
// 공백이 되는 엔티티가 위 목록으로 닫히기 때문이다.
function isBlankText(raw: string): boolean {
  // `&` 자체가 비공백이므로, 여기서 비면 엔티티도 없다.
  if (raw.trim() === "") return true
  const decoded = raw.replace(
    /&(#[0-9]+|#x[0-9a-f]+|[a-z][a-z0-9]*);?/gi,
    (_m, ref: string) => {
      if (ref.startsWith("#")) {
        const cp = ref.startsWith("#x")
          ? parseInt(ref.slice(2), 16)
          : parseInt(ref.slice(1), 10)
        if (!Number.isFinite(cp) || cp < 0 || cp > 0x10ffff) return "x"
        return String.fromCodePoint(cp)
      }
      return WHITESPACE_ENTITIES.has(ref) ? " " : "x"
    }
  )
  return decoded.trim() === ""
}

/**
 * 시작 태그의 끝 `>` 위치. 따옴표 안의 `>` 는 넘긴다(`title="a > b"`).
 *
 * 문자 루프인 것이 의도다 — 속성 구간까지 한 정규식에 넣으면 중첩 수량자가
 * 생겨, 닫는 `>` 가 없는 잘린 입력에서 지수 백트래킹이 난다(200 KB 실측
 * 94초 → 이 방식 1 ms). Stage 9a2 는 방금 생성된 파일을 받으므로 "입력은
 * 언제나 온전하다"를 가정할 수 없다.
 */
function findTagEnd(s: string, from: number): number {
  let quote: string | null = null
  for (let j = from; j < s.length; j++) {
    const c = s[j]
    if (quote !== null) {
      if (c === quote) quote = null
    } else if (c === '"' || c === "'") {
      quote = c
    } else if (c === ">") {
      return j
    }
  }
  return -1
}

/**
 * 시작 태그 속성 구간에서 attr 값을 뽑는다. 따옴표 없는 값도 받는다 — 파서가
 * 받으므로 DOM 과 맞추려면 여기서도 받아야 한다.
 *
 * 앞 경계가 `[\s"'/]` 인 이유는 `data-style=` 이 `style=` 로 읽히면 안 되는데
 * 하이픈이 non-word 라 `\b` 로는 막히지 않기 때문이다(같은 파일 `hasAttrValue`
 * 와 같은 이유).
 */
function attrValue(attrs: string, name: string): string | null {
  const re = new RegExp(
    `(?:^|[\\s"'/])${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`,
    "i"
  )
  // 주석 타입이 `RegExpExecArray` 면 그룹이 `string` 으로 잡히는데, 매칭되지
  // 않은 그룹은 런타임에 undefined 다. 세 대안 중 하나만 채워지는 정규식이라
  // 이 주석 타입이 사실이고, 없으면 아래 `??` 가 불필요한 조건으로 걸린다.
  const m: Array<string | undefined> | null = re.exec(attrs)
  if (m === null) return null
  return m[1] ?? m[2] ?? m[3] ?? ""
}

interface OpenElement {
  tag: string
  isFill: boolean
  /** 자신을 포함해 가장 가까운 `data-theme-only` 의 값 (= `closest()`). */
  theme: string | null
  /** 자손을 포함해 텍스트가 있었는가 (= `textContent.trim() !== ""`). */
  hasText: boolean
  /** svg/math 서브트리 안인가. self-closing 표기가 유효한 범위. */
  foreign: boolean
}

// Exported so preview-validator-corpus.test.ts can assert count equality with a
// jsdom walk, not merely verdict equality — the tighter check, and the one that
// would have caught bezier reading 7 where a browser renders 12.
export function swatchFillCount(html: string): number {
  const body = bodyOf(html)
  const stack: Array<OpenElement> = []
  let shared = 0
  let light = 0
  let dark = 0

  const record = (el: OpenElement): void => {
    if (!el.isFill || el.hasText) return
    if (el.theme === "light") light++
    else if (el.theme === "dark") dark++
    else shared++
  }

  // 위에서 아래로 훑다 이미 true 인 원소를 만나면 멈춘다. 표시는 늘 스택 top
  // 부터 연속으로 내려가고 push 는 top 에 false 만 얹으므로, "stack[k] 가
  // true 면 그 아래도 전부 true" 가 불변식이다.
  const markText = (): void => {
    for (let k = stack.length - 1; k >= 0; k--) {
      if (stack[k].hasText) break
      stack[k].hasText = true
    }
  }

  let i = 0
  while (i < body.length) {
    const lt = body.indexOf("<", i)
    if (lt === -1) {
      if (!isBlankText(body.slice(i))) markText()
      break
    }
    if (lt > i && !isBlankText(body.slice(i, lt))) markText()

    const next = body[lt + 1] ?? ""

    if (body.startsWith("<!--", lt)) {
      // 주석은 텍스트가 아니다 — 주석만 품은 fill 은 여전히 fill 이다.
      const end = body.indexOf("-->", lt + 4)
      i = end === -1 ? body.length : end + 3
      continue
    }
    if (next === "!" || next === "?") {
      const end = findTagEnd(body, lt + 1)
      i = end === -1 ? body.length : end + 1
      continue
    }

    if (next === "/") {
      if (!/[a-zA-Z]/.test(body[lt + 2] ?? "")) {
        const end = findTagEnd(body, lt + 2)
        i = end === -1 ? body.length : end + 1
        continue
      }
      const end = findTagEnd(body, lt + 2)
      if (end === -1) break
      const tag = body
        .slice(lt + 2, end)
        .trim()
        .toLowerCase()
      i = end + 1
      // 스택에 없는 닫는 태그는 무시한다. 흩어진 `</span>` 하나에 트리가
      // 풀리면 그 뒤 계수가 전부 어긋나는데, 파서도 이 경우를 버린다.
      let at = -1
      for (let k = stack.length - 1; k >= 0; k--) {
        if (stack[k].tag === tag) {
          at = k
          break
        }
      }
      if (at === -1) continue
      while (stack.length > at) {
        const el = stack.pop()
        if (el !== undefined) record(el)
      }
      continue
    }

    if (!/[a-zA-Z]/.test(next)) {
      // `a < b` 같은 순수 텍스트. `<` 한 글자만 넘긴다.
      markText()
      i = lt + 1
      continue
    }

    // 태그 이름만 잘라 읽는다 — 속성까지 한 정규식에 넣지 않는 이유는
    // `findTagEnd` 주석 참조. 64자는 실존 태그 이름을 다 덮는 상한이다.
    const nameMatch = /^[a-zA-Z][^\s/>]*/.exec(body.slice(lt + 1, lt + 65))
    if (nameMatch === null) {
      markText()
      i = lt + 1
      continue
    }
    const tag = nameMatch[0].toLowerCase()
    const end = findTagEnd(body, lt + 1 + tag.length)
    if (end === -1) break
    const attrs = body.slice(lt + 1 + tag.length, end)
    i = end + 1

    const style = attrValue(attrs, "style")
    const own = attrValue(attrs, "data-theme-only")
    const parent = stack.length > 0 ? stack[stack.length - 1] : null
    const el: OpenElement = {
      tag,
      isFill: style !== null && style.includes("background"),
      theme: own !== null ? own.toLowerCase() : (parent?.theme ?? null),
      hasText: false,
      foreign: tag === "svg" || tag === "math" || (parent?.foreign ?? false),
    }

    if (OPAQUE_ELEMENTS.has(tag)) {
      // `body.toLowerCase().indexOf(…)` 로 찾지 않는다. 대소문자 변환이
      // 길이를 바꾸는 문자가 있어(U+0130 은 소문자화하면 2글자다) 사본의
      // 인덱스를 원본에 그대로 쓰면 그 지점부터 파싱이 어긋난다. 매번 전체
      // 사본을 만드는 비용도 사라진다.
      const closeRe = new RegExp(`</${tag}(?=[\\s/>])`, "gi")
      closeRe.lastIndex = i
      const close = closeRe.exec(body)?.index ?? -1
      const inner = body.slice(i, close === -1 ? body.length : close)
      if (close === -1) {
        i = body.length
      } else {
        const closeEnd = findTagEnd(body, close + 2 + tag.length)
        i = closeEnd === -1 ? body.length : closeEnd + 1
      }
      // `template` 의 내용은 별도 fragment 라 조상의 textContent 에 안 들어간다.
      // 나머지 넷은 raw text 지만 textContent 에는 그대로 들어간다.
      if (tag !== "template" && !isBlankText(inner)) {
        stack.push(el)
        markText()
        stack.pop()
      }
      record(el)
      continue
    }

    // self-closing 표기는 svg/math 안에서만 유효하다. HTML 콘텐츠에서 `<div/>`
    // 는 여전히 열린 요소이므로, 항상 인정하면 그 뒤 텍스트를 놓쳐 과다 계수가
    // 나고 항상 무시하면 SVG 를 쓰는 프리뷰에서 스택이 통째로 어긋난다.
    const selfClosing = el.foreign && attrs.trimEnd().endsWith("/")
    if (VOID_ELEMENTS.has(tag) || selfClosing) {
      record(el)
      continue
    }
    stack.push(el)
  }

  while (stack.length > 0) {
    const el = stack.pop()
    if (el !== undefined) record(el)
  }
  return shared + Math.max(light, dark)
}

// 이름이 "단독 라벨"로 등장한 경우만 센다. 앞뒤를 공백이나 구두점으로 묶어
// `scale1` 이 `scale10` 안에서 매칭되는 것을 막는다. visibleText 가 태그를
// 공백으로 치환하므로 태그 경계도 자연히 경계로 잡히고, 속성값은 제거된다.
//
// 뒤쪽 경계에 한글 음절을 포함하는 이유: 이 카탈로그의 프리뷰는 전부 한국어
// 산문이고 `title1 은 60px, title2 는 48px` 대신 `title1은`, `title2는` 처럼
// 조사를 붙여 쓰는 것이 자연스러운 문형이다. 구두점·공백만 경계로 두면 규칙이
// 자기가 검사하는 언어의 기본 서법에서 눈이 멀어, 스케일을 통째로 열거하고도
// 조사 하나로 빠져나간다. 토큰명은 ASCII 이므로 바로 뒤에 붙은 한글 음절은
// 사실상 조사이고, 17개 전수 실측에서 이 확장으로 계수가 바뀐 항목은 0개다.
const HANGUL_SYLLABLE = "\\uac00-\\ud7a3"

function labelledTokenNames(html: string, names: Array<string>): number {
  const text = visibleText(bodyOf(html))
  let found = 0
  for (const raw of new Set(names)) {
    const name = raw.trim()
    if (name.length < 2) continue
    const re = new RegExp(
      `(?:^|[\\s(·|,/])${escapeRegExp(name)}(?:$|[\\s)·|,/:]|[${HANGUL_SYLLABLE}])`,
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
