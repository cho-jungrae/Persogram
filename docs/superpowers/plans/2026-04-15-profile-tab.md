# Profile 탭 구현 계획

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Profile 탭 UI 구현 — 유저 정보, Perso 포인트 카드, 팔로우 캐릭터 그리드, 설정 목록 + HomeScreen 연결

**Architecture:** `ProfileTabScreen.tsx`를 새로 생성하고, HomeScreen에서 `activeNav === "profile"` 조건으로 렌더링한다. 캐릭터 터치 시 HomeScreen의 `setSelectedCharacter`를 호출해 기존 `ProfileScreen(캐릭터 상세)`을 재사용한다. 모든 데이터는 목업이며 sonner toast로 미구현 기능을 처리한다.

**Tech Stack:** React 18, TypeScript, Tailwind CSS 4, sonner (toast), lucide-react

---

## 파일 구조

- **신규 생성:** `Design_main_screen/src/app/components/ProfileTabScreen.tsx`
- **수정:** `Design_main_screen/src/app/components/HomeScreen.tsx` — Profile 탭 라우팅 추가

---

## Chunk 1: ProfileTabScreen 컴포넌트

### Task 1: ProfileTabScreen 기본 뼈대 생성

**Files:**
- Create: `Design_main_screen/src/app/components/ProfileTabScreen.tsx`

- [ ] **Step 1: 타입 정의 및 목업 데이터 작성**

```tsx
import { useRef } from "react";
import { toast } from "sonner";
import { type Character } from "./ProfileScreen";

interface UserProfile {
  nickname: string;
  joinDate: string;
  avatarUrl?: string;
  followCount: number;
  streakDays: number;
  persoBalance: number;
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

const PLAN_COLORS: Record<UserProfile["subscriptionPlan"], string> = {
  Free: "#64748B",
  Standard: "#0EA5E9",
  Premium: "#F59E0B",
};

interface ProfileTabScreenProps {
  // 1단계: 전체 캐릭터 목록을 팔로우 목록으로 표시 (2단계에서 followedCharacters로 분리 예정)
  characters: Character[];
  onSelectCharacter: (character: Character) => void;
}
```

- [ ] **Step 2: ProfileTabHeader 서브 컴포넌트 작성**

```tsx
function ProfileTabHeader({ onSettingsClick }: { onSettingsClick: () => void }) {
  return (
    <div
      style={{
        padding: "52px 16px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}
    >
      <span style={{ color: "white", fontSize: "18px", fontWeight: 800 }}>프로필</span>
      <button
        onClick={onSettingsClick}
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
        ⚙️
      </button>
    </div>
  );
}
```

- [ ] **Step 3: UserInfoSection 서브 컴포넌트 작성**

```tsx
function UserInfoSection({ profile }: { profile: UserProfile }) {
  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {/* 아바타 */}
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            flexShrink: 0,
            border: "2px solid rgba(255,255,255,0.15)",
            overflow: "hidden",
            background: "linear-gradient(135deg, #38BDF8, #0369A1)",
          }}
        >
          {profile.avatarUrl && (
            <img src={profile.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          )}
        </div>
        {/* 텍스트 */}
        <div style={{ flex: 1 }}>
          <div style={{ color: "white", fontSize: "15px", fontWeight: 800, marginBottom: "3px" }}>
            {profile.nickname}
          </div>
          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: "10px", marginBottom: "3px" }}>
            {profile.joinDate} 가입
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}>
            팔로우 {profile.followCount}명 · 🔥 {profile.streakDays}일 연속
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: PersoCard 서브 컴포넌트 작성**

```tsx
function PersoCard({ profile }: { profile: UserProfile }) {
  const planColor = PLAN_COLORS[profile.subscriptionPlan];

  return (
    <div style={{ margin: "0 16px 16px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, rgba(14,165,233,0.2), rgba(56,189,248,0.08))",
          border: "1px solid rgba(14,165,233,0.3)",
          borderRadius: "14px",
          padding: "14px",
        }}
      >
        {/* 잔액 + 구독 플랜 */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", marginBottom: "4px" }}>보유 Perso</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
              <span style={{ color: "#FCD34D", fontSize: "11px", fontWeight: 700 }}>✦</span>
              <span style={{ color: "white", fontSize: "24px", fontWeight: 800, lineHeight: 1 }}>
                {profile.persoBalance.toLocaleString()}
              </span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px" }}>Perso</span>
            </div>
          </div>
          <div
            style={{
              background: planColor,
              borderRadius: "20px",
              padding: "4px 12px",
            }}
          >
            <span style={{ color: "white", fontSize: "10px", fontWeight: 700 }}>
              {profile.subscriptionPlan}
            </span>
          </div>
        </div>
        {/* 버튼 2개 */}
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => toast("충전 기능은 곧 제공될 예정이에요 ✦")}
            style={{
              flex: 1,
              background: "#0EA5E9",
              border: "none",
              borderRadius: "10px",
              padding: "10px",
              color: "white",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            충전하기
          </button>
          <button
            onClick={() => toast("사용내역은 곧 제공될 예정이에요")}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px",
              padding: "10px",
              color: "rgba(255,255,255,0.6)",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            사용내역
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: FollowedCharactersGrid 서브 컴포넌트 작성**

```tsx
function FollowedCharactersGrid({
  characters,
  onSelect,
}: {
  characters: Character[];
  onSelect: (char: Character) => void;
}) {
  if (characters.length === 0) {
    return (
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "12px" }}>
          팔로우한 캐릭터
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "4px" }}>
            아직 팔로우한 캐릭터가 없어요
          </div>
          <div style={{ color: "#0EA5E9", fontSize: "11px" }}>탐색하러 가기 →</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px" }}>
          팔로우한 캐릭터
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>
          {characters.length}명 전체보기 ›
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
      >
        {characters.map((char) => (
          <button
            key={char.id}
            onClick={() => onSelect(char)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "12px",
                  background: `linear-gradient(135deg, ${char.accentColor}, #0369A1)`,
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {char.avatarImage && (
                  <img src={char.avatarImage} alt={char.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
                {/* 온라인 점 (mock: 항상 표시) */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "3px",
                    right: "3px",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "#4ADE80",
                    border: "1.5px solid #0B1526",
                  }}
                />
              </div>
              <span
                style={{
                  color: "rgba(255,255,255,0.7)",
                  fontSize: "8px",
                  fontWeight: 600,
                  maxWidth: "100%",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {char.name.split(" ").slice(-1)[0]}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: SettingsList 서브 컴포넌트 작성**

```tsx
interface SettingsItemConfig {
  emoji: string;
  label: string;
  value?: string;
  disabled?: boolean;
  onPress?: () => void;
}

function SettingsList() {
  const items: SettingsItemConfig[] = [
    { emoji: "🔔", label: "알림", disabled: true },
    { emoji: "🌐", label: "언어", value: "한국어", disabled: true },
    { emoji: "🌙", label: "테마", value: "다크", disabled: true },
    {
      emoji: "👤",
      label: "계정 관리",
      onPress: () => toast("계정 관리 기능은 곧 제공될 예정이에요"),
    },
  ];

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "10px", fontWeight: 600, letterSpacing: "0.5px", marginBottom: "8px" }}>
        설정
      </div>
      <div>
        {items.map((item, i) => (
          <button
            key={item.label}
            onClick={item.disabled ? undefined : item.onPress}
            disabled={item.disabled}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              padding: "11px 0",
              background: "none",
              border: "none",
              borderBottom: i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              cursor: item.disabled ? "default" : "pointer",
              opacity: item.disabled ? 0.5 : 1,
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "14px" }}>{item.emoji}</span>
              <span style={{ color: "rgba(255,255,255,0.75)", fontSize: "13px" }}>{item.label}</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {item.value && (
                <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "11px" }}>{item.value}</span>
              )}
              {item.disabled ? (
                <span
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                    padding: "2px 6px",
                    color: "rgba(255,255,255,0.3)",
                    fontSize: "9px",
                  }}
                >
                  준비중
                </span>
              ) : (
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "14px" }}>›</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: ProfileTabScreen 메인 컴포넌트 작성**

```tsx
export function ProfileTabScreen({ characters, onSelectCharacter }: ProfileTabScreenProps) {
  const settingsRef = useRef<HTMLDivElement>(null);

  function scrollToSettings() {
    settingsRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  return (
    <div
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
      <ProfileTabHeader onSettingsClick={scrollToSettings} />

      {/* 스크롤 컨테이너 */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* 구분선 */}
        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        <UserInfoSection profile={mockUserProfile} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        <PersoCard profile={mockUserProfile} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        <FollowedCharactersGrid characters={characters} onSelect={onSelectCharacter} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        {/* 설정 섹션 — ref로 scroll 타깃 */}
        <div ref={settingsRef}>
          <SettingsList />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 8: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen"
npm run build
```

Expected: `✓ built in X.XXs` (에러 없음)

---

## Chunk 2: HomeScreen 연결

### Task 2: HomeScreen에 Profile 탭 라우팅 추가

**Files:**
- Modify: `Design_main_screen/src/app/components/HomeScreen.tsx`

- [ ] **Step 1: ProfileTabScreen import 추가**

[HomeScreen.tsx](Design_main_screen/src/app/components/HomeScreen.tsx) 상단 import 블록에 추가:

```tsx
import { ProfileTabScreen } from "./ProfileTabScreen";
```

- [ ] **Step 2: Profile 탭 렌더링 블록 추가**

Chat 탭 블록 바로 아래, Home 콘텐츠 블록 위에 추가:

```tsx
{/* ── PROFILE TAB ── */}
{activeNav === "profile" && !chatCharacter && !selectedCharacter && (
  <ProfileTabScreen
    characters={characters}
    onSelectCharacter={(char) => setSelectedCharacter(char)}
  />
)}
```

- [ ] **Step 3: 빌드 확인**

```bash
cd "d:/[00].ANTI.G/Persogram/Design_main_screen"
npm run build
```

Expected: `✓ built in X.XXs`

- [ ] **Step 4: 동작 확인 체크리스트**

개발 서버(`npm run dev`) 에서 확인:
- BottomNav에서 Profile(👤) 탭 터치 → ProfileTabScreen 표시
- ⚙️ 버튼 터치 → 설정 섹션으로 스크롤
- Perso 카드 "충전하기" 터치 → sonner toast 표시
- Perso 카드 "사용내역" 터치 → sonner toast 표시
- 설정 알림/언어/테마 → 터치 무반응, "준비중" 뱃지 표시
- 설정 계정 관리 → sonner toast 표시
- 팔로우 캐릭터 그리드 카드 터치 → 캐릭터 ProfileScreen(상세) 표시
- 캐릭터 ProfileScreen 뒤로가기 → Profile 탭으로 복귀 (activeNav 유지)
- Home/Chat 탭으로 이동 후 다시 Profile 탭 → 정상 표시

---

## 완료 기준

- [ ] Profile 탭 전환 시 ProfileTabScreen 표시 (BottomNav 위에 올바르게 표시)
- [ ] 유저 정보 (닉네임, 가입일, 팔로우수, 연속일) 정상 렌더링
- [ ] Perso 카드 잔액 + 구독 플랜 뱃지 표시
- [ ] 충전하기 / 사용내역 버튼 toast 동작
- [ ] 팔로우 캐릭터 4열 그리드 렌더링 (캐릭터 아바타 이미지 표시)
- [ ] 팔로우 캐릭터 터치 → 캐릭터 ProfileScreen 진입 → 뒤로가기 → Profile 탭 복귀
- [ ] 설정 목록 준비중/비활성 처리 정상 동작
- [ ] 빌드 에러 없음
