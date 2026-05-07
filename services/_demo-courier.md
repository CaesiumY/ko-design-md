---
name: Demo Courier
slug: demo-courier
category: delivery
last_updated: 2026-05-07
sources:
  - https://example.com/demo-courier/design
related_services: [demo-pay]
lang: ko
---

# Demo Courier — design.md

> Fictional service used to validate the rendering pipeline. Not a real product.

## 디자인 철학

Demo Courier는 **사용자의 기분을 같이 배달한다**고 본다. 음식을 기다리는 시간은 종종 지루하고, 때로 불안하다. 화면은 그 시간을 따뜻한 친구처럼 채워야 한다 — 그래서 시각 언어 전체에 약간의 캐릭터성과 따뜻한 색감을 둔다.

동시에, 핵심 정보(언제 도착하는가, 어디까지 왔는가)는 한눈에 들어와야 한다. "감성적이지만 정확한" — 이 두 마리 토끼를 잡는 것이 Demo Courier의 디자인 과제다.

## 비주얼 언어

- **Color tokens**: primary는 따뜻한 오렌지 (`oklch(0.7 0.18 50)`), accent는 부드러운 옐로우. surface는 크림 톤, text는 dark-warm gray
- **Typography**: Pretendard Variable. 제목은 Display 700, 본문은 500. 캐릭터 대사는 italic
- **Iconography**: rounded, 약간 통통한 형태. 핵심 아이콘은 미세한 마스코트 표정
- **Radius / Elevation**: 모든 radius 풍부 (16-20px). shadow는 가볍게 떠 있는 느낌
- **Motion**: 250-300ms, slight bounce. 도착 임박 알림에는 살짝 큰 motion으로 emphasis

## 핵심 UX 패턴

1. **실시간 위치 + 캐릭터 합성** — 지도 위에 라이더 캐릭터가 직접 움직임. 단순한 dot보다 "사람이 가져온다"는 감각을 강화.
2. **예상 도착 시간을 항상 상단 (ETA-first)** — 화면 어디에서든 ETA가 가장 위에. 사용자가 가장 자주 확인하는 정보.
3. **주문 단계별 마이크로카피** — "이제 픽업해요!", "거의 다 왔어요" 같은 친근한 톤으로 단계 변화 알림.
4. **재주문 한 탭 (1-tap reorder)** — 최근 주문은 홈 상단 카드에서 바로 재주문.

## 시그니처 컴포넌트

### EtaBanner

화면 상단에 sticky로 떠있는 ETA 표시. 시간이 줄어들수록 색이 살짝 밝아지며 강조 강도가 올라간다.

```tsx
<div className="sticky top-0 rounded-2xl bg-primary/10 p-4">
  <p className="text-sm text-muted-foreground">예상 도착</p>
  <p className="text-3xl font-bold">{minutes}분 후</p>
</div>
```

### RiderMapPin

지도 위 라이더 위치 핀. 단순 dot이 아닌 캐릭터 아이콘 + 진행 방향 표시.

## 대표 화면

- **주문 추적 화면**: 상단 EtaBanner, 가운데 큰 지도(라이더 캐릭터 핀 + 경로), 하단에 라이더/매장 정보 카드.
- **홈**: 상단 가까운 음식 카테고리 캐러셀 + 최근 주문 재주문 카드 + 추천 매장 그리드.

## 한국적 맥락 (WHY)

한국의 배달은 도시 밀도가 높고 배달 주기가 짧다. 사용자는 "배달이 왔는지" 궁금해 화면을 자주 들여다보는데, 이때 화면이 차갑거나 정보만 가득하면 기다림의 부담이 더 커진다. Demo Courier의 캐릭터/마이크로카피 톤은 이런 짧고 잦은 확인 행동에 작은 즐거움을 더하는 장치다.

또한 한국 배달 시장은 라이더 가시성이 중요한 사용자 경험 요소다 — "내 음식이 어디쯤 왔는지" 정확히 보는 것이 만족도와 직결. 라이더 캐릭터 핀은 이 정보 욕구를 정보 + 감성 두 축으로 동시에 만족시키는 한국 시장 특화 패턴이다.

## References

- https://example.com/demo-courier/design
