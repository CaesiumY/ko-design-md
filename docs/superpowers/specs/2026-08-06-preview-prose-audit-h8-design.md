# 프리뷰 산문 감사 8차 — wanted (첫 서술 전수)

- 날짜: 2026-08-06
- 선행: #215(1차) · #216(2차) · #220(3차) · #232(4차) · #236(5차 toss) ·
  #238(6차 seed-design) · #242(7차 line-design-system)
- 대상: `public/preview/wanted/{light,dark}.html`
- **감사 기준 커밋: `38983d1`** (착수 시점의 `origin/main`)

> **순번은 8차다.** 착수 시점엔 7차였으나 작업 중 #242(line-design-system)가 7차로
> 먼저 착지했다. 6차에서 같은 충돌이 났을 때 정한 규칙을 따른다 — 순번은 착수
> 순서가 아니라 `git log --grep "프리뷰 산문 감사"` 의 착지 순서다.

## 배경

이 계열이 지키는 규칙은 하나다 — **프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는
주장을 하지 않는다.** `validate:catalog` 는 md 의 `[src:N]` 만 검사하고 프리뷰 산문은
어떤 기계 검사도 받지 않으므로 이 대조는 사람이 한다.

`wanted` 를 고른 이유는 밀린 빚이 가장 크기 때문이다. **H-1(#215)이 저작권 축만
판정했고 서술 전수는 미착수였다** — H-6 이 이 셋(`wanted` · `bezier` ·
`line-design-system`)을 "완료로 취급하면 안 된다" 고 명시했고, 그중 둘이 이제 끝났다.

**이 프리뷰의 산문은 md 를 읽고 쓴 것이 아니다.** #86(2026-06-01)이 Claude Design
핸드오프 번들로 프리뷰를 갱신했고, 같은 경로가 다른 슬러그에서 반복적으로 무근거
주장을 낳았다. 이번 결과가 그 예상과 일치한다.

## 이 슬러그만의 두 번째 축 — 유보 보존

`wanted.md` 는 다른 항목에 없는 것을 갖고 있다. 리드 문단이 자기 값의 출처를
3분류로 선언한다 — **교차검증됨**(타입 스케일 · 알파 사다리 · 병기 hex 대부분),
**공개 출처와 어긋남**(스페이싱 · 브레이크포인트 · 엘리베이션 · 시맨틱 alias 명명),
**공개 토큰 자체가 없음**(라운드).

그래서 판정이 두 축이다: ① md 가 그 주장을 담는가, ② **md 가 유보를 단 값을
프리뷰가 단정적으로 서술하는가.** ②는 값을 지우지 않고 유보를 함께 옮기는 쪽으로
처리했다 — 지우면 시연할 것이 사라진다.

## 서술 표면 특정 — 55 개

파일을 열어 센 결과다. `<pre>`·코드카드는 **0개**다 — 6차(seed-design)의 주 무대가
여기엔 없고, 주장이 짧은 캡션에 흩어져 있다.

| 클래스 | 개수 | 성격 |
| --- | --- | --- |
| `.cl` | 21 | `.comp-cell` 컴포넌트 스펙 캡션 |
| `.row-label` | 7 | 컴포넌트군 스펙 — **정밀 수치가 몰려 있다** |
| `.hero-meta .item` | 6 | 시스템 축에 대한 수치 단언 |
| `.section-head .caption` | 4 | 섹션당 한 줄 규범문 |
| `.section-head h2` | 4 | 표제이면서 주장 |
| footer `span` | 3 | 출처·귀속 |
| `.eyebrow` | 2 | 히어로 키커 · 목업 라벨 |
| `.wcard-sub` | 2 | 목업 카드 문구로 보이나 규범문 |
| `.lede` · `h1` · `.subtitle` · `.strip-meta` | 각 1 | 히어로와 스트립 |
| 한글 CSS 주석 · Job card 주석 | 각 1 | 렌더 안 돼도 다음 편집자에게 닿는다 |

**감사 대상이 아닌 것** — `.jobcard-*` · `.wcell-*` · `.field-label` · `.helper` ·
표 셀 등 가짜 회사명·연봉·공고 데이터. 고지 스트립과 `.catalog-dummy` 2개가
더미임을 밝힌다.

## 대조 결과 — 14 개 표면 정정

**검산 내역**(합계만 적으면 다음 감사가 확인할 수 없다 — 6차가 분모를 틀린 자리다):
`.eyebrow` 1 + `.lede` 1 + `.hero-meta` 4 + `.row-label` 3 + `.cl` 2 +
CSS 주석 1 + `.strip-meta` 1 + footer 1 = **14**. 양 테마에 동일 적용.

| 표면 | 종전 | 판정 |
| --- | --- | --- |
| `.eyebrow` | `350만+ 회원이 함께하는 커리어` | 회원 수가 md 에 **0건**. 사업 통계를 프리뷰가 발명했다 → md 가 적는 시스템 정체(`몽타주(Montage)`)로 |
| `.lede` (light) | `그라디언트는 심볼과 아바타에만` | **자기 마크업과 어긋난다** (아래) |
| `.lede` (dark) | 네 자리 — CTA 배제 없음 | 자리 수는 맞으나 md 3개 절이 모두 적는 CTA 배제를 떨어뜨렸다 |
| `.hero-meta` RAMPS | `14 + 19 + 11` | md L36 은 `coolNeutral` **21**단계 → `14 + 21 + 11` |
| `.hero-meta` TYPE STYLES | `7 × 18 named` | md 가 네 곳에서 **19**개 명명 스타일 → `7 × 19 named` |
| `.hero-meta` PREVIEW CARDS | `40 figma` | **종전 md 에 있다가 빠진 수치다** → md 가 적는 `23 groups` |
| `.hero-meta` RADIUS | 라벨 `RADIUS` | 유보 축 ② — md `## Rounded`: *"이 사다리는 공개 출처가 없다"* → `RADIUS (번들 관찰)` |
| `.row-label` INPUTS | `44 height · radius-8` | md `### input` 은 48 · radius-12 이고 **프리뷰 자신의 CSS 도 48px/12px** |
| `.row-label` TOGGLE·CHECKBOX | `18 / 40 · radius-4 / radius-full` | md·CSS 모두 toggle 44×26 · checkbox 20/**6px**. md 는 그 6px 을 *"radius-4 보다 한 단계 큰"* 이라고 **명시적으로 정정**해 둔다 |
| `.row-label` JOB CARD | `SSOT components-job-cards.html 1:1` | md 가 명명하는 번들 파일은 `colors_and_type.css`·`components.css`·`components.html`·`styles.css` 뿐 |
| `.cl` RADIO | `switch와 짝` | md `### radio` 는 세 번 모두 **checkbox** 와 짝짓고, **이 셀에도 스위치가 없다**(라디오 둘뿐) |
| `.cl` AVATAR | `· company ·` | md 에 company 아바타 변형이 없다. md 는 *"그라디언트가 정식 등장하는 컴포넌트는 avatar 하나"* 라고만 적는다 |
| Job card CSS 주석 | 같은 파일명 | 렌더 안 돼도 다음 편집자에게 닿는다 → md 포인터로 |
| `.strip-meta` · footer | `SSOT: … (Community) — Claude Design handoff bundle` | 아래 |

### 라이트·다크가 서로를 반박했다 — 각자 다른 절반을 떨어뜨렸다

`.lede` 가 브랜드 그라디언트의 적용 범위를 두 테마에서 다르게 말했다. **light 는 두
자리, dark 는 네 자리.**

md `## Shapes`(L483)·`## Don'ts`(L927)가 둘 다 적는다 — *"(1) 심볼 마크, (2) 아바타
circle, (3) 잡카드 썸네일 placeholder, (4) 마케팅 hero banner — 네 가지 문서화된
자리에만 사용한다. CTA·헤더·풀-블리드 본문 표면에는 적용하지 않는다."*

그리고 **프리뷰 자신이 그 네 자리를 그린다** — CSS 실측으로 `.jobcard-thumb` ·
`.avatar.brand` · `.mhero` 세 곳이 브랜드 그라디언트를 쓰고 심볼은 로고 이미지로
들어간다. light 의 "심볼과 아바타에만" 은 같은 파일이 그리는 두 자리를 부정한 것이다.

양쪽을 md 문장으로 수렴시켰다. 편집 후 두 테마의 이 문장은 동일하다.

> **md 를 결함으로 오독할 뻔했다.** `## Brand & Style`(L36)은 자리를 셋으로 적어
> 처음엔 md 내부 모순으로 보였다. 실제로는 `## Colors` 가 참조 대상을 가른다 —
> *"마케팅 hero용 변형은 … 깊은 navy를 추가해 … 카탈로그 토큰으로 노출된 것은
> 아니다."* L36 은 **3-stop 심볼 토큰**을, L483·L927 은 **장치로서의 그라디언트**를
> 말한다. 둘 다 참이다. md 를 고쳤다면 근거 있는 정밀함을 무근거로 바꿀 뻔했다.

### SSOT 선언 2자리 — 카탈로그에서 wanted 만 갖고 있었다

`.strip-meta` 와 footer 가 `SSOT: Wanted Design System (Community) — Claude Design
handoff bundle` 을 선언했다. **17개 프리뷰 중 이 둘을 가진 것은 wanted 뿐이고**,
`(Community)` 는 md 에 **0건**이며 번들을 "Claude Design" 에 귀속시키는 서술도 md 에
없다(md 는 `SSOT 번들` · `2025년 Wanted Design System 핸드오프 번들` 로만 부른다).

**H-1(#215)이 바로 이 footer 를 손댔다** — 저작권 줄(`© 2025 Wanted Lab` →
`원티드랩 발행 몽타주(Montage)`)만 고치고 바로 옆 줄은 지나갔다. 이 계열이 기록한
*"부분 수정을 전체 수정으로 읽는다"* 가 **같은 footer 에서 재현된 셈이다.**

`.strip-meta` 는 `@media (max-width: 1023px)` 에서만 숨겨져 있었다 — **1024px 이상에서
실제로 렌더되던 표면**이다. 375px 만 보는 점검이었다면 존재 자체를 놓쳤다. 마크업을
지우면서 죽은 `.strip .strip-meta` 규칙도 함께 걷었다.

## 고치지 않은 것

**정정하지 않은 것이 결과의 대부분이다.** 0 건은 정당한 결과이고, 억지로 고치면
근거 있는 서술을 무근거로 대체하게 된다 — H-1 에서 두 번 일어났다.

- **`.cl` 21 개 중 19 개 무변경.** `TAG · # 접두 정적 라벨`(md `### tag` 축자),
  `BADGE · 시맨틱 + dot + count`, `SEGMENTED · 상호배타 뷰 전환`,
  `PAGINATION · invert-fill active`, `TABLE · tabular-nums … row hover`,
  `EMPTY STATE · 56px 아이콘 원형 + CTA` 등 전부 md 가 적는다.
- **`BOTTOM SHEET · 모바일` 무변경.** 의심했으나 md 가 *"모바일 바텀 시트"* 로
  시작한다. 열어 보지 않았으면 무근거로 오판했을 자리다.
- **`.wcard-sub` 2 건 무변경.** `그림자 없이 1px border-subtle로 구조를 만든다` 는
  md Do 의 축자에 가깝고, `--shadow 변형만 shadow-2를 얹는다` 는 md `### card` 가
  적는다. 목업 문구처럼 보인다는 이유로 지웠다면 근거를 잃었을 것이다.
- **`.caption` 4 · `h2` 4 무변경.** `버튼은 동사`(md Do) · `칩 active는 invert-fill`
  (md `### chip`) · `scrim 50% · elevated는 shadow-pop / shadow-4`(md `### modal` ·
  `### dropdown-menu`) 모두 근거가 있다.
- **`h1` `커리어를 시작하는 가장 가까운 방법.` 무변경.** 브랜드 슬로건이지만
  **카탈로그 관례를 실측해 판단했다** — toss(`금융을 더 쉽게, 토스로 한번에.`) ·
  class101 · codeit · yeogi 가 같은 형태이고, 그중 toss 는 5차 감사를 통과하며
  그대로 남았다. wanted 만 바꾸면 카탈로그가 불균질해진다.
- **편측 서술 2 건 무변경.** `focus glow … 20% (dark는 채도 더 살림)` 과
  `MARKETING HERO BANNER … (두 테마 모두 동일)` 은 다크에만 있으나 **둘 다 참이다.**
  후자는 토큰 값을 실측해 확인했다 — `grad-navy` · `grad-stop-1~3` 네 개가 양 테마
  바이트 동일이다. 5차(toss)가 "같은 문자열이 한 테마에서 거짓" 인 결함을 만든 뒤라
  이번엔 문자열이 아니라 값을 봤다.

## 검증

```
validate:previews (wanted)  0 blocking · warn 3 (기준과 동일, 신규 0)
validate:catalog  PASS      tokens:check  17 in sync
audit:oklch  0 mismatched   check:last-updated  services/*.md 무변경으로 해당 없음
typecheck / lint  PASS      test  496 passed (37 files)      build  PASS
```

warn 3 건(`bare-1fr` light·dark, `hex-colors-present` dark)은 기준 커밋 `38983d1` 에
이미 있던 것으로 이 PR 이 만든 것이 아니다 — 정정 전후 목록을 대조해 확인했다.

**375 / 768 / 976 / 1440 × light·dark 에서 문서 오버플로우 0 · 서술 표면 잘림 0.**
`.wtable` 이 375px 에서 폭을 넘지만 `.table-scroll`(`overflow-x: auto`) 안이라
스크롤이지 절단이 아니며 기준 커밋에서도 같다.

편집 후 남은 라이트·다크 산문 발산은 `.lede` 앞 두 문장(각 테마가 자기 캔버스를
설명)과 위 편측 서술 2건뿐이고 **전부 의도된 것**이다. 그라디언트 문장은 동일해졌다.

## 남은 것 — 9차 이후

잔여 10개 슬러그. **후보 개수는 상한이지 감사 단위가 아니고**, 여기 적힌 수는
슬러그별 *대표 클래스 하나*의 후보 수다 — 이번에도 `cl` 21 로 올라 있던 wanted 의
실제 서술 표면은 **55개**였다. 다음 슬러그를 이 수로 고르지 말 것.

| slug | 후보 클래스 | 후보 수 |
| --- | --- | --- |
| gmarket | `card__note` | 19 |
| baemin | `card-note` | 16 |
| class101 | `cell-cap` | 12 |
| vapor-ui | `caption` | 7 |
| bezier · kyobobook | `fam-head` · `panel-note` | 7 · 7 |
| yeogi | `card-note` | 5 |
| teamsparta | `caption` | 2 |
| codeit · 11st | 미특정 | — |

**`bezier` 는 저작권 축만 판정됐다**(H-1). 서술 전수는 미착수이므로 9차 이후가 이
항목을 "완료" 로 취급하면 안 된다. `wanted` 와 `line-design-system` 은 이제 끝났다.
