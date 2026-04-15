# Persogram — Chat 탭 설계안
Date: 2026-04-14

---

## 개요

Chat 탭은 사용자가 대화를 나눈 AI 캐릭터들의 **대화 목록 허브**이자, 즐겨찾기한 캐릭터의 **AI 상태 업데이트**를 확인하는 공간입니다.

---

## 화면 구성

### 배경 테마
- **다크 (#0B1526)** — 채팅 화면(ChatScreen)과 동일한 어두운 톤으로 통일

---

### ① AI 상태 업데이트 스트립 (상단)

| 항목 | 내용 |
|------|------|
| 표시 조건 | 즐겨찾기(⭐)한 캐릭터만 표시 |
| 레이아웃 | 가로 스크롤 원형 아이콘 리스트 |
| 새 업데이트 있음 | 그라디언트 링 (amber→red) + 이름 강조 |
| 업데이트 없음 | 회색 링, 반투명 처리 (opacity 0.35~0.5) |
| **터치 동작** | **해당 캐릭터의 ProfileScreen으로 이동** |
| 온라인 상태 뱃지 | 아바타 우하단 초록 점 (online 상태인 경우만) |

**업데이트 유형:**
- **(A) 새 포스트:** AI 캐릭터가 새 콘텐츠를 게시한 경우
- **(C) 오늘의 상태:** AI가 오늘의 기분·활동을 업데이트한 경우 (예: "오늘 신주쿠에 나왔어 🌸")

---

### ② 대화 목록 (하단)

| 항목 | 내용 |
|------|------|
| 정렬 | 최근 대화 순 |
| 각 항목 구성 | 캐릭터 아바타 + 이름 + 마지막 메시지 미리보기 + 시간 |
| 온라인 상태 | 아바타 우하단 초록 점 |
| 읽지 않은 메시지 | 숫자 뱃지 (파란색 원형) |
| **터치 동작** | **ChatScreen으로 이동 (이전 대화 이어서)** |

---

### ③ 헤더

| 항목 | 내용 |
|------|------|
| 좌측 | "채팅" 타이틀 (white, bold) |
| 우측 | ✏️ 새 대화 시작 버튼 → Home 탭으로 이동 |

---

## 화면 전환 흐름

```
Chat 탭
 ├── AI 상태 스트립 아이콘 터치   → 캐릭터 ProfileScreen
 │      └── "대화하기" 버튼       → ChatScreen
 └── 대화 목록 항목 터치          → ChatScreen (이전 대화 이어서)
```

---

## 즐겨찾기 vs 팔로우

| 구분 | 의미 | 표시 위치 |
|------|------|-----------|
| **팔로우** | 관심 있는 캐릭터 등록 | Profile 탭 — 팔로우한 캐릭터 그리드 |
| **즐겨찾기 ⭐** | 자주 대화하는 핵심 캐릭터 | Chat 탭 — 상단 AI 상태 업데이트 스트립 |

---

## 데이터 모델 (목업 기준)

### ChatConversation
```typescript
interface ChatConversation {
  id: string;
  character: Character;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isOnline: boolean;
}
```

### FavoriteCharacter (상태 스트립용)
```typescript
interface FavoriteCharacter {
  character: Character;
  hasUpdate: boolean;        // 새 업데이트 여부 → 그라디언트 링 표시
  isOnline: boolean;
  updateType?: 'post' | 'status'; // A: 새 포스트 / C: 오늘의 상태
}
```

---

## 컴포넌트 구조

```
ChatTabScreen
 ├── ChatHeader          — 타이틀 + ✏️ 버튼
 ├── FavoritesStrip      — 즐겨찾기 가로 스크롤 스트립
 │    └── FavoriteAvatar  — 개별 원형 아이콘 (링 + 이름 + 온라인 점)
 └── ConversationList    — 대화 목록
      └── ConversationItem — 아바타 + 이름 + 미리보기 + 시간 + 뱃지
```

---

## 구현 범위 (1단계 목업)

1단계는 **목업 데이터 기반** 정적 UI 구현:
- 하드코딩된 즐겨찾기 캐릭터 2~3명 (진우, 하나 등)
- 하드코딩된 대화 목록 3~4개
- 즐겨찾기 스트립 터치 → ProfileScreen 연결
- 대화 목록 터치 → ChatScreen 연결

실제 즐겨찾기 등록/해제 기능은 Profile 탭 구현 시 연결 예정.

---

## 현재 구현 상태

| 기능 | 상태 |
|------|------|
| Chat 탭 UI (ChatTabScreen) | ⬜ 미구현 |
| FavoritesStrip 컴포넌트 | ⬜ 미구현 |
| ConversationList 컴포넌트 | ⬜ 미구현 |
| 즐겨찾기 스트립 → ProfileScreen 연결 | ⬜ 미구현 |
| 대화 목록 → ChatScreen 연결 | ⬜ 미구현 |
| BottomNav Chat 탭 연결 | ⬜ 미구현 |
