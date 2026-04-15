# Persogram — Profile 탭 설계안
Date: 2026-04-15

---

## 개요

Profile 탭은 유저 자신의 계정 정보, Perso 포인트 관리, 팔로우한 캐릭터 목록, 앱 설정을 한 곳에서 관리하는 화면입니다.

- **레이아웃:** 스크롤형 단일 페이지 (섹션을 위아래로 스크롤)
- **배경:** 다크 (#0B1526) — Chat 탭·ChatScreen과 동일한 톤
- **파일명:** `ProfileTabScreen.tsx` (기존 캐릭터 상세 `ProfileScreen.tsx`와 명칭 분리)

---

## 화면 구성 (위→아래 순서)

### 헤더
| 항목 | 내용 |
|------|------|
| 좌측 | "프로필" 타이틀 (white, bold) |
| 우측 | ⚙️ 버튼 → 설정 섹션으로 smooth scroll |

---

### ① 유저 정보

| 항목 | 내용 |
|------|------|
| 아바타 | 원형 (1단계: 그라디언트 mock, 추후 `avatarUrl` 연결) |
| 닉네임 | 굵은 텍스트 |
| 가입일 | 작은 서브텍스트 |
| 통계 요약 | "팔로우 N명 · 🔥 N일 연속" 한 줄 (작은 크기) |

---

### ② Perso 포인트 카드

| 항목 | 내용 |
|------|------|
| 보유 잔액 | ✦ + 숫자 + "Perso" 단위 (정수, 소수점 없음) |
| 구독 플랜 뱃지 | `"Free" \| "Standard" \| "Premium"` |
| 충전하기 버튼 | 터치 시 sonner toast "충전 기능은 곧 제공될 예정이에요 ✦" |
| 사용내역 버튼 | 터치 시 sonner toast "사용내역은 곧 제공될 예정이에요" |

**구독 + 충전 혼합 모델:**
- 구독 플랜: 월정액으로 매달 기본 Perso 지급
- 추가 충전: 인앱 결제로 추가 Perso 구매
- 1단계: 목업 잔액 표시, 실제 결제 연동은 추후 구현

---

### ③ 팔로우한 캐릭터

| 항목 | 내용 |
|------|------|
| 섹션 라벨 | "팔로우한 캐릭터" + "N명 전체보기 ›" |
| 그리드 | 4열 정사각형 카드, 캐릭터 이름 하단 표시, 온라인 점 |
| 터치 동작 | `onSelectCharacter(char)` → HomeScreen의 `setSelectedCharacter` 호출 |
| 빈 상태 | 팔로우 0명일 경우 "아직 팔로우한 캐릭터가 없어요 · 탐색하러 가기" 표시 |

**1단계:** `characters` 배열 전체를 팔로우 목록으로 표시 (실제 팔로우 상태 필드는 미구현)

---

### ④ 설정

| 항목 | 우측 표시 | 터치 동작 |
|------|-----------|-----------|
| 🔔 알림 | 준비중 뱃지 | 비활성 (터치 무반응) |
| 🌐 언어 | 한국어 · 준비중 뱃지 | 비활성 |
| 🌙 테마 | 다크 · 준비중 뱃지 | 비활성 |
| 👤 계정 관리 | › | sonner toast "계정 관리 기능은 곧 제공될 예정이에요" |

> 언어·테마처럼 실제 상태 변경이 필요한 항목은 비활성 처리하여 기능 작동 오해를 방지합니다.

---

## 데이터 모델 (목업)

```typescript
// 1단계 목업 유저 프로필
interface UserProfile {
  nickname: string;
  joinDate: string;             // 표시용 문자열: "2024년 3월"
  avatarUrl?: string;           // 없으면 그라디언트 fallback
  followCount: number;
  streakDays: number;           // 1단계: 하드코딩, 추후 서버에서 수신
  persoBalance: number;         // 정수
  subscriptionPlan: "Free" | "Standard" | "Premium";
}

const mockUserProfile: UserProfile = {
  nickname: "홍길동",
  joinDate: "2024년 3월",
  followCount: 8,
  streakDays: 14,
  persoBalance: 2450,
  subscriptionPlan: "Standard",
};
```

---

## 컴포넌트 구조

```
ProfileTabScreen                        — 전체 화면, 스크롤 컨테이너
 ├── ProfileTabHeader                   — "프로필" 타이틀 + ⚙️ 버튼
 ├── UserInfoSection                    — 아바타 + 닉네임 + 통계 한 줄
 ├── PersoCard                          — 잔액 + 구독 뱃지 + 버튼 2개
 ├── FollowedCharactersGrid             — 4열 그리드 or Empty State
 └── SettingsList                       — 설정 항목 인라인 목록
      ├── SettingsItem (알림)           — 비활성
      ├── SettingsItem (언어)           — 비활성
      ├── SettingsItem (테마)           — 비활성
      └── SettingsItem (계정 관리)      — toast
```

---

## HomeScreen 연결 및 화면 전환

```
Profile 탭 활성 (activeNav === "profile")
 └── ProfileTabScreen 렌더링
      └── FollowedCharactersGrid 캐릭터 터치
           → HomeScreen의 setSelectedCharacter(char) 호출
           → 기존 ProfileScreen(캐릭터 상세) 렌더링
                └── 뒤로가기
                     → setSelectedCharacter(null)
                     → activeNav === "profile" 이므로 Profile 탭으로 복귀
```

**Props:**
```typescript
interface ProfileTabScreenProps {
  // 1단계: 전체 캐릭터 목록을 팔로우 목록으로 표시 (실제 팔로우 필터링은 2단계)
  // 2단계에서 followedCharacters: Character[] 로 prop 분리 예정
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}
```

**selectedCharacter 상태 위치:**
- `selectedCharacter`는 `HomeScreen` 레벨 상태 (`useState<Character | null>`)
- Profile 탭에서 캐릭터 터치 → `onSelectCharacter(char)` → HomeScreen의 `setSelectedCharacter(char)` 호출
- `!chatCharacter && selectedCharacter` 조건으로 기존 `ProfileScreen(캐릭터 상세)` 오버레이 렌더링 (activeNav 변경 없음)
- 캐릭터 상세에서 뒤로가기 → `setSelectedCharacter(null)` → activeNav가 여전히 "profile"이므로 ProfileTabScreen으로 자동 복귀

**계정 관리 (1단계):**
- 로그아웃/탈퇴 등 실제 동작 없음, 단순 toast "계정 관리 기능은 곧 제공될 예정이에요"
- 실제 구현 시 confirm dialog 추가 예정

---

## 구현 범위 (1단계)

| 기능 | 범위 |
|------|------|
| 유저 정보 | 목업 데이터 정적 표시 |
| Perso 카드 | 목업 잔액 표시, 버튼은 sonner toast |
| 팔로우 그리드 | `characters` 전체 표시, 빈 상태 처리 포함 |
| 설정 | 언어·테마·알림 비활성 + 준비중 뱃지, 계정관리만 toast |
| 캐릭터 상세 진입 | `onSelectCharacter` → HomeScreen `setSelectedCharacter` |
| 실제 팔로우 상태 연동 | 2단계 (전역 상태 도입 시) |
| 결제/충전 연동 | 추후 구현 |
