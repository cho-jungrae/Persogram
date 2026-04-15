import { motion } from "motion/react";
import { SPRING } from "./animationTokens";
import svgPaths from "../../imports/Container/svg-0ll42w83wa";

interface Character {
  id: number;
  name: string;
  role: string;
  description: string;
  image: string;
  avatarImage?: string;
  accentColor: string;
  cardBg: string;
  tagBg: string;
  tagColor: string;
  tags: string[];
  messages: number;
  chatPlaceholder?: string;
}

interface CharacterCardProps {
  character: Character;
  isInterested?: boolean;
  interestCount?: number;
  onProfileClick?: () => void;
  onChatClick?: () => void;
  onToggleInterest?: () => void;
}

export function CharacterCard({
  character,
  isInterested = false,
  interestCount = 0,
  onProfileClick,
  onChatClick,
  onToggleInterest,
}: CharacterCardProps) {
  const formatCount = (n: number) => {
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return n.toString();
  };

  const avatar = character.avatarImage || character.image;

  return (
    <motion.div
      className="relative overflow-hidden rounded-[24px] w-full max-w-[440px] mx-auto"
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{
        height: "clamp(260px, calc(100vw - 32px), 380px)",
        border: "0.848px solid rgba(255,255,255,0.7)",
        boxShadow: "0px 4px 24px 0px rgba(14,165,233,0.14)",
      }}
    >
      {/* ── Background image ── */}
      <img
        src={character.image}
        alt={character.name}
        className="absolute inset-0 w-full h-full object-cover object-top"
      />

      {/* ── Gradient overlay ── */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.15) 30%, rgba(12,35,64,0.65) 60%, rgba(12,35,64,0.90) 100%)",
        }}
      />

      {/* ── TOP ROW: name chip + heart ── */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-3 pt-3 z-10">
        {/* Name chip — click to open profile */}
        <div
          className="flex items-center gap-2 rounded-2xl px-2.5 max-w-[70%]"
          style={{
            background: "rgba(4,4,4,0.50)",
            border: "0.848px solid rgba(255,255,255,0.35)",
            height: "36px",
            minWidth: 0,
            cursor: onProfileClick ? "pointer" : "default",
          }}
          onClick={(e) => {
            e.stopPropagation();
            onProfileClick?.();
          }}
        >
          <div
            className="flex-shrink-0 rounded-full overflow-hidden"
            style={{
              width: "22px",
              height: "22px",
              border: `1.5px solid ${character.accentColor}`,
            }}
          >
            <img src={avatar} alt={character.name} className="w-full h-full object-cover" />
          </div>
          <p
            className="truncate"
            style={{
              color: "white",
              fontSize: "11px",
              fontWeight: 700,
              minWidth: 0,
            }}
          >
            {character.name}
          </p>
        </div>

        {/* Heart button — 관심 토글 */}
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onToggleInterest?.();
          }}
          whileTap={{ scale: 0.8 }}
          animate={isInterested ? { scale: [1, 1.3, 1] } : { scale: 1 }}
          transition={{ ...SPRING }}
          className="flex items-center justify-center flex-shrink-0 rounded-full transition-all"
          style={{
            width: "32px",
            height: "32px",
            background: isInterested ? "rgba(244,63,94,0.30)" : "rgba(0,0,0,0.50)",
            border: "0.848px solid rgba(255,255,255,0.35)",
          }}
        >
          <svg width="14" height="14" viewBox="0 0 13.9965 13.9965" fill="none">
            <path
              d={svgPaths.p1117e1c0}
              stroke={isInterested ? "#F43F5E" : "white"}
              fill={isInterested ? "#F43F5E" : "transparent"}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.16637"
            />
          </svg>
        </motion.button>
      </div>

      {/* ── BOTTOM PANEL (absolute, anchored to card bottom) ── */}
      <div
        className="absolute left-0 right-0 bottom-0 z-10"
        style={{
          background: "rgba(0,0,0,0.50)",
          border: "0.848px solid rgba(255,255,255,0.35)",
          borderRadius: "0 0 24px 24px",
          padding: "12px 16px 14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        {/* Description — 최대 2줄, 넘치면 말줄임 */}
        <p
          style={{
            fontSize: "15px",
            fontWeight: 800,
            color: "white",
            lineHeight: "1.35",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {character.description}
        </p>

        {/* Stats row — Chats + 관심 */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Chats */}
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 10.9877 10.9877" fill="none">
              <path
                d={svgPaths.p16909000}
                stroke="#0EA5E9"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="0.915645"
              />
            </svg>
            <span style={{ color: "rgba(255,255,255,0.80)", fontSize: "11px", whiteSpace: "nowrap" }}>
              {formatCount(character.messages)} chats
            </span>
          </div>
          {/* 관심 수 */}
          <div className="flex items-center gap-1">
            <svg width="11" height="11" viewBox="0 0 13.9965 13.9965" fill="none">
              <path
                d={svgPaths.p1117e1c0}
                stroke="#F43F5E"
                fill={isInterested ? "#F43F5E" : "transparent"}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.16637"
              />
            </svg>
            <span style={{ color: "rgba(255,255,255,0.80)", fontSize: "11px", whiteSpace: "nowrap" }}>
              관심 {interestCount}명
            </span>
          </div>
        </div>

        {/* Chat Input */}
        <div
          className="flex items-center gap-2"
          onClick={(e) => { e.stopPropagation(); onChatClick?.(); }}
          style={{
            background: "rgba(255,255,255,0.18)",
            border: "0.848px solid rgba(255,255,255,0.38)",
            borderRadius: "14px",
            height: "44px",
            padding: "0 10px 0 14px",
            cursor: onChatClick ? "pointer" : "default",
          }}
        >
          <span
            className="flex-1 truncate"
            style={{ color: "rgba(255,255,255,0.50)", fontSize: "12px" }}
          >
            {character.chatPlaceholder ?? `${character.name}와 대화하기`}
          </span>

          <button
            className="flex items-center justify-center flex-shrink-0 transition-all"
            style={{
              width: "28px",
              height: "28px",
              background: "rgba(255,255,255,0.22)",
              borderRadius: "10px",
              border: "0.848px solid rgba(255,255,255,0.30)",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 11.9951 11.9951" fill="none">
              <path d={svgPaths.p3a3d8380} stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999589" />
              <path d={svgPaths.p9081000}  stroke="white" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.999589" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
