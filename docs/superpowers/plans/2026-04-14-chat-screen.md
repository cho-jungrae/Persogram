# Chat Screen Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** AI 캐릭터와의 1:1 채팅 화면 구현 — CharacterCard 입력 터치 또는 ProfileScreen "대화하기" 버튼으로 진입, 다크 전체화면 UI, 타이핑 인디케이터 포함 목업 응답.

**Architecture:** HomeScreen에 `chatCharacter` 상태를 추가하여 기존 `selectedCharacter` 패턴과 동일하게 ChatScreen을 전체화면으로 렌더링. ChatScreen은 독립 파일로 분리, ProfileScreen의 `Character` 타입을 재사용. 애니메이션은 CSS keyframe(useEffect 주입) 방식 사용 (motion 라이브러리 사용 불가).

**Tech Stack:** React 18, TypeScript, Vite 6, Tailwind CSS 4, lucide-react (ArrowLeft 아이콘)

**Spec:** `docs/superpowers/specs/2026-04-14-chat-screen-design.md`

---

## File Map

| 파일 | 작업 |
|------|------|
| `src/app/components/ChatScreen.tsx` | **신규** — 채팅 화면 전체 구현 |
| `src/app/components/HomeScreen.tsx` | **수정** — `chatCharacter` 상태, ChatScreen 렌더링, onChatClick 전달 |
| `src/app/components/ProfileScreen.tsx` | **수정** — `onChatClick?` prop, "대화하기" 버튼 연결 |
| `src/app/components/CharacterCard.tsx` | **수정** — `onChatClick?` prop, 하단 입력창 터치 연결 |

---

## Chunk 1: ChatScreen 기본 구조 + 헤더

### Task 1: ChatScreen.tsx 파일 생성 — 타입·헬퍼·기본 레이아웃

**Files:**
- Create: `Design_main_screen/src/app/components/ChatScreen.tsx`

- [ ] **Step 1: ChatScreen.tsx 파일 생성**

`Character` 타입은 ProfileScreen에서 import. `Message` 타입, 헬퍼 함수, 목업 응답 배열을 정의하고 빈 레이아웃만 반환하는 컴포넌트 작성:

```tsx
import { useState, useRef, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import type { Character } from "./ProfileScreen";

// ── Types ──────────────────────────────────────────────────────
interface Message {
  id: number;         // Date.now() 사용
  role: "ai" | "user";
  text: string;
  timestamp: string;  // "오전/오후 H:MM"
}

interface ChatScreenProps {
  character: Character;
  onBack: () => void;
}

// ── Helpers ────────────────────────────────────────────────────
function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${m}`;
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

// ── Component ─────────────────────────────────────────────────
export function ChatScreen({ character, onBack }: ChatScreenProps) {
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

  // 자동 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#0B1526" }}
    >
      <p style={{ color: "white", padding: 24 }}>ChatScreen placeholder</p>
    </div>
  );
}
```

- [ ] **Step 2: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -5
```

Expected: `✓ built in` (에러 없음)

---

### Task 2: 헤더 구현

**Files:**
- Modify: `Design_main_screen/src/app/components/ChatScreen.tsx`

- [ ] **Step 1: placeholder를 실제 헤더 JSX로 교체**

`return` 블록을 아래로 교체:

```tsx
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: "#0B1526" }}
    >
      {/* ── 헤더 ── */}
      <div
        style={{
          background: `linear-gradient(135deg, #0369A1 0%, ${character.accentColor} 100%)`,
          padding: "48px 16px 12px",   // 상단 safe-area 고려
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

        {/* 이름 + 상태 */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "white", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {character.name}
          </div>
          <div style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, display: "flex", alignItems: "center", gap: 3 }}>
            {isTyping ? (
              "입력 중..."
            ) : (
              <>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#4ADE80", display: "inline-block" }} />
                온라인
              </>
            )}
          </div>
        </div>

        {/* 프로필 버튼 */}
        <button
          onClick={onBack}
          style={{
            color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600,
            border: "1px solid rgba(255,255,255,0.35)", borderRadius: 6,
            padding: "3px 8px", background: "none", cursor: "pointer",
          }}
        >
          프로필
        </button>
      </div>

      {/* ── 메시지 영역 (placeholder) ── */}
      <div style={{ flex: 1 }} />

      {/* ── 입력 영역 (placeholder) ── */}
      <div style={{ height: 60, background: "#0B1526", borderTop: "1px solid rgba(255,255,255,0.07)" }} />
    </div>
  );
```

- [ ] **Step 2: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -5
```

Expected: `✓ built in` (에러 없음)

---

## Chunk 2: 메시지 목록 + 입력바

### Task 3: 메시지 목록 렌더링

**Files:**
- Modify: `Design_main_screen/src/app/components/ChatScreen.tsx`

- [ ] **Step 1: 메시지 영역 placeholder를 실제 렌더링으로 교체**

`{/* ── 메시지 영역 (placeholder) ── */}` 블록을 아래로 교체:

```tsx
      {/* ── 메시지 영역 ── */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 14px",
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

        {/* 메시지 버블 목록 */}
        {messages.map((msg) =>
          msg.role === "ai" ? (
            <div key={msg.id} style={{ display: "flex", gap: 6, alignItems: "flex-end", maxWidth: "82%" }}>
              {/* AI 아바타 */}
              <div
                style={{
                  width: 24, height: 24, borderRadius: "50%",
                  border: "1px solid rgba(255,255,255,0.2)",
                  overflow: "hidden", flexShrink: 0,
                }}
              >
                <img src={avatar} alt={character.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div>
                <div
                  style={{
                    background: "rgba(255,255,255,0.10)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px 14px 14px 3px",
                    padding: "9px 12px",
                  }}
                >
                  <span style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, lineHeight: 1.5 }}>{msg.text}</span>
                </div>
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9, marginTop: 2, paddingLeft: 2 }}>{msg.timestamp}</div>
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

        {/* 자동 스크롤 앵커 */}
        <div ref={messagesEndRef} />
      </div>
```

- [ ] **Step 2: CSS keyframe 주입 (`useEffect` — 마운트 시 주입, 언마운트 시 정리)**

컴포넌트 내부 `useEffect(() => { scrollToBottom(); }, ...)` 바로 위에 추가:

```tsx
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
```

- [ ] **Step 3: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -5
```

Expected: `✓ built in` (에러 없음)

---

### Task 4: 입력바 + 전송 로직 구현

**Files:**
- Modify: `Design_main_screen/src/app/components/ChatScreen.tsx`

- [ ] **Step 1: 입력 영역 placeholder를 실제 입력바로 교체**

`{/* ── 입력 영역 (placeholder) ── */}` 블록을 아래로 교체:

```tsx
      {/* ── 입력 영역 ── */}
      <div
        style={{
          padding: "10px 14px 28px",
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
            padding: "8px 8px 8px 16px",
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
          <button
            onClick={handleSend}
            disabled={isTyping}
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
          </button>
        </div>
      </div>
```

- [ ] **Step 2: `handleSend` 함수 추가**

`aiResponseCount` 선언 바로 아래에 추가:

```tsx
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
```

- [ ] **Step 3: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -5
```

Expected: `✓ built in` (에러 없음)

---

## Chunk 3: 연결 — HomeScreen / ProfileScreen / CharacterCard

### Task 5: HomeScreen — chatCharacter 상태 + ChatScreen 렌더링

**Files:**
- Modify: `Design_main_screen/src/app/components/HomeScreen.tsx`

- [ ] **Step 1: import에 ChatScreen 추가**

`HomeScreen.tsx` 상단 import 블록에 추가:

```tsx
import { ChatScreen } from "./ChatScreen";
```

- [ ] **Step 2: `chatCharacter` 상태 추가**

`HomeScreen` 함수 내부 `selectedCharacter` 선언 바로 아래:

```tsx
const [chatCharacter, setChatCharacter] = useState<Character | null>(null);
```

- [ ] **Step 3: ChatScreen 렌더링 추가 + ProfileScreen에 onChatClick 전달**

현재 ProfileScreen 렌더링 블록:
```tsx
{selectedCharacter && (
  <ProfileScreen character={selectedCharacter} onBack={() => setSelectedCharacter(null)} />
)}
```

아래로 교체:
```tsx
{chatCharacter && (
  <ChatScreen character={chatCharacter} onBack={() => setChatCharacter(null)} />
)}
{!chatCharacter && selectedCharacter && (
  <ProfileScreen
    character={selectedCharacter}
    onBack={() => setSelectedCharacter(null)}
    onChatClick={() => setChatCharacter(selectedCharacter)}
  />
)}
```

- [ ] **Step 4: 홈 콘텐츠 조건 수정**

현재: `{!selectedCharacter && <>`
교체: `{!chatCharacter && !selectedCharacter && <>`

- [ ] **Step 5: BottomNav 숨김 조건 수정**

현재: `{!selectedCharacter && <BottomNav ...`
교체: `{!selectedCharacter && !chatCharacter && <BottomNav ...`

- [ ] **Step 6: CharacterCard에 onChatClick 전달**

현재:
```tsx
<CharacterCard
  key={char.id}
  character={char}
  onProfileClick={() => setSelectedCharacter(char)}
/>
```

교체:
```tsx
<CharacterCard
  key={char.id}
  character={char}
  onProfileClick={() => setSelectedCharacter(char)}
  onChatClick={() => setChatCharacter(char)}
/>
```

- [ ] **Step 7: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -5
```

Expected: `✓ built in` (에러 없음. ProfileScreen/CharacterCard prop 타입 불일치 경고가 나올 수 있으나 빌드는 성공해야 함)

---

### Task 6: ProfileScreen — onChatClick prop 연결

**Files:**
- Modify: `Design_main_screen/src/app/components/ProfileScreen.tsx`

- [ ] **Step 1: ProfileScreenProps에 onChatClick 추가**

현재:
```tsx
interface ProfileScreenProps {
  character: Character;
  onBack: () => void;
}
```

교체:
```tsx
interface ProfileScreenProps {
  character: Character;
  onBack: () => void;
  onChatClick?: () => void;
}
```

- [ ] **Step 2: 함수 시그니처에 onChatClick 추가**

현재: `export function ProfileScreen({ character, onBack }: ProfileScreenProps)`
교체: `export function ProfileScreen({ character, onBack, onChatClick }: ProfileScreenProps)`

- [ ] **Step 3: "대화하기" 버튼에 onClick 연결**

현재 (ProfileScreen.tsx:522 근처):
```tsx
<button
  className="flex-1 py-2.5 rounded-2xl text-sm font-bold"
  style={{
    background: "white",
    color: "#0C2340",
    boxShadow: "0 2px 12px rgba(14,165,233,0.13)",
    border: "1.5px solid rgba(14,165,233,0.15)",
  }}
>
  대화하기
</button>
```

교체:
```tsx
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
```

- [ ] **Step 4: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -5
```

Expected: `✓ built in`

---

### Task 7: CharacterCard — onChatClick prop 연결

**Files:**
- Modify: `Design_main_screen/src/app/components/CharacterCard.tsx`

- [ ] **Step 1: CharacterCardProps에 onChatClick 추가**

현재:
```tsx
interface CharacterCardProps {
  character: Character;
  onProfileClick?: () => void;
}
```

교체:
```tsx
interface CharacterCardProps {
  character: Character;
  onProfileClick?: () => void;
  onChatClick?: () => void;
}
```

- [ ] **Step 2: 함수 시그니처에 onChatClick 추가**

현재: `export function CharacterCard({ character, onProfileClick }: CharacterCardProps)`
교체: `export function CharacterCard({ character, onProfileClick, onChatClick }: CharacterCardProps)`

- [ ] **Step 3: 하단 Chat Input 영역 전체를 클릭 가능하게 변경**

현재 Chat Input div (CharacterCard.tsx 202번째 줄 근처):
```tsx
<div
  className="flex items-center gap-2"
  style={{
    background: "rgba(255,255,255,0.18)",
    border: "0.848px solid rgba(255,255,255,0.38)",
    borderRadius: "14px",
    height: "44px",
    padding: "0 10px 0 14px",
  }}
>
```

교체:
```tsx
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
```

- [ ] **Step 4: 최종 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite build 2>&1 | tail -8
```

Expected: `✓ built in` (경고 없이 클린 빌드)

---

## Chunk 4: 브라우저 수동 검증

### Task 8: 기능 검증

- [ ] **Step 1: 개발 서버 시작**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen" && npx vite --port 5173
```

- [ ] **Step 2: CharacterCard 진입 테스트**
  1. 홈 화면에서 캐릭터 카드 하단 "…와 대화하기" 입력 영역 터치
  2. ChatScreen이 전체화면으로 열리는지 확인
  3. 헤더에 캐릭터 이름·아바타 표시 확인
  4. 초기 AI 인사 메시지 표시 확인
  5. BottomNav가 숨겨지는지 확인

- [ ] **Step 3: ProfileScreen → 대화하기 진입 테스트**
  1. 캐릭터 이름 칩 터치 → ProfileScreen 열기
  2. "대화하기" 버튼 터치 → ChatScreen 열리는지 확인

- [ ] **Step 4: 메시지 전송 + 타이핑 인디케이터 테스트**
  1. 입력창에 텍스트 입력 → 전송 버튼 파란색 활성화 확인
  2. 전송 → 유저 말풍선(우측, 파란색) 표시 확인
  3. 타이핑 인디케이터(3점 애니메이션) 1.2초간 표시 확인
  4. AI 응답 말풍선(좌측, 반투명) 표시 확인
  5. 헤더 "온라인" ↔ "입력 중..." 전환 확인
  6. 메시지 목록 자동 스크롤 확인

- [ ] **Step 5: 뒤로가기 테스트**
  1. ChatScreen에서 `←` 버튼 또는 "프로필" 버튼 터치
  2. 직접 진입 시 → 홈으로 복귀 확인
  3. ProfileScreen 경유 진입 시 → ProfileScreen으로 복귀 확인

- [ ] **Step 6: Enter 키 전송 테스트 (데스크탑)**
  - 입력창에서 Enter → 메시지 전송 확인
