# 묶음 H-4 — 그리팅 프리뷰 산문 감사 마무리 (Brand · Components · ATS)

브랜드 자산 리스크 감사 계열의 아홉 번째이자 **그리팅을 끝내는 조각**이다.
H-3(PR #220, squash `0e5d96c`)이 Foundations 4개 그룹을 착지시켰고 감사 도중
`services/greeting.md` 자체의 인용 결함까지 고쳤다. 남은 **01 Brand · 03 Components ·
04 Greeting ATS** 를 여기서 다룬다.

이 계열이 지키는 규칙은 하나다 — **프리뷰 산문이 `services/*.md` 가 뒷받침하지 않는
주장을 하지 않는다.** `validate:catalog` 는 md 의 `[src:N]` 만 검사하고 프리뷰 산문은
무게이트라 이 대조는 사람이 한다.

## 대조 결과 — 19 건 정정

`origin/main`(`ff584e3`) 기준. **판정 단위는 노트가 아니라 주장**이다.

| 그룹 | 정정 | 비고 |
| --- | --- | --- |
| 01 Brand | 2 | 부제 2. 본문 `slot` 3 · `name-k` 2 는 근거 있음 |
| 03 Components | **14** | 아래 분류 참조 |
| 04 Greeting ATS | 2 | `원본 카드` 2 곳. 셸 규격 서술은 근거 있음 |
| 05 Shape | 1 | H-3 범위였으나 같은 구멍으로 놓친 것 |
| 히어로 | 0 | 어느 묶음의 범위에도 든 적이 없던 자리 |

**히어로와 04 의 셸 규격 서술은 정정 0 건이다.** 0 건은 정당한 결과이고, 억지로
고치면 근거 있는 서술을 무근거로 대체하게 된다 — H-1 에서 두 번 일어났다.

**세는 단위는 "고친 표면" 이다.** 리뷰 라운드에서 이 19 개 중 **두 개의 대체 문구가 한 번
더 다듬어졌다**(`Reproduced to the shell's 56px header` → `… to match …`,
`photography` → `portrait photography`, 커밋 `bd134a4`). 표면은 늘지 않았고 같은 자리의
문구가 개선됐으므로 19 를 유지한다 — **편집 횟수로 세면 21 이다.** 이 계열이 계수로
네 번 틀렸던 이유가 매번 단위가 흔들려서였으므로 단위를 명시해 둔다.

그중 `portrait photography` 는 단순 다듬기가 아니었다. **이 부제를 고친 이유 자체가 카드
본문 슬롯("진한 파랑 그라디언트 + 인물 사진")과 어긋났기 때문**인데, `photography` 로
일반화하면 같은 어긋남을 한 단계 줄인 채로 남겨 두는 셈이었다.

## md 와 충돌한 것 — 4 건

- **TextArea 노트** `스토리가 7개로 가장 많은 조합을 갖는 컴포넌트다`. md `### text-area`
  는 "`Button`(8개) 다음으로 조합이 많고, **입력 계열에서는 최다**" 다. 최상급이 한 단계
  과장돼 있었다.
- **Button 부제** `5 variants · 3 sizes · icon, status dot, disabled`. md `## Known Gaps` 는
  "Button 도 large(56px)만 실측됐고 그보다 작은 사이즈 규격은 확인되지 않았다" 고 적고,
  **같은 카드의 노트가 이미 "위의 40px·32px 은 밀도 비교용 재현이지 두들린 공개 규격이
  아니다" 라고 반박하고 있었다.** 렌더도 variant 는 filled·outlined 둘뿐이다.
- **다크 Tabs 노트** `Tooltip 은 Toast 와 같은 반전 서피스라 다크에서 밝은 면이 된다`.
  md 가 Tooltip 에 대해 싣는 것은 래퍼 padding 16px 하나뿐이다. 라이트가 싣는 md 근거
  문장(TabsRail 별개 계열 · Tooltip padding 16px)으로 되돌렸다 — **다크 쪽이 근거 있는
  두 사실을 버리고 없는 사실 하나를 얻은 상태였다.**
- **다크 Toast 부제** `Dark floating notification`. 같은 카드의 다크 노트가 "램프가
  뒤집히므로 **다크에서는 밝은 면에 어두운 글자**가 된다" 고 적고, `dark.html:140` 의
  CSS 주석도 `/* 다크에서는 밝은 면이 된다 */` 라고 적는다. 부제만 반대로 말했다.
  라이트의 같은 부제는 md `### toast`("라이트 기준 배경 gray600")와 맞아 그대로다.

## md 에 없는 값·용도를 실측처럼 적은 것 — 8 건

- **RecommendationInfo 노트** `background2 채움 + radius4 로 끝낸다`. md 는 이 컴포넌트의
  값을 싣지 않는다("추천인 정보 블록이고 `RecommenderInfo` 가 짝을 이룬다" 가 전부).
  그 수치는 `### callout` 실측이다. 이 프리뷰의 `.rec` CSS 가 실제로 `--bg-2` / `--r4` 를
  쓰므로 **값이 틀린 게 아니라 출처가 틀렸다.** 재현 표기로 바꿨다.
- **Drawer 카드** — md 전문에 `Drawer` 가 0 건이다(하이픈·대소문자 정규화 후에도 0).
  노트는 H-1 이 이미 재현 표기로 바꿨으나 **제목·부제가 남아 컴포넌트명과 규격을
  주장하고 있었다** — 표면 목록에 카드 헤더가 없어 두 번 연속 지나갔다.
  `Fields` · `Selection` · `Utility` 처럼 총칭 제목을 쓰는 선례가 이미 파일 안에 있어
  `Side panel` 로 바꾸고 부제를 노트와 같은 틀로 맞췄다.
  **컴포넌트 부재를 주장하지는 않았다** — md 는 컴포넌트 그룹이 60 개라고 적으면서
  `## Components` 에는 24 개 하위절과 "이 밖에 …" 한 줄만 싣는다. 즉 md 자체가 전수가
  아니므로 "공개된 Drawer 가 없다" 는 코퍼스만으로 단정할 수 없다.
- **Callout 부제 `five tones`** — md 는 Callout 의 톤을 세지 않는다. 렌더는 5 행이지만
  그건 이 데모의 구성이다. 수치만 걷어냈다.
- **RecommendationInfo 부제 `Employee-referral panel`** — md 는 "추천인 정보 블록" 이고
  사내 추천 제도라는 서술이 없다.
- **MenuItem 부제 `32px sidebar rows`** — md 는 height 32px 만 싣고 **MenuItem 이 사이드바에
  산다는 서술이 없다.** 232px 사이드바는 `### template` 의 것이고, 둘을 잇는 것은 이
  프리뷰의 재구성이다.
- **Tabs 부제 `hover label`** — md 가 Tooltip 에 대해 싣는 것은 래퍼 padding 뿐이라 트리거
  동작 주장이 근거 없다. md 자신이 "`Usage` 스토리 20개도 전부 인터랙티브 데모라
  '언제 무엇을 쓰라'는 서술 규칙이 없다" 고 밝힌다.
- **`The parent company mark`**(01 Brand) — 두들린은 그리팅을 **만드는 회사**이지 모회사가
  아니다. 그리팅은 회사가 아니라 제품이므로 모자 관계 자체가 성립하지 않는다.
- **`Marketing gradient and collateral cover`**(01 Brand) — md 가 마케팅 표면에 대해 싣는 것은
  "진한 파랑 그라디언트와 인물 사진" 이다. **같은 카드의 본문 슬롯도 "진한 파랑
  그라디언트 + 인물 사진" 이라 적어, 부제만 어긋나 있었다.**

## 자기반박 — 1 건

**QuestionAnswer 카드 본문의 `보관된 응답 — ArchivedAnswer`.** md 는 `ArchivedAnswer` 를
`Forms/FormResponse/` 하위로 싣고, **같은 카드의 노트가 ATS/ 하위를 `Question` · `Answer`
로 정확히 한정한다.** 데모가 Forms 컴포넌트를 ATS 카드 안으로 끌어왔다. 컴포넌트명만
뺐다 — Forms 카드(`light:1091`)는 제자리에 그대로 싣는다.

## 프리뷰의 재구성을 시스템 사실처럼 적은 것 — 4 건 (전부 다크)

`떠 있는 면이 gray25 로 한 단계 밝아진다`(Modal · Dropdown · Shape)와
`선택 행은 라이트의 blue50 자리를 brand 틴트로 대신한다`(Table).

md 는 **라이트 1280×900 렌더만 실측했다**(`## Responsive Behavior`). 다크의 부양 표면
처리는 md 에 없고, `dark.html:137` 의 CSS 주석이 스스로 "다크의 floating 표면은
base(검정) 위에 gray25 로 한 단계 올라선다" 라고 밝힌다 — **작성자는 프리뷰의 결정임을
알고 있었고 산문만 그렇게 읽히지 않았다.** 문장을 지우지 않고 주어를 프리뷰로 돌렸다.

`gray25` 자체는 md `### gray 램프의 거울 구조` 가 다크값 `oklch(0.205 0.000 0)` 을 싣고,
그게 다크 base(`gray0` = 검정)보다 한 단계 밝은 것도 맞다. **값이 아니라 귀속이 문제였다.**

## 04 Greeting ATS — `원본 카드` 2 건

부제의 `(original card is click-through)` 와 노트 첫 절의 "원본 카드는 클릭 가능한
재현이지만" 을 걷어냈다. **md 전문에 "원본 카드" 가 없다** — 파이프라인 내부(핸드오프
번들)를 가리키는 말이라 프리뷰 독자에게는 "실제 그리팅 지원자 목록이 클릭 가능하다"
는 제품 동작 주장으로 읽힌다. 프리뷰가 정적이라는 사실 자체는 남겼다.

## 남긴 것 중 판단이 갈린 자리

- **Dropdown 의 `3겹 오버레이 그림자`** — md 는 이 토큰을 `overlay` 로 이름 붙이고
  "떠 있는 표면에만 … 붙는다" 는 일반 규칙으로 서술한다. 값 자체는 Toast 실측이지만
  **토큰명이 컴포넌트가 아니라 역할을 가리키므로** 적용으로 본다. Fields·MenuItem 이
  `### button-states` 의 hover·disabled 를 인용하는 것과 같은 층위다(md 가 그 절을
  "시스템 전역 규칙" 이라 명시한다).
- **QuestionAnswer 부제 `The atom of the applicant review screen`** — 측정 주장이 아니라
  md `### ats-question-answer`("여기서만 볼 수 있는 컴포넌트" · 질문–답변 쌍 표시)의
  비유적 요약으로 본다.
- **Callout 노트의 `톤은 선두 슬롯의 시맨틱 색으로만 갈린다`** — md `## Shapes` 가
  "단독 또는 Callout/Toast 선두 20px" 로 선두 슬롯 자체는 싣는다. 수치 주장이 아니라
  구성 서술이라 남겼다. **부제의 `five tones` 와 갈린 판단이라는 점은 인정한다** —
  걷어낸 쪽은 세어 말할 수 있는 수치였고, 남긴 쪽은 아니다.
- **마크업·CSS 의 `.drawer` 식별자 11 곳** — 가시 텍스트에는 `Drawer` 가 0 건이지만
  셀렉터·주석에는 남아 있다. **산문 정정 PR 에서 마크업을 바꾸면 회귀 원인이 섞이므로
  손대지 않았다.** "파일 어디에도 잔여가 없는가" 에 대한 답은 아니오다.
- **01 Brand 의 `Doodlin wordmark` 카드** — 빈 회색 박스 하나("두들린 워드마크 — 자산
  미수록")만 렌더하고 시각적으로 시연하는 것이 없다. 그 카드가 말하는 "두들린은 회사,
  그리팅은 제품" 은 같은 그룹의 그룹 리드 · 카드 노트 · Naming 부제 · Naming 본문에서
  **네 번 반복된다.** 산문에 거짓이 없어 이 PR 의 판정 대상은 아니었고, 카드 삭제는
  카운터 두 곳(`grp-ct` `3장` · 상단 `35 cards`)을 함께 내려야 하는 마크업 변경이다.
  **로고 자산 자체는 이미 깨끗하다** — `public/logos/greeting.svg` 하나뿐이고 양 파일에서
  3 회씩(히어로 · ATS 셸 사이드바 · 푸터) 실제로 참조된다. 고아 파일 0 건(묶음 B, #206).

## 표면 목록이 또 좁았다 — 이번에는 세 겹으로

**계획서가 잡은 표면은 49 개였고, 실제로 대조해야 했던 것은 그보다 많았다.**

1. **light 에서만 산문을 뽑았다.** 두 파일은 바이트 동일이 아니다 — 다크 전용 문장
   9 곳이 03 Components 안에 있었고 그중 4 곳이 정정 대상이었다. Tooltip 오귀속은
   다크에만 있어 라이트만 봐서는 **존재 자체가 보이지 않았다.**
2. **분기 검출기가 절반을 놓쳤다.** `<p class="note">[^<]*` 로 뽑아 비교했더니 첫
   인라인 태그 앞까지만 봤고, `<b>` 뒤에서 갈리는 노트가 "동일" 로 나왔다. 태그를
   걷어내고 다시 세니 **7 이 아니라 13** 이었다(전체 텍스트 기준으로는 41).
3. **분기 검출은 원리상 Toast 부제를 못 잡는다.** 양 테마가 **같은 문자열**이라
   "분기 없음" 으로 나오는데 틀린 쪽은 다크뿐이었다. **테마 간 차이를 보는 도구는
   각 테마의 참거짓을 보지 않는다** — 분기 목록은 대조 대상을 좁히는 데 쓰고
   각 표면의 판정은 따로 해야 한다.
4. **카드 본문의 `slot`(3) · `name-k`(2) · `qa` 라벨과 히어로(5)가 목록에 없었다.**
   `qa` 라벨에서 위 자기반박 1 건이 나왔다.

**계수가 네 번 연속 작았다** — H-1 의 172(단위 오류) · H-2 의 krds 4→30 · H-3 의 36→93 ·
이번 49→그 이상. 매번 원인이 다르다는 점이 핵심이다. 같은 실수의 반복이 아니라
**"이 파일에서 카탈로그가 말하는 자리가 전부인가" 를 묻는 방법이 매번 한 축씩
부족했다.**

이번에 쓴 방법을 남긴다 — 다음 슬러그는 여기서 시작하면 된다:

```bash
# 1. 산문을 담은 클래스 전수 (20자 이상 한글)
grep -oE '<[a-z]+ class="[^"]+"[^>]*>[^<]{20,}' public/preview/<slug>/light.html \
  | sed -E 's/^<[a-z]+ class="([^"]+)".*/\1/' | sort | uniq -c | sort -rn
```

```bash
# 2. 테마 분기 — 태그를 걷어내고 비교할 것 (분기가 없다고 옳은 것은 아니다)
for f in light dark; do
  sed -e '/<style/,/<\/style>/d' -e 's/<[^>]*>/\n/g' public/preview/<slug>/$f.html \
    | sed 's/^ *//;s/ *$//' | grep -v '^$' > /tmp/x_$f.txt
done
diff /tmp/x_light.txt /tmp/x_dark.txt
```

## 도구가 세 번 거짓말했다

1. **메인 리포에서 `ls public/preview/` 가 `greeting` 없음 · `note=0` 을 반환했다.**
   작업트리가 낡은 커밋에 있었다. **워크트리 환경에서 파일시스템 조회는 브랜치
   상태의 증거가 아니다** — `git show origin/main:<path>` 로 읽어야 한다.
2. **`tr -d '-_ '` 가 `-_` 를 옵션으로 해석해 실패했고 빈 파일이 남아, 19 개 컴포넌트
   이름이 전부 "md 부재" 로 나왔다.** 실제 부재는 `Drawer` 하나였다. 파이프 중간
   실패가 0 을 만들었고, **이 작업에서 0 은 곧 "결함 발견" 이라 거짓 측정이 거짓 결함을
   만드는 방향으로 기울어 있었다.** 정규화·필터를 거친 계수는 중간 산출물이 비어
   있지 않은지(`wc -l`) 먼저 확인할 것.
3. **`git commit -m @'…'@` 는 PowerShell 문법이고 Bash 에서는 리터럴 `@` 가 붙는다.**
   이 저장소의 CLAUDE.md 가 Bash 툴을 POSIX sh 로 명시하는데도 세션 내내 그렇게 썼다.
   결과로 **`0e5d96c`(PR #220 squash)의 본문에 홀로 선 `@` 줄이 2 개 박혔다** — 제목
   바로 아래와 `Signed-off-by` 아래. 되돌리려면 `main` 히스토리를 다시 써야 하므로
   그대로 두고 여기 남긴다. 앞선 두 머지(`2d0fca7` · `6420c0a`)는 깨끗하다.
   **여러 줄 커밋 메시지는 파일에 쓰고 `git commit -F <file>` 로 넘길 것.**

md 를 읽을 때의 기존 함정도 그대로 유효하다 — **`cut -c1-N` 으로 md 줄을 자르지 말 것.**
md 는 한 문단이 한 줄이라 `cut` 이 문단 중간을 자르고, H-3 초판 오판이 그렇게 났다.
폭이 필요하면 `fold` 를 쓴다.

## 정오표 — H-3 스펙의 그리팅 표면 지도

H-3 스펙은 그리팅 표면을 93 개(note 42 · card-hd 44 · grp-hd 7)로 적었다. 그 수는
**#221 병합 전 기준이고 라이트 단독 계수**다. 현재 실제는 note 35 · card-hd 35 ·
grp-hd 7 에 **다크 전용 문장 · 카드 본문 · 히어로**가 더해진다. 지우지 않고 남긴다 —
무엇이 왜 틀렸는지가 다음 사람에게 필요하다.

## 검증

- 게이트 — `typecheck` · `lint` · `test`(**423**) · `validate:previews`(greeting
  **0 blocking / 0 warning**) · `tokens:check`(17 sidecar in sync) ·
  `audit:oklch`(0 mismatched) · `validate:catalog`(17 files, 0 blocking, greeting `ok`).
  `validate:catalog` 의 warning 9 건은 다른 슬러그의 기존 항목이고 이 PR 과 무관하다.
- `check:last-updated` — `no services/*.md changed`. **이번 PR 은 md 를 건드리지 않는다.**
  H-3 과 달리 md 쪽 결함이 나오지 않았다.
- **`format:check` 는 이 PR 과 무관하다** — 스크립트가 `**/*.{ts,tsx,js,jsx}` 만 검사하고
  HTML 은 대상이 아니다. 직접 `prettier --check` 를 걸면 두 파일이 잡히지만 **재포맷하면
  안 된다** — 이슈 #222 가 보여주듯 `swatchFillCount` 가 "한 줄 = 한 엘리먼트" 불변식에
  의존하고 있어, 속성을 줄바꿈하는 순간 그 게이트가 조용히 무력화된다.
- 육안 — 4폭(375 · 768 · **976** · 1440) × 2테마 8 조합에서
  `documentElement.scrollWidth - clientWidth == 0`. 정정한 표면이 양 테마에서 전부
  렌더되는 것을 텍스트로 확인했다. 스크린샷은 Playwright MCP 로 찍었다(이 저장소에서
  `preview_screenshot` 은 행이 걸린다).
- 테마 분기 — 전체 텍스트 기준 기준선 41 → 현재 41. Tabs 노트를 라이트와 같게
  되돌려 하나가 줄고, 다크 Toast 부제를 고쳐 하나가 늘었다. **의도하지 않은 분기는 없다.**
- 용량 — raw 바이트 light 104,379 → 104,353(**−26**) · dark 105,969 → 106,025(**+56**).
  게이트는 #221 이후 brotli 기준(`BLOCK_BROTLI_BYTES = 40 KiB`)이므로 raw 로 전송량을
  논하지 않는다. `validate:previews` 가 두 파일 모두 통과했다.

## 커밋 전 서브에이전트 리뷰

계획대로 1 회 돌렸고 **새로 넣은 문구(ⓒ)와 지운 것(ⓑ)에서는 결함 0 건**이었다.
그 리뷰가 찾아낸 것이 위 5 건이다 — 다크 Toast 부제 · MenuItem `sidebar` ·
Tabs `hover label` · QuestionAnswer 의 `ArchivedAnswer` · 04 의 `원본 카드`.
**표면 목록의 세 번째·네 번째 구멍도 그 리뷰가 짚었다.**

## 범위 밖

- **다른 슬러그 12 개가 통째로 미감사다.** 서술 클래스가 슬러그마다 다르다 —
  codeit `cell-note` 24 · gmarket `card__note` 19 + `sec__note` 2 · toss `comp-caption` 9 +
  `caption` 6 · baemin `card-note` 16 · class101 `text-meta-caps` 14 · kyobobook `panel-note` 7 ·
  line-design-system `section-sub` 7 + `note-line` 5 · vapor-ui `caption` 7 + `rc-desc` 4 ·
  11st · bezier · teamsparta · yeogi. **seed-design 제외**(#209, 리뉴얼 준비 중).
- **프리뷰 `.rail` 컨테이너가 radius 축을 시연하지 않는다** — `.rail`(light:420)에
  border-radius 가 없고 `.rail-item`(light:422)만 `--r6` 이다. 값은 md `### tabs`(md:468
  `아이템 height 28px, {rounded.radius6}`)와 어긋나지 않지만 **높이는 28px 이 아니라
  32px** 이라, 이 레일이 시연하는 것이 `Tabs` 인지 `MenuItem`(md:476 이 32px)인지가
  마크업 층에서 모호하다. H-3 이 관찰만 남긴 항목이고 **이번에도 산문이 아니라 마크업
  문제라 손대지 않았다.**

  *(H-3 스펙이 이 관찰에 단 `md:465` 는 그 PR 이 `## Rounded` 에 감사 메모와 표 한 행을
  넣으면서 밀린 줄 번호다. 현재는 468 이다 — **줄 번호 인용은 같은 브랜치가 md 를
  고치는 순간 낡는다.**)*

  이 항목과 `.drawer` 식별자 · `Doodlin wordmark` 카드는 **마크업 정리 PR 로 묶어 별도
  처리한다**(2026-08-05 결정). 이슈를 새로 열지 않는 이유는 추적 지점을 둘로 가르지
  않기 위해서다 — 이 계열은 스펙의 "범위 밖" 절이 실제 인계 경로로 작동해 왔다
  (H-2 → H-3 범위가 그렇게 정해졌다).
- **#222**(`swatchFillCount` 줄 단위 스캔 우회 — 실측 30 → 0, 거짓 통과) ·
  **#214** · **#202** · **#187** · 묶음 **C**(로고 6 개) · **F 잔여** · **G**(`SOURCES.json`).
