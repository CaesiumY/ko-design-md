---
name: Demo Pay
slug: demo-pay
category: finance
last_updated: 2026-05-07
sources:
  - https://example.com/demo-pay/design
  - https://example.com/demo-pay/tech-blog
related_services: [demo-courier]
lang: ko
---

# Demo Pay — design.md

> Fictional service used to validate the rendering pipeline. Not a real product.

## 디자인 철학

Demo Pay는 **결제는 무조건 짧고 단호하게**라는 원칙을 본다. 한 손으로 잡은 화면 안에서, 사용자의 시선은 금액과 다음 행동(확인 버튼) 사이를 두 번만 오간다. 다른 모든 보조 정보는 그 두 시선의 바깥으로 밀어낸다.

이 단호함은 시각적으로도 같은 결을 갖는다. 색은 한 가지 핵심 액션 컬러 외에는 거의 무채색에 가깝게 운영하고, 모션은 사용자의 결정을 재촉하지 않으면서도 망설임을 끊어주는 역할만 한다. "결제는 신중해야 하지만, 망설이게 두지는 말자"가 시각 언어의 한 줄 요약이다.

## 비주얼 언어

- **Color tokens**: primary는 강한 단일 블루 (`oklch(0.55 0.18 250)`), surface는 거의 흰색에 가까운 ivory 톤, text는 high-contrast 무채색 2단(primary text / muted)
- **Typography**: Pretendard Variable. 금액은 tabular-nums + 700 weight, 설명은 400, 보조 정보는 500 muted
- **Iconography**: stroke 1.5px, rounded join, 아이콘은 액션 보조 역할만 — 메인 정보는 항상 텍스트
- **Radius / Elevation**: 카드 14px, 버튼 12px. shadow는 거의 없음 (border + 미세한 inner glow로 깊이 표현)
- **Motion**: 200ms ease-out 기준. 결제 confirm 시에만 240ms로 살짝 길게 — 사용자의 결정을 시각적으로 인식

## 핵심 UX 패턴

1. **금액 우선 (Amount-first)** — 어떤 결제 화면이든 금액이 화면 상단 1/3 안에 가장 큰 글자로. 다른 정보는 모두 그 아래로.
2. **단일 다음 행동 (Single primary action)** — 화면당 강조 버튼은 정확히 1개. 보조 행동은 ghost 또는 텍스트 링크.
3. **마찰 없는 인증 (Frictionless auth)** — 생체 인증을 default로, PIN은 fallback. 카드 추가는 카메라 OCR이 default.
4. **취소는 항상 한 번** — 결제 직전 화면에서 취소 버튼은 항상 좌상단의 X 위치에 일관되게.

## 시그니처 컴포넌트

### AmountDisplay

화면 상단에 노출되는 금액 컴포넌트. tabular-nums + 큰 weight + 통화 단위가 작게 따라온다.

```tsx
<div className="flex items-baseline gap-2">
  <span className="text-4xl font-bold tabular-nums">{amount.toLocaleString()}</span>
  <span className="text-base text-muted-foreground">원</span>
</div>
```

### ConfirmSheet

화면 하단에서 올라오는 결제 확인 시트. swipe down으로 dismiss, 메인 버튼은 탭 영역이 시트 너비 전체.

## 대표 화면

- **결제 confirm 화면**: 상단 1/3에 금액 + 결제 대상 한 줄, 중간에 결제 수단 카드 한 장, 하단에 단일 confirm 버튼. 보조 정보(영수증 옵션 등)는 작은 텍스트 링크.
- **결제 수단 관리**: 카드 리스트는 가로 스와이프 캐러셀이 아닌 세로 리스트 — 한 번에 한 카드씩 명확하게 보이도록.

## 한국적 맥락 (WHY)

한국의 모바일 결제는 한 손 사용 비중이 높고, 결제 빈도가 일상의 작은 단위(편의점, 카페)까지 깊게 들어와 있다. 이 환경에서는 "한 번 더 누르게 만드는 디자인"이 곧 이탈로 이어지기 쉽다. Demo Pay의 단호한 두 시선 원칙은 이런 환경에 대한 직접적인 응답이다.

또한 한국의 결제는 본인인증(PASS), 카드사 약관 표시, 영수증 옵션 같은 규제적 요소가 많다. 이 정보들을 "단호한 메인 흐름"의 흐름을 깨지 않으면서 어떻게 배치할 것인가가 한국 결제 디자인의 본질적 도전이다 — Demo Pay는 이를 보조 시트로 분리하고, 메인 흐름에는 한 줄 요약만 노출하는 패턴을 택한다.

## References

- https://example.com/demo-pay/design
- https://example.com/demo-pay/tech-blog
