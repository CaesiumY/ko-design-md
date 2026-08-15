import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()

// The non-affiliation sentence is shared verbatim between the preview strip and
// the site footer. Keeping one literal here (rather than one per surface) is the
// point: it is what makes the two surfaces impossible to drift apart silently.
const NON_AFFILIATION = "제휴·후원 관계가 없습니다"
const DUMMY_DATA = "더미 데이터"
const DISCLAIMER_CLASS = "catalog-disclaimer"

function readRepoFile(path: string): string {
  return readFileSync(join(ROOT, path), "utf8")
}

/**
 * Content of the `<div class="screen">` that opens at `openIndex`, found by
 * counting tag depth to its real closing tag.
 *
 * A non-greedy `([\s\S]*?)</div>\s*</div>` regex looks equivalent and is not: it
 * stops at the first *adjacent* pair of closing divs, which inside a phone mock
 * is some nested field wrapper, not the screen. Measured against depth counting
 * it covered 14% of 11st's screen, 16% of socar's, and 43% of codeit's — so the
 * back of every mock went unchecked and this guard would have passed a caption
 * placed there.
 */
function screenContent(html: string, openIndex: number): string {
  let depth = 0
  for (const tag of html
    .slice(openIndex)
    .matchAll(/<(\/?)div\b[^>]*?(\/?)>/g)) {
    if (tag[2] === "/") continue // self-closing, no depth change
    depth += tag[1] ? -1 : 1
    if (depth === 0) return html.slice(openIndex, openIndex + tag.index)
  }
  return html.slice(openIndex)
}

function previewFiles(): Array<string> {
  return (
    readdirSync(join(ROOT, "public/preview"), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== "_runtime")
      // One file per slug since the themes merged (issue #235). Its raw text
      // holds both renderings — the light nodes and the dark ones still inert in
      // their templates — so a text-level check covers both at once.
      .map((entry) => `public/preview/${entry.name}/preview.html`)
  )
}

describe("/design-md catalog disclosure wiring", () => {
  it("teaches the strip everywhere the pipeline could drop it", () => {
    const previewAuthor = readRepoFile(".claude/agents/preview-html-author.md")
    const previewRubric = readRepoFile(
      ".claude/skills/design-md/references/rubric-preview.md"
    )
    const skill = readRepoFile(".claude/skills/design-md/SKILL.md")
    const validator = readRepoFile("src/lib/preview-validator.ts")
    const tokensCss = readRepoFile("public/preview/_runtime/tokens.css")

    // Author: the verbatim strip, both sentences, and the reason it cannot be
    // injected at runtime (an author that does not know this "helpfully" moves
    // it into iframe.js).
    expect(previewAuthor).toContain(`class="${DISCLAIMER_CLASS}"`)
    expect(previewAuthor).toContain(NON_AFFILIATION)
    expect(previewAuthor).toContain(DUMMY_DATA)
    expect(previewAuthor).toContain("window.parent === window")
    expect(previewAuthor).toContain("catalog-dummy")

    // Rubric: structural check in Item 1, labelling as a score-neutral advisory.
    expect(previewRubric).toContain(DISCLAIMER_CLASS)
    expect(previewRubric).toContain("first child of `<body>`")
    expect(previewRubric).toContain("Dummy-data labelling")
    expect(previewRubric).toContain("does NOT change the 10-point score")

    // Skill: the Stage 10 sentinels, including the multiline placement check.
    expect(skill).toContain("Catalog disclosure deterministic check")
    expect(skill).toContain("DISCLAIMER_MISSING_")
    expect(skill).toContain("DISCLAIMER_MISPLACED_")
    expect(skill).toContain("catalog disclosure strip")

    // Validator: all three rule names reachable from the skill's 9a2 gate.
    // They are separate because the fixes are: add the strip / move it / restore
    // a sentence.
    expect(validator).toContain("missing-disclaimer-banner")
    expect(validator).toContain("disclaimer-banner-misplaced")
    expect(validator).toContain("disclaimer-banner-incomplete")

    // Runtime CSS: dedicated 0-chroma tokens. Reusing --muted-foreground would
    // let 13 of 17 previews tint the strip with their own brand hue, because a
    // preview's inline <style> loads after this file.
    expect(tokensCss).toContain(`.${DISCLAIMER_CLASS}`)
    expect(tokensCss).toContain("--catalog-note-fg")
    expect(tokensCss).toContain("--catalog-note-bg")
  })

  it("keeps the strip present, complete, and first in every preview", () => {
    const files = previewFiles()
    expect(files.length).toBeGreaterThan(0)

    for (const path of files) {
      const html = readRepoFile(path)

      // Placement, not just presence: the strip has to land in the first screen
      // and in the hero crop a screenshot takes.
      expect(
        html,
        `${path} must open <body> with the disclosure strip`
      ).toMatch(
        new RegExp(
          `<body\\b[^>]*>\\s*<[a-z][a-z0-9]*\\b[^>]*${DISCLAIMER_CLASS}`
        )
      )

      // Scoped to the strip itself — five previews carry .catalog-dummy captions
      // that also say "더미 데이터", so a document-wide search would keep passing
      // after the sentence is deleted from the strip.
      const strip = html.match(
        new RegExp(
          `<([a-z][a-z0-9]*)\\b[^>]*${DISCLAIMER_CLASS}[^>]*>([\\s\\S]*?)</\\1>`
        )
      )?.[2]

      expect(strip, `${path} disclosure strip must parse`).toBeTruthy()
      expect(
        strip,
        `${path} strip must carry the non-affiliation sentence`
      ).toContain(NON_AFFILIATION)
      expect(
        strip,
        `${path} strip must carry the dummy-data sentence`
      ).toContain(DUMMY_DATA)
    }
  })

  it("keeps the preview strip and the site footer on one non-affiliation sentence", () => {
    const footer = readRepoFile("src/components/site/footer.tsx")
    expect(footer).toContain(NON_AFFILIATION)

    // Both surfaces answer the same 부정경쟁방지법 제2조 제1호 나목 question. If
    // one is reworded and the other is not, a reader comparing them learns the
    // claim is casual. src/lib/license-notice-consistency.test.ts pins the
    // footer side; this pins that the preview side did not drift away from it.
    for (const path of previewFiles()) {
      expect(
        readRepoFile(path),
        `${path} must reuse the footer's non-affiliation sentence verbatim`
      ).toContain(NON_AFFILIATION)
    }
  })

  // Every entry below is a screen showing invented values against a real, named
  // third party. The literals are the *claims* — badges, certifications, rankings,
  // identifiers — not the numbers. Those are what regressed: the first pass
  // enumerated prices and ratings and silently dropped 베스트, 국비지원, the
  // fabricated invoice number, and the merchant names (PR #210 erratum).
  //
  // Badge literals are quoted (`'베스트'`, not `베스트`) on purpose. The captions
  // mention some of these twice — once as the badge, once in the closing "…이
  // 아닙니다" clause — so the bare token stays satisfied after the badge is
  // dropped from the enumeration. Mutation-testing caught exactly that.
  const FABRICATED_DATA_SITES: Record<string, Array<string>> = {
    // 원티드랩·토스·당근 with invented 채용보상금 figures.
    wanted: ["채용보상금", "근무지", "경력 조건"],
    // Course cards claiming a government-funded designation.
    teamsparta: ["'국비지원'", "평점", "수강생 수"],
    // Real books (룰루 밀러 『물고기는 존재하지 않는다』, 곰출판) with invented
    // prices, a bestseller rank, and a rating.
    kyobobook: ["'베스트'", "베스트 순위", "리뷰 수", "할인율"],
    // 나이키·소니·스타벅스 with invented prices and an "공식" seller badge, plus
    // a mock order screen carrying an invoice number against a real courier, and
    // a component grid attaching invented benefits and delivery/stock/cancellation
    // terms to 스마일클럽 and 스마일배송 — both real, named services.
    gmarket: [
      "'공식' 배지",
      "쿠폰·사은품",
      "송장번호",
      "택배사명",
      // Phrase, not token — see the vapor-ui note below on why the split has to
      // be spanned rather than enumerated.
      "스마일클럽·스마일배송은 실재하는 서비스명",
      "멤버십 혜택",
      "배송 도착 시각",
      "재고 수량",
      "취소 정책",
    ],
    // 삼성전자·SK하이닉스 quotes, and a transaction list naming 카카오T·쿠팡.
    toss: ["종목명", "가맹점명"],
    // The KRDS government-identification banner rendered inside a catalog page.
    krds: ["표시 예시"],
    // A named store (칭찬강정 딜리점) and a named third party (이마트슈퍼무배)
    // carrying invented delivery terms, plus a coupon amount.
    baemin: ["이마트슈퍼무배", "최소주문", "배달팁", "쿠폰 금액"],
    // A promo card with a coupon amount and a deadline, plus FAQ answers stating
    // delivery, cancellation and coupon policy.
    "11st": ["오늘 마감", "쿠폰", "배송 조건", "취소 가능 시점"],
    // An accordion answer stating a refund window and scope.
    codeit: ["환불 기한", "환불 범위"],
    // Membership tier benefits — the tier NAMES are md-backed (Elite/ElitePlus),
    // only the benefit copy is invented, so the caption must keep that split.
    yeogi: ["혜택 설명", "ElitePlus"],
    // The only entry whose named subjects are natural persons, not companies:
    // a member table rendering goorm's real Vapor Squad Lead and CDO (md:27,
    // sourced to goorm's blog) with invented account status and container
    // counts, alongside two people who do not exist. Plus a console mock on a
    // real hostname carrying invented usage figures.
    //
    // These literals are PHRASES, not tokens, and that is the whole point. This
    // check concatenates a file's captions and asks whether each literal appears
    // somewhere in the result — so it can verify that a word is present but
    // never WHICH CLAIM it is attached to.
    //
    // That gap was measured, not theorised. With bare tokens ("Squad Lead",
    // "김지원", "실제 직함", "가상의 인물") a caption reading "Squad Lead·CDO 라는
    // 실제 직함을 가진 인물은 김지원·박서연이며 … 최준영·이태성은 가상의 인물이다"
    // — real people and invented ones swapped — contains every token and PASSES.
    // Adding proper nouns raised the bar and did not close the hole.
    //
    // Spanning the attribution with the phrase is what closes it here: the
    // reversal cannot produce `Squad Lead 최준영·CDO 이태성` or
    // `김지원·박서연은 가상의 인물`. This works because these captions state the
    // split locally, in one clause. It is not a general fix — the mechanism
    // still cannot check attribution, so any entry below that uses bare tokens
    // is only pinning presence.
    //
    // One documented hole survives the phrase literals: NEGATION. `.includes`
    // does not see clause boundaries, so `김지원·박서연은 가상의 인물이 아니라
    // 실존 인물` still contains `김지원·박서연은 가상의 인물` and passes with
    // every claim inverted. Measured, like the reversal above. It is left open
    // because reaching it requires deliberately writing the opposite claim,
    // where the reversal was something an innocent reword could stumble into —
    // but closing it needs clause-aware parsing, not a longer literal.
    //
    // Cost of the fix: rewording a caption breaks the build even when the new
    // wording is correct. For captions naming real natural persons that is the
    // right direction to be brittle in.
    "vapor-ui": [
      "Squad Lead 최준영·CDO 이태성",
      "실제 직함",
      "계정 상태와 컨테이너 수는 발명값",
      "김지원·박서연은 가상의 인물",
      "총 사용량",
    ],
  }

  it("labels the fabricated claims, not only the fabricated numbers", () => {
    for (const [slug, required] of Object.entries(FABRICATED_DATA_SITES)) {
      {
        const path = `public/preview/${slug}/preview.html`
        const html = readRepoFile(path)

        const captions = [
          ...html.matchAll(/class="catalog-dummy"[^>]*>([\s\S]*?)</g),
        ]
          .map((match) => match[1])
          .join("\n")

        expect(
          captions,
          `${path} must carry catalog-dummy captions`
        ).toBeTruthy()

        for (const phrase of required) {
          expect(
            captions,
            `${path} caption must name the fabricated claim "${phrase}"`
          ).toContain(phrase)
        }
      }
    }
  })

  it("keeps captions out of the mocked app's own screen", () => {
    // The label is the catalog speaking. Inside a phone mockup it reads as the
    // mocked product disclaiming its own data, which is a different (and false)
    // statement about a real brand.
    for (const path of previewFiles()) {
      const html = readRepoFile(path)
      // Three wrapper names, three previews that were silently unguarded until
      // they were added: `screen-mock` (baemin, line-design-system) and
      // `mock-screen` (krds, vapor-ui). The list is the weak point — a preview
      // whose mock wrapper is called something else is not checked at all, and
      // nothing fails to tell you. Grep the file's own class names before
      // trusting a green run here.
      for (const open of html.matchAll(
        /<div class="(screen|screen-mock|mock-screen)"[^>]*>/g
      )) {
        expect(
          screenContent(html, open.index),
          `${path} must not place a catalog-dummy caption inside a .screen mock`
        ).not.toContain("catalog-dummy")
      }
    }
  })
})
