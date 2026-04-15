import { Home, Compass, MessageCircle, User, PlusCircle, Bell, Settings } from "lucide-react";
import { Logo } from "./Logo";

interface SideNavProps {
  activeNav: string;
  setActiveNav: (nav: string) => void;
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "chat", icon: MessageCircle, label: "Chat", badge: 3 },
  { id: "profile", icon: User, label: "Profile" },
];

export function SideNav({ activeNav, setActiveNav }: SideNavProps) {
  return (
    <aside
      className="hidden md:flex flex-col h-screen sticky top-0 py-6 px-4"
      style={{
        width: "240px",
        minWidth: "240px",
        background: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(16px)",
        borderRight: "1px solid rgba(14,165,233,0.12)",
        boxShadow: "2px 0 20px rgba(14,165,233,0.07)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8 px-2">
        <Logo size={36} />
        <span style={{ fontSize: "20px", fontWeight: 800, color: "#0C2340", letterSpacing: "-0.5px" }}>
          Persogram
        </span>
      </div>

      {/* Create Button */}
      <button
        onClick={() => setActiveNav("create")}
        className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl mb-6 transition-all"
        style={{
          background: "linear-gradient(135deg, #38BDF8, #0EA5E9)",
          boxShadow: "0 6px 18px rgba(14,165,233,0.35)",
          color: "white",
          fontSize: "14px",
          fontWeight: 700,
        }}
      >
        <PlusCircle size={18} />
        Create Persona
      </button>

      {/* Nav Items */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => {
          const isActive = activeNav === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveNav(item.id)}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all text-left relative"
              style={{
                background: isActive ? "rgba(14,165,233,0.12)" : "transparent",
                color: isActive ? "#0EA5E9" : "#64748B",
                fontWeight: isActive ? 700 : 400,
                fontSize: "14px",
              }}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
              {item.label}
              {item.badge && (
                <span
                  className="ml-auto text-white text-xs w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: "#F43F5E", fontSize: "10px", fontWeight: 700 }}
                >
                  {item.badge}
                </span>
              )}
              {isActive && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: "#0EA5E9" }}
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="flex flex-col gap-1 mt-4 pt-4" style={{ borderTop: "1px solid rgba(14,165,233,0.10)" }}>
        <button
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all text-left"
          style={{ color: "#64748B", fontSize: "14px" }}
        >
          <Bell size={20} strokeWidth={1.8} />
          Notifications
        </button>
        <button
          className="flex items-center gap-3 w-full px-4 py-3 rounded-2xl transition-all text-left"
          style={{ color: "#64748B", fontSize: "14px" }}
        >
          <Settings size={20} strokeWidth={1.8} />
          Settings
        </button>

        {/* User Profile */}
        <div
          className="flex items-center gap-3 mt-3 px-3 py-3 rounded-2xl"
          style={{ background: "rgba(14,165,233,0.08)" }}
        >
          <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0 border-2 border-sky-200">
            <img
              src="https://images.unsplash.com/photo-1716798084682-decdb59ca364?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=80"
              className="w-full h-full object-cover"
              alt="profile"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p style={{ color: "#0C2340", fontSize: "13px", fontWeight: 700 }} className="truncate">
              Soo-Yeon Park
            </p>
            <p style={{ color: "#94A3B8", fontSize: "11px" }}>@sooyeon</p>
          </div>
        </div>
      </div>
    </aside>
  );
}