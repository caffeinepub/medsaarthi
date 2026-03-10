import type { Profile } from "@/backend";
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

interface AppContextValue {
  profile: Profile | null;
  setProfile: (p: Profile | null) => void;
  emergencyOpen: boolean;
  openEmergency: () => void;
  closeEmergency: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  const openEmergency = useCallback(() => setEmergencyOpen(true), []);
  const closeEmergency = useCallback(() => setEmergencyOpen(false), []);

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        emergencyOpen,
        openEmergency,
        closeEmergency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used inside AppProvider");
  return ctx;
}
