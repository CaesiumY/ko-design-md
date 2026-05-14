# routes 중심 폴더 구조 개편 설계

## 배경

현재 애플리케이션은 TanStack Start와 TanStack Router의 file-based routing을 사용한다. 실제 화면 단위 코드는 `src/routes`가 URL 엔트리포인트를 맡고, `src/features/home`과 `src/features/service-detail`이 각 라우트의 컴포넌트와 훅을 담는 구조다.

문제는 현재 `features` 하위의 `home`, `service-detail`이 독립 기능이나 비즈니스 도메인이라기보다 각각 `/`, `/services/$slug` 라우트 전용 구현이라는 점이다. 이 때문에 "feature", "domain", "route" 경계가 섞여 보이고, 앞으로 화면이 늘어날 때 어떤 코드를 어디에 둬야 하는지 판단 비용이 커질 수 있다.

TanStack 공식 문서는 기본 라우트 위치를 `src/routes`로 설명하고, 라우트 전용 파일이나 폴더는 `-components`, `-hooks`처럼 `-` prefix를 붙여 라우트 트리 생성에서 제외하는 colocate 방식을 안내한다.

참고 문서:

- TanStack Start Routing: https://tanstack.com/start/latest/docs/framework/react/guide/routing
- TanStack Router Routing Concepts: https://tanstack.com/router/latest/docs/routing/routing-concepts
- TanStack Router File-Based Routing API: https://tanstack.com/router/latest/docs/api/file-based-routing
- React File Structure FAQ: https://legacy.reactjs.org/docs/faq-structure.html

## 목표

- 라우트 전용 UI와 훅을 해당 라우트 근처로 이동한다.
- `features` 폴더를 실제 독립 기능이 있을 때만 사용하는 기준을 세운다.
- TanStack Router의 공식 ignore 규칙인 `-` prefix를 따른다.
- 이번 변경은 구조 개편과 import 정리에 한정하고, 동작 변경은 만들지 않는다.
- 타입 체크, 린트, 테스트, 빌드로 이동 결과를 검증한다.

## 비목표

- 사이트 UX, 스타일, 라우팅 URL, 콘텐츠 파싱 동작은 변경하지 않는다.
- `src/lib`, `src/components/ui`, `src/components/site`, `src/og`의 역할을 재설계하지 않는다.
- 아직 여러 라우트에서 쓰이지 않는 코드를 미리 `features`로 추상화하지 않는다.
- TanStack Router 설정의 `routeFileIgnorePrefix`나 `routeFileIgnorePattern`을 바꾸지 않는다.

## 현재 features 조사 결과

`src/features/home`의 파일은 모두 `/` 라우트에서만 참조된다.

- `components/hero.tsx`
- `components/category-sidebar.tsx`
- `components/design-search.tsx`
- `components/service-list-row.tsx`
- `components/service-logo.tsx`
- `hooks/use-filtered-services.ts`

특히 `use-filtered-services.ts`는 `useSearch({ from: "/" })`, `useNavigate({ from: "/" })`에 직접 의존하므로 홈 라우트 전용 훅이다.

`src/features/service-detail`의 파일은 모두 `/services/$slug` 라우트에서만 참조된다.

- `components/copy-button.tsx`
- `components/detail-tabs.tsx`
- `components/inline-copy-button.tsx`
- `components/preview-frame.tsx`
- `components/preview-theme-toggle.tsx`
- `components/raw-design-md.tsx`
- `components/service-meta.tsx`
- `components/token-badge.tsx`

현재 기준으로는 `features`에 남길 독립 기능이 없다.

## 결정한 구조

홈 라우트 전용 코드는 `src/routes/-home` 아래로 이동한다. `-home`은 URL에 영향을 주지 않는 라우트 제외 폴더이며, 홈 화면을 구성하는 private implementation 영역이다.

```txt
src/routes/
  index.tsx
  -home/
    components/
      category-sidebar.tsx
      design-search.tsx
      hero.tsx
      service-list-row.tsx
      service-logo.tsx
    hooks/
      use-filtered-services.ts
```

서비스 상세 라우트 전용 코드는 `src/routes/services/-components` 아래로 이동한다.

```txt
src/routes/
  services/
    $slug.tsx
    -components/
      copy-button.tsx
      detail-tabs.tsx
      inline-copy-button.tsx
      preview-frame.tsx
      preview-theme-toggle.tsx
      raw-design-md.tsx
      service-meta.tsx
      token-badge.tsx
```

개편 후 `src/features`는 비어 있으면 제거한다.

## 공유 코드 분류 기준

`features`는 "여러 라우트에서 공유되는 사용자 기능"이 생겼을 때만 만든다. 단순히 여러 파일에서 import된다는 이유만으로 승격하지 않는다.

`src/components/ui`에 둘 코드:

- 버튼, 배지, 카드, 툴팁처럼 도메인 의미가 거의 없는 UI primitive
- 앱 전반에서 일관된 스타일 API를 제공하는 저수준 컴포넌트

`src/components/site`에 둘 코드:

- 헤더, 푸터처럼 사이트 전체 레이아웃에 속하는 컴포넌트
- 특정 라우트가 아니라 앱 shell에 가까운 요소

`src/lib`에 둘 코드:

- content parsing, collection, category style, site config, Shiki integration처럼 UI 라우트와 독립적인 순수 로직
- 테스트 가능한 데이터 변환, 타입, 설정, 유틸리티

`src/features/<feature>`에 둘 코드:

- 같은 사용자 기능이 2개 이상의 라우트에서 쓰인다.
- 특정 라우트의 search params, loader data, URL 구조에 직접 묶여 있지 않다.
- UI, 훅, 상태, 사용자 행위가 하나의 기능 단위로 함께 변경된다.
- `components/ui`나 `lib`로 두기에는 도메인 행위가 크다.

예시 후보:

- 여러 라우트에서 `design.md` 원문 복사를 제공하게 되면 `src/features/copy-design-md`.
- 상세 페이지 외 다른 라우트에서도 프리뷰 iframe과 테마 전환을 제공하게 되면 `src/features/design-preview`.

현재는 두 후보 모두 단일 라우트 사용이므로 승격하지 않는다.

## 구현 방침

1. `src/routes/-home/components`, `src/routes/-home/hooks`, `src/routes/services/-components`를 만든다.
2. 기존 `src/features/home`과 `src/features/service-detail`의 파일을 새 위치로 이동한다.
3. `src/routes/index.tsx` import를 `./-home/...` 기준으로 수정한다.
4. `src/routes/services/$slug.tsx` import를 `./-components/...` 기준으로 수정한다.
5. 이동한 파일 내부의 상대 import를 새 위치에 맞게 수정한다.
6. `src/features`가 비면 삭제한다.

## 테스트 및 검증

구조 변경 후 다음 명령으로 검증한다.

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

라우트 트리 검증 기준:

- `src/routeTree.gen.ts`에 `-home`이나 `-components`가 라우트로 추가되지 않아야 한다.
- `/`와 `/services/$slug` 라우트 경로가 그대로 유지되어야 한다.
- 홈 검색, 카테고리 필터, 서비스 상세 탭 전환, 프리뷰 테마 전환, 복사 버튼 동작이 유지되어야 한다.

## 리스크와 대응

`-` prefix 폴더를 잘못 쓰면 import 경로는 맞더라도 라우터 생성 대상에 의도치 않은 파일이 포함될 수 있다. 따라서 `components`가 아니라 반드시 `-components`, 홈 전용 grouping도 `-home`으로 둔다.

파일 이동 과정에서 상대 import가 깨질 수 있다. 이동 후 `rg "@/features"`로 잔여 import를 확인하고, 타입 체크로 경로 오류를 잡는다.

이번 변경은 파일 이동이 대부분이므로 리뷰 시 동작 diff보다 import 경로와 라우트 트리 결과를 중심으로 확인한다.
