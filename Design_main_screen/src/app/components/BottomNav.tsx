import { motion } from "motion/react";
import { Home, Compass, MessageCircle, User } from "lucide-react";
import { SPRING } from "./animationTokens";

interface BottomNavProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "chat", icon: MessageCircle, label: "Chat" },
  { id: "profile", icon: User, label: "Profile" },
];

export function BottomNav({ activeNav, setActiveNav }: BottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-3 z-40"
      style={{
        background: "rgba(255,255,255,0.94)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(108,99,255,0.10)",
        paddingTop: "10px",
        paddingBottom: "22px",
        boxShadow: "0 -4px 24px rgba(108,99,255,0.10)",
      }}
    >
      {navItems.map((item) => {
        const isActive = activeNav === item.id;
        const Icon = item.icon;

        return (
          <motion.button
            key={item.id}
            onClick={() => setActiveNav(item.id)}
            whileTap={{ scale: 0.85 }}
            className="flex flex-col items-center gap-1 min-w-[44px]"
          >
            <div
              className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-all"
              style={{ background: isActive ? "rgba(14,165,233,0.12)" : "transparent" }}
            >
              <motion.span
                key={isActive ? `${item.id}-active` : item.id}
                animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                transition={{ ...SPRING }}
                style={{ display: "flex" }}
              >
                <Icon
                  size={20}
                  color={isActive ? "#0EA5E9" : "#94A3B8"}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
              </motion.span>
            </div>
            <span
              style={{
                fontSize: "9px",
                color: isActive ? "#0EA5E9" : "#94A3B8",
                fontWeight: isActive ? 700 : 400,
              }}
            >
              {item.label}
            </span>
            <motion.div
              layoutId="nav-indicator"
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#0EA5E9",
                opacity: isActive ? 1 : 0,
                marginTop: -2,
              }}
            />
          </motion.button>
        );
      })}
    </nav>
  );
}
