# use-design-md eval 스위트

소비자 스킬 `use-design-md` 의 외부 행동을 `claude plugin eval` 로 잰다. 케이스는 두 종류다(`tags`).

- **`trigger/`** — 떠야 할 요청 10개(`should-*`)와 뜨면 안 되는 요청 14개(`should-not-*`)에서 스킬이
  호출됐는지를 본다. 뜨면 안 되는 쪽에는 인접 스킬의 요청(생산자 스킬, 토스 톤의 퀴즈 HTML, 브랜드 없는
  범용 리스타일, 카탈로그 형식 · DESIGN.md 명세 설명)이 들어 있다. 기준 점수와 그 뒤의 비교는 이슈에 남긴다(#462 에서 처음
  재고, 인접 케이스를 더한 #464 에서 다시 쟀다 · 부모 #459).
- **`fetch/`** — 스킬이 항목을 받은 뒤의 답을 본다(#461). 끝부분이 셸 출력 한도(30,000자) 밖에 있는
  항목에서 그 끝부분에만 있는 사실이 답에 반영되는가, 없는 슬러그에서 "카탈로그에 없다"고 답하고 값을 지어내지 않는가.
  없는 슬러그 케이스는 스킬이 색인 단계에서 끝낼 수 있어, 항목 URL 의 404 를 `-f` 로 실패 처리하는 경로까지
  고정하지는 않는다. 셸이 필요하다 — 아래 「fetch 케이스」를 볼 것.

**트리거 케이스를 더하거나 빼면 기준 점수를 다시 잰다** — 기준 점수는 이 구성에서 잰 값이라, 구성이 바뀐
뒤의 점수와는 비교가 되지 않는다. 계약 테스트가 두 쪽의 수를 고정해 두었으니 함께 고친다.

이 디렉터리가 스킬 디렉터리 밖에 있는 이유: skills.sh 는 `.claude/skills/use-design-md/` 를
통째로 소비자 프로젝트에 복사한다. 그 안에 두면 eval 자산이 함께 배포된다.

## 실행

저장소 루트에서:

```bash
claude plugin eval . --eval-dir evals/use-design-md --tag trigger --ablation none --no-publish
```

- **`--eval-dir evals/use-design-md`** — 스위트 위치. 기본값 `evals/` 를 쓰면 나중에 다른
  스위트가 생겼을 때 함께 돈다. 결과는 `evals/use-design-md/results/<타임스탬프>/` 에 쌓이고
  gitignore 돼 있다.
- **`--ablation none`** — 스킬 있음 쪽만 돌린다. 기본값(있음/없음 양쪽)에서는 `tool_used: Skill`
  채점기가 "플러그인이 떴는가" 표시로만 쓰이고 점수에서 빠져, 이 스위트의 점수가 빈다.
- **`--no-publish`** — HTML 리포트를 claude.ai 에 올리지 않는다.
- 선택: `-j 4`(동시 실행 — 같은 레이트 리밋을 나눠 쓴다), `--max-cost-usd <n>`(상한),
  `--tag trigger` 대신 `--tag should-trigger` / `--tag should-not-trigger`(한쪽만), `--json <path>`(전체 결과).
- **`--tag trigger`** — 트리거 케이스만 돈다. 빼면 fetch 케이스도 함께 돌고, 셸을 허용하지 않은 채로
  돌리면 그 케이스는 실행 단계에서 실패한다.

트리거 케이스는 케이스마다 `runs: 3` 이라 한 번 돌리면 72회 모델 호출이다. 비용은 이슈의 기준 점수 코멘트를 볼 것.
CI 에서는 돌지 않는다 — 비용이 들고 결과가 흔들린다. 소비자 스킬을 바꾸는 PR 은 결과를 첨부한다.

## 점수 읽기

- 케이스 점수는 3회 실행의 평균이다. 실행별 점수는 `results/<타임스탬프>/aggregate-result.json`
  (`--json` 출력과 같은 문서)의 `cases[].arms.with[].score` 에 있어 분산은 거기서 계산한다.
- **3회로는 판정할 수 없는 케이스가 있다.** `should-not-03`(형식 설명)은 같은 스킬 description 으로 0/3 부터
  3/3 까지 나왔다(#463 에서 누적 8/15, 같은 날 main 대조군 3/6). 한 케이스의 변화를 판정하려면
  `--case "<이름>*" --runs 6` 이상으로, 바꾸기 전 스킬(main)의 대조군과 같은 날 함께 잰다.
  `--case` 는 글롭 하나만 받는다(중괄호 `{a,b}` 는 0건에 맞는다). 케이스마다 따로 돌릴 것.
- **description 의 부정 문구는 인접 스킬의 이름이 아니라 요청의 범주로 쓴다.** 소비자 세션에 그 스킬이 없을
  수 있어서다. `should-not-12`(토스 톤 퀴즈 HTML)는 "quiz or exam page 에는 쓰지 않는다"는 범주 부정 하나로
  0/6 에서 6/6 이 됐고, 바로 옆의 `should-01`·`should-02`·`should-08` 은 6/6 그대로였다(#464). 부정이
  떠야 할 요청까지 막을 것이라는 예상은 재 보기 전에는 근거가 아니다 — 이 케이스도 처음엔 그렇게 짐작했다.
  막는 범위는 **브랜드의 톤만 빌리는** 퀴즈·시험 화면이다(#459 사용자 스토리 7 의 "토스 톤의 퀴즈 HTML").
  카탈로그를 직접 지목한 퀴즈 화면은 떠야 하고, 그 짝을 `should-11` 이 잰다.
- 떠야 할 쪽과 뜨면 안 되는 쪽은 **따로** 본다(`tags` 의 `should-trigger` / `should-not-trigger`).
  합친 점수만 보면 과잉 트리거가 정확도 향상처럼 보일 수 있다.
- 실행별 `error` 의 `Reached maximum number of turns` 는 **트리거 케이스에서는** 정상이다. 트리거
  판단은 첫 턴에 나고, `max_turns: 3` 은 그 뒤의 작업 비용을 자르기 위한 값이다. **fetch 케이스에서는
  정상이 아니다** — 항목을 나눠 읽다 턴 상한(`max_turns: 12`)에 닿아 답이 덜 된 채 끝났다는 뜻이라,
  그 실행의 낮은 점수는 모델 품질이 아니라 턴 부족으로 읽는다.
- `allowed_tools` 는 `Task`(서브에이전트)를 빼지 못한다. 자식 세션이 서브에이전트를 띄우면 그
  비용과 시간이 턴 상한 밖에서 늘어, 한 케이스가 `timeout_seconds`(300초)까지 갈 수 있다.

## 측정 환경 (알고 읽을 것)

- `plugin eval` 은 격리된 자식 세션을 띄운다. 그 세션의 스킬 목록에는 이 스킬
  (`use-design-md:use-design-md`, inline 플러그인)과 Claude Code 내장 스킬만 있고, 작성자의
  사용자·계정 스킬은 없다. 작업 디렉터리는 빈 임시 폴더다.
- 그래서 **뜨면 안 되는 쪽은 "이 스킬이 안 뜨는가"만 잰다.** 생산자 스킬 `design-md` 처럼
  그 요청을 가져가야 할 인접 스킬은 그 세션에 없다.
- 케이스는 저장소 매니페스트 없이 각자의 `plugins:` 경로로 스킬 디렉터리를 가리킨다.
  저장소에는 `plugin.json` 이 없고 마켓플레이스 선언(`strict: false`)만 있다. 그래서 eval 안의
  호출명은 `use-design-md:use-design-md` 이고, 마켓플레이스로 설치하면 `ko-design-md:use-design-md`
  일 것이다. 스킬 목록에 보이는 네임스페이스가 다르므로 플러그인 채널의 트리거와 완전히 같은
  조건은 아니다(채점 정규식은 둘 다 잡는다).
- **슬래시 호출(`/use-design-md …`)은 이 스위트로 잴 수 없다.** CLI 가 본문을 직접 펼쳐 넣어
  Skill 도구 호출이 없으므로, 스킬이 로드돼도 `tool_used: Skill` 채점기는 0을 낸다. 모델의 트리거
  판단도 아니다. 그래서 원래 질의 20개 중 슬래시 질의 하나는 옮기지 않았다(`should-06` 이 빈 이유).
- **SKILL.md Step 1 의 영문명 안내("Karrot → 당근")는 #466 이 해소되면 걷어낸다.** 색인이 영문 시스템명을
  싣지 않아 생긴 우회다. 이 의존은 배포되는 SKILL.md 대신 여기에 적는다.
- 트리거 케이스는 읽기 전용 도구(`Read`·`Glob`·`Grep`·`Skill`)만 허용하므로 Windows 네이티브에서 돈다.

## fetch 케이스

```bash
claude plugin eval . --eval-dir evals/use-design-md --tag fetch --ablation none --no-publish --allow-tools Bash
```

- **셸이 필요하다.** `plugin eval` 은 셸 도구를 OS 샌드박스 안에서만 돌리고, 샌드박스가 없으면 실행을
  거부한다. Linux(WSL2 포함)에서는 `bubblewrap`·`socat` 이 있어야 하고, macOS 는 내장 샌드박스(Seatbelt)를 쓴다.
- **Windows 네이티브에서는 돌지 않는다**(Claude Code 2.1.286 실측). 실행별 `error` 에 이렇게 남는다:
  `sandbox required but unavailable: sandbox is enabled but the Windows sandbox is not active on this
  session (feature gate off)`. 로드 오류가 아니라 실행 오류라 실행은 exit 0 으로 끝나고, 응답이 빈 채로
  채점된다. `llm` 과 `not_contains` 정규식을 함께 가진 케이스가 그렇게 0.5점을 받았다 — llm 은 떨어지고
  정규식은 빈 응답을 통과로 봤다. 그래서 fetch 케이스의 채점기는 **모두** 빈 응답에서 실패해야 한다
  (계약 테스트가 지킨다). 점수를 읽기 전에 `error` 부터 볼 것.
- **채점은 `llm` 하나다.** 키워드 정규식은 틀린 답("Deprecated 9건이 있지만 Error State 는 못 찾음",
  프롬프트의 "쓰지 마" 메아리)도 통과시키고, 값 금지 정규식(`oklch(`·hex)은 다른 브랜드를 대안으로
  권하는 맞는 답을 떨어뜨린다(리뷰에서 나온 판단 — 실제 답으로 채점해 본 적은 없다).
- 이 스위트의 fetch 케이스는 아직 eval 로 통과시킨 적이 없다. #461 은 Windows 에서 같은 두 요청을
  `claude -p` 로 직접 돌려 스킬 수정 전후를 비교했다(이슈 코멘트). 샌드박스가 있는 환경에서 처음
  돌릴 때 그 결과를 이슈에 남긴다.

## 케이스 형식

한 케이스는 디렉터리 하나와 `case.yaml` 하나다. `schema_version`·`name`(디렉터리명과 같게)이
없으면 로드되지 않는다 — 그런데 실행은 exit 0 으로 끝날 수 있으니 로그의 `failed to load` 를 볼
것. 스위트의 배선(스킬 경로, 케이스가 trigger·fetch 중 한 종류인지, 트리거 태그와 채점 방향의 일치,
채점 정규식, fetch 케이스의 `Bash` 허용과 빈 응답에서 실패하는 채점기)은
`src/lib/use-design-md-eval-suite.test.ts` 가 `pnpm test` 에서 지킨다.
