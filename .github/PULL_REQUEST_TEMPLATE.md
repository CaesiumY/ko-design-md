## 변경 요약

<!-- 무엇이 왜 바뀌고 누구에게 무엇이 달라지는지 쉬운 말 1~3줄로 — 함수명·규칙 ID·단계 번호 없이, 저장소 용어는 괄호로 풀이. 상세는 그 아래에 -->

## 변경 종류

- [ ] 새 카탈로그 항목 (`services/*.md`)
- [ ] 기존 항목 수정
- [ ] 사이트 코드/UI
- [ ] 문서 (README / CONTRIBUTING / CHANGELOG 등)
- [ ] `/design-md` 스킬

## 카탈로그 PR 체크 (해당 시)

- [ ] `/design-md` 스킬로 생성
- [ ] frontmatter 필수 필드 검증 완료 (`name`, `slug`, `category`, `last_updated`, `created_at`, `lang`)
- [ ] `public/preview/{slug}/preview.html` 생성·확인 (라이트·다크 한 파일)
- [ ] `[src:N]` 인용이 `## References` 번호와 일치
- [ ] 브랜드 자산 라이선스/상표 우려 검토 ([NOTICE](https://github.com/CaesiumY/ko-design-md/blob/main/NOTICE) 정책)

## 일반 체크

- [ ] `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build` 통과 (카탈로그 변경 시 `pnpm validate:catalog`·`validate:previews`·`tokens:check`·`audit:oklch`·`check:last-updated` 도)
- [ ] 머지 직전 `origin/main`을 합쳐 본 상태에서 게이트 재실행 (`git merge origin/main --no-commit --no-ff` → 게이트 → `git merge --abort`). PR 단위 CI 는 각 브랜치를 자기 base 에서 돌리므로 둘 다 green 인데 합치면 깨지는 경우를 못 잡는다
- [ ] (에이전트 작업) 저장소 규칙 준수와 이슈 요구 충족을 따로 보는 로컬 2축 리뷰(방법은 CODING_STANDARDS.md 머리말) 결과가 **마지막 커밋까지** 결함 없음. 리뷰 지적을 반영한 커밋도 다시 리뷰한다 ([CODING_STANDARDS.md](https://github.com/CaesiumY/ko-design-md/blob/main/CODING_STANDARDS.md))
- [ ] DCO 서명 (`git commit -s`)
- [ ] [CONTRIBUTING.md](https://github.com/CaesiumY/ko-design-md/blob/main/CONTRIBUTING.md) 가이드라인 준수

## 관련 이슈

<!-- Closes #123 -->
