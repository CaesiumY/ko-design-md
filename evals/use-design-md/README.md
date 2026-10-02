# use-design-md eval 스위트

소비자 스킬 `use-design-md` 의 외부 행동을 `claude plugin eval` 로 잰다. 지금은 **트리거**만
있다 — 떠야 할 요청 9개(`should-*`)와 뜨면 안 되는 요청 10개(`should-not-*`)에서 스킬이
호출됐는지를 본다. 기준 점수와 그 뒤의 비교는 이슈에 남긴다(#462 · 부모 #459).

이 디렉터리가 스킬 디렉터리 밖에 있는 이유: skills.sh 는 `.claude/skills/use-design-md/` 를
통째로 소비자 프로젝트에 복사한다. 그 안에 두면 eval 자산이 함께 배포된다.

## 실행

저장소 루트에서:

```bash
claude plugin eval . --eval-dir evals/use-design-md --ablation none --no-publish
```

- **`--eval-dir evals/use-design-md`** — 스위트 위치. 기본값 `evals/` 를 쓰면 나중에 다른
  스위트가 생겼을 때 함께 돈다. 결과는 `evals/use-design-md/results/<타임스탬프>/` 에 쌓이고
  gitignore 돼 있다.
- **`--ablation none`** — 스킬 있음 쪽만 돌린다. 기본값(있음/없음 양쪽)에서는 `tool_used: Skill`
  채점기가 "플러그인이 떴는가" 표시로만 쓰이고 점수에서 빠져, 이 스위트의 점수가 빈다.
- **`--no-publish`** — HTML 리포트를 claude.ai 에 올리지 않는다.
- 선택: `-j 4`(동시 실행 — 같은 레이트 리밋을 나눠 쓴다), `--max-cost-usd <n>`(상한),
  `--tag should-trigger` / `--tag should-not-trigger`(한쪽만), `--json <path>`(전체 결과).

케이스마다 `runs: 3` 이라 한 번 돌리면 57회 모델 호출이다. 비용은 이슈의 기준 점수 코멘트를 볼 것.
CI 에서는 돌지 않는다 — 비용이 들고 결과가 흔들린다. 소비자 스킬을 바꾸는 PR 은 결과를 첨부한다.

## 점수 읽기

- 케이스 점수는 3회 실행의 평균이다. 실행별 점수는 `results/<타임스탬프>/aggregate-result.json`
  (`--json` 출력과 같은 문서)의 `cases[].arms.with[].score` 에 있어 분산은 거기서 계산한다.
- 떠야 할 쪽과 뜨면 안 되는 쪽은 **따로** 본다(`tags` 의 `should-trigger` / `should-not-trigger`).
  합친 점수만 보면 과잉 트리거가 정확도 향상처럼 보일 수 있다.
- 실행별 `error` 의 `Reached maximum number of turns` 는 정상이다. 트리거 판단은 첫 턴에 나고,
  `max_turns: 3` 은 그 뒤의 작업 비용을 자르기 위한 값이다.
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
- 읽기 전용 도구(`Read`·`Glob`·`Grep`·`Skill`)만 허용하므로 Windows 네이티브에서 돈다. 셸이나
  네트워크를 허용하는 케이스(항목을 끝까지 받는지 보는 정확성 케이스 등)는 `plugin eval` 이
  Windows 네이티브에서 거부하므로 WSL2 에서 돌린다.

## 케이스 형식

한 케이스는 디렉터리 하나와 `case.yaml` 하나다. `schema_version`·`name`(디렉터리명과 같게)이
없으면 로드되지 않는다 — 그런데 실행은 exit 0 으로 끝날 수 있으니 로그의 `failed to load` 를 볼
것. 스위트의 배선(스킬 경로, 태그와 채점 방향의 일치, 채점 정규식)은
`src/lib/use-design-md-eval-suite.test.ts` 가 `pnpm test` 에서 지킨다.
