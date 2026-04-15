# Persogram — Explore 탭 설계안
Date: 2026-04-15

---

## 개요

Explore 탭은 유저가 새로운 페르소나를 검색하고 발견하는 화면입니다.

- **레이아웃:** 스크롤형 단일 페이지
- **배경:** 다크 (#0B1526) — Chat·Profile 탭과 동일한 톤
- **파일명:** `ExploreTabScreen.tsx`

---

## 화면 구성 (위→아래 순서)

### 헤더
| 항목 | 내용 |
|------|------|
| 좌측 | "탐색" 타이틀 (white, bold) |
| 우측 | 없음 |

---

### ① 검색창

| 상태 | 내용 |
|------|------|
| 비활성 | `"페르소나 검색..."` placeholder, 터치 시 `isSearching = true` |
| 활성 | 전체화면 오버레이로 전환, "취소" 버튼 표시 |

**검색 모드 (isSearching === true):**
- 전체화면 다크 오버레이 (`position: fixed, inset: 0, z-index: 50`)
- 탭바를 포함한 전체화면을 덮음 (탭바 숨김 불필요 — 오버레이가 위에 표시)
- 상단: 활성 검색창 + "취소" 버튼
- 입력 전: 최근 검색 목록 (최대 5개, × 버튼으로 삭제) + 추천 태그 칩 (= CATEGORIES 목록 재사용)
- 입력 후: `characters` 전체를 대상으로 `name` · `role` · `tags` 기준 필터링 (activeCategory 무시, 전체 캐릭터 풀 검색)
- 결과 없음: "검색 결과가 없어요" 빈 상태 텍스트
- 검색 모드 중에는 카테고리 필터 완전 무시, 검색어 기준으로만 필터링 (카테고리 칩은 오버레이에 가려져 조작 불가)
- 최근 검색 저장 대상: 검색 결과 카드 터치 시 **입력했던 query 문자열**을 recentSearches 앞에 추가 (단, `query.trim()` 이 비어 있으면 저장하지 않음. 중복 제거, 최대 5개 유지)
- 최근 검색 칩 터치 시: 해당 query 문자열을 검색창에 복원하여 검색 재실행

**상태 초기화:**
- "취소" 버튼 터치: `query = "", isSearching = false`
- 오버레이 배경 탭: `isSearching = false` (취소와 동일)
- 탭 전환 시(ExploreTabScreen 비활성화): `query = "", isSearching = false` (unmount 시 자동 초기화)

**최근 검색 영속성:**
- `useState<string[]>` — 세션 내 메모리만 유지, 새로고침 시 초기화
- `localStorage` 영속화는 2단계

---

### ② 카테고리 필터 칩

| 항목 | 내용 |
|------|------|
| 칩 목록 | `전체 · 로맨스 · 판타지 · 일상 · 직장 · SF · 미스터리` |
| 레이아웃 | 가로 스크롤 (scrollbar 숨김) |
| 활성 칩 | `#0EA5E9` 배경, white 텍스트 |
| 비활성 칩 | `rgba(255,255,255,0.07)` 배경, 반투명 텍스트 |
| 동작 | 칩 선택 → `activeCategory` 상태 변경 → 트렌딩 목록 필터링 |
| 검색 모드 중 | 검색 오버레이가 전체화면을 덮으므로 카테고리 칩 조작 불가. 검색 완료 후 기존 activeCategory 유지 |

**"전체" 선택 시:** 필터 없이 전체 캐릭터 표시

---

### ③ 트렌딩 캐릭터 목록

| 항목 | 내용 |
|------|------|
| 섹션 라벨 | "🔥 이번 주 인기" |
| 카드 레이아웃 | 아바타(w-11 h-11 = 44px, rounded-xl) + 텍스트 영역 + 우측 정보 |
| 아바타 | `avatarImage` 있으면 이미지, 없으면 `accentColor` 그라디언트 fallback |
| 텍스트 | 이름 (white, bold) + 역할 (반투명, small) + 태그 칩 |
| 우측 | 대화수 + 급상승 뱃지 (`↑ 급상승`, amber) |
| 급상승 뱃지 | `isTrending === true`인 캐릭터에만 표시. `false`면 뱃지 미표시, 목록엔 포함 |
| 카테고리 필터 적용 | `isTrending` 여부와 무관하게 카테고리 매칭 기준으로 포함/제외 |
| 터치 동작 | `onSelectCharacter(char)` → HomeScreen의 `setSelectedCharacter` 호출 |
| 빈 상태 | 카테고리 필터 결과 없을 때 "해당 카테고리의 페르소나가 없어요" |

---

## 데이터 모델

```typescript
// Character 타입: ProfileScreen.tsx에서 import
// 사용 필드: id (number), name, role, tags (string[]), avatarImage?, accentColor?
import { type Character } from "./ProfileScreen";

// 카테고리 필터
type Category = "전체" | "로맨스" | "판타지" | "일상" | "직장" | "SF" | "미스터리";

const CATEGORIES: Category[] = ["전체", "로맨스", "판타지", "일상", "직장", "SF", "미스터리"];

// 트렌딩 메타 (1단계: 급상승 여부 하드코딩)
interface TrendingMeta {
  characterId: Character["id"]; // number와 동기화 보장
  isTrending: boolean;
}

const TRENDING_META: TrendingMeta[] = [
  { characterId: 1, isTrending: true },
  { characterId: 2, isTrending: false },
  { characterId: 3, isTrending: true },
  { characterId: 4, isTrending: false },
];
// characters prop에 해당 id가 없을 경우 해당 항목 무시 (런타임 안전)
// trendingCharacters = TRENDING_META.map(m => characters.find(c => c.id === m.characterId)).filter(Boolean)
```

---

## 컴포넌트 구조

```
ExploreTabScreen                          — 전체 화면, 상태 관리
 ├── ExploreHeader                        — "탐색" 타이틀
 ├── SearchBar                            — 비활성 검색창 (터치 시 isSearching=true)
 ├── CategoryChips                        — 가로 스크롤 필터 칩
 ├── TrendingList                         — 트렌딩 캐릭터 세로 목록
 │    └── TrendingCard (×N)              — 캐릭터 카드 1개
 └── SearchOverlay (isSearching=true)     — 전체화면 검색 오버레이 (z-50)
      ├── 활성 검색창 + 취소 버튼
      ├── 최근 검색 목록 (입력 전)
      ├── 추천 태그 칩 = CATEGORIES 재사용 (입력 전)
      └── 검색 결과 목록 (입력 후)
```

**내부 상태:**
```typescript
const [isSearching, setIsSearching] = useState(false);
const [query, setQuery] = useState("");
const [recentSearches, setRecentSearches] = useState<string[]>([]);
const [activeCategory, setActiveCategory] = useState<Category>("전체");
```

---

## HomeScreen 연결

```
Explore 탭 활성 (activeNav === "explore")
 └── ExploreTabScreen 렌더링 (activeNav === "explore" && !chatCharacter && !selectedCharacter)
      ├── TrendingCard 터치
      │    → onSelectCharacter(char)
      │    → HomeScreen setSelectedCharacter(char)
      │    → ProfileScreen(캐릭터 상세) 오버레이
      │         └── 뒤로가기 → setSelectedCharacter(null)
      │              → activeNav === "explore" → ExploreTabScreen 복귀
      └── SearchOverlay 결과 카드 터치
           → 동일 플로우
```

**Props:**
```typescript
interface ExploreTabScreenProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}
```

> `activeNav` prop은 HomeScreen에서 조건부 렌더링으로 제어 (`activeNav === "explore"` 조건).
> ExploreTabScreen 자체는 activeNav를 받지 않으며, unmount 시 상태가 자동 초기화됨.

---

## 구현 범위 (1단계)

| 기능 | 범위 |
|------|------|
| 검색창 UI | 비활성 + 전체화면 활성 전환 |
| 최근 검색 | 세션 내 메모리(useState), 새로고침 시 초기화 |
| 검색 필터링 | 클라이언트 사이드 (name · role · tags) |
| 카테고리 필터 | 클라이언트 사이드 tags 매칭 |
| 트렌딩 목록 | `characters` 배열 + `TRENDING_META` 조합 |
| 급상승 뱃지 | 하드코딩 mock (`isTrending: true`인 경우만 표시) |
| 캐릭터 상세 진입 | `onSelectCharacter` → HomeScreen `setSelectedCharacter` |
| localStorage 영속화 | 2단계 |
| 서버 검색 연동 | 추후 구현 |
