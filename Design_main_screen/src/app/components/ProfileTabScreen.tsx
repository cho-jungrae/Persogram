import { useState, useRef } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { type Character } from "./ProfileScreen";
import { STAGGER_CONTAINER, STAGGER_ITEM, FADE_UP } from "./animationTokens";

interface UserProfile {
  nickname: string;
  joinDate: string;
  avatarUrl?: string;
  interestCount: number;
  streakDays: number;
  persoBalance: number;
  subscriptionPlan: "Free" | "Standard" | "Premium";
}

const mockUserProfile: UserProfile = {
  nickname: "홍길동",
  joinDate: "2024년 3월",
  interestCount: 8,
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
  characters: Character[];
  interestIds: number[];
  onSelectCharacter: (character: Character) => void;
}

// ── 서브 컴포넌트 ──────────────────────────────────────────────────────────────

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
            <img
              src={profile.avatarUrl}
              alt="avatar"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
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
            관심 {profile.interestCount}명 · 🔥 {profile.streakDays}일 연속
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <div>
            <div style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px", marginBottom: "4px" }}>
              보유 Perso
            </div>
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

function CharacterGridCard({ char, onSelect }: { char: Character; onSelect: (c: Character) => void }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <button onClick={() => onSelect(char)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", width: "100%" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
        <div
          style={{
            width: "100%",
            aspectRatio: "1",
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${char.accentColor ?? "#38BDF8"}, #0369A1)`,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {!loaded && <div className="avatar-shimmer" style={{ position: "absolute", inset: 0, borderRadius: "12px" }} />}
          {char.avatarImage && (
            <img
              src={char.avatarImage}
              alt={char.name}
              onLoad={() => setLoaded(true)}
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: loaded ? 1 : 0 }}
            />
          )}
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
  );
}

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
        <div
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.5px",
            marginBottom: "12px",
          }}
        >
          관심 캐릭터
        </div>
        <motion.div
          initial={FADE_UP.initial}
          animate={FADE_UP.animate}
          transition={{ duration: 0.3 }}
          style={{
            background: "rgba(255,255,255,0.04)",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
          }}
        >
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: "12px", marginBottom: "4px" }}>
            아직 관심 캐릭터가 없어요
          </div>
          <div style={{ color: "#0EA5E9", fontSize: "11px" }}>탐색하러 가기 →</div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "10px",
        }}
      >
        <span
          style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.5px",
          }}
        >
          관심 캐릭터
        </span>
        <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "10px" }}>
          {characters.length}명 전체보기 ›
        </span>
      </div>
      <motion.div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "8px",
        }}
        variants={STAGGER_CONTAINER}
        initial="initial"
        animate="animate"
      >
        {characters.map((char) => (
          <motion.div key={char.id} variants={STAGGER_ITEM}>
            <CharacterGridCard char={char} onSelect={onSelect} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

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
      <div
        style={{
          color: "rgba(255,255,255,0.4)",
          fontSize: "10px",
          fontWeight: 600,
          letterSpacing: "0.5px",
          marginBottom: "8px",
        }}
      >
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
              borderBottom:
                i < items.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
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

// ── 메인 컴포넌트 ──────────────────────────────────────────────────────────────

export function ProfileTabScreen({ characters, interestIds, onSelectCharacter }: ProfileTabScreenProps) {
  const interestedCharacters = characters.filter((c) => interestIds.includes(c.id));
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

        <UserInfoSection profile={{ ...mockUserProfile, interestCount: interestedCharacters.length }} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        <PersoCard profile={mockUserProfile} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        <FollowedCharactersGrid characters={interestedCharacters} onSelect={onSelectCharacter} />

        <div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "0 16px 16px" }} />

        {/* 설정 섹션 — ref로 scroll 타깃 */}
        <div ref={settingsRef}>
          <SettingsList />
        </div>
      </div>
    </div>
  );
}
