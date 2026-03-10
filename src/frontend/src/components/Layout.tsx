import { useAppContext } from "@/context/AppContext";
import { Link, useLocation } from "@tanstack/react-router";
import { Bell, Home, User, Users } from "lucide-react";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { EmergencyModal } from "./EmergencyModal";

interface LayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

const navItems = [
  { path: "/home", icon: Home, label: "Home" },
  { path: "/reminders", icon: Bell, label: "Reminders" },
  { path: "/caregiver", icon: Users, label: "Caregiver" },
  { path: "/profile", icon: User, label: "Profile" },
];

function SOSButton() {
  const { openEmergency } = useAppContext();
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={openEmergency}
      className="fixed top-4 right-4 z-50 w-16 h-16 rounded-full bg-destructive text-destructive-foreground flex flex-col items-center justify-center font-bold shadow-lg animate-pulse-red focus-ring"
      aria-label="Emergency SOS — tap to call for help"
      data-ocid="layout.sos_button"
      style={{
        right: "max(1rem, calc(50vw - 240px + 1rem))",
      }}
    >
      <span className="text-xl">🆘</span>
      <span className="text-xs font-bold leading-none">Emergency</span>
    </motion.button>
  );
}

function BottomNav() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex justify-around items-center border-t border-border bg-card"
      style={{
        height: "72px",
        maxWidth: "480px",
        margin: "0 auto",
        left: "50%",
        transform: "translateX(-50%)",
      }}
      aria-label="Main navigation"
    >
      {navItems.map((item) => {
        const active = pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors focus-ring ${
              active
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            aria-label={item.label}
            aria-current={active ? "page" : undefined}
            data-ocid={`nav.${item.label.toLowerCase()}.link`}
          >
            <item.icon className={`w-6 h-6 ${active ? "text-primary" : ""}`} />
            <span className="text-xs font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

export function Layout({ children, showNav = true }: LayoutProps) {
  return (
    <div className="app-shell">
      <SOSButton />
      <main>{children}</main>
      {showNav && <BottomNav />}
      <EmergencyModal />
    </div>
  );
}
