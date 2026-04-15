# UI 폴리싱 및 세부 개선 설계

> **For agentic workers:** REQUIRED: Use superpowers:executing-plans to implement this plan.

**Goal:** motion 라이브러리를 활용해 각 화면에 경쾌하고 생동감 있는 애니메이션, 빈 상태 처리, 스켈레톤 shimmer를 추가해 앱 완성도를 높인다.

**Architecture:** 공통 spring 토큰을 상수로 정의하고, 각 화면 컴포넌트에 motion.div를 인라인 스타일 패턴을 유지하며 적용한다. AnimatePresence로 언마운트 애니메이션을 처리한다. ProfileScreen의 슬라이드업 exit 애니메이션은 HomeScreen.tsx의 AnimatePresence에서 처리한다.

**Tech Stack:** motion (framer-motion v12, 이미 설치), CSS keyframes (shimmer), React 18 + TypeScript

---

## 공통 애니메이션 토큰

모든 화면이 공유하는 상수. 별도 파일(`src/app/components/animationTokens.ts`)로 분리한다.

```ts
export const SPRING = { type: "spring" as const, stiffness: 300, damping: 24 };

export const FADE_UP = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 10 },
};

// STAGGER_CONTAINER는 반드시 initial: {} 포함 — 자식 variant 전파를 위해 필수
export const STAGGER_CONTAINER = {
  initial: {},
  animate: { transition: { staggerChildren: 0.06 } },
};

// SPRING 상수 재사용 (인라인 중복 방지)
export const STAGGER_ITEM = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { ...SPRING } },
};
```

---

## 화면별 설계

### 1. BottomNav — 아이콘 bounce + active indicator slide

**파일:** `BottomNav.tsx`

- 각 탭 버튼을 `motion.button`으로 교체, `whileTap={{ scale: 0.85 }}`
- 활성 탭 아이콘에 `animate={{ scale: [1, 1.25, 1] }}` spring transition (key prop으로 재트리거)
- active dot은 **모든 탭 버튼 아래에 항상 렌더링**, 비활성 탭은 `opacity: 0`으로 처리.
  `layoutId="nav-indicator"`를 공유하면 framer-motion이 활성 탭 사이를 슬라이딩 보간함.

```tsx
// 각 탭 버튼 내부 하단에 항상 렌더링
<motion.div
  layoutId="nav-indicator"
  style={{
    width: 4, height: 4, borderRadius: "50%",
    background: "#0EA5E9",
    opacity: isActive ? 1 : 0,  // 비활성 시 invisible, layoutId는 유지
  }}
/>
```

### 2. HomeScreen — 캐릭터 카드 stagger 진입 + ProfileScreen AnimatePresence

**파일:** `HomeScreen.tsx`

- 홈 탭 콘텐츠 진입 시 `AnimatePresence` + `FADE_UP` 전체 컨테이너
- 캐릭터 카드 리스트를 `STAGGER_CONTAINER` / `STAGGER_ITEM`으로 감싸 순서대로 등장
- **ProfileScreen 슬라이드업 exit 애니메이션을 위해** `HomeScreen.tsx`에서 아래와 같이 감쌀 것:

```tsx
// HomeScreen.tsx — ProfileScreen 조건부 렌더링 블록
<AnimatePresence>
  {!chatCharacter && selectedCharacter && (
    <ProfileScreen
      key={selectedCharacter.id}
      character={selectedCharacter}
      // ... 나머지 props
    />
  )}
</AnimatePresence>
```

- `CharacterCard` 최상위 div를 `motion.div`로 교체, `whileTap={{ scale: 0.97 }}`.
  `whileHover={{ scale: 1.02 }}`는 카드 컨테이너에만 적용하고, 내부 버튼(`onClick`)은 별도 `stopPropagation` 불필요 (motion hover가 pointer 이벤트를 막지 않음).

### 3. ExploreTabScreen — 검색 오버레이 + 결과 stagger

**파일:** `ExploreTabScreen.tsx`

- 검색 오버레이 진입: `AnimatePresence` + `motion.div`
  ```tsx
  initial={{ opacity: 0, scale: 0.97 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.97 }}
  transition={{ duration: 0.2 }}  // framer-motion duration 단위는 초(숫자), "0.2s" 문자열 아님
  ```
- 검색 결과 카드 목록: `STAGGER_CONTAINER` / `STAGGER_ITEM`
- 카테고리 칩 button: `whileTap={{ scale: 0.88 }}`
- 트렌딩 리스트 아이템: 화면 진입 시 `STAGGER_ITEM`

### 4. ChatTabScreen — 대화 목록 stagger + Empty State

**파일:** `ChatTabScreen.tsx`

- 화면 전체 컨테이너: `motion.div` + `FADE_UP` variants
- 대화 목록 컨테이너: `STAGGER_CONTAINER`, 각 아이템: `STAGGER_ITEM`
- 대화 없을 때 Empty State:
  ```tsx
  <motion.div {...FADE_UP} style={{ textAlign:"center", padding:"48px 16px" }}>
    <div style={{ fontSize:32, marginBottom:8 }}>💬</div>
    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:13 }}>아직 대화가 없어요</div>
    <div style={{ color:"#0EA5E9", fontSize:12, marginTop:4 }}>탐색에서 캐릭터를 찾아보세요 →</div>
  </motion.div>
  ```

### 5. ProfileTabScreen — 그리드 stagger + shimmer + Empty State

**파일:** `ProfileTabScreen.tsx`, **shimmer CSS:** `src/index.css`

- 관심 캐릭터 그리드 컨테이너: `STAGGER_CONTAINER`, 각 카드: `STAGGER_ITEM`
- 아바타 이미지 로딩 중 shimmer 플레이스홀더는 **`src/index.css`에 keyframe 추가**:
  ```css
  @keyframes shimmer {
    0%   { background-position: -200% 0; }
    100% { background-position:  200% 0; }
  }
  .avatar-shimmer {
    background: linear-gradient(90deg, #1e2d40 25%, #2a3d52 50%, #1e2d40 75%);
    background-size: 200% 100%;
    animation: shimmer 1.4s infinite linear;
  }
  ```
  컴포넌트에서 이미지가 로드되기 전 `<div className="avatar-shimmer" />` 렌더링,
  이미지 `onLoad` 시 shimmer 제거 (`useState(false)` → `setLoaded(true)`).
- 관심 0명 Empty State: 기존 UI에 `motion.div` + `FADE_UP` 래핑

### 6. ProfileScreen — 슬라이드업 진입 + 관심 버튼 spring bounce

**파일:** `ProfileScreen.tsx`

- 최상위 컨테이너를 `motion.div`로 교체 (AnimatePresence는 HomeScreen.tsx에서 처리):
  ```tsx
  <motion.div
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    exit={{ y: "100%" }}
    transition={{ type: "spring", stiffness: 260, damping: 28 }}
    style={{ position:"fixed", inset:0, ... }}
  >
  ```
- 관심 버튼 (`isInterested` prop 기준, `isFollowing` 아님):
  ```tsx
  <motion.button
    whileTap={{ scale: 0.88 }}
    animate={isInterested ? { scale: [1, 1.3, 1] } : { scale: 1 }}
    transition={{ ...SPRING }}
    onClick={onToggleInterest}
  />
  ```

---

## 구현 우선순위

1. `animationTokens.ts` 공통 토큰 생성 + `src/index.css` shimmer keyframe 추가
2. BottomNav — layoutId indicator + whileTap
3. HomeScreen — AnimatePresence(ProfileScreen) + 카드 stagger + CharacterCard whileTap
4. ProfileScreen — 슬라이드업 + 관심 버튼 bounce
5. ExploreTabScreen — 오버레이 fade+scale + 결과 stagger + 칩 whileTap
6. ChatTabScreen — FADE_UP + stagger + Empty State
7. ProfileTabScreen — stagger + shimmer + Empty State 애니메이션

---

## 제약 사항

- 기존 인라인 스타일 패턴 유지 (Tailwind 클래스 새로 추가하지 않음)
- 모든 애니메이션은 `prefers-reduced-motion` 미디어쿼리 고려 불필요 (프로토타입 단계 — 프로덕션 전환 시 재검토 필요)
- `motion` import는 `"motion/react"` (framer-motion v12 패키지명)
- `duration` 값은 반드시 숫자(초 단위)로 — `"0.2s"` 문자열 사용 금지
