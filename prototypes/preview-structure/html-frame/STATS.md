# 구조마다 함께 적는 수치: HTML 한 장 + 공용 틀 (`html-frame`)

> PROTOTYPE. `prototypes/preview-structure/SCENARIOS.md` 끝의 「구조마다 함께 적는 수치」 여섯 항목을 같은 순서로 적는다.
> 브랜치 `proto/preview-structure-html-frame`, 공통 바탕 커밋 `9f72b96` 에서 갈라졌다. 줄 수는 `wc -l` 이다.

## 1. 원본, 공용 코드, 산출물의 줄 수

| 무엇 | 파일 수 | 줄 수 | 바이트 | 공통 바탕 |
| --- | --- | --- | --- | --- |
| 치지직 원본 `public/preview/chzzk/preview.html` | 1 | 790 | 59,775 | 874줄 |
| 토스 원본 `public/preview/toss/preview.html` | 1 | 2,260 | 94,157 | 2,344줄 |
| 공용 틀 `public/preview/_runtime/frame.css` | 1 | 85 | 1,832 | 바탕에서는 항목마다 같은 85줄을 붙여 넣었다 |
| 산출물 | 0 | 0 | 0 | 원본이 곧 서빙되는 파일이다 |

- 항목마다 손으로 쓰는 원본은 HTML 한 장이다. 바탕보다 84줄씩 짧다(틀 블록 85줄을 걷고 링크 한 줄을 더했다).
- 공용 코드로 새로 생긴 것은 `frame.css` 85줄뿐이다. 이 파일은 바탕의 `prototypes/preview-structure/frame.css` 를 `git mv` 로 옮긴 것이고 내용은 같다. 기존 공용 런타임 `tokens.css`(178줄)와 `iframe.js`(225줄)는 그대로다.
- 새 항목을 시작할 뼈대 `html-frame/skeleton.html` 은 80줄이다. 서빙되지 않고 복사해서 쓴다.

## 2. 기존 검사기와 테스트를 고친 줄, 새로 쓴 검사의 줄

| 무엇 | 줄 수 | 이유 |
| --- | --- | --- |
| 기존 프리뷰 검증기와 그 테스트(`src/lib/`, `scripts/`) | 0 | 고칠 일이 없었다. `pnpm validate:previews` 가 두 슬러그에서 바탕과 같은 결과를 낸다(치지직 막힘 0 경고 0, 토스 막힘 0 경고 2) |
| 새 약속 검사 `html-frame/check-frame.ts` | 486 | 구역 목록 `ZONES` 와 검사, 명령 줄 진입점 |
| 새 약속 검사의 테스트 `html-frame/check-frame.test.ts` | 218 | 14개. 틀린 구역 순서, 모르는 구역, 이름표 없는 칸, 빈 이름표, 실제 두 프리뷰와 뼈대의 통과 등 |

- 바탕의 `base-notes/paste-frame.mjs` 는 고치지 않았지만 이 브랜치에서는 실행되지 않는다. 옮긴 `frame.css` 를 옛 경로에서 읽다가 `ENOENT` 로 멈춘다. 그 도구가 지키던 약속(블록이 같음, 페이지가 `.pv-` 선택자와 `--pv-gutter` 를 건드리지 않음, 틀 요소의 인라인 스타일 없음)은 `check-frame.ts` 가 넘겨받았다.
- 약속 검사는 jsdom 으로 파일을 읽고 줄 번호를 얻는다(`includeNodeLocations`). jsdom 은 이미 있는 개발 의존성이다.

## 3. 온보딩 스테이징 흐름(Stage 9~12)에 더해지는 단계

| 단계 | 달라지는 것 |
| --- | --- |
| 9a 저자 | 단계는 그대로다. 저자가 쓰는 파일은 여전히 임시 폴더의 HTML 한 장이다. 다만 저자 프롬프트가 틀 링크 한 줄과 `--pv-*` 일곱 변수를 가르쳐야 한다(이 브랜치에서는 프롬프트를 고치지 않았다) |
| 9a2 기계 검사 | 약속 검사 한 줄이 더해진다: `pnpm exec tsx prototypes/preview-structure/html-frame/check-frame.ts .claude/cache/design-md/{slug}/preview.html`. 막히면 검증기의 막힘과 같이 저자에게 되돌린다 |
| 9a3 대비 관측 | 그대로다. 관측기가 임시 파일 아래에 저장소의 `public/` 을 깔아 열므로 틀 링크가 풀린다. 토스 사본을 저장소 밖 임시 폴더에서 관측해 텍스트 요소 테마마다 325, 미달 83 으로 바탕과 같음을 확인했다 |
| 9b 리뷰어 | 그대로다. 리뷰어가 읽는 HTML 에는 틀의 스타일이 없다(5절) |
| 10 복사 | 그대로다(`cp` 한 번). 생성 단계가 없다 |
| 11 OG 이미지 | 보지 않았다 |
| 12 확인 | 그대로다. 사이트가 `public/` 을 서빙하므로 `frame.css` 도 tokens.css 와 같은 길로 나간다. 빌드한 서버와 배포에서 실제로 서빙되는지는 이 브랜치에서 확인하지 않았다 |

## 4. 새로 생기는 고장 방식

확인한 것

- **틀 링크가 빠지거나 자리가 틀리면 틀만 무너진다.** 화면은 뜨지만 구역 제목, 칸의 격자, 이름표가 브라우저 기본 모양이 된다. 기존 프리뷰 검증기는 이 링크를 보지 않는다. 약속 검사가 링크의 유무와 자리(`frame-link`)를 막는다. 링크가 실제로 불러와지는지(404)는 아무 검사도 보지 않는다.
- **틀 블록을 다시 붙여 넣으면 두 벌이 된다.** 약속 검사가 `frame-copy` 로 막는다.
- **기존 프리뷰 검증기의 CSS 규칙이 틀 스타일을 보지 못한다.** 검증기는 HTML 파일의 `<style>` 만 읽는다. 틀의 `minmax(0, 1fr)` 와 접기 규칙은 이제 검증기 밖이다. 크기 검사도 HTML 만 잰다(틀 1,832바이트는 따로 받는다).
- **바탕 단계의 도구 하나가 깨진다.** `paste-frame.mjs` 가 옛 경로의 `frame.css` 를 찾지 못한다(2절).

확인하지 않은 것(구조상 생길 수 있는 것)

- **틀 한 줄이 모든 항목의 화면을 바꾸는데 항목 파일은 그대로다.** 항목의 `last_updated` 와 git 이력에는 흔적이 없고, 대비 기준선은 모든 슬러그에서 한꺼번에 움직일 수 있다.
- **파일 한 장만 떼어 낸 사본에는 틀이 없다.** tokens.css 와 iframe.js 도 사이트 절대 경로라 원래부터 같은 사정이다.
- 줄 번호 불일치는 없다. 원본이 곧 서빙되는 파일이라 검사기가 말하는 줄이 고칠 줄이다.
- 빌드 실패, 원본과 산출물의 어긋남은 없다. 빌드와 산출물이 없다.

## 5. 고쳐 써야 하는 결정 기록

| 결정 기록 | 문장 | 이유 |
| --- | --- | --- |
| 0002 한 파일에 두 테마 | 「검증과 리뷰의 대상은 실제로 서빙되는 문서 한 장이다」 | 프리뷰의 모양이 이제 HTML 한 장과 공용 `frame.css` 둘에서 나온다. 한 장만 보는 검증과 리뷰는 틀을 보지 못한다(4절). 틀 파일을 어떻게 검증하는지를 덧붙여야 한다 |
| 0015 프리뷰 기준 | 「프리뷰 파일을 어떤 구조로 쓰는가 … 따로 기록한다」, 「구역의 이름과 순서는 한 곳에만 적고, 프리뷰 검증기는 그곳을 읽으며」 | 이 구조가 정해지면 "HTML 한 장, 틀 스타일은 `_runtime/frame.css`" 를 적고, 구역 목록의 자리(지금은 `check-frame.ts` 의 `ZONES`)를 검증기가 읽는 곳으로 정해야 한다 |
| 0006 저장소 트리가 배포물 | 「사이트 안에서만 쓰는 프리뷰는 상대 경로를 쓴다」 | 고칠 문장은 없다. 프리뷰가 사이트에 기대는 파일이 tokens.css, iframe.js 에 frame.css 하나가 더해진다는 사실만 늘어난다 |

0008, 0009, 0013 은 문장을 바꿀 곳을 찾지 못했다. 텍스트 요소 수(0013 의 하한)는 두 슬러그에서 바탕과 같다.

## 6. 토스를 옮긴 변환 스크립트와 손으로 마무리한 곳

- 스크립트: `prototypes/preview-structure/html-frame/to-html-frame.mjs`, 97줄.
- 하는 일: 첫 `<style>` 맨 위의 틀 블록을 걷고, tokens.css 링크 다음 줄에 틀 링크를 넣는다. HTML 을 파싱해 다시 쓰지 않고 글자를 잘라 붙이므로 나머지 바이트는 그대로다. 걷는 블록이 `frame.css` 와 글자까지 같지 않으면 손대지 않고 멈춘다. 두 번째 실행은 아무것도 바꾸지 않는다(확인).
- 실행: `node prototypes/preview-structure/html-frame/to-html-frame.mjs public/preview/toss/preview.html public/preview/chzzk/preview.html`. 치지직도 같은 스크립트로 옮겼다.
- **손으로 마무리한 곳은 없다**(토스 0곳, 치지직 0곳). 두 파일의 변경은 각각 85줄 삭제와 1줄 추가다.

확인

| 무엇 | 명령 | 결과 |
| --- | --- | --- |
| 화면 비교(바탕 폴더의 파일과) | `pnpm exec tsx prototypes/preview-structure/dom-diff.ts --a <바탕>/public/preview/{slug}/preview.html --public-a <바탕>/public --b public/preview/{slug}/preview.html --public-b public` | 두 슬러그 `SAME`(16 패스, 치지직 608요소, 토스 730요소) |
| 프리뷰 검증기 | `pnpm validate:previews --slug {slug} --verbose` | 치지직 막힘 0 경고 0, 토스 막힘 0 경고 2(바탕과 같음) |
| 약속 검사 | `check-frame.ts chzzk toss` | 둘 다 ok |
| 일부러 망가뜨린 토스 사본(두 구역 순서 뒤바꿈, 토스트 칸의 이름표 지움) | 같은 명령, 저장소 밖 사본 | exit 1, `zone-order` 1835줄과 `cell-label` 2134줄. 두 줄 모두 그 사본에서 해당 `<section>` 과 칸이 시작하는 줄이다 |
| 바탕 검사 도구(읽기 전용 회귀 확인) | `pnpm exec tsx prototypes/preview-structure/base-notes/check-base.ts chzzk toss` | 둘 다 ok |
