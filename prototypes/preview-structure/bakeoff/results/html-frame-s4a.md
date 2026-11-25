# html-frame 문제 4 (a): 라프텔 프리뷰를 처음부터 쓴다

- 가지: `eval/html-frame-s4a` (`0ef2f879` 에서 쳤다)
- 준비 커밋: `2b5ebe2f` (라프텔 기존 프리뷰 삭제만. 파일은 열지 않았다)
- 풀이 커밋: `b33053db`

## "풀었다" 조건

1. 서빙되는 `public/preview/laftel/preview.html` 이 범위(면책 띠, 히어로, 화면 하나, 버튼, 입력)를 라이트와 다크로 싣는다. 채웠다.
2. 약속 검사 `check-frame.ts laftel` 은 `ok`, `pnpm validate:previews --slug laftel --verbose` 는 0 blocking, 0 warning. 채웠다.
3. 이 구조는 원본과 산출물을 따로 두지 않는다(안내 1절: 손으로 쓴 HTML 한 장이 곧 서빙 파일). 어긋남 검사가 따로 없다. 해당 없음으로 채웠다.

렌더링해서 넘침이나 대비를 보는 확인은 하지 않았다(지시 3절이 슬러그 단위 두 검사만 돌리라고 했다).

## 명령 기록

Bash 로 돌린 명령만 센다. 파일 읽기, 쓰기(Read, Write, Edit, Glob)는 세지 않는다.
이 파일을 커밋하는 결과 커밋의 명령(`git add`, `git commit`, 그 뒤 `git status`)은 이 표에 들어가지 않는다.

| # | 명령 | 결과 | 실패면 출력 한 줄과 종류 |
| --- | --- | --- | --- |
| 1 | `git status` | 성공 | |
| 2 | `git rev-parse HEAD` | 성공 | |
| 3 | `git switch -c eval/html-frame-s4a 0ef2f879` | 성공 | |
| 4 | `pnpm install` | 성공 (스스로 찍은 시간 1m 9.5s) | |
| 5 | `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts toss chzzk` | 성공 (`ok` 둘) | |
| 6 | `pnpm validate:previews --slug toss` | 성공 (0 blocking, 2 warn) | |
| 7 | `pnpm validate:previews --slug chzzk` | 성공 (0 blocking) | |
| 8 | `git rm -q public/preview/laftel/preview.html` | 성공 | |
| 9 | `git commit -s -q -F .claude/cache/msg-s4a-prep.txt` (준비 커밋) | 성공 | |
| 10 | `git rev-parse --short HEAD` | 성공 (2b5ebe2f) | |
| 11 | `wc -l` (치지직, 토스 프리뷰와 라프텔 사이드카의 줄 수) | 성공 | |
| 12 | `cp skeleton.html public/preview/laftel/preview.html` | 실패 | `cp: cannot create regular file '…/public/preview/laftel/preview.html': No such file or directory`. 안내: 6절 1번은 "복사한다"만 말하고 폴더를 만들라는 말이 없다. 새 항목에는 폴더가 없고, 여기서도 `git rm` 이 빈 폴더를 지웠다 |
| 13 | `mkdir -p public/preview/laftel` | 성공 | |
| 14 | `cp skeleton.html public/preview/laftel/preview.html` | 성공 | |
| 15 | `check-frame.ts laftel` (1회차) | 성공 (`ok`) | |
| 16 | `pnpm validate:previews --slug laftel --verbose` (1회차) | 성공 (0 blocking, 0 warn) | |
| 17 | `check-frame.ts laftel` (2회차) | 성공 (`ok`) | |
| 18 | `pnpm validate:previews --slug laftel --verbose` (2회차) | 성공 (0 blocking, 0 warn) | |
| 19 | `git add public/preview/laftel/preview.html` | 성공 | |
| 20 | `git commit -s -q -F .claude/cache/msg-s4a-solve.txt` (풀이 커밋) | 성공 | |
| 21 | `git rev-parse --short HEAD` | 성공 (b33053db) | |
| 22 | `git diff --stat 2b5ebe2f HEAD` | 성공 | |
| 23 | `git diff --no-index --numstat skeleton.html public/preview/laftel/preview.html` | 성공 | |

- 명령 수 23, 실패 1(안내).
- 고치고 나서 확인이 끝날 때까지 돌린 명령: 15~18 의 넷. 걸린 시간: 재지 않음(두 검사 모두 시간을 찍지 않는다).

## 거친 단계와 확인 회차

1. 안내(`html-frame/README.md`), `SCENARIOS.md`, `STANDARD.md`, `services/laftel.md`, `skeleton.html`, `public/preview/_runtime/frame.css`, 치지직 프리뷰(머리와 스타일, 화면, 버튼, 입력 구역)를 읽었다.
2. 뼈대를 복사했다(명령 12 에서 한 번 실패, 13~14).
3. 최소 채우기: `<title>`, 로고 경로, `h1`, 첫 `<style>` 의 md 토큰과 `--pv-*` 변수, 다크 시트의 토큰 재정의. 뼈대의 화면, 버튼 구역은 그대로 둔 채였다.
4. **1회차 확인**(15, 16): 두 검사 모두 통과. 막힌 것 없음. 뼈대의 빈 칸(시연 자리가 주석뿐)도 두 검사가 막지 않았다.
5. 컴포넌트 스타일과 히어로 CTA, 화면 하나, 버튼 칸 셋, 입력 칸 하나를 썼다.
6. **2회차 확인**(17, 18): 두 검사 모두 통과. 막힌 것 없음.

- 처음으로 두 검사가 모두 통과한 회차: 1회차(최소 채우기 상태). 범위를 다 채운 뒤에는 2회차가 처음이자 마지막이다.
- 검증기의 `--verbose` 출력은 `ok   laftel  (oklch 25/32L 0/32D)` 한 줄이었다. 다크 시트는 토큰을 `var(--lf-dark-…)` 참조로 다시 정의해서 다크 쪽 OKLCH 글자 값이 0 으로 세어졌고, 막힘이나 경고는 없었다.

## 파일과 줄 수

`git diff --stat 2b5ebe2f b33053db`: 파일 1, 더한 줄 270, 뺀 줄 0.

| 나눔 | 파일 | 줄 |
| --- | --- | --- |
| 손으로 고친 원본 | `public/preview/laftel/preview.html` (새 파일) | 270 줄 가운데 손으로 더한 줄 221, 뼈대에서 그대로 남은 줄 49 |
| 명령이 만들어 낸 산출물 | 없음(이 구조는 빌드가 없다) | 0 |
| 안내 문서와 테스트 | 없음 | 0 |

- 뼈대와의 차이는 `git diff --no-index --numstat skeleton.html preview.html` 로 셌다: 더한 줄 221, 뼈대에서 지운 줄 41(뼈대 90 줄 가운데 49 줄이 남았다). "구조가 대신 써 준 줄"은 이 49 줄이다(문서 머리, 세 링크, 면책 띠, 구역 껍데기 등).
- 새로 만든 파일: `public/preview/laftel/preview.html` 하나(손으로 씀, 명령이 만든 것은 `cp` 로 복사한 뼈대 90 줄이 출발점). 명령이 생성한 산출물 파일은 없다.

## 범위 안에서 그린 것

| 구역 | 칸 | md 근거 |
| --- | --- | --- |
| 히어로 | 로고(`/logos/laftel.png`), `h1`, 한 줄 소개, 작품 이미지 자리 위 button-cta | md 머리말 `logo`, 첫 문단, `### button-cta` |
| 화면 | `screen-daily-desktop`: 서브페이지 헤더(64px, 하단 1px 선, 네비 항목 여섯, 루프의 N 배지, 활성 링크 보라), 요일 칩(활성 보라, 비활성 면과 선), 포스터 카드 넷(UP 배지, 진행바) | `header`, `nav-link`, `chip-*`, `badge-up`, `badge-new`, `poster-card`. `role="img"` 로 그림 한 장으로 둠 |
| 버튼 | `button-cta`(기본, hover 견본, 직접 hover 해 볼 줄), `button-secondary`, `button-point`(보라 1차 버튼) | `### button-cta`, `### button-secondary`, Colors 절의 404 "홈으로 이동" 문장 |
| 입력 | `search-field`(접힘 40 원형 아이콘, 펼침 288×40, 직접 입력) | `### search-field` |

손끝 반응은 button-cta 의 hover(흰색 70%) 하나만 넣었다. 초점 스타일은 넣지 않고 브라우저 기본 초점 표시를 지우지 않았다(md Don't: 포커스 링을 지우지 않는다).

## 막히거나 헷갈린 곳

- **폴더가 없어 `cp` 실패**(명령 12). 무엇을 찾으려 했나: 뼈대를 새 항목 자리로 복사하는 법. 본 곳: 안내 6절 「새 항목의 프리뷰를 쓴다」 1번. 답: 안내에 없었다. 출력을 보고 `mkdir -p` 를 더했다. 연 파일 0. 종류: 안내.
- **틀 변수에 어느 토큰을 줄지**(md 해석). `--pv-canvas`, `--pv-surface` 를 무엇으로 할지. 본 곳: 안내 3절, `STANDARD.md` 3절의 표, md 의 `membership-card`(다크 `dark-bg-2` 페이지 위 `dark-bg-1` 면, 라이트는 `bg-2` 위 `bg-1`)와 Do 문장. 답: md 에서 얻었다. 캔버스 `bg-2`, 칸 `bg-1`, 이름표 `fg-2`, 선 `border-2`, 반경 `radius-md`. 연 파일 2(STANDARD, md).
- **라이트 색**(md 해석). md 의 컴포넌트 값은 다크에서 잰 것이고, 라이트는 같은 시맨틱 변수(`--background-1` 등)의 라이트 값이라고만 적혀 있다. button-secondary 의 라이트 글자(`fg-2`)만 md 가 적었다. 나머지 라이트 면과 선은 같은 이름의 라이트 토큰으로 옮기고 칸 이름표에 `(라이트 … 가정)` 을 달고 다크 이름표는 template 으로 바꿔 꼈다. 이 꼴은 치지직의 `chat-input`, `screen-live-watch` 칸을 보고 따라 했다.
- **보라 1차 버튼을 그릴지**(md 해석). 머리말 `components:` 에는 없고 Colors 절 문장에만 있다(404 "홈으로 이동" 160×56, radius 4). STANDARD 1절의 "브랜드가 발행한 값이든 화면을 관찰해 적은 값이든 DESIGN.md 가 규정했으면 그린다"를 따라 그렸다. hover 의 진한 보라(`PURPLE700`)는 값이 md 에 없어 넣지 않았다. 멤버십 랜딩의 알약 버튼은 md 가 "랜딩 페이지 전용"이라 해 그리지 않았다.
- **글자 크기가 md 에 없는 곳**(md 해석). button-cta, 보라 버튼의 글자 크기, 칩의 글자, 카드 제목의 px(md 는 `1.125em` 이고 1em 이 폭에 따라 변한다)은 md 에 없어 타입 스케일의 가까운 값(14px 700, 16px 700, 14px 400)을 쓰고 칸 이름표에 `(… 가정)` 을 달았다. button-secondary 의 `1em` 은 md Typography 절의 "1440px 기준 1em 약 11.9px" 를 따라 12px 로 그렸다.
- **button-cta 를 어디에 그릴지**(md 해석). 흰 면이 두 테마 공통이라 라이트의 흰 칸 위에서는 보이지 않는다. 히어로와 버튼 칸 모두 `dark-bg-3` 면(작품 이미지 자리) 위에 그렸다.
- **진행바의 바탕 막대**(md 해석). md 는 채움 색(`point`)과 크기만 적었다. 바탕 막대 색이 없어 채움만 그렸다.
- **상태 견본과 직접 해 볼 줄**. 견본마다 상태 이름표가 있으면 견본은 그대로 두고 해 볼 줄을 더한다는 것은 안내에 없고 `STANDARD.md` 7절에서 찾았다. button-cta 칸에 "직접 hover" 줄을 더했다. 연 파일 1.

## 안내에서 답을 찾지 못해 치지직이나 토스의 원본을 보고 따라 한 곳

- 시연 자리 안의 상태 이름표와 스펙 줄의 꼴(`.states`, `.state`, `.state-l`, `.specs`, `.spec`, `.hint` class 와 그 배치), 다크에서 달라지는 스펙 줄 뒤에 template 을 두는 자리: 치지직의 버튼, 입력 구역.
- 화면 재현을 `role="img"` 와 `aria-label` 로 그림 한 장으로 두고 그 안의 탭과 칩을 `<span>` 으로 그리는 꼴: 치지직의 `screen-live-watch`(STANDARD 5절에도 있다).
- "직접 입력" 줄을 `<label>` 안의 실제 `<input>` 으로 두고 조작 안내 `.hint` 를 다는 꼴: 치지직의 `search-field`. 치지직은 그 입력에 `outline: none` 을 주지만 라프텔 md 의 Don't 때문에 따라 하지 않았다.
- 화면 안 더미 데이터 표기를 칸의 `catalog-dummy` 로 두는 것은 안내 3절에 있었다(따라 한 곳이 아니다).
