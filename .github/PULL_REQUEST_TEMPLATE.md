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
- [ ] frontmatter 필수 필드 검증 완료 (`name`, `slug`, `category`, `last_updated`, `created_at`, `lang`)
- [ ] `public/preview/{slug}/preview.html` 생성·확인 (라이트·다크 한 파일)
- [ ] `[src:N]` 인용이 `## References` 번호와 일치
- [ ] 브랜드 자산 라이선스/상표 우려 검토 ([NOTICE](https://github.com/CaesiumY/ko-design-md/blob/main/NOTICE) 정책)

## 일반 체크

- [ ] `pnpm typecheck && pnpm lint && pnpm format:check && pnpm test && pnpm build` 통과 (카탈로그 변경 시 `pnpm validate:catalog`·`validate:previews`·`tokens:check`·`audit:oklch`·`check:last-updated` 도)
- [ ] DCO 서명 (`git commit -s`)
- [ ] [CONTRIBUTING.md](https://github.com/CaesiumY/ko-design-md/blob/main/CONTRIBUTING.md) 가이드라인 준수

## 관련 이슈

<!-- Closes #123 -->
