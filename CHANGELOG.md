# Changelog

이 프로젝트의 모든 주요 변경 사항은 이 파일에 기록됩니다.

형식은 [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/)을 따르고, 버전은 [SemVer](https://semver.org/lang/ko/)를 따릅니다.

## [Unreleased]

### Added

- `use-design-md` 스킬 외부 배포 — skills.sh(`npx skills add CaesiumY/ko-design-md`) + Claude Code 플러그인 마켓플레이스(`.claude-plugin/marketplace.json`) 2채널 설치 지원
- 내부 전용 스킬(`design-md`, `docs-crawler`, `preview-prose-audit`)에 `metadata.internal` 플래그 — skills.sh 디스커버리에서 숨김

- 스킬 공개/내부 경계 계약 테스트(`src/lib/skill-distribution.test.ts`) — 스킬 디렉터리·`metadata.internal`·`.claude-plugin/marketplace.json`을 `PUBLIC_SKILLS`/`INTERNAL_SKILLS` 선언과 대조
- `docs-crawler` 스킬의 유닛 테스트 70개를 `pnpm test`에 편입 (`test.exclude`를 `.claude/{worktrees,cache}/`로 좁힘)

### Changed

- 테스트가 읽는 `.claude/` 경로를 `src/lib/skill-asset-paths.ts` 레지스트리로 일원화 — 스킬 자산을 읽던 테스트 4곳에 복제돼 있던 `readRepoFile` 헬퍼와 `import.meta.url` 예외 경로 제거 (스킬 밖 파일을 읽는 나머지 2곳은 그대로 둠)
- `use-design-md` 스킬에서 특정 플러그인(superpowers) 호출 지시를 행동 지시로 교체 — 이 스킬만 설치한 환경에서도 유효
- `preview-prose-audit` 스킬이 종결된 되돌리기 캠페인의 판정 규칙을 직접 담도록 이관

### Removed

- `docs/superpowers/` (plans 6 + specs 34) — 착지 완료된 설계 기록. 살아있던 참조는 스킬·테스트 주석으로 이관

### Fixed

- `use-design-md` frontmatter description의 비유효 YAML(콜론+공백) 수정 — 엄격한 스킬 파서(skills.sh) 호환
- CLAUDE.md 의 docs-crawler CRLF 면제 조항 삭제 — `.gitattributes` 가 전 파일을 LF 로 두어 성립하지 않는 면제였다

## [0.1.0] — 2026-05-11

### Added

- 첫 공개 릴리스 — OSS 공개 전환
- KRDS(Korea Reusable Design System) 카탈로그 항목 (`services/krds.md`)
- `/design-md` 스킬 — 13단계 자동 온보딩 파이프라인 (research → draft → review → preview HTML → OG 이미지)
- TanStack Start 기반 카탈로그 사이트 — 카탈로그 목록, 항목 상세, 프리뷰 iframe(라이트/다크), 테마 토글
- Stitch v0.1 작성 규격 및 검증 파서 (`src/lib/content-parser.ts`)
- `ko/` 모노그램 favicon 세트 + OG 이미지 빌더 (`scripts/build-og.ts`)
- 표준 OSS 문서: README, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, NOTICE
- 3-tier 라이선스 구조 — 코드 MIT, 카탈로그 콘텐츠 CC BY 4.0, 브랜드 자산 권리자 정책 별도
- GitHub Issue Forms 4종 (bug-report, new-catalog-entry, entry-correction, documentation) + PR 템플릿
- Dependabot weekly 업데이트 (npm + github-actions)
- CI 워크플로 — typecheck/lint/build 자동 검증

[Unreleased]: https://github.com/CaesiumY/ko-design-md/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/CaesiumY/ko-design-md/releases/tag/v0.1.0
