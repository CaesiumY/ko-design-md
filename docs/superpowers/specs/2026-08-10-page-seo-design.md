# 페이지 SEO 설계

## 목적

`ko/design.md`의 공개 HTML 페이지가 페이지별로 고유하고 일관된 검색 신호를
제공하도록 한다. 범위는 홈페이지, 서비스 상세 페이지, 서비스 탭 URL, 404 페이지와
검색 엔드포인트의 URL 일관성이다.

## 성공 기준

- 홈페이지와 모든 서비스 상세 페이지가 고유한 title, description, canonical URL을
  서버 렌더링 HTML에 포함한다.
- UI 상태인 서비스 탭 URL은 검색 결과의 별도 문서로 색인되지 않는다.
- 404 응답은 홈페이지 메타데이터를 상속하지 않으며 `noindex,follow`를 제공한다.
- sitemap의 각 URL은 색인할 페이지의 canonical URL과 정확히 일치한다.
- 구조화 데이터는 실제 화면에 표시되는 값만 표현한다.

## 페이지별 메타데이터 정책

### 홈페이지 (`/`)

- Title: `한국 서비스 디자인 시스템 카탈로그 | ko/design.md`
- Description: 한국 서비스 디자인 시스템의 규칙과 디자인 토큰을 AI에 바로 전달할 수
  있는 `design.md` 카탈로그라는 현재 제품 설명을 사용한다.
- Canonical: `${SITE_URL}/`
- Open Graph/Twitter: 홈페이지 title, description, 기본 OG 이미지와 같은 canonical URL을
  사용한다.
- JSON-LD: 사이트명, URL, 한국어를 표현하는 `WebSite`와 카탈로그 성격을 표현하는
  `CollectionPage`를 제공한다.

### 서비스 상세 (`/services/:slug`)

- Title: `{서비스명} 디자인 시스템·토큰 | ko/design.md`
- Description: 서비스 문서의 `tagline`을 평문으로 정리하고 메타 길이 제한을 적용한다.
- Canonical: `${SITE_URL}/services/:slug`이며 쿼리 문자열은 포함하지 않는다.
- Open Graph/Twitter: title, description, 서비스별 OG 이미지와 canonical URL을 같은 값으로
  사용한다.
- JSON-LD: 화면에 표시되는 서비스명, 설명, OG 이미지, 수정일, 언어와 canonical URL만으로
  `Article`을 구성한다. 저자, 평점, breadcrumb처럼 근거 또는 화면 표현이 없는 값은
  추가하지 않는다.
- 현재 제목의 손상된 구분문자는 ASCII `|`로 교체한다.

### 서비스 탭 URL (`?tab=preview|tokens|md`)

- 기본 프리뷰는 쿼리 없는 `/services/:slug`를 정규 URL로 사용한다.
- `tokens`와 `md`는 같은 문서 안의 UI 상태이므로 canonical을 기본 상세 URL로 고정하고
  `robots`를 `noindex,follow`로 설정한다.
- 라우트의 검색 파라미터 기본값을 렌더링 시 적용해, 쿼리 없는 기본 URL이 자동으로
  `?tab=preview`로 리다이렉트되지 않게 한다.

### 404

- Title: `페이지를 찾을 수 없습니다 | ko/design.md`
- Description와 OG 메타데이터는 홈페이지 값을 재사용하지 않는다.
- Robots: `noindex,follow`
- 응답 상태는 현재처럼 HTTP 404를 유지한다.

## 구성과 데이터 흐름

`src/lib/seo.ts`에 사이트 제목, 기본 설명, canonical URL, OG/Twitter 메타데이터,
JSON-LD를 생성하는 순수 헬퍼를 둔다. `src/lib/site-config.ts`의 `SITE_URL`과
`absoluteUrl()`을 유일한 origin 입력으로 사용한다.

- 루트 라우트는 전역 charset, viewport, favicon, 테마와 공유 기본값만 제공한다.
- 홈페이지 라우트는 홈페이지 전용 head와 JSON-LD를 제공한다.
- 서비스 상세 라우트는 loader의 `ServiceDoc`으로 서비스 전용 head와 JSON-LD를 제공한다.
- 404 경로는 별도 head 정책을 선택해 색인 방지 메타데이터를 서버 렌더링한다.
- sitemap 생성기는 canonical URL 규칙을 재사용하며, RSS·robots·`llms.txt`의 기존 역할은
  변경하지 않는다.

## 오류와 배포 경계

- 서비스 문서를 찾지 못하면 기존 HTTP 404를 유지하고 404 SEO 정책을 적용한다.
- `VITE_SITE_URL` 누락 시 production build를 실패시키는 현재 보호 장치를 유지한다.
- 배포 환경에서는 `getdesign.kr` 또는 `www.getdesign.kr` 중 하나를 정해 다른 호스트를
  301 리다이렉트해야 한다. `VITE_SITE_URL`, canonical, OG URL, sitemap과 RSS의 origin은
  반드시 이 선호 호스트와 같아야 한다. 이 호스트 리다이렉트 설정은 배포 권한이 필요한
  별도 운영 작업이다.

## 검증 계획

- SEO 헬퍼 단위 테스트: title, description, canonical, robots, JSON-LD의 입력별 출력을
  확인한다.
- 라우트 head 테스트: 홈, 서비스 상세, 세 탭 상태, 미존재 URL에서 SSR 메타데이터를
  검증한다.
- sitemap 테스트: 모든 색인 URL이 대응 페이지 canonical과 1:1인지 확인한다.
- build 검증: production URL을 설정한 상태에서 타입 검사, 테스트, 린트, production build를
  실행한다.
- 배포 후: 단일 호스트 301, 실제 응답의 HTTP 상태와 head, Google Rich Results Test,
  Search Console URL Inspection을 확인한다.

## 제외 범위

- 새 콘텐츠 랜딩 페이지, 키워드용 문서 작성, 보이지 않는 breadcrumb 마크업은 추가하지
  않는다.
- `llms.txt`는 Google SEO 표준 sitemap 항목이 아니므로 sitemap에 넣지 않는다.
- 배포 호스트와 리다이렉트의 실제 변경은 별도 권한 없이는 수행하지 않는다.

## 근거

- [Google Search Central: 중복 URL 통합](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Google Search Central: robots 메타 태그](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag)
- [Google Search Central: 구조화 데이터 소개](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data)
- [Google Search Central: title link 제어](https://developers.google.com/search/docs/appearance/title-link)
