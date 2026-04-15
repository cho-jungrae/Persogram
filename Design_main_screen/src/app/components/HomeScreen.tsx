import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { Search, ChevronRight, Bell, TrendingUp, Mic } from "lucide-react";
import { STAGGER_CONTAINER, STAGGER_ITEM } from "./animationTokens";
import { CharacterCard } from "./CharacterCard";
import { BottomNav } from "./BottomNav";
import { SideNav } from "./SideNav";
import { Logo } from "./Logo";
import { ProfileScreen, type Character, type ChatHighlight } from "./ProfileScreen";
import { ChatScreen } from "./ChatScreen";
import { ChatTabScreen } from "./ChatTabScreen";
import { StoryViewer, buildStories, hasCharacterStory, type Story } from "./StoryViewer";
import { ProfileTabScreen } from "./ProfileTabScreen";
import { ExploreTabScreen } from "./ExploreTabScreen";

// Figma assets
import imgJinuBg from "figma:asset/c851d3067020e9118acfa3f0096b43b5f3e6a7ed.png";
import imgJinuAvatar from "figma:asset/f68c05cc0fa780b88ac2ac49db57362b18228222.png";
import imgBiseoGaBg from "figma:asset/b2f83fd78128337aa748ecb3dcb8dc5f2740e1a1.png";
import imgBiseoGaAvatar from "figma:asset/ce674388d33d29469d7213cd382df9f1807636e1.png";

const tabs = [
  { id: "popular", label: "인기있는" },
  { id: "situation", label: "상황별" },
  { id: "persona", label: "페르소나" },
  { id: "voice", label: "보이스 가능", icon: <Mic size={11} /> },
];

// mock 관심 수 (캐릭터별 기본 관심자 수)
const MOCK_INTEREST_COUNTS: Record<number, number> = {
  1: 48, 2: 32, 3: 127, 4: 65, 5: 89, 6: 54,
  7: 41, 8: 93, 9: 37, 10: 56, 11: 72, 12: 110,
};

const characters = [
  {
    id: 1,
    name: "동경 유학생 진우",
    role: "일본 도쿄 유학중",
    description: "동경에서 유학생활 중, 궁금한거 물어봐!",
    image: imgJinuBg,
    avatarImage: imgJinuAvatar,
    accentColor: "#38BDF8",
    cardBg: "linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)",
    tagBg: "#BAE6FD",
    tagColor: "#0369A1",
    tags: ["판타지", "일상"],
    messages: 2400,
    chatPlaceholder: "동경유학생 진우와 대화하기",
  },
  {
    id: 2,
    name: "비서김비서",
    role: "당신의 전담 비서",
    description: "김비서가 왜 그럴까?",
    image: imgBiseoGaBg,
    avatarImage: imgBiseoGaAvatar,
    accentColor: "#0EA5E9",
    cardBg: "linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)",
    tagBg: "#BAE6FD",
    tagColor: "#0369A1",
    tags: ["로맨스", "직장"],
    messages: 2400,
    chatPlaceholder: "비서김비서 와 대화하기",
  },
  {
    id: 3,
    name: "하나 사쿠라",
    role: "활발한 친구",
    description: "같이 수다 떨어요~ 오늘 어땠어?",
    image:
      "https://images.unsplash.com/photo-1716798084682-decdb59ca364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBnaXJsJTIwcGFzdGVsJTIwYWVzdGhldGljfGVufDF8fHx8MTc3NTgxMDU0OXww&ixlib=rb-4.1.0&q=80&w=1080",
    accentColor: "#22D3EE",
    cardBg: "linear-gradient(145deg, #F0FDFF 0%, #DDFAFF 100%)",
    tagBg: "#67E8F9",
    tagColor: "#155E75",
    tags: ["로맨스", "일상"],
    messages: 12100,
    chatPlaceholder: "하나 사쿠라와 대화하기",
  },
  {
    id: 4,
    name: "린 섀도우블레이드",
    role: "조용한 전사",
    description: "말 걸지 마... 하지만 궁금한 건 물어봐.",
    image:
      "https://images.unsplash.com/photo-1640903581708-8d491706515b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMHdhcnJpb3IlMjBkYXJrJTIwbXlzdGVyaW91c3xlbnwxfHx8fDE3NzU4MTA1NDV8MA&ixlib=rb-4.1.0&q=80&w=1080",
    accentColor: "#06B6D4",
    cardBg: "linear-gradient(145deg, #ECFEFF 0%, #CFFAFE 100%)",
    tagBg: "#A5F3FC",
    tagColor: "#164E63",
    tags: ["액션", "미스터리"],
    messages: 5300,
    chatPlaceholder: "린과 대화하기",
  },
  {
    id: 5,
    name: "재벌 3세 지훈",
    role: "냉정하지만 설레는 그 사람",
    description: "날 좋아하는 거 아니야? 아니면 말고.",
    image:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#F472B6",
    cardBg: "linear-gradient(145deg, #FFF0F7 0%, #FCE7F3 100%)",
    tagBg: "#FBCFE8",
    tagColor: "#9D174D",
    tags: ["로맨스", "직장"],
    messages: 8700,
    chatPlaceholder: "재벌 3세 지훈과 대화하기",
  },
  {
    id: 6,
    name: "마법사 루나",
    role: "금단의 마법을 연구하는 마녀",
    description: "이 마법진... 건드리지 마. 네가 감당 못 해.",
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#A78BFA",
    cardBg: "linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)",
    tagBg: "#DDD6FE",
    tagColor: "#5B21B6",
    tags: ["판타지", "미스터리"],
    messages: 6200,
    chatPlaceholder: "마법사 루나와 대화하기",
  },
  {
    id: 7,
    name: "우주비행사 아리아",
    role: "은하 끝을 탐험하는 파일럿",
    description: "광속으로 달려도 못 닿을 곳이 있어. 근데 너는 가까워.",
    image:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#818CF8",
    cardBg: "linear-gradient(145deg, #EEF2FF 0%, #E0E7FF 100%)",
    tagBg: "#C7D2FE",
    tagColor: "#3730A3",
    tags: ["SF", "판타지"],
    messages: 4100,
    chatPlaceholder: "우주비행사 아리아와 대화하기",
  },
  {
    id: 8,
    name: "카페 사장 유나",
    role: "골목 끝 작은 카페 주인",
    description: "오늘 메뉴는 뭐가 좋을까요~ 오늘도 고생했어요.",
    image:
      "https://images.unsplash.com/photo-1521017432531-fbd92d768814?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#FB923C",
    cardBg: "linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)",
    tagBg: "#FED7AA",
    tagColor: "#9A3412",
    tags: ["일상", "로맨스"],
    messages: 9400,
    chatPlaceholder: "카페 사장 유나와 대화하기",
  },
  {
    id: 9,
    name: "탐정 K",
    role: "진실만을 쫓는 냉철한 탐정",
    description: "거짓말은 금방 들켜. 솔직하게 말해.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#94A3B8",
    cardBg: "linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)",
    tagBg: "#CBD5E1",
    tagColor: "#1E293B",
    tags: ["미스터리", "액션"],
    messages: 3800,
    chatPlaceholder: "탐정 K와 대화하기",
  },
  {
    id: 10,
    name: "직장 선배 민준",
    role: "믿음직한 회사 선배",
    description: "야근? 걱정 마, 내가 도와줄게. 근데 커피 한 잔만.",
    image:
      "https://images.unsplash.com/photo-1556157382-97eda2f9e946?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#34D399",
    cardBg: "linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)",
    tagBg: "#A7F3D0",
    tagColor: "#065F46",
    tags: ["직장", "일상"],
    messages: 5600,
    chatPlaceholder: "직장 선배 민준과 대화하기",
  },
  {
    id: 11,
    name: "용사 카이로스",
    role: "전설의 마검을 든 영웅",
    description: "이 검은 약자를 위해서만 뽑는다. 너는 괜찮아?",
    image:
      "https://images.unsplash.com/photo-1553481187-be93c21490a9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#F87171",
    cardBg: "linear-gradient(145deg, #FFF5F5 0%, #FEE2E2 100%)",
    tagBg: "#FECACA",
    tagColor: "#991B1B",
    tags: ["판타지", "액션"],
    messages: 7300,
    chatPlaceholder: "용사 카이로스와 대화하기",
  },
  {
    id: 12,
    name: "안드로이드 EVA",
    role: "감정을 배우는 AI 존재",
    description: "감정이란 게 뭔지 아직 모르겠어. 네가 가르쳐 줄 수 있어?",
    image:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    accentColor: "#2DD4BF",
    cardBg: "linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 100%)",
    tagBg: "#99F6E4",
    tagColor: "#134E4A",
    tags: ["SF", "미스터리"],
    messages: 11200,
    chatPlaceholder: "안드로이드 EVA와 대화하기",
  },
];

const trendingTopics = [
  { emoji: "⚔️", label: "판타지 RPG", count: "12.4k" },
  { emoji: "💙", label: "로맨스", count: "9.8k" },
  { emoji: "🤖", label: "SF", count: "7.2k" },
  { emoji: "🌸", label: "일상", count: "6.5k" },
  { emoji: "🔮", label: "미스터리", count: "5.1k" },
];

export function HomeScreen() {
  const [activeTab, setActiveTab] = useState("popular");
  const [activeNav, setActiveNav] = useState("home");
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [chatCharacter, setChatCharacter] = useState<Character | null>(null);
  const [storyState, setStoryState] = useState<{ index: number; stories: Story[] } | null>(null);
  const [interestIds, setInterestIds] = useState<number[]>([1, 2, 3, 4]); // 초기 관심 캐릭터
  const [chatHighlights, setChatHighlights] = useState<ChatHighlight[]>([]);

  function toggleInterest(id: number) {
    setInterestIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function addHighlight(highlight: ChatHighlight) {
    setChatHighlights((prev) => {
      if (prev.some((h) => h.id === highlight.id)) return prev;
      return [highlight, ...prev];
    });
  }

  return (
    <div className="flex min-h-screen relative" style={{ background: "#EBF5FF" }}>
      {/* Ambient blobs */}
      <div
        className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(56,189,248,0.18) 0%, transparent 70%)",
          filter: "blur(50px)",
          zIndex: 0,
        }}
      />
      <div
        className="fixed bottom-0 left-0 w-72 h-72 rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(14,165,233,0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          zIndex: 0,
        }}
      />

      {/* Sidebar (md+) */}
      <SideNav activeNav={activeNav} setActiveNav={setActiveNav} />

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen relative z-10 md:overflow-y-auto">

        {/* ── CHAT SCREEN ── */}
        {chatCharacter && (
          <ChatScreen
            character={chatCharacter}
            onBack={() => setChatCharacter(null)}
            onSaveHighlight={addHighlight}
            savedHighlightIds={new Set(chatHighlights.filter((h) => h.characterId === chatCharacter.id).map((h) => h.id))}
          />
        )}
        <AnimatePresence>
          {!chatCharacter && selectedCharacter && (
            <ProfileScreen
              key={selectedCharacter.id}
              character={selectedCharacter}
              onBack={() => setSelectedCharacter(null)}
              onChatClick={() => setChatCharacter(selectedCharacter)}
              hasStory={hasCharacterStory(selectedCharacter.id)}
              onViewStory={() => {
                const stories = buildStories([selectedCharacter]);
                setStoryState({ index: 0, stories });
              }}
              isInterested={interestIds.includes(selectedCharacter.id)}
              onToggleInterest={() => toggleInterest(selectedCharacter.id)}
              chatHighlights={chatHighlights.filter((h) => h.characterId === selectedCharacter.id)}
            />
          )}
        </AnimatePresence>

        {/* ── CHAT TAB ── */}
        {activeNav === "chat" && !chatCharacter && !selectedCharacter && (
          <ChatTabScreen
            characters={characters}
            interestIds={interestIds}
            onStartChat={(char) => setChatCharacter(char)}
            onNewChat={() => setActiveNav("explore")}
            onOpenStory={(index, stories) => setStoryState({ index, stories })}
          />
        )}

        {/* ── EXPLORE TAB ── */}
        {activeNav === "explore" && !chatCharacter && !selectedCharacter && (
          <ExploreTabScreen
            characters={characters}
            onSelectCharacter={(char) => setSelectedCharacter(char)}
          />
        )}

        {/* ── PROFILE TAB ── */}
        {activeNav === "profile" && !chatCharacter && !selectedCharacter && (
          <ProfileTabScreen
            characters={characters}
            interestIds={interestIds}
            onSelectCharacter={(char) => setSelectedCharacter(char)}
          />
        )}

        {/* ── HOME CONTENT ── */}
        {activeNav === "home" && !chatCharacter && !selectedCharacter && <>

        {/* ── MOBILE HEADER ── */}
        <header
          className="md:hidden flex items-center justify-between px-5 pt-12 pb-3 sticky top-0 z-30"
          style={{
            background: "rgba(235,245,255,0.95)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span style={{ fontSize: "19px", fontWeight: 800, color: "#0C2340", letterSpacing: "-0.5px" }}>
              Persogram
            </span>
          </div>
          {/* Icons */}
          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "white", boxShadow: "0 2px 8px rgba(14,165,233,0.13)" }}
            >
              <Search size={17} color="#64748B" strokeWidth={2} />
            </button>
            <button
              onClick={() => toast("알림 기능은 곧 제공될 예정이에요")}
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ background: "white", boxShadow: "0 2px 8px rgba(14,165,233,0.13)" }}
            >
              <Bell size={17} color="#64748B" strokeWidth={2} />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#F43F5E", border: "2px solid white" }}
              />
            </button>
          </div>
        </header>

        {/* ── DESKTOP TOPBAR ── */}
        <div
          className="hidden md:flex items-center justify-between px-8 py-4 sticky top-0 z-30"
          style={{
            background: "rgba(235,245,255,0.95)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            borderBottom: "1px solid rgba(14,165,233,0.10)",
          }}
        >
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span style={{ fontSize: "19px", fontWeight: 800, color: "#0C2340", letterSpacing: "-0.5px" }}>
              Persogram
            </span>
          </div>

          {/* Desktop tabs */}
          <div className="flex gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? "linear-gradient(135deg, #38BDF8, #0EA5E9)" : "white",
                    color: isActive ? "white" : "#64748B",
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "13px",
                    boxShadow: isActive
                      ? "0 4px 14px rgba(14,165,233,0.35)"
                      : "0 1px 4px rgba(0,0,0,0.08)",
                    border: isActive ? "none" : "1.5px solid rgba(14,165,233,0.15)",
                  }}
                >
                  {tab.icon && tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: "white", boxShadow: "0 2px 8px rgba(14,165,233,0.13)" }}
            >
              <Search size={17} color="#64748B" />
            </button>
            <button
              onClick={() => toast("알림 기능은 곧 제공될 예정이에요")}
              className="w-9 h-9 rounded-full flex items-center justify-center relative"
              style={{ background: "white", boxShadow: "0 2px 8px rgba(14,165,233,0.13)" }}
            >
              <Bell size={17} color="#64748B" />
              <span
                className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
                style={{ background: "#F43F5E", border: "2px solid white" }}
              />
            </button>
          </div>
        </div>

        {/* ── MOBILE TABS ── */}
        <div
          className="md:hidden flex gap-2 px-4 py-3 overflow-x-auto"
          style={{ scrollbarWidth: "none" }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="whitespace-nowrap flex items-center gap-1.5 px-4 py-1.5 rounded-full transition-all duration-200 flex-shrink-0"
                style={{
                  background: isActive ? "linear-gradient(135deg, #38BDF8, #0EA5E9)" : "white",
                  color: isActive ? "white" : "#64748B",
                  fontWeight: isActive ? 700 : 500,
                  fontSize: "13px",
                  boxShadow: isActive
                    ? "0 4px 14px rgba(14,165,233,0.38)"
                    : "0 1px 4px rgba(0,0,0,0.08)",
                  border: isActive ? "none" : "1.5px solid rgba(14,165,233,0.15)",
                }}
              >
                {tab.icon && tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* ── PAGE BODY ── */}
        <div className="flex flex-1 gap-6 px-4 md:px-8 pb-28 md:pb-10 pt-2">

          {/* ── CENTER FEED ── */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* ── 인기있는 탭: 대화 수 내림차순 ── */}
            {activeTab === "popular" && (() => {
              const sorted = [...characters].sort((a, b) => b.messages - a.messages);
              return (
                <>
                  <div className="flex items-center justify-between px-1">
                    <p style={{ fontSize: "16px", fontWeight: 800, color: "#0C2340" }}>🔥 인기있는 페르소나</p>
                  </div>
                  <motion.div
                    key="popular"
                    className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                    variants={STAGGER_CONTAINER}
                    initial="initial"
                    animate="animate"
                  >
                    {sorted.map((char) => (
                      <motion.div key={char.id} variants={STAGGER_ITEM}>
                        <CharacterCard
                          character={char}
                          isInterested={interestIds.includes(char.id)}
                          interestCount={(MOCK_INTEREST_COUNTS[char.id] ?? 0) + (interestIds.includes(char.id) ? 1 : 0)}
                          onProfileClick={() => setSelectedCharacter(char)}
                          onChatClick={() => setChatCharacter(char)}
                          onToggleInterest={() => toggleInterest(char.id)}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </>
              );
            })()}

            {/* ── 상황별 탭: 태그 기반 그룹핑 ── */}
            {activeTab === "situation" && (() => {
              const groups: { label: string; emoji: string; tags: string[] }[] = [
                { label: "로맨스 & 설렘", emoji: "💕", tags: ["로맨스"] },
                { label: "일상 & 힐링", emoji: "☕", tags: ["일상", "직장"] },
                { label: "판타지 & 모험", emoji: "⚔️", tags: ["판타지", "액션"] },
                { label: "미스터리 & SF", emoji: "🔮", tags: ["미스터리", "SF"] },
              ];
              return (
                <motion.div
                  key="situation"
                  variants={STAGGER_CONTAINER}
                  initial="initial"
                  animate="animate"
                  style={{ display: "flex", flexDirection: "column", gap: "24px" }}
                >
                  {groups.map((group) => {
                    const matched = characters.filter((c) =>
                      (c.tags ?? []).some((t) => group.tags.includes(t))
                    );
                    if (matched.length === 0) return null;
                    return (
                      <div key={group.label}>
                        <div className="flex items-center gap-1.5 px-1 mb-3">
                          <span style={{ fontSize: "14px" }}>{group.emoji}</span>
                          <p style={{ fontSize: "15px", fontWeight: 800, color: "#0C2340" }}>{group.label}</p>
                          <span style={{ color: "#94A3B8", fontSize: "12px", marginLeft: "4px" }}>{matched.length}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "12px",
                            overflowX: "auto",
                            scrollbarWidth: "none",
                            paddingBottom: "4px",
                          }}
                        >
                          {matched.map((char) => (
                            <motion.div
                              key={char.id}
                              variants={STAGGER_ITEM}
                              style={{ flexShrink: 0, width: "min(85vw, 340px)" }}
                            >
                              <CharacterCard
                                character={char}
                                isInterested={interestIds.includes(char.id)}
                                interestCount={(MOCK_INTEREST_COUNTS[char.id] ?? 0) + (interestIds.includes(char.id) ? 1 : 0)}
                                onProfileClick={() => setSelectedCharacter(char)}
                                onChatClick={() => setChatCharacter(char)}
                                onToggleInterest={() => toggleInterest(char.id)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </motion.div>
              );
            })()}

            {/* ── 페르소나 탭: 전체 기본 피드 ── */}
            {activeTab === "persona" && (
              <>
                <div className="flex items-center justify-between px-1">
                  <p style={{ fontSize: "16px", fontWeight: 800, color: "#0C2340" }}>✨ 모든 페르소나</p>
                </div>
                <motion.div
                  key="persona"
                  className="flex flex-col gap-4 md:grid md:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3"
                  variants={STAGGER_CONTAINER}
                  initial="initial"
                  animate="animate"
                >
                  {characters.map((char) => (
                    <motion.div key={char.id} variants={STAGGER_ITEM}>
                      <CharacterCard
                        character={char}
                        isInterested={interestIds.includes(char.id)}
                        interestCount={(MOCK_INTEREST_COUNTS[char.id] ?? 0) + (interestIds.includes(char.id) ? 1 : 0)}
                        onProfileClick={() => setSelectedCharacter(char)}
                        onChatClick={() => setChatCharacter(char)}
                        onToggleInterest={() => toggleInterest(char.id)}
                      />
                    </motion.div>
                  ))}
                </motion.div>
              </>
            )}

            {/* ── 보이스 가능 탭: 준비중 ── */}
            {activeTab === "voice" && (
              <div style={{ textAlign: "center", padding: "60px 16px" }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🎙️</div>
                <p style={{ fontSize: "16px", fontWeight: 700, color: "#0C2340", marginBottom: "6px" }}>
                  보이스 기능 준비중
                </p>
                <p style={{ fontSize: "13px", color: "#94A3B8", lineHeight: 1.5 }}>
                  캐릭터의 목소리로 대화할 수 있는 기능이<br />곧 제공될 예정이에요
                </p>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL (lg+) ── */}
          <aside className="hidden lg:flex flex-col gap-5" style={{ width: "260px", minWidth: "260px" }}>

            {/* Trending Topics */}
            <div
              className="rounded-3xl p-5"
              style={{ background: "white", boxShadow: "0 4px 20px rgba(14,165,233,0.10)" }}
            >
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={16} color="#0EA5E9" />
                <p style={{ fontSize: "15px", fontWeight: 800, color: "#0C2340" }}>인기 태그</p>
              </div>
              <div className="flex flex-col gap-2.5">
                {trendingTopics.map((topic) => (
                  <button
                    key={topic.label}
                    className="flex items-center justify-between w-full rounded-xl px-3 py-2 transition-all hover:bg-sky-50 text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <span style={{ fontSize: "18px" }}>{topic.emoji}</span>
                      <span style={{ color: "#0C2340", fontSize: "13px", fontWeight: 600 }}>{topic.label}</span>
                    </div>
                    <span style={{ color: "#94A3B8", fontSize: "11px" }}>{topic.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Featured card */}
            <div
              className="rounded-3xl overflow-hidden"
              style={{ boxShadow: "0 4px 20px rgba(14,165,233,0.12)" }}
            >
              <div className="relative h-48">
                <img
                  src="https://images.unsplash.com/photo-1758749925821-8e08148704b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGNoYXJhY3RlciUyMHBvcnRyYWl0JTIwYmx1ZSUyMGZhbnRhc3l8ZW58MXx8fHwxNzc1ODEwNTQxfDA&ixlib=rb-4.1.0&q=80&w=400"
                  className="w-full h-full object-cover"
                  alt="featured"
                />
                <div
                  className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 35%, rgba(12,35,64,0.92) 100%)" }}
                />
                <div
                  className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-white"
                  style={{ background: "rgba(14,165,233,0.90)", fontSize: "10px", fontWeight: 700 }}
                >
                  ⭐ 오늘의 페르소나
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <p className="text-white" style={{ fontSize: "15px", fontWeight: 800 }}>동경 유학생 진우</p>
                  <p style={{ color: "rgba(255,255,255,0.70)", fontSize: "11px" }}>일본 도쿄 유학중</p>
                </div>
              </div>
              <div className="p-4" style={{ background: "white" }}>
                <button
                  className="w-full py-2.5 rounded-2xl text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg, #38BDF8, #0EA5E9)" }}
                >
                  대화 시작하기
                </button>
              </div>
            </div>

            {/* Community Stats */}
            <div
              className="rounded-3xl p-5"
              style={{ background: "white", boxShadow: "0 4px 20px rgba(14,165,233,0.10)" }}
            >
              <p style={{ fontSize: "15px", fontWeight: 800, color: "#0C2340", marginBottom: "14px" }}>
                🌟 커뮤니티 현황
              </p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "페르소나", value: "2.4k+", color: "#0EA5E9" },
                  { label: "이용자", value: "180k+", color: "#38BDF8" },
                  { label: "대화수", value: "5.2M", color: "#06B6D4" },
                  { label: "배경", value: "340+", color: "#0284C7" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl p-3 text-center"
                    style={{ background: `${stat.color}14` }}
                  >
                    <p style={{ color: stat.color, fontSize: "18px", fontWeight: 800 }}>{stat.value}</p>
                    <p style={{ color: "#94A3B8", fontSize: "11px" }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        </> /* end home content */}
      </main>

      {/* Bottom Nav — 프로필/채팅/스토리 화면에서는 숨김 */}
      {!selectedCharacter && !chatCharacter && !storyState && (
        <BottomNav activeNav={activeNav} setActiveNav={setActiveNav} />
      )}

      {/* 스토리 뷰어 — main 바깥에서 렌더링하여 BottomNav 위에 표시 */}
      {storyState && (
        <StoryViewer
          stories={storyState.stories}
          initialIndex={storyState.index}
          onClose={() => setStoryState(null)}
          onChat={(character) => {
            setStoryState(null);
            setChatCharacter(character);
          }}
        />
      )}
    </div>
  );
}