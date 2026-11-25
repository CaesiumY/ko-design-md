# html-frame 문제 4 (두 번째 풀이, s4b)

- 가지: `eval/html-frame-s4b` (`0ef2f879` 에서 침)
- 준비 커밋: `8e7984fd61468f559c8a0bcc354828348b672d5c` (라프텔 프리뷰 삭제만, 621줄 뺌, 파일은 열지 않음)
- 풀이 커밋: `ec2228952a99f3595aa7b658295f74643a2c10ba`

## 결과

- 범위: 면책 띠, 히어로, 화면 하나(작품 목록, 데스크톱), 버튼 구역(칸 셋: button-cta, 보라 채움 1차 버튼과 멤버십 알약, button-secondary), 입력 구역(칸 하나: search-field).
- 라이트와 다크: 첫 `<style>` 의 `:root` 에 라이트 토큰, 다크 시트에서 `[data-theme="dark"]` 로 다크에서 바뀌는 토큰 8개만 다시 정의. 다크 시트에 규칙은 없다.
- 손끝 반응: md 가 값을 준 button-cta 의 hover(흰색 70%)만 실제 `:hover` 로 넣었다. 보라 1차 버튼의 hover 는 md 가 팔레트 이름(`PURPLE700`)만 주고 값을 주지 않아 넣지 않았다. 초점 링은 브라우저 기본을 지우지 않고 둠(md 의 Don't).
- "풀었다" 조건
  1. 서빙되는 `public/preview/laftel/preview.html` 이 문제 4 의 범위를 담는다: 채움.
  2. 약속 검사(`check-frame.ts laftel`)와 `pnpm validate:previews --slug laftel --verbose` 가 막지 않는다: 채움(1회차에 둘 다 통과).
  3. 원본과 산출물의 어긋남: 이 구조는 원본이 곧 서빙 파일이라 산출물이 없다. 해당 없음.

## 파일 수와 줄 수 (`git diff --stat 8e7984fd ec222895`)

| 나눔 | 파일 | 더한 줄 | 뺀 줄 |
| --- | --- | --- | --- |
| 손으로 고친 원본 | 1 (`public/preview/laftel/preview.html`, 새 파일) | 243 | 0 |
| 명령이 만들어 낸 산출물 | 0 | 0 | 0 |
| 안내 문서와 테스트 | 0 | 0 | 0 |

- 새로 만든 파일: `public/preview/laftel/preview.html` 243줄. `skeleton.html`(90줄)을 `cp` 로 복사한 뒤 Write 로 통째로 다시 썼다. 뼈대에서 글자 그대로 남은 것은 `<head>` 의 링크 세 줄, 면책 띠, 구역과 칸 조각의 꼴이다. 명령이 만든 줄은 없다.
- 구조가 대신 써 준 줄: 0(빌드와 생성 단계가 없다). 틀 스타일은 공용 `frame.css` 를 `<link>` 한 줄로 싣는다.

## 확인 회차

| 회차 | 약속 검사 | `validate:previews --slug laftel --verbose` | 막힘의 종류 |
| --- | --- | --- | --- |
| 1 | 통과 (`ok`, exit 0) | 통과 (0 blocking, 0 warning, `oklch 21/32L 16/32D`) | 없음 |

- 처음으로 두 검사가 모두 통과한 회차: 1회차.

## 명령 기록

PowerShell 로 돌린 검사 명령은 exit code 를 보려고 끝에 `; "EXIT=$LASTEXITCODE"` 를 붙였다(Bash 가 아니라 PowerShell 도구).

| # | 명령 | 결과 | 실패면 출력과 종류 |
| --- | --- | --- | --- |
| 1 | `git status` | 성공 | |
| 2 | `git rev-parse HEAD` | 성공 | |
| 3 | `git switch -c eval/html-frame-s4b 0ef2f879` | 성공 | |
| 4 | `pnpm install` | 성공 (`Done in 17.4s`) | |
| 5 | `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts toss chzzk` | 성공 (둘 다 ok) | |
| 6 | `pnpm validate:previews --slug toss` | 성공 (0 blocking, warning 2: `bare-1fr`, `no-mobile-collapse`) | |
| 7 | `pnpm validate:previews --slug chzzk` | 성공 | |
| 8 | `git rm -q public/preview/laftel/preview.html` | 성공 | |
| 9 | `git commit -s -q -F .claude/cache/s4b-prep-msg.txt` (준비 커밋) | 성공 | |
| 10 | `git log --stat -1 --format=%H%n%s` | 성공 | |
| 11 | `git status --short` | 성공 | |
| 12 | `cp …/skeleton.html …/public/preview/laftel/preview.html` | 실패 | `cp: cannot create regular file '…/public/preview/laftel/preview.html': No such file or directory`. 내 실수: 준비 단계의 `git rm` 이 하나뿐인 파일과 함께 빈 폴더도 지웠는데 그것을 놓침 |
| 13 | `mkdir …/public/preview/laftel` | 성공 | |
| 14 | `cp …/skeleton.html …/public/preview/laftel/preview.html` | 성공 | |
| 15 | `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts laftel` | 성공 (ok, exit 0) | |
| 16 | `pnpm validate:previews --slug laftel --verbose` | 성공 (0 blocking, 0 warning) | |
| 17 | `git add public/preview/laftel/preview.html` | 성공 | |
| 18 | `git commit -s -q -F .claude/cache/s4b-solve-msg.txt` (풀이 커밋) | 성공 | |
| 19 | `git diff --stat 8e7984fd HEAD` | 성공 | |
| 20 | `git rev-parse HEAD` | 성공 | |

- 명령 수 20, 실패 1(내 실수 1). 이 파일을 쓴 뒤의 결과 커밋 명령(`git add`, `git commit`, `git status`)은 세지 않았다.
- 첫 파일을 쓰기 시작해(12번) 검사를 통과할 때까지(16번): 명령 5개, 거친 단계는 뼈대 복사(폴더 만들기 포함), 파일 통째로 쓰기, 인라인 `style` 하나를 class 로 바꾸는 편집(검사 전에 스스로 바꿈), 검사 두 개.
- 걸린 시간: `pnpm install` 의 17.4s 만 명령이 찍었다. 그 밖은 재지 않음.

## 읽은 파일

지시 파일 둘, `html-frame/README.md`, `SCENARIOS.md`, `STANDARD.md`, `services/laftel.md`, `html-frame/skeleton.html`, `public/preview/chzzk/preview.html`(1~200줄, 300~599줄, 그리고 구역과 칸 줄을 Grep 한 번). 모두 8개 파일. `services/laftel.tokens.json`, 토스 프리뷰, `.claude/rules/` 는 열지 않았다.

## 막히거나 헷갈린 곳

- **뼈대를 복사할 자리가 없었다.** 찾으려 한 것: README 6절 1번의 복사가 왜 실패하는지. 본 곳: `cp` 의 출력. 답: 준비 커밋의 `git rm` 이 빈 `public/preview/laftel/` 폴더까지 지웠다. `mkdir` 로 풀었다. 연 파일 0개.
- **md 가 다크 값만 준 컴포넌트의 라이트 값.** 찾으려 한 것: header, search-field, button-secondary, chip 의 라이트 색. 본 곳: `services/laftel.md` 의 Colors 절. 답: 같은 이름의 시맨틱 변수에 라이트, 다크 두 값이 있다는 서술(`--background-1` 등)을 따라 `dark-bg-1` 자리에 라이트는 `bg-1` 을 넣었다. button-secondary 는 md 가 라이트 글자색(`fg-2`)을 따로 적어 두었다. 연 파일 1개(md). 종류: md 해석.
- **흰 CTA 의 글자색.** md 는 `fg-1` 이라 적었지만 `fg-1` 을 다크에서 바꾸는 토큰으로 두면 다크에서 흰 면 위에 밝은 글자가 된다. 다크에서 바꾸지 않는 토큰(`--lf-cta-ink`, 값은 `fg-1` 의 라이트 값)을 따로 두었다. CTA 가 이미지 위에 놓인다는 md 서술을 따라 뒤에 어두운 면(`--lf-scrim`, 값은 `dark-bg-3`)을 깔고 이름표에 "(뒤 이미지 자리 가정)" 을 달았다. 종류: md 해석.
- **`--pv-*` 에 어느 토큰을 줄지.** README 3절과 STANDARD 3절의 표를 보고 정했다. `--pv-ink-muted` 는 md 의 보조 글자색 가운데 `fg-3`(라이트 #8A8A8A)이 흰 칸 위에서 옅어 `fg-2` 를 골랐고, 캔버스와 칸 바탕은 md 의 Do("dark-bg-1 을 기본 면으로")를 따라 둘 다 `bg-1` 로 두었다. 안내에서 답을 얻었다(변수의 뜻). 어느 토큰이 맞는지는 md 해석.
- **글자 크기를 md 가 주지 않은 버튼.** button-cta, 보라 1차 버튼의 글자 크기, button-secondary 의 `1em` 은 값이 없거나 뷰포트에 따라 변한다. 16px, 12px 로 두고 이름표에 `(가정)` 을 달았다. 종류: md 해석.
- **버튼을 실제 `<button>` 으로 쓸지.** 안내에 말이 없었다. 치지직은 `<span>` 으로 그렸다. hover 를 실제로 반응하게 하고 초점 링을 남기려고 칸의 견본은 `<button type="button">` 으로 쓰고, 나란히 그린 hover 견본만 `<span class="… is-hover">` 로 두었다. 화면(`role="img"`) 안은 모두 `<span>` 이다(STANDARD 5절).

## 안내에서 답을 찾지 못해 치지직의 원본을 보고 따라 한 곳

- 시연 자리 안의 상태 이름표 꼴(`.state` 안에 `.state-l` 과 견본)과 한 줄 전체를 쓰는 `.state.full`, 세로로 쌓는 `.in-stack`.
- 입력 칸의 "직접 입력" 줄: `<label>` 안에 실제 `<input>` 과 `aria-label="검색 시연"`.
- 돋보기 아이콘 SVG 의 경로, `* { box-sizing: border-box; }`, `svg { display: block; }`, 히어로 안쪽의 `padding: … var(--pv-gutter) …` 값의 꼴, `@media (max-width: 900px)` 와 `720px` 의 접기 경계.
- 화면 칸 이름표의 `(… 가정)` 표지와 `catalog-dummy` 문장의 꼴.
- 토스의 원본은 보지 않았다.
