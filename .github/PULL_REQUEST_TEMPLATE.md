## 변경 요약

<!-- 무엇을, 왜 바꾸는지 1-3줄로 -->

## 변경 종류

- [ ] 새 카탈로그 항목 (`services/*.md`)
- [ ] 기존 항목 수정
- [ ] 사이트 코드/UI
- [ ] 문서 (README / CONTRIBUTING / CHANGELOG 등)
- [ ] `/design-md` 스킬

## 카탈로그 PR 체크 (해당 시)

- [ ] `/design-md` 스킬로 생성
- [ ] frontmatter 필수 필드 검증 완료 (`name`, `slug`, `category`, `last_updated`, `sources`, `related_services`, `lang`)
- [ ] `public/preview/{slug}/{light,dark}.html` 생성·확인
- [ ] `[src:N]` 인용이 `## References`와 정합 (공개 URL은 `sources`에; ephemeral 핸드오프 등은 References label-only — CONTRIBUTING.md §3 참조)
- [ ] 브랜드 자산 라이선스/상표 우려 검토 ([NOTICE](https://github.com/CaesiumY/ko-design-md/blob/main/NOTICE) 정책)
- [ ] 데모 항목(`_` 접두) 변경 아님

## 일반 체크

- [ ] `pnpm typecheck && pnpm lint && pnpm build` 통과
- [ ] DCO 서명 (`git commit -s`)
- [ ] [CONTRIBUTING.md](https://github.com/CaesiumY/ko-design-md/blob/main/CONTRIBUTING.md) 가이드라인 준수

## 관련 이슈

<!-- Closes #123 -->
