import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { type Character } from "./ProfileScreen";
import { STAGGER_CONTAINER, STAGGER_ITEM } from "./animationTokens";

type Category = "전체" | "로맨스" | "판타지" | "일상" | "직장" | "SF" | "미스터리";

const CATEGORIES: Category[] = ["전체", "로맨스", "판타지", "일상", "직장", "SF", "미스터리"];

interface TrendingMeta {
  characterId: Character["id"];
  isTrending: boolean;
}

const TRENDING_META: TrendingMeta[] = [
  { characterId: 3,  isTrending: true  },  // 하나 사쿠라 — 최다 대화
  { characterId: 12, isTrending: true  },  // 안드로이드 EVA
  { characterId: 8,  isTrending: true  },  // 카페 사장 유나
  { characterId: 5,  isTrending: false },  // 재벌 3세 지훈
  { characterId: 11, isTrending: false },  // 용사 카이로스
  { characterId: 1,  isTrending: false },  // 동경 유학생 진우
  { characterId: 7,  isTrending: false },  // 우주비행사 아리아
  { characterId: 6,  isTrending: false },  // 마법사 루나
  { characterId: 10, isTrending: false },  // 직장 선배 민준
  { characterId: 9,  isTrending: false },  // 탐정 K
  { characterId: 2,  isTrending: false },  // 비서김비서
  { characterId: 4,  isTrending: false },  // 린 섀도우블레이드
];

// mock 대화수 (1단계: characterId 기준 하드코딩)
const MOCK_MESSAGE_COUNTS: Record<number, string> = {
  1:  "2.4k",
  2:  "2.4k",
  3:  "12.1k",
  4:  "5.3k",
  5:  "8.7k",
  6:  "6.2k",
  7:  "4.1k",
  8:  "9.4k",
  9:  "3.8k",
  10: "5.6k",
  11: "7.3k",
  12: "11.2k",
};

interface ExploreTabScreenProps {
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

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
          <motion.button
            key={cat}
            onClick={() => onSelect(cat)}
            whileTap={{ scale: 0.88 }}
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
          </motion.button>
        );
      })}
    </div>
  );
}

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
        <motion.div
          style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          variants={STAGGER_CONTAINER}
          initial="initial"
          animate="animate"
        >
          {filtered.map(({ char, isTrending }) => (
            <motion.div key={char.id} variants={STAGGER_ITEM}>
              <TrendingCard
                character={char}
                isTrending={isTrending}
                onSelect={() => onSelect(char)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

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
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.2 }}
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
            <motion.div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              variants={STAGGER_CONTAINER}
              initial="initial"
              animate="animate"
            >
              {results.map((char) => (
                <motion.div key={char.id} variants={STAGGER_ITEM}>
                <button
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
                    <div
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "11px",
                        marginTop: "2px",
                      }}
                    >
                      {char.role}
                    </div>
                  </div>
                </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

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
      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
}
