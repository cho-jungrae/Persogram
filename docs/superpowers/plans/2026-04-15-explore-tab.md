# Explore 탭 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Explore 탭 UI 구현 — 검색(전체화면 오버레이), 카테고리 필터 칩, 트렌딩 캐릭터 목록 + HomeScreen 연결

**Architecture:** `ExploreTabScreen.tsx` 단일 파일에 모든 서브 컴포넌트와 상태(`isSearching`, `query`, `recentSearches`, `activeCategory`)를 포함. HomeScreen에서 `activeNav === "explore"` 조건으로 렌더링. 캐릭터 터치 시 HomeScreen의 `setSelectedCharacter`를 호출해 기존 `ProfileScreen`(캐릭터 상세)을 재사용.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 4 (인라인 style 위주 — 기존 탭 화면 패턴 동일)

---

## 파일 구조

- **신규 생성:** `Design_main_screen/src/app/components/ExploreTabScreen.tsx`
- **수정:** `Design_main_screen/src/app/components/HomeScreen.tsx` — Explore 탭 라우팅 추가

---

## Chunk 1: ExploreTabScreen 컴포넌트

### Task 1: ExploreTabScreen 구현

**Files:**
- Create: `Design_main_screen/src/app/components/ExploreTabScreen.tsx`

- [ ] **Step 1: 타입 정의 및 데이터 상수 작성**

```tsx
import { useState } from "react";
import { type Character } from "./ProfileScreen";

type Category = "전체" | "로맨스" | "판타지" | "일상" | "직장" | "SF" | "미스터리";

const CATEGORIES: Category[] = ["전체", "로맨스", "판타지", "일상", "직장", "SF", "미스터리"];

interface TrendingMeta {
  characterId: Character["id"];
  isTrending: boolean;
}

const TRENDING_META: TrendingMeta[] = [
  { characterId: 1, isTrending: true },
  { characterId: 2, isTrending: false },
  { characterId: 3, isTrending: true },
  { characterId: 4, isTrending: false },
];

// mock 대화수 (1단계: characterId 기준 하드코딩)
const MOCK_MESSAGE_COUNTS: Record<number, string> = {
  1: "2.4k",
  2: "2.4k",
  3: "12.1k",
  4: "5.3k",
};

interface ExploreTabScreenProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}
```

- [ ] **Step 2: ExploreHeader 서브 컴포넌트 작성**

```tsx
function ExploreHeader() {
  return (
    <div
      style={{
        padding: "52px 16px 12px",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "white", fontSize: "18px", fontWeight: 800 }}>탐색</span>
    </div>
  );
}
```

- [ ] **Step 3: SearchBar 서브 컴포넌트 작성 (비활성 상태)**

```tsx
function SearchBar({ onFocus }: { onFocus: () => void }) {
  return (
    <div style={{ padding: "0 16px 12px" }}>
      <button
        onClick={onFocus}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.07)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span style={{ fontSize: "14px" }}>🔍</span>
        <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "13px" }}>
          페르소나 검색...
        </span>
      </button>
    </div>
  );
}
```

- [ ] **Step 4: CategoryChips 서브 컴포넌트 작성**

```tsx
function CategoryChips({
  activeCategory,
  onSelect,
}: {
  activeCategory: Category;
  onSelect: (cat: Category) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        padding: "0 16px 14px",
        overflowX: "auto",
        scrollbarWidth: "none",
      }}
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat === activeCategory;
        return (
          <button
            key={cat}
            onClick={() => onSelect(cat)}
            style={{
              flexShrink: 0,
              background: isActive ? "#0EA5E9" : "rgba(255,255,255,0.07)",
              border: isActive ? "none" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              padding: "5px 14px",
              color: isActive ? "white" : "rgba(255,255,255,0.5)",
              fontSize: "12px",
              fontWeight: isActive ? 700 : 400,
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: TrendingCard + TrendingList 서브 컴포넌트 작성**

```tsx
function TrendingCard({
  character,
  isTrending,
  onSelect,
}: {
  character: Character;
  isTrending: boolean;
  onSelect: () => void;
}) {
  const messageCount = MOCK_MESSAGE_COUNTS[character.id] ?? "—";

  return (
    <button
      onClick={onSelect}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        width: "100%",
        background: "rgba(255,255,255,0.05)",
        border: "none",
        borderRadius: "14px",
        padding: "12px",
        cursor: "pointer",
        textAlign: "left",
      }}
    >
      {/* 아바타 */}
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "12px",
          flexShrink: 0,
          overflow: "hidden",
          background: `linear-gradient(135deg, ${character.accentColor ?? "#38BDF8"}, #0369A1)`,
        }}
      >
        {character.avatarImage && (
          <img
            src={character.avatarImage}
            alt={character.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}
      </div>

      {/* 텍스트 */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: "white", fontSize: "13px", fontWeight: 700, marginBottom: "2px" }}>
          {character.name}
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginBottom: "5px" }}>
          {character.role}
        </div>
        {/* 태그 칩 */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {(character.tags ?? []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                background: `${character.accentColor ?? "#38BDF8"}22`,
                color: character.accentColor ?? "#38BDF8",
                fontSize: "9px",
                padding: "2px 7px",
                borderRadius: "4px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* 우측 정보 */}
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: "10px", marginBottom: "4px" }}>
          {messageCount} 대화
        </div>
        {isTrending && (
          <div style={{ color: "#F59E0B", fontSize: "10px", fontWeight: 600 }}>↑ 급상승</div>
        )}
      </div>
    </button>
  );
}

function TrendingList({
  characters,
  trendingMeta,
  activeCategory,
  onSelect,
}: {
  characters: Character[];
  trendingMeta: TrendingMeta[];
  activeCategory: Category;
  onSelect: (char: Character) => void;
}) {
  // TRENDING_META 순서 유지, characters에 없는 id는 무시
  const trendingCharacters = trendingMeta
    .map((meta) => {
      const char = characters.find((c) => c.id === meta.characterId);
      if (!char) return null;
      return { char, isTrending: meta.isTrending };
    })
    .filter((item): item is { char: Character; isTrending: boolean } => item !== null);

  // 카테고리 필터 적용
  const filtered =
    activeCategory === "전체"
      ? trendingCharacters
      : trendingCharacters.filter(({ char }) =>
          (char.tags ?? []).some((tag) => tag === activeCategory)
        );

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.5px",
          marginBottom: "10px",
        }}
      >
        🔥 이번 주 인기
      </div>

      {filtered.length === 0 ? (
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            color: "rgba(255,255,255,0.35)",
            fontSize: "13px",
          }}
        >
          해당 카테고리의 페르소나가 없어요
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {filtered.map(({ char, isTrending }) => (
            <TrendingCard
              key={char.id}
              character={char}
              isTrending={isTrending}
              onSelect={() => onSelect(char)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: SearchOverlay 서브 컴포넌트 작성**

```tsx
function SearchOverlay({
  query,
  recentSearches,
  characters,
  onQueryChange,
  onCancel,
  onDeleteRecent,
  onSelectRecent,
  onSelectCharacter,
}: {
  query: string;
  recentSearches: string[];
  characters: Character[];
  onQueryChange: (q: string) => void;
  onCancel: () => void;
  onDeleteRecent: (term: string) => void;
  onSelectRecent: (term: string) => void;
  onSelectCharacter: (char: Character) => void;
}) {
  const trimmed = query.trim();

  // 검색 결과: characters 전체 대상, name/role/tags 매칭
  const results = trimmed
    ? characters.filter(
        (c) =>
          c.name.toLowerCase().includes(trimmed.toLowerCase()) ||
          c.role.toLowerCase().includes(trimmed.toLowerCase()) ||
          (c.tags ?? []).some((t) => t.toLowerCase().includes(trimmed.toLowerCase()))
      )
    : [];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0B1526",
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* 검색창 + 취소 */}
        <div
          style={{
            padding: "52px 16px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(14,165,233,0.4)",
              borderRadius: "12px",
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "14px" }}>🔍</span>
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="페르소나 검색..."
              style={{
                flex: 1,
                background: "none",
                border: "none",
                outline: "none",
                color: "white",
                fontSize: "13px",
              }}
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.3)",
                  fontSize: "14px",
                  padding: 0,
                }}
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={onCancel}
            style={{
              background: "none",
              border: "none",
              color: "#0EA5E9",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              whiteSpace: "nowrap",
              padding: 0,
            }}
          >
            취소
          </button>
        </div>

        {/* 스크롤 가능한 콘텐츠 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>
          {!trimmed ? (
            <>
              {/* 최근 검색 */}
              {recentSearches.length > 0 && (
                <div style={{ marginBottom: "16px" }}>
                  <div
                    style={{
                      color: "rgba(255,255,255,0.35)",
                      fontSize: "10px",
                      fontWeight: 600,
                      letterSpacing: "0.5px",
                      marginBottom: "8px",
                    }}
                  >
                    최근 검색
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "9px 0",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        <span style={{ fontSize: "12px" }}>🕐</span>
                        <button
                          onClick={() => onSelectRecent(term)}
                          style={{
                            flex: 1,
                            background: "none",
                            border: "none",
                            color: "rgba(255,255,255,0.65)",
                            fontSize: "13px",
                            cursor: "pointer",
                            textAlign: "left",
                            padding: 0,
                          }}
                        >
                          {term}
                        </button>
                        <button
                          onClick={() => onDeleteRecent(term)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "rgba(255,255,255,0.2)",
                            fontSize: "16px",
                            cursor: "pointer",
                            padding: 0,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 추천 태그 */}
              <div>
                <div
                  style={{
                    color: "rgba(255,255,255,0.35)",
                    fontSize: "10px",
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                    marginBottom: "10px",
                  }}
                >
                  추천 태그
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {CATEGORIES.filter((c) => c !== "전체").map((cat) => (
                    <button
                      key={cat}
                      onClick={() => onSelectRecent(cat)}
                      style={{
                        background: "rgba(255,255,255,0.07)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "12px",
                        cursor: "pointer",
                      }}
                    >
                      # {cat}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : results.length === 0 ? (
            <div
              style={{
                paddingTop: "40px",
                textAlign: "center",
                color: "rgba(255,255,255,0.35)",
                fontSize: "14px",
              }}
            >
              검색 결과가 없어요
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {results.map((char) => (
                <button
                  key={char.id}
                  onClick={() => onSelectCharacter(char)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "none",
                    borderRadius: "14px",
                    padding: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "12px",
                      flexShrink: 0,
                      overflow: "hidden",
                      background: `linear-gradient(135deg, ${char.accentColor ?? "#38BDF8"}, #0369A1)`,
                    }}
                  >
                    {char.avatarImage && (
                      <img
                        src={char.avatarImage}
                        alt={char.name}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    )}
                  </div>
                  <div>
                    <div style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>
                      {char.name}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", marginTop: "2px" }}>
                      {char.role}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: ExploreTabScreen 메인 컴포넌트 작성**

```tsx
export function ExploreTabScreen({ characters, onSelectCharacter }: ExploreTabScreenProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<Category>("전체");

  function handleCancel() {
    setQuery("");
    setIsSearching(false);
  }

  function handleDeleteRecent(term: string) {
    setRecentSearches((prev) => prev.filter((t) => t !== term));
  }

  function handleSelectRecent(term: string) {
    setQuery(term);
  }

  function handleSelectCharacter(char: Character) {
    // query.trim() 비어있지 않을 때만 최근 검색에 저장
    if (query.trim()) {
      setRecentSearches((prev) => {
        const filtered = prev.filter((t) => t !== query.trim());
        return [query.trim(), ...filtered].slice(0, 5);
      });
    }
    setIsSearching(false);
    setQuery("");
    onSelectCharacter(char);
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0B1526",
        display: "flex",
        flexDirection: "column",
        zIndex: 20,
        paddingBottom: "80px",
      }}
    >
      <ExploreHeader />

      {/* 스크롤 컨테이너 */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        <SearchBar onFocus={() => setIsSearching(true)} />

        <CategoryChips activeCategory={activeCategory} onSelect={setActiveCategory} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 14px" }} />

        <TrendingList
          characters={characters}
          trendingMeta={TRENDING_META}
          activeCategory={activeCategory}
          onSelect={onSelectCharacter}
        />
      </div>

      {/* 검색 오버레이 */}
      {isSearching && (
        <SearchOverlay
          query={query}
          recentSearches={recentSearches}
          characters={characters}
          onQueryChange={setQuery}
          onCancel={handleCancel}
          onDeleteRecent={handleDeleteRecent}
          onSelectRecent={handleSelectRecent}
          onSelectCharacter={handleSelectCharacter}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 8: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen"
npm run build
```

Expected: `✓ built in X.XXs` (에러 없음)

---

## Chunk 2: HomeScreen 연결

### Task 2: HomeScreen에 Explore 탭 라우팅 추가

**Files:**
- Modify: `Design_main_screen/src/app/components/HomeScreen.tsx`

- [ ] **Step 1: ExploreTabScreen import 추가**

[HomeScreen.tsx](Design_main_screen/src/app/components/HomeScreen.tsx) 상단 import 블록에 추가:

```tsx
import { ExploreTabScreen } from "./ExploreTabScreen";
```

- [ ] **Step 2: Explore 탭 렌더링 블록 추가**

Profile 탭 블록 바로 아래, Home 콘텐츠 블록 위에 추가:

```tsx
{/* ── EXPLORE TAB ── */}
{activeNav === "explore" && !chatCharacter && !selectedCharacter && (
  <ExploreTabScreen
    characters={characters}
    onSelectCharacter={(char) => setSelectedCharacter(char)}
  />
)}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen"
npm run build
```

Expected: `✓ built in X.XXs`

- [ ] **Step 4: 동작 확인 체크리스트**

개발 서버(`npm run dev`)에서 확인:
- BottomNav에서 Explore(🧭) 탭 터치 → ExploreTabScreen 표시
- 검색창 터치 → 전체화면 검색 오버레이 표시
- 추천 태그 칩 터치 → 해당 태그로 검색 실행 (결과 목록 표시)
- 검색 결과 카드 터치 → 최근 검색에 query 저장 → ProfileScreen(캐릭터 상세) 진입
- 최근 검색 항목 터치 → 검색어 복원
- 최근 검색 × 버튼 → 해당 항목 삭제
- 취소 버튼 / 배경 탭 → 검색 모드 종료
- 카테고리 칩 "로맨스" → 트렌딩 목록에서 로맨스 태그 캐릭터만 표시
- 카테고리 매칭 없을 때 → "해당 카테고리의 페르소나가 없어요" 빈 상태
- 캐릭터 ProfileScreen 뒤로가기 → Explore 탭으로 복귀 (activeNav 유지)

---

## 완료 기준

- [ ] Explore 탭 전환 시 ExploreTabScreen 표시
- [ ] 검색창 터치 → 전체화면 오버레이 (z-50, 탭바 위)
- [ ] 검색 결과 카드 터치 → query 저장(trim 비어있으면 제외) + ProfileScreen 진입
- [ ] 최근 검색 목록 표시·삭제·복원 동작
- [ ] 추천 태그 칩 (CATEGORIES, "전체" 제외) 터치 → 검색 재실행
- [ ] 카테고리 칩 필터 → 트렌딩 목록 필터링
- [ ] 빈 상태 처리 (카테고리 필터 결과 없음, 검색 결과 없음)
- [ ] 빌드 에러 없음
