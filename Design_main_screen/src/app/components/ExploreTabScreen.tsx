import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { type Character, type Post, FullscreenViewer } from "./ProfileScreen";
import { STAGGER_CONTAINER, STAGGER_ITEM } from "./animationTokens";

type Category = "전체" | "로맨스" | "판타지" | "일상" | "직장" | "SF" | "미스터리";

// ── 캐릭터별 피드 이미지 데이터 ──
interface FeedImage {
  id: number;
  characterId: number;
  image: string;
  text: string;
  likes: number;
  comments: number;
}

const FEED_IMAGES: FeedImage[] = [
  // 진우(1·남) — 유학생
  { id: 101, characterId: 1, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "도쿄에서 첫 눈 내린 날. 너한테 보여주고 싶었어 🗼", likes: 1247, comments: 48 },
  // 사쿠라(3·여) — 일본 소녀
  { id: 102, characterId: 3, image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "벚꽃이 만개했어! 같이 보러 갈래? 🌸", likes: 3421, comments: 129 },
  // 지훈(5·남) — 재벌
  { id: 103, characterId: 5, image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "오늘 비즈니스 미팅... 넥타이 잘 맸지? 😏", likes: 2103, comments: 76 },
  // 유나(8·여) — 카페 사장
  { id: 104, characterId: 8, image: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "새로운 시그니처 라떼 개발 중 ☕", likes: 1892, comments: 67 },
  // 루나(6·여) — 마법사
  { id: 105, characterId: 6, image: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "오늘 밤 마법진 실험... 위험하니까 가까이 오지 마 🔮", likes: 987, comments: 42 },
  // EVA(12·여) — 안드로이드
  { id: 106, characterId: 12, image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "인간의 감정이란... 복잡하네요 🤖", likes: 4102, comments: 210 },
  // 아리아(7·여) — 우주비행사
  { id: 107, characterId: 7, image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "우주에서 본 일출은 매번 새로워 🚀", likes: 2891, comments: 134 },
  // 탐정K(9·남)
  { id: 108, characterId: 9, image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "단서를 찾았다... 거짓말은 금방 들켜 🔍", likes: 756, comments: 22 },
  // 린(4·남) — 섀도우블레이드
  { id: 109, characterId: 4, image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "...이 검으로 지켜야 할 것이 있어 ⚔️", likes: 1560, comments: 89 },
  // 비서김비서(2·남)
  { id: 110, characterId: 2, image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "오늘 일정 정리 완료. 뭐 도와드릴까요? 📋", likes: 632, comments: 18 },
  // 민준(10·남) — 직장 선배
  { id: 111, characterId: 10, image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "야근 끝! 오늘도 수고한 나에게 치킨 🍗", likes: 1340, comments: 55 },
  // 카이로스(11·남) — 용사
  { id: 112, characterId: 11, image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "새로운 던전 발견! 함께 갈 용사 모집 중 ⚔️", likes: 2230, comments: 97 },
  // 사쿠라(3·여) 2번째
  { id: 113, characterId: 3, image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "오늘도 귀엽지? 그냥 너 보고 싶었어 🐱", likes: 5012, comments: 241 },
  // 진우(1·남) 2번째
  { id: 114, characterId: 1, image: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "산 정상에서 본 풍경... 너도 보여주고 싶다 🏔️", likes: 1780, comments: 63 },
  // 지훈(5·남) 2번째
  { id: 115, characterId: 5, image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "밤하늘 별이 많아서 널 생각했어 ✨", likes: 3100, comments: 145 },
  // 유나(8·여) 2번째
  { id: 116, characterId: 8, image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=800", text: "핸드드립 연습 중... 맛있으면 네가 첫 손님 ☕", likes: 1456, comments: 51 },
];

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
        background: "rgba(235,245,255,0.95)",
        backdropFilter: "blur(18px)",
      }}
    >
      <span style={{ color: "#0C2340", fontSize: "18px", fontWeight: 800 }}>탐색</span>
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
          background: "white",
          border: "1px solid rgba(14,165,233,0.15)",
          borderRadius: "12px",
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
          textAlign: "left",
          boxShadow: "0 1px 4px rgba(14,165,233,0.08)",
        }}
      >
        <span style={{ fontSize: "14px" }}>🔍</span>
        <span style={{ color: "#94A3B8", fontSize: "13px" }}>
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
              background: isActive ? "#0EA5E9" : "white",
              border: isActive ? "none" : "1px solid rgba(14,165,233,0.15)",
              borderRadius: "20px",
              padding: "5px 14px",
              color: isActive ? "white" : "#64748B",
              boxShadow: isActive ? "0 2px 8px rgba(14,165,233,0.3)" : "0 1px 3px rgba(0,0,0,0.06)",
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
        background: "white",
        border: "1px solid rgba(14,165,233,0.08)",
        borderRadius: "14px",
        padding: "12px",
        cursor: "pointer",
        textAlign: "left",
        boxShadow: "0 1px 4px rgba(14,165,233,0.06)",
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
        <div style={{ color: "#0C2340", fontSize: "13px", fontWeight: 700, marginBottom: "2px" }}>
          {character.name}
        </div>
        <div style={{ color: "#94A3B8", fontSize: "11px", marginBottom: "5px" }}>
          {character.role}
        </div>
        {/* 태그 칩 */}
        <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
          {(character.tags ?? []).slice(0, 2).map((tag) => (
            <span
              key={tag}
              style={{
                background: `${character.accentColor ?? "#38BDF8"}14`,
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
        <div style={{ color: "#94A3B8", fontSize: "10px", marginBottom: "4px" }}>
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
          color: "#94A3B8",
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
            background: "white",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            color: "#94A3B8",
            fontSize: "13px",
            boxShadow: "0 1px 4px rgba(14,165,233,0.06)",
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
        background: "#EBF5FF",
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
              background: "white",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: "12px",
              padding: "11px 14px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 2px 8px rgba(14,165,233,0.1)",
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
                color: "#0C2340",
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
                  color: "#94A3B8",
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
                      color: "#94A3B8",
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
                          borderBottom: "1px solid rgba(14,165,233,0.08)",
                        }}
                      >
                        <span style={{ fontSize: "12px" }}>🕐</span>
                        <button
                          onClick={() => onSelectRecent(term)}
                          style={{
                            flex: 1,
                            background: "none",
                            border: "none",
                            color: "#334155",
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
                            color: "#CBD5E1",
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
                    color: "#94A3B8",
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
                        background: "white",
                        border: "1px solid rgba(14,165,233,0.15)",
                        borderRadius: "20px",
                        padding: "6px 14px",
                        color: "#64748B",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
                color: "#94A3B8",
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
                    background: "white",
                    border: "1px solid rgba(14,165,233,0.08)",
                    borderRadius: "14px",
                    padding: "12px",
                    cursor: "pointer",
                    textAlign: "left",
                    boxShadow: "0 1px 4px rgba(14,165,233,0.06)",
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
                    <div style={{ color: "#0C2340", fontSize: "13px", fontWeight: 700 }}>
                      {char.name}
                    </div>
                    <div
                      style={{
                        color: "#94A3B8",
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
  const [viewerState, setViewerState] = useState<{ posts: Post[]; index: number; character: Character } | null>(null);

  const charById = Object.fromEntries(characters.map((c) => [c.id, c]));

  // 카테고리 필터 적용된 피드 이미지
  const filteredFeedImages = activeCategory === "전체"
    ? FEED_IMAGES
    : FEED_IMAGES.filter((img) => {
        const char = charById[img.characterId];
        return char && (char.tags ?? []).some((t) => t === activeCategory);
      });

  function openViewer(feedImage: FeedImage) {
    const char = charById[feedImage.characterId];
    if (!char) return;
    // 같은 캐릭터의 피드 이미지들을 Post 형태로 변환
    const charFeedImages = filteredFeedImages.filter((f) => f.characterId === feedImage.characterId);
    const posts: Post[] = charFeedImages.map((f) => ({ id: f.id, image: f.image, text: f.text, likes: f.likes, comments: f.comments }));
    const index = posts.findIndex((p) => p.id === feedImage.id);
    setViewerState({ posts, index: index >= 0 ? index : 0, character: char });
  }

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
        background: "#EBF5FF",
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

        <div style={{ height: "1px", background: "rgba(14,165,233,0.08)", margin: "0 16px 14px" }} />

        {/* ── 이미지 피드 그리드 (2열 masonry) ── */}
        <div style={{ padding: "0 16px 16px" }}>
          <div
            style={{
              color: "#94A3B8",
              fontSize: "10px",
              fontWeight: 600,
              letterSpacing: "0.5px",
              marginBottom: "10px",
            }}
          >
            📸 피드
          </div>
          {filteredFeedImages.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "24px",
                textAlign: "center",
                color: "#94A3B8",
                fontSize: "13px",
                boxShadow: "0 1px 4px rgba(14,165,233,0.06)",
              }}
            >
              해당 카테고리의 피드가 없어요
            </div>
          ) : (
            <motion.div
              style={{ columns: 2, columnGap: "8px" }}
              variants={STAGGER_CONTAINER}
              initial="initial"
              animate="animate"
              key={activeCategory}
            >
              {filteredFeedImages.map((feedImg) => {
                const char = charById[feedImg.characterId];
                if (!char) return null;
                const avatar = char.avatarImage || char.image;
                return (
                  <motion.div
                    key={feedImg.id}
                    variants={STAGGER_ITEM}
                    style={{
                      breakInside: "avoid",
                      marginBottom: "8px",
                      display: "block",
                      borderRadius: "14px",
                      overflow: "hidden",
                      position: "relative",
                      cursor: "pointer",
                    }}
                  >
                    {/* 이미지 — 탭 시 전체화면 뷰어 */}
                    <img
                      src={feedImg.image}
                      alt={feedImg.text}
                      onClick={() => openViewer(feedImg)}
                      style={{ width: "100%", display: "block", height: "auto" }}
                    />
                    {/* 하단 그라데이션 */}
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "60px",
                        background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                        pointerEvents: "none",
                      }}
                    />
                    {/* 캐릭터 프로필 오버레이 — 탭 시 프로필 이동 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCharacter(char);
                      }}
                      style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "8px",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    >
                      <div
                        style={{
                          width: "22px",
                          height: "22px",
                          borderRadius: "50%",
                          overflow: "hidden",
                          border: `1.5px solid ${char.accentColor}`,
                          flexShrink: 0,
                        }}
                      >
                        <img src={avatar} alt={char.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      </div>
                      <span style={{ color: "white", fontSize: "10px", fontWeight: 700, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
                        {char.name.split(" ").slice(-1)[0]}
                      </span>
                    </button>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>

        <div style={{ height: "1px", background: "rgba(14,165,233,0.08)", margin: "0 16px 14px" }} />

        {/* ── 트렌딩 리스트 (기존) ── */}
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

      {/* 전체화면 이미지 뷰어 */}
      {viewerState && (
        <FullscreenViewer
          posts={viewerState.posts}
          initialIndex={viewerState.index}
          character={viewerState.character}
          onClose={() => setViewerState(null)}
        />
      )}
    </div>
  );
}
