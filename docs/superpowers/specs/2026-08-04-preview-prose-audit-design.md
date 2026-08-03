# 브랜드 자산 리스크 정정 — 묶음 H-1: 저작권 축 판정 + 그리팅 이월

- 날짜: 2026-08-04
- 선행: PR #206(묶음 A·B), #209(seed-design 범위), #210(D-1), #212(D-2), #213(E)
- 대상: `public/preview/wanted/{light,dark}.html`, `public/preview/greeting/{light,dark}.html`,
  `src/lib/preview-validator.ts`

## 배경

감사 계열의 여섯 번째다. 묶음 H 는 **프리뷰 산문 전수 감사**이고 크기가 커서, H-1 은
**발견 작업이 이미 끝난 항목만** 담는다 — D·E 스펙이 인계한 저작권 축 3건과, A·B
스펙이 인계한 그리팅 이월 6건.

## H-1a. 저작권 축 — 인계 메모의 분류가 틀렸다

D 스펙(`2026-08-03-preview-disclosure-banner-design.md:255-262`)은 krds 의
`© Ministry of the Interior and Safety, Republic of Korea. All rights reserved.` 를
인계하며 **"`bezier`(© Channel Corp.) · `line-design-system`(© LY Corporation) ·
`wanted`(© 2025 Wanted Lab) 도 같은 형태다"** 라고 적었다. **파일을 열어 보면 셋은
서로 다른 구조에 있고, 실제 편집이 필요한 것은 하나뿐이다.**

| 파일                                        | 마크업 위치                                                                                                     | 판정                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| `bezier` light:1079 / dark:1081             | 프리뷰 자체 `<footer>` 의 `<h4>License</h4>` 열. 같은 열에 `Apache-2.0` 와 `channel-io/bezier-react`            | **무변경** — 라이브러리에 대한 정확한 귀속. E 스펙:163 이 이미 "올바른 귀속의 모범"으로 지정 |
| `line-design-system` light:1884 / dark:1929 | `Footer · 애플리케이션 (모바일)` 카드 안. 카드 제목이 `Social · Items · Copyright`, 노트가 `copyright gray-400` | **무변경** — 저작권 줄이 **시연 대상인 슬롯 자체**다. 지우면 시연할 것이 사라진다            |
| `wanted` light:995 / dark:998               | 프리뷰 자체 `<footer class="footer">` 안, `원티드 · ko/design.md preview · light theme` 바로 옆                 | **재작성** — krds 부류                                                                       |

**개수를 근거로 작업을 잡았으면 셋을 똑같이 처리했을 자리다.** 이 표를 남기는 이유는
H-2 이후가 `bezier`·`line-design-system` 을 다시 열지 않게 하기 위해서다.

### `wanted` 재작성

```
before: © 2025 Wanted Lab · Wanted Sans (OFL) · Pretendard JP
after:  Wanted Design System 발행 원티드랩 · Wanted Sans (OFL) · Pretendard JP
```

E 가 krds 에서 쓴 변환(권리 주장 → 발행 주체 서술)을 그대로 적용했다. 지킨 세 가지 —
ⓐ `©` 로 권리를 주장하지 않는다 ⓑ 발행 주체가 원티드랩이라는 사실은 남긴다
ⓒ 폰트 귀속 두 개는 글자 그대로 보존한다.

**폰트 귀속을 남기는 근거는 관례가 아니라 사실이다** — `wanted/light.html:9` 가
jsDelivr 에서 `wanted-sans@1.0.3` 을 실제로 로드한다.

**값 자체도 틀려 있었다.** 몽타주 공식 이용약관의 표기는 `© 2026 Wanted Lab, Inc.`
(`services/wanted.md:1002`)로, 프리뷰의 `© 2025 Wanted Lab` 은 연도와 법인 표기가 둘 다
어긋났다. `©` 를 걷어내면 이 오류도 함께 사라진다.

**MIT 의무를 훼손하지 않는다.** 몽타주 웹 구현체는 MIT 이고 저작권 표시·라이선스 전문
포함이 의무지만(`services/wanted.md:32`), 이 프리뷰는 `montage-web` 코드를 재배포하지
않는다 — 핸드오프 번들과 공개 문서를 근거로 손으로 쓴 마크업이다. MIT 귀속이 놓일 자리는
`services/wanted.md` 와 그 References 이고, 거기서 이미 이행된다.

### 검토했으나 결함이 아닌 것 (H-2 가 재논의하지 않도록)

- **greeting Dropdown/`fbox` 의 `3겹 오버레이 그림자` 서술.** `services/greeting.md:353` 의
  `overlay` 토큰 주석이 `Toast 실측(3겹)` 이라 용도 매핑 오류로 보이지만, 프리뷰
  `.fbox` CSS 는 실제로 `var(--sh-overlay)` 를 쓴다. 즉 이름이 `overlay` 인 토큰을
  오버레이 표면에 적용한 것을 서술한 **관찰문**이지 두들린이 드롭다운에서 실측했다는
  주장이 아니다. 무변경.
- **greeting dark Table 노트의 `선택 행은 라이트의 blue50 자리를 brand 틴트로 대신한다`.**
  `blue50` 은 md:85 에 실재하고, 문장은 이 프리뷰의 다크 렌더링에 대한 관찰이다. 무변경.

## H-1b. 그리팅 이월 6건

A·B 스펙(`2026-08-02-…-design.md:276-287`)이 인계한 목록이다. 각 주장을
`services/greeting.md` **전문**과 대조했고, 판정은 grep 히트 수가 아니라 **그 히트가
주장을 떠받치는지**로 냈다.

### 지운 것 — 근거가 없다

| 프리뷰 서술                                                                                   | md 대조                                                                                                                                           |
| --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 두들린 워드마크 자형 (`lowercase, rounded, slight lean` / `소문자·둥근·오른쪽으로 살짝 기운`) | 0건. 상표의 글자 형태에 대한 사실 주장                                                                                                            |
| `영문은 Doodlin Corp.`                                                                        | 0건. md:22 는 `두들린 주식회사` 로만 적는다                                                                                                       |
| `제품군은 그리팅 ATS · 그리팅 TRM`                                                            | md:26·569 의 모듈명은 `채용 ATS` · `인재영입 TRM` 이다                                                                                            |
| `✕ Greeting HR, 그리팅HR` · `greetinghr.com 은 도메인일 뿐 제품명이 아닙니다`                 | 0건. 규범문                                                                                                                                       |
| 기능명 7개 나열                                                                               | 일곱 중 여섯이 0건                                                                                                                                |
| Table `데이터 행 48px` · `세로선이 없다`                                                      | md 의 48px(305·449)은 Toast 오른쪽 패딩. 부재 주장                                                                                                |
| Drawer `모서리를 굴리지 않는다(radius0)` · `0.3s 듀레이션 자리`                               | md 에 `Drawer` 0건. `radius0` 토큰은 md:323 에 실재하나 이 용도에 매핑한 근거가 없고, `0.3s` 는 md:485 가 `여기뿐`(ToggleSwitch)이라 **반박한다** |
| `DropdownItemSelect`                                                                          | md:499 는 `Dropdown`/`DropdownItem` 만 적는다. dark 는 이미 이 문장이 없어 light 만 남은 잔여였다                                                 |

**`면접 일정 조율` 은 md 히트가 1건 있지만 그 1건이 `md:527` 의 Don't 안이다.** 히트 수만
셌으면 근거로 오인했을 자리이고, 이 저장소는 전에 정확히 그렇게 틀린 적이 있다
(krds `간편인증`·`공동인증서`, PR #213).

### 남긴 것 — 전문 검색이 근거를 찾았다

계획 단계에서 **지우려던 셋이 여기 해당한다.** 이 항이 이 스펙에서 가장 중요한 기록이다.

| 프리뷰 서술                                | md 근거                                             |
| ------------------------------------------ | --------------------------------------------------- |
| Drawer `헤더는 셸과 같은 56px`             | md:461·537 `232px 고정 사이드바 + 56px sticky 헤더` |
| Dropdown `배치는 Floating UI 가 담당`      | md:477                                              |
| Table `With Fixed 컬럼 고정 + 가로 스크롤` | md:499·542                                          |
| Table `헤더 행 40px`                       | md:548                                              |

### 고친 것 — 자기반박

Icon 카드 부제 `⚠ Lucide substitutes — real Doodlin geometry is not published` 는 같은
카드 노트의 _"이 프리뷰는 대체본조차 그리지 않고 중립 슬롯과 합성형 이름만 옮긴다"_ 와
어긋났고, 마크업도 `<i class="isl">` 중립 슬롯이다. 부제를 마크업 실제에 맞췄다.

### 삭제가 아니라 재작성

Drawer 노트는 지우는 대신 **재현 표기**로 바꿨다 — 같은 파일 Button 카드가 이미
_"밀도 비교용 재현이지 두들린 공개 규격이 아니다"_ 라는 형식을 쓴다. Naming 카드의 무출처
기능명 7개도 삭제가 아니라 **출처 있는 다섯 모듈**(채용 ATS · 채용 홈페이지 Homepage ·
설문 Form · 인재영입 TRM · 분석 Analytics, md:26·569)로 바꿨다.

**규범문을 관찰문으로 바꾸는 것은 이 저장소의 기존 판단이다** — 프리뷰 산문은
`validate:catalog` 의 인용 검사를 우회하므로(md 에서 정정된 오귀속이 캡션에 생존한 전례가
그리팅에 있다), 프리뷰는 규범을 선언하지 않고 관찰만 적는다. seed-design 철회 선례를 따른다.

### 테마 대칭

D·E 에서 쓰던 "두 테마 바이트 동일 편집" 검증은 **여기서 쓸 수 없다.** greeting light/dark 는
이 구간에서 원래 다르다 — dark Table 노트에 `선택 행은 라이트의 blue50…` 문장이 하나 더 있고,
`DropdownItemSelect` 줄은 light 에만 있었다. 그래서 의도한 차이 목록을 먼저 적고 편집 후
그 외의 차이가 새로 생기지 않았는지를 확인했다. 결과: 새 차이 0건.

용량은 순삭제라 여유가 늘었다 — light 123,459 → 122,966 (−493 B) · dark 125,297 → 124,867
(−430 B). 캡 131,072 까지 여유 dark 기준 6,205 B.

## H-1c. `rights-reserved-claim` (block)

`preview-validator.ts` 의 `checkFile()`, 정부 식별자 블록 뒤. `/all\s+rights\s+reserved/i`
가 잡히면 block.

**`©` 전체가 아니라 이 구절만 잡는 이유**는 위 H-1a 표가 그대로 근거다 — `©` 는 정확한
귀속일 수 있고, `bezier`·`line-design-system` 이 그 예다. `©` 전부를 잡는 규칙이었다면
그 둘을 지우라고 요구했을 것이다. `All rights reserved` 는 **적극적 권리유보**이고, 이
카탈로그가 쓴 파일에서 참일 수 없는 부분은 그쪽이다.

**첫 판부터 block 인 이유.** `missing-disclaimer-banner`(D-1)와
`government-identifier-unlabelled`(E)는 둘 다 warn 으로 시작했다. 그 근거는
ⓐ 기존 파일이 위반 중이었고 ⓑ 작성자 프롬프트가 그 축을 몰라 Stage 9a2 block 을 만나도
스스로 못 고쳤기 때문이다. **여기는 둘 다 해당하지 않는다** — 묶음 E 가 마지막 하나를
제거해 `public/preview` 전수 0건이고, 파이프라인이 이 구절을 처방한 적이 없어 작성자가
만들어 낼 경로가 없다. 따라서 `.claude/skills/design-md/` 배선 없이 성립하고, CLAUDE.md 의
사전 합의 절차도 필요 없다.

테스트 3건은 **양방향 뮤테이션**으로 검증했다 — 정규식을 절대 매치되지 않게 바꾸면
1·3번이, `/©/` 로 넓히면 2·3번이 깨진다. 어느 하나도 통과만 하는 장식이 아니다.

## 묶음 H 전체 지도 (H-2 이후)

프리뷰 산문 서술문 실측 (light.html, 한글 종결형 ≥18자, 2026-08-04):

```
greeting 62 · krds 29 · socar 22 · class101 20 · vapor-ui 19 · gmarket 18 · kyobobook 16
yeogi 8 · teamsparta 8 · codeit 8 · line-design-system 7 · wanted 6 · baemin 5
toss 3 · 11st 2 · bezier 1 · (seed-design 15 — 범위 밖)
```

seed-design(15)·greeting(62, 이 PR 로 이월분 소진)을 빼면 **172문장**이고 그중
**124개가 상위 6슬러그**에 몰린다. H-2 는 이 6개부터 잡는 편이 효율이 높다.

판정 기준 5개(A·B 스펙이 세운 것):

1. **미출처 규범문** — md 에 근거 없이 "~해야 한다 / ~하지 않는다" 를 선언
2. **자기반박 사실주장** — 같은 카드의 다른 문장이나 마크업 실제와 어긋남
3. **고아 서술** — md 에 존재하지 않는 컴포넌트·값을 서술
4. **용도 매핑** — 실재하는 토큰을 md 가 지정하지 않은 용도에 귀속
5. **벤더 중립** — md 의 Don't 절이 금지한 이름·개념을 산문이 전파

**seed-design 은 리뉴얼 준비 중이라 묶음 C~H 전체의 범위 밖이다**(PR #209).

## 범위 밖

- 묶음 **C**(로고 리사이즈 — `gmarket-logotype.png` 3020×800, `toss-logotype.png`
  1920×1784/325 KB 등 6개) · **F 잔여**(rubric 로고 조항, `parseRobots` 이름지정 UA) ·
  **G**(`public/logos/SOURCES.json`) · **#214**(룰 승격 + 위치 대응 갭)
- **묶음 G 의 난이도 재평가 (2026-08-04).** 로고 파일들의 커밋 메시지는 전부
  `feat(catalog): add …` 형태로 취득 URL 을 담지 않고, `SKILL.md:75` 는 오히려
  _"Do not download logos from the web"_ 라 파이프라인이 URL 을 남긴 적이 없다.
  G 는 기록 전사가 아니라 **역추적 조사**다 — 착수 전에 이 점을 반영해 견적할 것.
