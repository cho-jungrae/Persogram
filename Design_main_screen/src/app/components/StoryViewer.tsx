import { useState, useEffect, useRef } from "react";
import { type Character } from "./ProfileScreen";

export interface Story {
  character: Character;
  statusText: string;
  timeAgo: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onChat: (character: Character) => void;
}

// 캐릭터별 목업 상태 메시지
const STATUS_MESSAGES: Record<number, { text: string; timeAgo: string }> = {
  1: { text: "신주쿠 공원에 벚꽃이 피기 시작했어! 주말에 하나미 할 예정 🌸🍱", timeAgo: "2시간 전" },
  2: { text: "오늘도 바쁜 하루지만 당신 생각이 나네요. 업무 끝나면 꼭 연락해줘요 💼", timeAgo: "30분 전" },
  3: { text: "오늘 새로운 카페 발견했어~ 같이 가고 싶다! ☕✨", timeAgo: "1시간 전" },
  4: { text: "...달이 밝네. 가끔은 혼자가 편하다고 생각했는데.", timeAgo: "3시간 전" },
};

export function hasCharacterStory(characterId: number): boolean {
  return characterId in STATUS_MESSAGES;
}

export function buildStories(characters: Character[]): Story[] {
  return characters.map((char) => ({
    character: char,
    statusText: STATUS_MESSAGES[char.id]?.text ?? "오늘도 잘 부탁해! 😊",
    timeAgo: STATUS_MESSAGES[char.id]?.timeAgo ?? "방금 전",
  }));
}

const STORY_DURATION = 5000; // 5초 자동 진행

export function StoryViewer({ stories, initialIndex, onClose, onChat }: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const paused = useRef(false);

  const story = stories[currentIndex];

  // CSS 애니메이션 주입 (framer-motion 없이)
  useEffect(() => {
    const styleId = "story-viewer-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes storyFadeIn {
          from { opacity: 0; transform: scale(1.03); }
          to { opacity: 1; transform: scale(1); }
        }
        .story-content-enter {
          animation: storyFadeIn 0.25s ease-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 진행 바 타이머
  useEffect(() => {
    setProgress(0);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const startTime = Date.now();
    intervalRef.current = setInterval(() => {
      if (paused.current) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      }
    }, 50);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [currentIndex]);

  function goNext() {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      onClose();
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    }
  }

  function handleTap(e: React.MouseEvent<HTMLDivElement>) {
    const x = e.clientX;
    const w = (e.currentTarget as HTMLElement).offsetWidth;
    if (x < w * 0.35) {
      goPrev();
    } else if (x > w * 0.65) {
      goNext();
    }
  }

  if (!story) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "#000",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 배경 그라디언트 */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(3,105,161,0.55) 0%, #0B1526 60%)`,
          zIndex: 0,
        }}
      />

      {/* 탭 영역 (좌/우 이전·다음) */}
      <div
        onClick={handleTap}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          cursor: "pointer",
        }}
      />

      {/* 콘텐츠 레이어 */}
      <div
        className="story-content-enter"
        key={currentIndex}
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          flex: 1,
          padding: "52px 16px 32px",
        }}
      >
        {/* 진행 바 */}
        <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
          {stories.map((_, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                height: "2px",
                borderRadius: "2px",
                background: "rgba(255,255,255,0.25)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  borderRadius: "2px",
                  background: "white",
                  width:
                    i < currentIndex
                      ? "100%"
                      : i === currentIndex
                      ? `${progress}%`
                      : "0%",
                  transition: i === currentIndex ? "none" : undefined,
                }}
              />
            </div>
          ))}
        </div>

        {/* 헤더: 아바타 + 이름 + 시간 + X */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: `linear-gradient(135deg, ${story.character.accentColor}, #0369A1)`,
                border: "2px solid rgba(255,255,255,0.8)",
                flexShrink: 0,
                overflow: "hidden",
              }}
            >
              {story.character.avatarImage && (
                <img
                  src={story.character.avatarImage}
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              )}
            </div>
            <div>
              <div style={{ color: "white", fontSize: "13px", fontWeight: 700 }}>
                {story.character.name}
              </div>
              <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}>
                {story.timeAgo}
              </div>
            </div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            style={{
              background: "rgba(255,255,255,0.15)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "rgba(255,255,255,0.85)",
              fontSize: "16px",
              flexShrink: 0,
            }}
          >
            ✕
          </button>
        </div>

        {/* 상태 카드 */}
        <div
          style={{
            marginTop: "auto",
            background: "rgba(0,0,0,0.45)",
            backdropFilter: "blur(12px)",
            borderRadius: "18px",
            padding: "18px",
            marginBottom: "16px",
          }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "10px",
              marginBottom: "8px",
              fontWeight: 600,
              letterSpacing: "0.5px",
            }}
          >
            오늘의 상태 🌸
          </div>
          <div
            style={{
              color: "white",
              fontSize: "15px",
              fontWeight: 500,
              lineHeight: 1.6,
              marginBottom: "16px",
            }}
          >
            {story.statusText}
          </div>

          {/* 액션 버튼 */}
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={(e) => { e.stopPropagation(); onChat(story.character); }}
              style={{
                flex: 1,
                background: story.character.accentColor,
                border: "none",
                borderRadius: "12px",
                padding: "10px",
                color: "white",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
              }}
            >
              💬 대화하기
            </button>
            <button
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "44px",
                height: "44px",
                background: "rgba(255,255,255,0.12)",
                border: "none",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "18px",
                flexShrink: 0,
              }}
            >
              ❤️
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
