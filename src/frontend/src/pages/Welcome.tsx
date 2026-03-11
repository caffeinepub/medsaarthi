import { Button } from "@/components/ui/button";
import { useAppContext } from "@/context/AppContext";
import { useProfile } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { Mic, Play } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export function Welcome() {
  const navigate = useNavigate();
  const { speak } = useVoice();
  const { data: profile, isLoading } = useProfile();
  const { setProfile } = useAppContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once
  useEffect(() => {
    speak("Welcome to MEDSAARTHI. Your voice healthcare assistant.");
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: redirect after load
  useEffect(() => {
    if (!isLoading && profile && profile.registrationComplete) {
      setProfile(profile);
      navigate({ to: "/home" });
    }
  }, [profile, isLoading]);

  return (
    <div
      className="flex flex-col items-center justify-between min-h-dvh px-6 py-12"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.13 0.03 264) 0%, oklch(0.18 0.05 240) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-6 mt-12"
      >
        <div className="w-28 h-28 rounded-3xl bg-amber-500/20 flex items-center justify-center">
          <span className="text-6xl">💊</span>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-black text-amber-400 tracking-tight">
            MEDSAARTHI
          </h1>
          <p className="text-slate-400 text-xl mt-2">
            Your voice healthcare assistant
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex flex-col items-center gap-4 mb-8 w-full"
      >
        <div className="flex flex-col items-center gap-2 mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center animate-pulse">
            <Mic className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-slate-400 text-base">
            Voice-guided healthcare for all
          </p>
        </div>

        <Button
          onClick={() => navigate({ to: "/register" })}
          className="w-full h-16 rounded-xl bg-amber-500 text-black hover:bg-amber-400 text-xl font-bold shadow-lg"
          aria-label="Start Setup"
          data-ocid="welcome.setup_button"
        >
          <Mic className="w-6 h-6 mr-3" /> Start Setup
        </Button>

        <Button
          onClick={() => navigate({ to: "/home" })}
          variant="outline"
          className="w-full h-16 rounded-xl border-2 border-amber-500/60 text-amber-400 hover:bg-amber-500/10 text-xl font-bold"
          aria-label="Voice Command"
          data-ocid="welcome.voice_button"
        >
          <Play className="w-6 h-6 mr-3" /> Voice Command
        </Button>

        <p className="text-slate-500 text-sm text-center mt-4">
          Designed for visually impaired users
        </p>
      </motion.div>
    </div>
  );
}
