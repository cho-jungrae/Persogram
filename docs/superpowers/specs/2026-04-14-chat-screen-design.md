# Chat Screen Design Spec
Date: 2026-04-14

## Overview

AI 캐릭터와의 1:1 채팅 화면 구현. 두 개의 진입점(CharacterCard 하단 입력, ProfileScreen "대화하기" 버튼)에서 접근 가능한 전체화면 채팅 UI.

---

## Entry Points

1. **CharacterCard 하단 입력창** — 터치 시 해당 캐릭터의 채팅 화면으로 진입
2. **ProfileScreen "대화하기" 버튼** — 터치 시 해당 캐릭터의 채팅 화면으로 진입

---

## Navigation Architecture

HomeScreen 상태 확장 방식 (기존 `selectedCharacter` 패턴과 동일).

```
HomeScreen
 ├─ selectedCharacter === null && chatCharacter === null  → 홈 화면
 ├─ selectedCharacter !== null && chatCharacter === null  → ProfileScreen
 └─ chatCharacter !== null                               → ChatScreen (프로필 위에 올라옴)
```

### 상태 변수 (HomeScreen)

| 변수 | 타입 | 역할 |
|------|------|------|
| `selectedCharacter` | `Character \| null` | 프로필 화면 표시 여부 |
| `chatCharacter` | `Character \| null` | 채팅 화면 표시 여부 |

### 렌더링 우선순위

```tsx
{chatCharacter && <ChatScreen character={chatCharacter} onBack={() => setChatCharacter(null)} />}
{!chatCharacter && selectedCharacter && <ProfileScreen ... onChatClick={() => setChatCharacter(selectedCharacter)} />}
{!chatCharacter && !selectedCharacter && <HomeContent />}
```

BottomNav는 `chatCharacter`가 있을 때도 숨김.

---

## ChatScreen Component

### Props

```ts
interface ChatScreenProps {
  character: Character;  // ProfileScreen의 Character 타입 재사용
  onBack: () => void;
}
```

### 내부 상태

```ts
const [messages, setMessages] = useState<Message[]>(initialMessages);
const [inputText, setInputText] = useState("");
const [isTyping, setIsTyping] = useState(false);
```

### Message 타입

```ts
interface Message {
  id: number;  // Date.now() 사용 (동적 추가 시 고유성 보장)
  role: "ai" | "user";
  text: string;
  timestamp: string; // "오후 2:14" 형식
}
```

---

## UI 구성

### 1. 헤더

- 배경: `linear-gradient(135deg, #0369A1, #0EA5E9)` (캐릭터 accentColor 기반)
- 좌측: 뒤로가기 버튼 (`ArrowLeft` 아이콘) → `onBack()` 호출
- 중앙: 캐릭터 아바타(36px 원형) + 이름 + 온라인 상태
  - 평상시: 초록 점 + "온라인"
  - 타이핑 중: "입력 중..." (isTyping === true일 때)
- 우측: "프로필" 버튼 → 항상 `onBack()` 호출. 렌더링 우선순위 구조상 chatCharacter를 null로 설정하면 자연스럽게 ProfileScreen(또는 홈)으로 복귀됨.

### 2. 메시지 목록

- 스크롤 가능한 영역 (`overflow-y: auto`)
- 새 메시지 추가 시 자동 스크롤 최하단 (`useRef` + `scrollIntoView`)
- 최상단: 날짜 구분선 ("오늘")

#### AI 메시지 (좌측 정렬)
- 아바타(24px) + 말풍선
- 말풍선: `background: rgba(255,255,255,0.10)`, `border: 1px solid rgba(255,255,255,0.08)`
- border-radius: `14px 14px 14px 3px`
- 텍스트: `rgba(255,255,255,0.9)`, 14px
- 시간: 말풍선 아래 좌측, `rgba(255,255,255,0.25)`, 10px

#### 유저 메시지 (우측 정렬)
- 말풍선: `background: #0EA5E9`
- border-radius: `14px 14px 3px 14px`
- 텍스트: white, 14px
- 시간: 말풍선 아래 우측, `rgba(255,255,255,0.25)`, 10px

#### 타이핑 인디케이터
- AI 말풍선 위치에 3개의 점(6px 원) 애니메이션
- 각 점은 순서대로 0s / 0.3s / 0.6s delay로 scale + opacity 애니메이션
- `isTyping === true`일 때만 렌더링

### 3. 입력 영역

- 배경: `#0B1526`, 상단 border: `rgba(255,255,255,0.07)`
- 입력창: `background: rgba(255,255,255,0.08)`, `border: rgba(255,255,255,0.12)`, border-radius: 24px
- `<input type="text">` (실제 입력 가능)
- 전송 버튼(30px 원형):
  - 비활성: `background: rgba(255,255,255,0.15)`, 흰색 반투명 아이콘
  - 활성(텍스트 있을 때): `background: #0EA5E9`

---

## 인터랙션 흐름

### 메시지 전송

```
1. 유저가 텍스트 입력 후 전송 버튼 터치 (inputText.trim() === "" 이면 무시)
2. 유저 메시지 messages 배열에 추가 → 즉시 최하단 스크롤
3. inputText 초기화
4. isTyping = true (타이핑 인디케이터 표시) → 즉시 최하단 스크롤
5. setTimeout 1200ms 후:
   - isTyping = false
   - 목업 AI 응답 messages 배열에 추가 → 즉시 최하단 스크롤
```

자동 스크롤은 유저 메시지 추가(2단계), 타이핑 인디케이터 표시(4단계), AI 응답 추가(5단계) 각각에서 발생.

### 목업 AI 응답

각 캐릭터별 고정 응답 배열에서 순환(index % responses.length).
캐릭터 id에 해당하는 배열이 없을 경우 fallback 배열 사용.

```ts
const FALLBACK_RESPONSES = ["정말요? 더 얘기해줘요 😊", "흥미롭네요!", "그렇군요~"];

const mockResponses: Record<number, string[]> = {
  1: ["정말? 나도 그렇게 생각해!", "도쿄 생활 이야기 더 해줘 😊", "진짜? 나도 그래!"],
  2: ["네, 맞아요. 바로 처리해드릴게요.", "오늘 하루도 수고하셨어요 😊", "그렇군요, 제가 도와드릴게요."],
  3: ["ほんと！嬉しい 🌸", "また話しかけてね！", "そうだね、楽しいね！"],
  4: ["...알겠어.", "그래, 계속해.", "흥미롭군."],
};

function getNextResponse(characterId: number, count: number): string {
  const list = mockResponses[characterId] ?? FALLBACK_RESPONSES;
  return list[count % list.length];
}
```

---

## 파일 구성

| 파일 | 변경 내용 |
|------|-----------|
| `HomeScreen.tsx` | `chatCharacter` 상태 추가, ChatScreen 렌더링, BottomNav 숨김 조건 수정 |
| `ProfileScreen.tsx` | `onChatClick?: () => void` prop 추가, "대화하기" 버튼에 연결 |
| `CharacterCard.tsx` | `onChatClick?: () => void` prop 추가, 하단 입력창 터치에 연결 |
| `ChatScreen.tsx` | 신규 파일 — 채팅 화면 전체 구현 |

---

## 초기 메시지

ChatScreen 최초 진입 시 캐릭터의 첫 인사 메시지 1개를 초기 상태로 표시.

```ts
// getCurrentTime(): 현재 시각을 "오전/오후 H:MM" 형식으로 반환하는 모듈 내부 헬퍼 함수
function getCurrentTime(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes().toString().padStart(2, "0");
  return `${h < 12 ? "오전" : "오후"} ${h % 12 || 12}:${m}`;
}

const initialMessages: Message[] = [
  {
    id: Date.now(),
    role: "ai",
    text: `안녕! 나는 ${character.name}이야. 무슨 얘기든 해봐 😊`,
    timestamp: getCurrentTime(),
  }
];
```

---

## 기술 스택

- React 18 + TypeScript
- Tailwind CSS 4 (인라인 스타일 병행)
- CSS keyframe 애니메이션 (`useEffect`로 `<style>` 주입) — 타이핑 인디케이터 점 애니메이션
  - `useEffect` cleanup 함수에서 주입한 `<style>` 태그 제거하여 마운트/언마운트 반복 시 중복 방지
  - style 태그에 고유 `id` 부여 후 이미 존재하면 재주입 건너뜀
- `useRef` — 메시지 목록 자동 스크롤
- `sonner` toast — 기존 설치 완료, 이 기능에서는 미사용
