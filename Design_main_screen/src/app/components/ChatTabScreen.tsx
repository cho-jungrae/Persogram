import { motion } from "motion/react";
import { type Character } from "./ProfileScreen";
import { buildStories } from "./StoryViewer";
import { FADE_UP, STAGGER_CONTAINER, STAGGER_ITEM } from "./animationTokens";

interface FavoriteCharacter {
  character: Character;
  hasUpdate: boolean;
  isOnline: boolean;
}

interface ConversationItem {
  id: string;
  character: Character;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

interface ConversationMeta {
  id: string;
  characterId: number;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}

// 관심 캐릭터 순서 및 업데이트/온라인 상태 (이미지는 HomeScreen에서 주입)
const FAVORITE_META: { id: number; hasUpdate: boolean; isOnline: boolean }[] = [
  { id: 1, hasUpdate: true, isOnline: true },
  { id: 3, hasUpdate: true, isOnline: false },
  { id: 4, hasUpdate: false, isOnline: false },
  { id: 2, hasUpdate: false, isOnline: false },
];

// 대화 목록 메타 (이미지는 HomeScreen에서 주입)
const CONVERSATION_META: ConversationMeta[] = [
  { id: "1", characterId: 1, lastMessage: "신주쿠에 같이 가고 싶다~ 🌸", lastMessageTime: "오후 2:14", unreadCount: 2, isOnline: true },
  { id: "2", characterId: 3, lastMessage: "また話しかけてね！", lastMessageTime: "어제", unreadCount: 0, isOnline: false },
  { id: "3", characterId: 4, lastMessage: "...생각해볼게.", lastMessageTime: "3일 전", unreadCount: 0, isOnline: false },
];

interface ChatTabScreenProps {
  characters: Character[];
  interestIds: number[];
  onStartChat: (character: Character) => void;
  onGoHome: () => void;
  onOpenStory: (index: number, stories: ReturnType<typeof buildStories>) => void;
}


function getShortName(name: string) {
  const parts = name.split(" ");
  return parts[parts.length - 1];
}

function FavoritesStrip({
  favorites,
  onSelect,
}: {
  favorites: FavoriteCharacter[];
  onSelect: (character: Character) => void;
}) {
  return (
    <div style={{ padding: "0 16px 12px", flexShrink: 0 }}>
      <div
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: "9px",
          fontWeight: 600,
          marginBottom: "8px",
          letterSpacing: "0.5px",
        }}
      >
        관심
      </div>
      <div
        style={{
          display: "flex",
          gap: "14px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none",
        }}
      >
        {favorites.map((fav) => (
          <button
            key={fav.character.id}
            onClick={() => onSelect(fav.character)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "4px",
              flexShrink: 0,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              opacity: fav.hasUpdate ? 1 : 0.4,
            }}
          >
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  borderRadius: "50%",
                  background: fav.hasUpdate
                    ? "linear-gradient(135deg, #F59E0B, #EF4444)"
                    : "rgba(255,255,255,0.2)",
                  padding: "2px",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    background: "#0B1526",
                    padding: "2.5px",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${fav.character.accentColor}, #0369A1)`,
                    }}
                  />
                </div>
              </div>
              {fav.isOnline && (
                <div
                  style={{
                    position: "absolute",
                    bottom: "1px",
                    right: "1px",
                    width: "13px",
                    height: "13px",
                    borderRadius: "50%",
                    background: "#4ADE80",
                    border: "2px solid #0B1526",
                  }}
                />
              )}
            </div>
            <span
              style={{
                color: fav.hasUpdate ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.5)",
                fontSize: "8px",
                fontWeight: fav.hasUpdate ? 600 : 400,
                maxWidth: "50px",
                textAlign: "center",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {getShortName(fav.character.name)}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConversationList({
  conversations,
  onSelect,
}: {
  conversations: ConversationItem[];
  onSelect: (character: Character) => void;
}) {
  if (conversations.length === 0) {
    return (
      <motion.div
        initial={FADE_UP.initial}
        animate={FADE_UP.animate}
        transition={{ duration: 0.3 }}
        style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 16px" }}
      >
        <div style={{ fontSize: 32, marginBottom: 12 }}>💬</div>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 4 }}>아직 대화가 없어요</div>
        <div style={{ color: "#0EA5E9", fontSize: 12 }}>탐색에서 캐릭터를 찾아보세요 →</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ flex: 1, overflowY: "auto" }}
      variants={STAGGER_CONTAINER}
      initial="initial"
      animate="animate"
    >
      {conversations.map((conv) => (
        <motion.div key={conv.id} variants={STAGGER_ITEM}>
        <button
          key={conv.id}
          onClick={() => onSelect(conv.character)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "11px 16px",
            width: "100%",
            background: "none",
            border: "none",
            borderBottom: "1px solid rgba(255,255,255,0.05)",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div style={{ position: "relative", flexShrink: 0 }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${conv.character.accentColor}, #0369A1)`,
              }}
            />
            {conv.isOnline && (
              <div
                style={{
                  position: "absolute",
                  bottom: "1px",
                  right: "1px",
                  width: "11px",
                  height: "11px",
                  borderRadius: "50%",
                  background: "#4ADE80",
                  border: "2px solid #0B1526",
                }}
              />
            )}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2px",
              }}
            >
              <span
                style={{
                  color: "white",
                  fontSize: "12px",
                  fontWeight: conv.unreadCount > 0 ? 700 : 600,
                }}
              >
                {conv.character.name}
              </span>
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "9px" }}>
                {conv.lastMessageTime}
              </span>
            </div>
            <span
              style={{
                color: conv.unreadCount > 0 ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.4)",
                fontSize: "11px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                display: "block",
              }}
            >
              {conv.lastMessage}
            </span>
          </div>
          {conv.unreadCount > 0 && (
            <div
              style={{
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                background: "#0EA5E9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <span style={{ color: "white", fontSize: "9px", fontWeight: 700 }}>
                {conv.unreadCount}
              </span>
            </div>
          )}
        </button>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ChatTabScreen({ characters, interestIds, onStartChat, onGoHome, onOpenStory }: ChatTabScreenProps) {
  const charById = Object.fromEntries(characters.map((c) => [c.id, c]));

  // 관심 캐릭터 기반으로 스트립 구성 (interestIds 순서 유지, FAVORITE_META로 hasUpdate/isOnline 보강)
  const metaById = Object.fromEntries(FAVORITE_META.map((m) => [m.id, m]));
  const favorites: FavoriteCharacter[] = interestIds
    .filter((id) => charById[id])
    .map((id) => ({
      character: charById[id],
      hasUpdate: metaById[id]?.hasUpdate ?? false,
      isOnline: metaById[id]?.isOnline ?? false,
    }));

  const conversations: ConversationItem[] = CONVERSATION_META
    .filter((m) => charById[m.characterId])
    .map((m) => ({ ...m, character: charById[m.characterId] }));

  const stories = buildStories(favorites.map((f) => f.character));

  function handleFavoriteSelect(character: Character) {
    const idx = favorites.findIndex((f) => f.character.id === character.id);
    onOpenStory(idx >= 0 ? idx : 0, stories);
  }

  return (
    <motion.div
        initial={FADE_UP.initial}
        animate={FADE_UP.animate}
        transition={{ duration: 0.25 }}
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
        {/* 헤더 */}
        <div
          style={{
            padding: "52px 16px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexShrink: 0,
          }}
        >
          <span style={{ color: "white", fontSize: "18px", fontWeight: 800 }}>
            채팅
          </span>
          <button
            onClick={onGoHome}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              fontSize: "15px",
            }}
          >
            ✏️
          </button>
        </div>

        {/* AI 상태 스트립 */}
        <FavoritesStrip favorites={favorites} onSelect={handleFavoriteSelect} />

        {/* 구분선 */}
        <div
          style={{
            height: "1px",
            background: "rgba(255,255,255,0.07)",
            flexShrink: 0,
          }}
        />

        {/* 대화 목록 */}
        <ConversationList conversations={conversations} onSelect={onStartChat} />
      </motion.div>
  );
}
