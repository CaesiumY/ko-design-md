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

function previewFiles(): Array<string> {
  return readdirSync(join(ROOT, "public/preview"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && entry.name !== "_runtime")
    .flatMap((entry) =>
      ["light", "dark"].map(
        (theme) => `public/preview/${entry.name}/${theme}.html`
      )
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

    // Validator: both rule names reachable from the skill's 9a2 gate.
    expect(validator).toContain("missing-disclaimer-banner")
    expect(validator).toContain("disclaimer-banner-misplaced")

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
  const FABRICATED_DATA_SITES: Record<string, Array<string>> = {
    // 원티드랩·토스·당근 with invented 채용보상금 figures.
    wanted: ["채용보상금", "근무지", "경력 조건"],
    // Course cards claiming a government-funded designation.
    teamsparta: ["국비지원", "평점", "수강생 수"],
    // Real books (룰루 밀러 『물고기는 존재하지 않는다』, 곰출판) with invented
    // prices, a bestseller rank, and a rating.
    kyobobook: ["베스트", "리뷰 수", "할인율"],
    // 나이키·소니·스타벅스 with invented prices and an "공식" seller badge, plus
    // a mock order screen carrying an invoice number against a real courier.
    gmarket: ["'공식' 배지", "쿠폰·사은품", "송장번호", "택배사명"],
    // 삼성전자·SK하이닉스 quotes, and a transaction list naming 카카오T·쿠팡.
    toss: ["종목명", "가맹점명"],
    // The KRDS government-identification banner rendered inside a catalog page.
    krds: ["표시 예시"],
  }

  it("labels the fabricated claims, not only the fabricated numbers", () => {
    for (const [slug, required] of Object.entries(FABRICATED_DATA_SITES)) {
      for (const theme of ["light", "dark"]) {
        const path = `public/preview/${slug}/${theme}.html`
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
      const screens = [
        ...html.matchAll(
          /<div class="screen"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/g
        ),
      ]
      for (const screen of screens) {
        expect(
          screen[1],
          `${path} must not place a catalog-dummy caption inside a .screen mock`
        ).not.toContain("catalog-dummy")
      }
    }
  })
})
