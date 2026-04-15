import { useState, useRef, useEffect } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { ArrowLeft, Heart, MessageCircle, X, Zap, BookOpen, Mic2, ChevronUp, ChevronDown } from "lucide-react";
import { SPRING } from "./animationTokens";

export interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  avatarImage?: string;
  accentColor: string;
  tags: string[];
  messages: number;
}

interface Post {
  id: number;
  image: string;
  text: string;
  likes: number;
  comments: number;
}

export interface ChatHighlight {
  id: number;
  characterId: number;
  userQuestion: string;
  aiAnswer: string;
  savedAt: string;
}

const posts: Post[] = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1758749925821-8e08148704b1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhbmltZSUyMGNoYXJhY3RlciUyMHBvcnRyYWl0JTIwYmx1ZSUyMGZhbnRhc3l8ZW58MXx8fHwxNzc1ODEwNTQxfDA&ixlib=rb-4.1.0&q=80&w=800",
    text: "오늘 하늘이 유독 맑아서 너 생각났어. 뭐 하고 있어? 🌸",
    likes: 1247,
    comments: 48,
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
    text: "빗소리 들으면서 너랑 얘기하고 싶어졌어. 지금 어디야? 🌧️",
    likes: 892,
    comments: 31,
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1532635241-17e820acc59f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
    text: "벚꽃 피는 계절이 왔어! 매년 이맘때면 어김없이 너 생각이 나더라. 같이 꽃구경 가고 싶다~ 올해는 진짜 같이 가자, 언제 시간 돼? 내가 맛있는 도시락도 싸올게 🌺",
    likes: 2103,
    comments: 76,
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1716798084682-decdb59ca364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjdXRlJTIwYW5pbWUlMjBnaXJsJTIwcGFzdGVsJTIwYWVzdGhldGljfGVufDF8fHx8MTc3NTgxMDU0OXww&ixlib=rb-4.1.0&q=80&w=800",
    text: "오늘도 귀엽지? ㅎㅎ 아무것도 아니야, 그냥... 너 보고 싶었어 🐱",
    likes: 3421,
    comments: 129,
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1501854140801-50d01698950b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
    text: "산에 올라왔어. 공기가 너무 맑아서 눈물 날 것 같아. 저 아래 작은 마을 불빛들 보이지? 저기 어딘가에 너도 있겠지 싶어서 한참 바라봤어. 보고 싶다 🏔️",
    likes: 756,
    comments: 22,
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1465101162946-4377e57745c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
    text: "별 보고 있어. 너는 지금 뭐 보고 있어? ✨",
    likes: 1893,
    comments: 65,
  },
  {
    id: 7,
    image:
      "https://images.unsplash.com/photo-1519608487953-e999c86e7455?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
    text: "도시 불빛 진짜 예쁘다. 이런 밤에 같이 걷고 싶어. 아무 말 안 해도 괜찮아, 그냥 옆에 있어줘. 가끔은 그게 제일 큰 위로가 되더라고. 너는 그런 사람이야 나한테 🌃",
    likes: 2567,
    comments: 89,
  },
  {
    id: 8,
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixlib=rb-4.1.0&q=80&w=800",
    text: "책 읽다가 너 생각났어. 이 문장이 꼭 너 같아 📚",
    likes: 1102,
    comments: 43,
  },
];

// chatHighlights는 이제 props로 전달받음

const formatCount = (n: number) => {
  if (n >= 10000) return (n / 1000).toFixed(0) + "k";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return n.toString();
};

type TabType = "Images" | "Chats" | "Perso";

// ── Fullscreen image viewer (native pointer events, no motion) ──
interface ViewerProps {
  posts: Post[];
  initialIndex: number;
  character: Character;
  onClose: () => void;
}

function FullscreenViewer({ posts, initialIndex, character, onClose }: ViewerProps) {
  const [index, setIndex] = useState(initialIndex);
  // prevIndex: 나가는 이미지, slideDir: 이동 방향
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<"up" | "down">("up");
  const [textExpanded, setTextExpanded] = useState(false);
  const isAnimatingRef = useRef(false);
  const pointerStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragDirRef = useRef<"vertical" | "horizontal" | null>(null);
  const avatar = character.avatarImage || character.image;
  const post = posts[index];

  // CSS keyframes 한 번만 주입
  useEffect(() => {
    if (document.getElementById("viewer-keyframes")) return;
    const style = document.createElement("style");
    style.id = "viewer-keyframes";
    style.textContent = `
      @keyframes vSlideInUp    { from { transform:translateY(100%);  opacity:0 } to { transform:translateY(0);   opacity:1 } }
      @keyframes vSlideOutUp   { from { transform:translateY(0);     opacity:1 } to { transform:translateY(-100%); opacity:0 } }
      @keyframes vSlideInDown  { from { transform:translateY(-100%); opacity:0 } to { transform:translateY(0);   opacity:1 } }
      @keyframes vSlideOutDown { from { transform:translateY(0);     opacity:1 } to { transform:translateY(100%); opacity:0 } }
    `;
    document.head.appendChild(style);
  }, []);

  const navigate = (dir: "up" | "down" | "right") => {
    if (isAnimatingRef.current) return;
    if (dir === "right") { onClose(); return; }
    if (dir === "up" && index >= posts.length - 1) return;
    if (dir === "down" && index <= 0) return;

    isAnimatingRef.current = true;
    setSlideDir(dir as "up" | "down");
    setPrevIndex(index);                          // 현재 이미지 → 나가는 역할
    setIndex(dir === "up" ? index + 1 : index - 1); // 새 이미지 → 들어오는 역할
    setTextExpanded(false);

    // 애니메이션 완료 후 나가는 이미지 제거
    setTimeout(() => {
      setPrevIndex(null);
      isAnimatingRef.current = false;
    }, 320);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointerStartRef.current = { x: e.clientX, y: e.clientY };
    dragDirRef.current = null;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    if (dragDirRef.current === null && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      dragDirRef.current = Math.abs(dx) > Math.abs(dy) ? "horizontal" : "vertical";
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!pointerStartRef.current) return;
    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    pointerStartRef.current = null;
    const dir = dragDirRef.current;
    dragDirRef.current = null;

    if (dir === "horizontal" && dx > 60) navigate("right");
    else if (dir === "vertical" && dy < -60) navigate("up");
    else if (dir === "vertical" && dy > 60) navigate("down");
  };

  const DUR = "0.30s cubic-bezier(0.4,0,0.2,1) forwards";

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 200, background: "#000", overflow: "hidden" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* X 버튼 */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={onClose}
        style={{
          position: "absolute", top: "52px", right: "20px", zIndex: 20,
          width: "36px", height: "36px", borderRadius: "50%",
          background: "rgba(0,0,0,0.55)", border: "1px solid rgba(255,255,255,0.25)",
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}
      >
        <X size={18} color="white" />
      </button>

      {/* 카운터 */}
      <div style={{
        position: "absolute", top: "56px", left: "20px", zIndex: 20,
        color: "rgba(255,255,255,0.7)", fontSize: "13px", fontWeight: 600,
      }}>
        {index + 1} / {posts.length}
      </div>

      {/* 방향 힌트 화살표 */}
      {index > 0 && (
        <div style={{ position: "absolute", top: "96px", left: "50%", transform: "translateX(-50%)", zIndex: 5 }}>
          <ChevronUp size={22} color="rgba(255,255,255,0.35)" />
        </div>
      )}
      {index < posts.length - 1 && (
        <div style={{ position: "absolute", bottom: "130px", left: "50%", transform: "translateX(-50%)", zIndex: 5 }}>
          <ChevronDown size={22} color="rgba(255,255,255,0.35)" />
        </div>
      )}

      {/* 나가는 이미지 (key=prevIndex 로 항상 새 DOM 엘리먼트) */}
      {prevIndex !== null && (
        <div
          key={`out-${prevIndex}`}
          style={{
            position: "absolute", inset: 0,
            animation: `${slideDir === "up" ? "vSlideOutUp" : "vSlideOutDown"} ${DUR}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <img
            src={posts[prevIndex].image}
            draggable={false}
            style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none", pointerEvents: "none" }}
          />
        </div>
      )}

      {/* 들어오는 이미지 (key=index 로 항상 새 DOM 엘리먼트) */}
      <div
        key={`in-${index}`}
        style={{
          position: "absolute", inset: 0,
          animation: prevIndex !== null
            ? `${slideDir === "up" ? "vSlideInUp" : "vSlideInDown"} ${DUR}`
            : "none",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <img
          src={post.image}
          draggable={false}
          style={{ width: "100%", height: "100%", objectFit: "contain", userSelect: "none", pointerEvents: "none" }}
        />
      </div>

      {/* 하단 정보 */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 10,
          background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 65%, transparent 100%)",
          padding: "56px 20px 44px",
          pointerEvents: "none",
        }}
      >
        <div className="flex items-center gap-2.5 mb-3" style={{ pointerEvents: "auto" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "50%", overflow: "hidden", border: `2px solid ${character.accentColor}`, flexShrink: 0 }}>
            <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
          </div>
          <span style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>{character.name}</span>
        </div>

        {/* 텍스트 + 좋아요/댓글 — 텍스트 탭 시 전체 슬라이드업 */}
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onClick={() => setTextExpanded((v) => !v)}
          style={{ cursor: "pointer", pointerEvents: "auto", marginBottom: "12px" }}
        >
          {/* 텍스트: 기본 2줄, 탭 시 전체 표시 */}
          <div
            style={{
              overflow: "hidden",
              maxHeight: textExpanded ? "240px" : "52px",
              transition: "max-height 0.38s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <p
              style={{
                color: "rgba(255,255,255,0.92)",
                fontSize: "14px",
                lineHeight: "26px",
                whiteSpace: "pre-wrap",
              }}
            >
              {post.text}
            </p>
          </div>

          {/* 더보기 / 접기 인디케이터 */}
          <div
            className="flex items-center gap-1 mt-1"
            style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px" }}
          >
            {textExpanded ? (
              <>
                <ChevronDown size={13} />
                <span>접기</span>
              </>
            ) : (
              <>
                <ChevronUp size={13} />
                <span>더보기</span>
              </>
            )}
          </div>
        </div>

        {/* 좋아요 + 댓글 */}
        <div className="flex items-center gap-5" style={{ pointerEvents: "auto" }}>
          <button className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 600 }}>
            <Heart size={16} /> {formatCount(post.likes)}
          </button>
          <button className="flex items-center gap-1.5" style={{ color: "rgba(255,255,255,0.85)", fontSize: "14px", fontWeight: 600 }}>
            <MessageCircle size={16} /> {post.comments}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ProfileScreen ─────────────────────────────────────────────
interface ProfileScreenProps {
  character: Character;
  onBack: () => void;
  onChatClick?: () => void;
  hasStory?: boolean;
  onViewStory?: () => void;
  isInterested?: boolean;
  onToggleInterest?: () => void;
  chatHighlights?: ChatHighlight[];
}

export function ProfileScreen({ character, onBack, onChatClick, hasStory, onViewStory, isInterested = false, onToggleInterest, chatHighlights = [] }: ProfileScreenProps) {
  const [isFollowing, setIsFollowing] = useState(isInterested);
  const [activeTab, setActiveTab] = useState<TabType>("Images");
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const avatar = character.avatarImage || character.image;
  const followers = formatCount(character.messages * 3);
  const following = formatCount(Math.floor(character.messages * 0.4));

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 30,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div className="flex-1 overflow-y-auto" style={{ background: "#EBF5FF" }}>
        {/* Mobile header */}
        <div
          className="md:hidden flex items-center gap-3 px-5 pt-12 pb-3 sticky top-0 z-30"
          style={{
            background: "rgba(235,245,255,0.95)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
          }}
        >
          <button
            onClick={onBack}
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: "white", boxShadow: "0 2px 8px rgba(14,165,233,0.13)" }}
          >
            <ArrowLeft size={18} color="#0C2340" />
          </button>
          <span style={{ fontSize: "17px", fontWeight: 800, color: "#0C2340" }}>{character.name}</span>
        </div>

        {/* Desktop back button */}
        <div className="hidden md:flex items-center gap-3 px-8 pt-6 pb-3">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-full transition-all"
            style={{
              background: "white",
              color: "#0EA5E9",
              fontSize: "14px",
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(14,165,233,0.13)",
            }}
          >
            <ArrowLeft size={16} />
            돌아가기
          </button>
        </div>

        {/* Banner */}
        <div className="relative" style={{ height: "200px" }}>
          <img src={character.image} className="w-full h-full object-cover object-top" alt="banner" />
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg, transparent 30%, rgba(235,245,255,0.60) 100%)" }}
          />
        </div>

        {/* Profile info */}
        <div className="px-5 md:px-8">
          <div style={{ marginTop: "-44px", marginBottom: "12px", position: "relative", zIndex: 1 }}>
            {hasStory ? (
              <button
                onClick={onViewStory}
                style={{
                  padding: 0,
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  display: "inline-block",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                  padding: "3px",
                  boxShadow: `0 4px 16px ${character.accentColor}44`,
                }}
              >
                <div style={{ background: "white", borderRadius: "50%", padding: "2px" }}>
                  <div className="w-20 h-20 rounded-full overflow-hidden">
                    <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
                  </div>
                </div>
              </button>
            ) : (
              <div
                className="w-20 h-20 rounded-full overflow-hidden"
                style={{ border: "4px solid white", boxShadow: `0 4px 16px ${character.accentColor}44` }}
              >
                <img src={avatar} className="w-full h-full object-cover" alt="avatar" />
              </div>
            )}
          </div>

          <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#0C2340", marginBottom: "2px" }}>
            {character.name}
          </h1>
          <p style={{ color: character.accentColor, fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
            {character.role}
          </p>
          <p style={{ color: "#475569", fontSize: "13px", lineHeight: 1.5, marginBottom: "12px" }}>
            {character.description}
          </p>

          <div className="flex gap-2 flex-wrap mb-4">
            {character.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: `${character.accentColor}18`, color: character.accentColor }}
              >
                #{tag}
              </span>
            ))}
          </div>

          <div className="flex gap-6 mb-5">
            {[
              { label: "posts", value: posts.length },
              { label: "관심", value: followers },
              { label: "관심중", value: following },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span style={{ fontSize: "18px", fontWeight: 800, color: "#0C2340" }}>{stat.value}</span>
                <span style={{ fontSize: "11px", color: "#94A3B8" }}>{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="flex gap-3 mb-6">
            <motion.button
              whileTap={{ scale: 0.88 }}
              animate={isFollowing ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ ...SPRING }}
              onClick={() => {
                const next = !isFollowing;
                setIsFollowing(next);
                onToggleInterest?.();
                toast(next ? `${character.name} 님을 관심 추가했어요 ♥` : `${character.name} 님의 관심을 해제했어요`);
              }}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold transition-all"
              style={{
                background: isFollowing
                  ? "white"
                  : `linear-gradient(135deg, ${character.accentColor}cc, ${character.accentColor})`,
                color: isFollowing ? character.accentColor : "white",
                border: isFollowing ? `2px solid ${character.accentColor}` : "none",
                boxShadow: isFollowing ? "none" : `0 6px 18px ${character.accentColor}44`,
              }}
            >
              {isFollowing ? "관심중 ✓" : "관심 추가"}
            </motion.button>
            <button
              onClick={onChatClick}
              className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
              style={{
                background: "white",
                color: "#0C2340",
                boxShadow: "0 2px 12px rgba(14,165,233,0.13)",
                border: "1.5px solid rgba(14,165,233,0.15)",
                cursor: onChatClick ? "pointer" : "default",
              }}
            >
              대화하기
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div
          className="flex px-4 mb-1 sticky z-20"
          style={{
            top: "64px",
            background: "rgba(235,245,255,0.97)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid rgba(14,165,233,0.10)",
          }}
        >
          {(["Images", "Chats", "Perso"] as TabType[]).map((tab) => {
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="flex-1 py-3 text-sm font-semibold transition-all relative"
                style={{ color: isActive ? character.accentColor : "#94A3B8", fontWeight: isActive ? 700 : 500 }}
              >
                {tab}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full"
                    style={{ width: "32px", height: "2.5px", background: character.accentColor }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* ── Images tab ── */}
        {activeTab === "Images" && (
          <div className="px-4 pt-3 pb-28 md:pb-10" style={{ columns: 2, columnGap: "6px" }}>
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="relative overflow-hidden rounded-2xl cursor-pointer"
                style={{ breakInside: "avoid", marginBottom: "6px", display: "block" }}
                onClick={() => setViewerIndex(i)}
              >
                <img
                  src={post.image}
                  className="w-full"
                  style={{ display: "block", height: "auto" }}
                  alt={`post-${post.id}`}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Chats tab ── */}
        {activeTab === "Chats" && (
          <div className="flex flex-col gap-3 px-4 pt-4 pb-28 md:pb-10">
            {chatHighlights.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "48px 16px",
                  background: "white",
                  borderRadius: "24px",
                  boxShadow: "0 2px 16px rgba(14,165,233,0.09)",
                }}
              >
                <div style={{ fontSize: 32, marginBottom: 8 }}>💬</div>
                <div style={{ color: "#94A3B8", fontSize: 13, marginBottom: 4 }}>
                  저장된 주요 대화가 없어요
                </div>
                <div style={{ color: "#0EA5E9", fontSize: 12 }}>
                  대화 중 AI 메시지를 더블탭하면 저장돼요
                </div>
              </div>
            ) : (
              chatHighlights.map((chat) => (
                <div
                  key={chat.id}
                  className="rounded-3xl overflow-hidden"
                  style={{
                    background: "white",
                    boxShadow: "0 2px 16px rgba(14,165,233,0.09)",
                    border: "1px solid rgba(14,165,233,0.08)",
                  }}
                >
                  {/* 내 질문 */}
                  <div className="flex items-start gap-2.5 px-4 pt-4 pb-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: "#F1F5F9" }}
                    >
                      <span style={{ fontSize: "13px" }}>👤</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: "11px", color: "#94A3B8", fontWeight: 600 }}>나</span>
                      <p style={{ fontSize: "13px", color: "#0C2340", fontWeight: 600, marginTop: "1px" }}>
                        {chat.userQuestion}
                      </p>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "rgba(14,165,233,0.07)", margin: "0 16px" }} />
                  {/* AI 답변 */}
                  <div className="flex items-start gap-2.5 px-4 pt-3 pb-4">
                    <div
                      className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5"
                      style={{ border: `2px solid ${character.accentColor}` }}
                    >
                      <img src={avatar} className="w-full h-full object-cover" alt="ai" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span style={{ fontSize: "11px", color: character.accentColor, fontWeight: 700 }}>
                        {character.name}
                      </span>
                      <p
                        style={{
                          fontSize: "13px",
                          color: "#334155",
                          lineHeight: 1.55,
                          marginTop: "2px",
                        }}
                      >
                        {chat.aiAnswer}
                      </p>
                    </div>
                  </div>
                  {/* 하단 저장 시각 */}
                  <div
                    className="flex items-center justify-between px-4 py-2.5"
                    style={{ borderTop: "1px solid rgba(14,165,233,0.07)" }}
                  >
                    <span className="flex items-center gap-1.5" style={{ color: character.accentColor, fontSize: "11px", fontWeight: 600 }}>
                      <Heart size={11} fill={character.accentColor} />
                      주요 대화
                    </span>
                    <span style={{ color: "#CBD5E1", fontSize: "11px" }}>{chat.savedAt}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Perso tab ── */}
        {activeTab === "Perso" && (
          <div className="flex flex-col gap-4 px-4 pt-4 pb-28 md:pb-10">
            <div className="rounded-3xl p-5" style={{ background: "white", boxShadow: "0 2px 16px rgba(14,165,233,0.09)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Zap size={15} color={character.accentColor} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C2340" }}>성격</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["활발함", "친근함", "낙천적", "공감 능력 높음", "유머러스"].map((trait) => (
                  <span
                    key={trait}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: `${character.accentColor}14`, color: character.accentColor }}
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-3xl p-5" style={{ background: "white", boxShadow: "0 2px 16px rgba(14,165,233,0.09)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Mic2 size={15} color={character.accentColor} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C2340" }}>말투 스타일</span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7 }}>
                친근하고 편안한 반말체를 사용해요. 이모티콘을 자주 쓰고, 상대방에게 질문을 많이 던지며 대화를 이어나가는 걸 좋아해요.
              </p>
              <div
                className="mt-3 px-4 py-2.5 rounded-2xl rounded-tl-sm inline-block"
                style={{ background: `${character.accentColor}14`, maxWidth: "85%" }}
              >
                <p style={{ fontSize: "12px", color: character.accentColor, fontStyle: "italic" }}>
                  "아 진짜? 나도 그런 적 있어~ 그래서 어떻게 됐어? 🤔"
                </p>
              </div>
            </div>

            <div className="rounded-3xl p-5" style={{ background: "white", boxShadow: "0 2px 16px rgba(14,165,233,0.09)" }}>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={15} color={character.accentColor} />
                <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C2340" }}>배경 설정</span>
              </div>
              <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7 }}>
                {character.description} 밝고 긍정적인 에너지로 주변 사람들을 끌어당기는 매력이 있어요.
                혼자 있는 시간보다 누군가와 함께하는 시간을 더 좋아하며, 상대방의 이야기를 진심으로 들어주는 걸 중요하게 생각해요.
              </p>
            </div>

            <div className="rounded-3xl p-5" style={{ background: "white", boxShadow: "0 2px 16px rgba(14,165,233,0.09)" }}>
              <span style={{ fontSize: "14px", fontWeight: 800, color: "#0C2340" }}>주요 태그</span>
              <div className="flex gap-2 flex-wrap mt-3">
                {character.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "#F1F5F9", color: "#475569" }}
                  >
                    #{tag}
                  </span>
                ))}
                {["#AI페르소나", "#대화형"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold"
                    style={{ background: "#F1F5F9", color: "#475569" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen viewer — rendered outside scroll container */}
      {viewerIndex !== null && (
        <FullscreenViewer
          posts={posts}
          initialIndex={viewerIndex}
          character={character}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </motion.div>
  );
}
