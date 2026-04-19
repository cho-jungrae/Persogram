import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Character, ChatHighlight } from "./ProfileScreen";

// ── Types ──────────────────────────────────────────────────────
interface Message {
  id: number;        // Date.now() 사용
  role: "ai" | "user";
  text: string;
  timestamp: string; // "오전/오후 H:MM"
}

interface ChatScreenProps {
  character: Character;
  onBack: () => void;
  onViewProfile?: () => void;
  onSaveHighlight?: (highlight: ChatHighlight) => void;
  savedHighlightIds?: Set<number>;
  characterStatus?: string;
  intimacyLevel?: number; // 0~100
}

// ── 친밀도 레벨 시스템 ──
interface IntimacyInfo {
  emoji: string;
  label: string;
  color: string;
}

function getIntimacyInfo(level: number): IntimacyInfo {
  if (level <= 20) return { emoji: "🌱", label: "새싹", color: "#86EFAC" };
  if (level <= 40) return { emoji: "🌿", label: "풀잎", color: "#4ADE80" };
  if (level <= 60) return { emoji: "🌳", label: "나무", color: "#22C55E" };
  if (level <= 80) return { emoji: "🌸", label: "꽃", color: "#F472B6" };
  if (level <= 95) return { emoji: "⭐", label: "별", color: "#FBBF24" };
  return { emoji: "👑", label: "소울메이트", color: "#F59E0B" };
}

// ── Helpers ────────────────────────────────────────────────────
function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${m}`;
}

function getRelativeTime(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return `${month}/${day}`;
}

// ── Mock responses ─────────────────────────────────────────────
const FALLBACK_RESPONSES = [
  "정말요? 더 얘기해줘요 😊",
  "흥미롭네요!",
  "그렇군요~",
];

const mockResponses: Record<number, string[]> = {
  1: [
    "정말? 나도 그렇게 생각해!",
    "도쿄 생활 이야기 더 해줘 😊",
    "진짜? 나도 그래!",
    "신주쿠에 같이 가고 싶다~ 🌸",
  ],
  2: [
    "네, 맞아요. 바로 처리해드릴게요.",
    "오늘 하루도 수고하셨어요 😊",
    "그렇군요, 제가 도와드릴게요.",
    "언제든지 말씀해주세요!",
  ],
  3: [
    "ほんと！嬉しい 🌸",
    "また話しかけてね！",
    "そうだね、楽しいね！",
    "いつでも話しかけて 😊",
  ],
  4: [
    "...알겠어.",
    "그래, 계속해.",
    "흥미롭군.",
    "...생각해볼게.",
  ],
};

function getNextResponse(characterId: number, count: number): string {
  const list = mockResponses[characterId] ?? FALLBACK_RESPONSES;
  return list[count % list.length];
}

// ── 하트 이펙트 컴포넌트 ──────────────────────────────────────
function HeartBurst({ onComplete }: { onComplete: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1.4, opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        zIndex: 10,
        fontSize: 36,
      }}
    >
      ❤️
    </motion.div>
  );
}

// ── Component ─────────────────────────────────────────────────
export function ChatScreen({ character, onBack, onViewProfile, onSaveHighlight, savedHighlightIds = new Set(), characterStatus = "온라인", intimacyLevel = 15 }: ChatScreenProps) {
  const avatar = character.avatarImage || character.image;
  const [messages, setMessages] = useState<Message[]>([
    {
      id: Date.now(),
      role: "ai",
      text: `안녕! 나는 ${character.name}이야. 무슨 얘기든 해봐 😊`,
      timestamp: getCurrentTime(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const aiResponseCount = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 더블탭 감지용
  const lastTapRef = useRef<{ id: number; time: number }>({ id: 0, time: 0 });
  // 하트 이펙트 표시용
  const [heartMsgId, setHeartMsgId] = useState<number | null>(null);
  // 이미 저장된 메시지 ID 추적 (세션 내)
  const [localSavedIds, setLocalSavedIds] = useState<Set<number>>(new Set());

  const handleDoubleTap = useCallback((aiMsg: Message) => {
    const now = Date.now();
    const last = lastTapRef.current;

    if (last.id === aiMsg.id && now - last.time < 400) {
      // 더블탭 감지
      if (localSavedIds.has(aiMsg.id) || savedHighlightIds.has(aiMsg.id)) {
        toast("이미 저장된 대화예요");
        return;
      }

      // 직전 유저 메시지 찾기
      const msgIndex = messages.findIndex((m) => m.id === aiMsg.id);
      let userQuestion = "";
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (messages[i].role === "user") {
          userQuestion = messages[i].text;
          break;
        }
      }

      if (!userQuestion) {
        toast("저장할 수 있는 대화 쌍이 없어요");
        return;
      }

      const highlight: ChatHighlight = {
        id: aiMsg.id,
        characterId: character.id,
        userQuestion,
        aiAnswer: aiMsg.text,
        savedAt: getRelativeTime(),
      };

      onSaveHighlight?.(highlight);
      setLocalSavedIds((prev) => new Set(prev).add(aiMsg.id));
      setHeartMsgId(aiMsg.id);
      toast("주요 대화로 저장했어요 ❤️");

      lastTapRef.current = { id: 0, time: 0 };
    } else {
      lastTapRef.current = { id: aiMsg.id, time: now };
    }
  }, [messages, character.id, onSaveHighlight, localSavedIds, savedHighlightIds]);

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;
    const userMsg: Message = {
      id: Date.now(),
      role: "user",
      text: inputText.trim(),
      timestamp: getCurrentTime(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);
    const count = aiResponseCount.current++;
    setTimeout(() => {
      const aiMsg: Message = {
        id: Date.now(),
        role: "ai",
        text: getNextResponse(character.id, count),
        timestamp: getCurrentTime(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1200);
  };

  // 타이핑 인디케이터 keyframe 주입
  useEffect(() => {
    const STYLE_ID = "chat-dot-keyframes";
    if (!document.getElementById(STYLE_ID)) {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
        @keyframes chatDot {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.8); }
          30%            { opacity: 1;   transform: scale(1.2); }
        }
      `;
      document.head.appendChild(style);
    }
    return () => {
      document.getElementById(STYLE_ID)?.remove();
    };
  }, []);

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  const isSaved = (msgId: number) => localSavedIds.has(msgId) || savedHighlightIds.has(msgId);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#0B1526" }}
    >
      {/* ── 헤더 ── */}
      <div
        style={{
          background: `linear-gradient(135deg, #0369A1 0%, ${character.accentColor} 100%)`,
          padding: "48px 16px 12px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        {/* 뒤로가기 */}
        <button
          onClick={onBack}
          style={{ color: "rgba(255,255,255,0.85)", background: "none", border: "none", padding: 4, cursor: "pointer", display: "flex" }}
        >
          <ArrowLeft size={22} />
        </button>

        {/* 아바타 */}
        <div
          style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "2px solid rgba(255,255,255,0.6)",
            overflow: "hidden", flexShrink: 0,
          }}
        >
          <img src={avatar} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>

        {/* 이름 + 상태 + 친밀도 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "white", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {character.name}
            </span>
            {/* 친밀도 뱃지 */}
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 2,
                background: "rgba(255,255,255,0.15)",
                borderRadius: 10,
                padding: "1px 6px",
                fontSize: 10,
              }}
            >
              <span>{getIntimacyInfo(intimacyLevel).emoji}</span>
              <span style={{ color: getIntimacyInfo(intimacyLevel).color, fontWeight: 700, fontSize: 9 }}>
                {getIntimacyInfo(intimacyLevel).label}
              </span>
            </span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, display: "flex", alignItems: "center", gap: 3, marginTop: 1, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {isTyping ? (
              "입력 중..."
            ) : (
              <>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", display: "inline-block", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{characterStatus}</span>
              </>
            )}
          </div>
        </div>

        {/* 프로필 버튼 */}
        <button
          onClick={onViewProfile}
          style={{
            color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6,
            padding: "3px 8px", background: "none", cursor: "pointer",
          }}
        >
          프로필
        </button>
      </div>

      {/* ── 메시지 영역 ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 16px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {/* 날짜 구분선 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 0 4px" }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>오늘</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* 더블탭 안내 (메시지 3개 이하일 때만) */}
        {messages.length >= 1 && messages.length <= 3 && (
          <div style={{ textAlign: "center", padding: "4px 0 8px" }}>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>
              AI 메시지를 더블탭하면 주요 대화로 저장돼요
            </span>
          </div>
        )}

        {/* 메시지 버블 목록 */}
        {messages.map((msg) =>
          msg.role === "ai" ? (
            <div
              key={msg.id}
              onClick={() => handleDoubleTap(msg)}
              style={{ display: "flex", gap: 6, alignItems: "flex-end", maxWidth: "82%", position: "relative", cursor: "pointer" }}
            >
              <div
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.2)",
                  overflow: "hidden", flexShrink: 0,
                }}
              >
                <img src={avatar} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    background: isSaved(msg.id)
                      ? `${character.accentColor}18`
                      : "rgba(255,255,255,0.10)",
                    border: isSaved(msg.id)
                      ? `1px solid ${character.accentColor}40`
                      : "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px 14px 14px 3px",
                    padding: "9px 12px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 1.5 }}>{msg.text}</span>
                  {isSaved(msg.id) && (
                    <span style={{ marginLeft: 6, fontSize: 10, color: character.accentColor }}>❤️</span>
                  )}
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 2, paddingLeft: 2 }}>{msg.timestamp}</div>
                {/* 하트 이펙트 */}
                <AnimatePresence>
                  {heartMsgId === msg.id && (
                    <HeartBurst onComplete={() => setHeartMsgId(null)} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div key={msg.id} style={{ alignSelf: "flex-end", maxWidth: "75%" }}>
              <div
                style={{
                  background: character.accentColor,
                  borderRadius: "14px 14px 3px 14px",
                  padding: "9px 12px",
                }}
              >
                <span style={{ color: "white", fontSize: 13, lineHeight: 1.5 }}>{msg.text}</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 2, textAlign: "right", paddingRight: 2 }}>{msg.timestamp}</div>
            </div>
          )
        )}

        {/* 타이핑 인디케이터 */}
        {isTyping && (
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end" }}>
            <div
              style={{
                width: 24, height: 24, borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.2)",
                overflow: "hidden", flexShrink: 0,
              }}
            >
              <img src={avatar} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            <div
              style={{
                background: "rgba(255,255,255,0.10)",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: "14px 14px 14px 3px",
                padding: "10px 14px",
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {[0, 0.3, 0.6].map((delay, i) => (
                <span
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "rgba(255,255,255,0.5)",
                    display: "inline-block",
                    animation: `chatDot 1.2s infinite ${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── 입력 영역 ── */}
      <div
        style={{
          padding: "10px 16px 28px",
          background: "#0B1526",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 24,
            padding: "8px 8px 8px 18px",
          }}
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "white",
              fontSize: 13,
            }}
          />
          <motion.button
            onClick={handleSend}
            disabled={isTyping}
            whileTap={inputText.trim() && !isTyping ? { scale: 0.85 } : {}}
            style={{
              width: 30, height: 30, borderRadius: "50%",
              background: inputText.trim() && !isTyping ? character.accentColor : "rgba(255,255,255,0.15)",
              border: "none", cursor: inputText.trim() && !isTyping ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "background 0.2s",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 19V5M5 12l7-7 7 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
