import { Layout } from "@/components/Layout";
import { useAppContext } from "@/context/AppContext";
import { useAllMedicines, useTodaysAdherence } from "@/hooks/useQueries";
import { useReminders } from "@/hooks/useReminders";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import {
  Heart,
  Mic,
  MicOff,
  Pill,
  Play,
  ScanLine,
  ShieldCheck,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const QUICK_ACTIONS = [
  {
    id: "medicines",
    path: "/medicines",
    icon: Pill,
    label: "My Medicines",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    ocid: "home.medicines_button",
  },
  {
    id: "scan",
    path: "/scan-prescription",
    icon: ScanLine,
    label: "Scan Prescription",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    ocid: "home.scan_button",
  },
  {
    id: "verify",
    path: "/verify-medicine",
    icon: ShieldCheck,
    label: "Verify Medicine",
    color: "bg-green-500/20 text-green-400 border-green-500/30",
    ocid: "home.verify_button",
  },
  {
    id: "reminders",
    path: "/reminders",
    icon: Pill,
    label: "Reminders",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    ocid: "home.reminders_button",
  },
  {
    id: "checkin",
    path: "/checkin",
    icon: Heart,
    label: "Health Check-in",
    color: "bg-rose-500/20 text-rose-400 border-rose-500/30",
    ocid: "home.checkin_button",
  },
  {
    id: "caregiver",
    path: "/caregiver",
    icon: Users,
    label: "Caregiver",
    color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    ocid: "home.caregiver_button",
  },
  {
    id: "demo",
    path: "/demo",
    icon: Play,
    label: "Demo Mode",
    color: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
    ocid: "home.demo_button",
  },
];

export function Home() {
  const navigate = useNavigate();
  const { speak, listen, stopListening, isListening } = useVoice();
  const { profile, openEmergency } = useAppContext();
  const { data: medicines = [] } = useAllMedicines();
  const { data: adherence = [] } = useTodaysAdherence();
  const [activeReminder, setActiveReminder] = useState<string | null>(null);

  const takenCount = adherence.length;
  const totalCount = medicines.length;

  useReminders(medicines, (med) => {
    setActiveReminder(med.name);
    toast(`⏰ Time to take ${med.name}!`, { duration: 10000 });
    setTimeout(() => setActiveReminder(null), 10000);
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on mount
  useEffect(() => {
    const name = profile?.name || "friend";
    speak(
      `${getGreeting()}, ${name}. You have ${totalCount} medicines today. ${takenCount} taken.`,
    );
  }, []);

  const handleMicPress = () => {
    if (isListening) {
      stopListening();
      return;
    }
    speak(
      "Listening. Say medicines, scan, verify, reminders, health, caregiver, demo, or help.",
    );
    listen((text) => {
      const t = text.toLowerCase();
      if (t.includes("help") || t.includes("emergency")) openEmergency();
      else if (t.includes("medicine")) navigate({ to: "/medicines" });
      else if (t.includes("scan")) navigate({ to: "/scan-prescription" });
      else if (t.includes("verify")) navigate({ to: "/verify-medicine" });
      else if (t.includes("remind")) navigate({ to: "/reminders" });
      else if (t.includes("health") || t.includes("check"))
        navigate({ to: "/checkin" });
      else if (t.includes("caregiver")) navigate({ to: "/caregiver" });
      else if (t.includes("profile")) navigate({ to: "/profile" });
      else if (t.includes("demo")) navigate({ to: "/demo" });
      else speak("Sorry, I did not understand. Please try again.");
    });
  };

  return (
    <Layout>
      <div className="page-container pt-16 pb-24">
        <div className="pt-6 pb-4">
          <p className="text-muted-foreground text-xl">{getGreeting()}</p>
          <h1 className="text-4xl font-black text-foreground">
            {profile?.name || "MEDSAARTHI"}
          </h1>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-3xl font-black text-primary">{totalCount}</p>
            <p className="text-muted-foreground text-sm mt-1">
              Medicines today
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-card border border-border">
            <p className="text-3xl font-black text-green-500">{takenCount}</p>
            <p className="text-muted-foreground text-sm mt-1">Doses taken</p>
          </div>
        </div>

        {activeReminder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center gap-3"
          >
            <span className="text-2xl">⏰</span>
            <p className="text-amber-400 font-bold text-lg">
              Time to take {activeReminder}!
            </p>
          </motion.div>
        )}

        <h2 className="text-xl font-bold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileTap={{ scale: 0.96 }}
                onClick={() => navigate({ to: action.path as any })}
                className={`p-5 rounded-2xl border flex flex-col items-start gap-3 ${action.color} min-h-[100px]`}
                aria-label={action.label}
                data-ocid={action.ocid}
              >
                <Icon className="w-8 h-8" />
                <span className="text-base font-bold leading-tight">
                  {action.label}
                </span>
              </motion.button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleMicPress}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
              isListening
                ? "bg-destructive text-white"
                : "bg-primary text-primary-foreground"
            }`}
            aria-label={isListening ? "Stop listening" : "Voice command"}
            data-ocid="home.toggle"
          >
            {isListening ? (
              <MicOff className="w-9 h-9" />
            ) : (
              <Mic className="w-9 h-9" />
            )}
          </motion.button>
        </div>
        {isListening && (
          <p className="text-center text-primary font-semibold mt-3 text-lg animate-pulse">
            Listening...
          </p>
        )}
      </div>
    </Layout>
  );
}
