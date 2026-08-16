# 프리뷰 산문 감사 — 기각 판정 전수 재검토

- 날짜: 2026-08-16
- 기준 커밋: `54aa0d8`
- 대장: `2026-08-07-preview-prose-audit-false-positive-ledger.md`
- 상위 규칙: `CLAUDE.md` §「프리뷰 산문 감사 — 판정 근거의 등급」

## 왜 했나

대장이 명시적으로 남긴 부채다:

> 반증 검증의 **기각 판정도 부재 주장에 기대면 같은 방식으로 틀린다** — 남은 기각
> 18건 중 16건이 "md 에 0건" · "원본에 없다" 형태다. 각 슬러그를 집행할 때 **기각도
> 근거 등급으로 함께 재검토할 것.**

근거가 있었다. 집행 중 **3건이 실제로 뒤집혔다** — bezier Divider(#258) ·
wanted `1:1` 과 `(Community)`(#281).

## 결과 — 재검토 15건, 뒤집힌 것 0건

| 상태 | 건수 | 내역 |
| --- | ---: | --- |
| 이미 뒤집힘 | 3 | bezier Divider(#258) · wanted `components-job-cards.html 1:1` · wanted `(Community)`(둘 다 #281) |
| 이미 해소 | 1 | wanted `18 named text styles` — #282 가 md 의 `19` 를 브랜드 발행물로 확인, 감사가 옳았다 |
| 집행 불가 | 1 | greeting Doodlin 워드마크 subtitle — `584f363`(#233)이 카드를 걷어내 되돌릴 표면이 없다 |
| **유지 확정** | **14** | 아래 |

**뒤집힌 3건은 전부 대장이 지시한 대로 "집행하며" 잡혔다.** 이번 전수 스윕은 나머지가
견고함을 확인한 것이고, 규칙이 작동했다는 뜻이지 스윕이 헛돌았다는 뜻이 아니다.

## 대장의 "16건이 부재 주장" 은 표면을 센 것이었다

사유 전문을 읽으면 **대부분 훨씬 강한 근거를 함께 단다.** 부재 어휘가 들어 있다고
부재 논증인 것이 아니다.

| 근거 유형 | 사례 |
| --- | --- |
| **자기모순** | greeting `icons` — 캡션이 "⚠ Lucide substitutes" 라 적는데 **같은 카드의 note** 가 "이 프리뷰는 대체본조차 그리지 않고 중립 슬롯만 옮긴다" 고 적는다. 실제로 프리뷰 아이콘 자리는 전부 빈 `<i class="isl">` 다 |
| **자기모순** | greeting 다크 `Toast` — "Dark floating notification" 이 **다크 렌더에서 거짓**이다. `dark.html:140` 이 `--toast-bg: var(--g-gray-600); /* 다크에서는 밝은 면이 된다 */` |
| **md 의 적극 금지** | greeting `Drawer radius0` — 원본에 `borderRadius` **선언 자체가 없고**(계산값 0), md `:345` 가 radius 표에 대해 *"용도 매핑을 만들어 인용하지 말 것"* 이라 못박는다. 선언되지 않은 부재를 발행 토큰명으로 라벨링한 것 |
| **md 의 명시 부인** | greeting `buttons 5 variants · 3 sizes` — md Known Gaps 가 *"Button도 large(56px)만 실측됐고 그보다 작은 사이즈 규격은 확인되지 않았다"* 로 `3 sizes` 를 직접 부인한다. 원본 카드조차 `large is the measured Storybook default` 라벨을 단다 |
| **인용 부정확** | greeting `greetinghr.com 은 도메인일 뿐…` — 원본은 기능명 **8개**(평가 관리 포함), 프리뷰는 **7개**로 하나를 떨어뜨렸다. **열거가 곧 주장인 문장**이라 축자 인용이 아니다 |
| **번들 내부 모순** | socar `Snackbar gray-1000` — 같은 번들이 `socar.css` 에서는 어두운 면, `preview/component-tips-snackbar-alert.html` 에서는 `.snack { background: white; … }` 로 **정반대로 렌더**한다. 게다가 `socar.css` 는 스스로 *"Not the production code. It's a cosmetic recreation"* 이라 밝힌다 |
| **상류 귀속 없음(캐시로 확인)** | socar `SelectionBox blue-50 + inset 링` — 크롤 코퍼스의 SelectionBox 절은 `2883–3010` 행인데 `blue-50` 은 **`4528` 행(색 팔레트 목록)에만** 있다. `component-specs.md:341` 도 *"선택 시 강조 보더·배경 적용 — 상세는 … 참조"* 로 **측정하지 못했다고 자기 기록**한다 |
| **이름이 원본에 없음** | line-design-system — 정정 전 문구가 출처를 "Claude Design 번들" 이라 불렀으나, 원본 README 는 자신을 *"A local recreation"* 이라 하고 `Source of truth: designsystem.line.me/LDSG` 를 명시한다. `Claude` 는 README 전체에서 한 번뿐이다 |
| **삭제된 것이 없음** | toss caveat — 컴포넌트 이름 목록(`segmented · search · … · filter chips`)은 **한 글자도 안 바뀌었고** 프로비넌스 캐비엇 한 문장이 덧붙었을 뿐이다. 되돌릴 값·상태·이름이 0건이라 오탐 조건에 걸 대상이 없다 |
| **값이 원본에 없음(자인)** | 11st `92% alpha` — 원본 `.bubble` 은 불투명 `--gray-02: #111111` 이고 알파 표면이 없다. `radius 4` 는 축자로 맞아 #259 가 이미 **갈라서** 처리했다 |

## 규범문 / 관찰문 — 별개의 살아남는 근거

greeting 브랜드 카드 2건(`greetinghr.com 은 도메인일 뿐, 제품명이 아닙니다` ·
`○/✕ do/don't`)은 **공개 출처가 사실을 뒷받침하는데도 기각이 유지된다.**

`greetinghr.com` 을 직접 열어 확인했다 — `그리팅 ATS` ×4 · `그리팅 TRM` ×1 이 실재하고
`Greeting HR`·`그리팅HR` 는 **0건**이며, 기능명 8개가 전부 한글로 실재한다. **주장은
참이다.**

그런데도 유지인 이유는 이 저장소의 별도 규칙이다 — **캡션은 규범문이 아니라
관찰문**(seed-design 철회 선례). `~은 제품명이 아닙니다` 와 `○/✕` 는 **규범 선언**이고,
공개 카탈로그 프리뷰가 브랜드 내부 규범을 선언할 자리가 아니다.

**사실이 참인 것과 캡션이 그 규범을 선언해도 되는 것은 다른 문제다.** 이 구분이 없으면
"참이니까 되살린다" 로 규칙을 우회하게 된다.

현재 프리뷰는 같은 사실을 **관찰문으로** 이미 싣고 있어 정보 손실도 없다:

```
제품 · 그리팅   그리팅 / Greeting  제품군은 그리팅 ATS · 그리팅 TRM.
note           공식 제품 가이드는 모듈을 채용 ATS · 채용 홈페이지 Homepage ·
               설문 Form · 인재영입 TRM · 분석 Analytics 다섯으로 번호 매겨 연다.
```

제품군과 공식 가이드 모듈명을 **갈라서** 싣고 둘 다 공개 출처와 일치한다.

## 가장 약한 유지 — greeting 법인명

`두들린 / Doodlin / (주)두들린 … 영문은 Doodlin Corp.` 를 감사가
`두들린 / Doodlin … 법인은 두들린 주식회사다.` 로 바꿨다.

**양쪽 다 참이다.** `greetinghr.com` 푸터가 `(주)두들린` 과
`Copyright © 2026 Doodlin Corp.` 를 싣고, md `:22` 는 `두들린 주식회사` 로 적는다.
같은 법인의 다른 표기 형태이고 지금 문구는 md 를 따른다.

**되돌려도 참, 안 되돌려도 참**이라 결함이 아니다 — 다만 영문 형태 `Doodlin Corp.` 가
공개 출처에 있는데 빠졌으므로, **15건 중 근거가 가장 얇은 유지**로 기록해 둔다.
재감사가 이 자리를 다시 본다면 그때 판단하면 된다.

## 방법

1. 워크플로 저널(`wf_22fc679d-5df/journal.jsonl`, 163줄)에서 2단계 판정을
   `key` 로 dedupe 해 추출했다 — **raw 56 → dedupe 49 · 확증 30 · 기각 19** 로
   대장의 수치를 독립 재산출했다(`resumeFromRunId` 재실행분이 7건 중복)
2. 기각 19건의 사유 전문을 읽어 **부재 논증인지 값 논증인지** 분류했다
3. 공개 출처로 확인 가능한 것을 직접 열었다 — `greetinghr.com`(브랜드 표기·기능명) ·
   socar 크롤 캐시(`crawl-corpus.md` · `component-specs.md`)
4. `DesignSync` 는 이번에도 연결돼 있었으나, **번들이 상류가 아닌 슬러그**
   (greeting · socar 는 sources 가 전부 공개 출처다)에서는 판정 근거로 쓰지 않았다

## 남기는 교훈

**기각 사유를 어휘로 분류하지 말 것.** 대장이 "16건이 부재 주장 형태" 라 적은 것은
사유 안의 부재 어휘를 센 것이고, 실제로 무게를 지는 근거는 대부분 값·자기모순이었다.
**재검토가 필요한지 판단하려면 사유를 읽어야 한다** — 세어서는 알 수 없다.

**"참이다" 가 "되살려야 한다" 를 뜻하지 않는다.** greeting 브랜드 카드 2건이 그 예다.
공개 출처가 사실을 뒷받침해도 **규범문/관찰문 규칙**이라는 별개 축이 남는다. 되돌리기
계열이 "감사가 참인 것을 지웠다" 만 찾으면 이 축을 놓친다.

## 후속 — 이 재검토가 손대지 않은 것

**toss caveat 의 범위 좁히기**는 여전히 열려 있다. 대장이 적은 대로, 그 caveat 는 8개
컴포넌트의 치수·변형을 싸잡아 "이 프리뷰의 재현" 이라 말하는데 그중 일부는 번들이 실제로
발행한다(`chip.html` 의 `removable`, `segmented-control.html` 의 `PILL · 2 segments`).
**충실한 전사를 창작으로 격하하는 것도 프로비넌스 오류다.** 다만 이것은 기각 재검토가
아니라 **caveat 자체의 정밀화**라 별건이다.

## 검증

```
프리뷰·md 변경 없음 — 재검토 결과가 "전부 유지" 이므로 고칠 것이 없다
validate:catalog   0 blocking · 31 warn (기준선 54aa0d8 와 동일)
tokens:check       17 sidecar(s) in sync
check:last-updated services/*.md 미변경 — 해당 없음
```
