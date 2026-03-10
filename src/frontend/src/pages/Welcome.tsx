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

  // biome-ignore lint/correctness/useExhaustiveDependencies: run once on mount
  useEffect(() => {
    speak("Welcome to MEDSAARTHI. Your voice healthcare assistant.");
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: redirect after profile load
  useEffect(() => {
    if (!isLoading && profile) {
      setProfile(profile);
      navigate({ to: "/home" });
    }
  }, [profile, isLoading]);

  return (
    <div
      className="app-shell flex flex-col items-center justify-between min-h-dvh px-6 py-12"
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
        <img
          src="/assets/generated/medsaarthi-logo.dim_200x200.png"
          alt="MEDSAARTHI logo"
          className="w-28 h-28 rounded-3xl shadow-card"
        />
        <div className="text-center">
          <h1 className="text-5xl font-black text-primary tracking-tight">
            MEDSAARTHI
          </h1>
          <p className="text-muted-foreground text-xl mt-2">
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
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            <Mic className="w-8 h-8 text-primary" />
          </div>
          <p className="text-muted-foreground text-base">
            Voice-guided healthcare
          </p>
        </div>

        <Button
          onClick={() => navigate({ to: "/register" })}
          className="w-full btn-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-card focus-ring text-xl font-bold py-6"
          aria-label="Start Setup — begin voice-guided registration"
          data-ocid="welcome.setup_button"
        >
          <Mic className="w-6 h-6 mr-3" />
          Start Setup
        </Button>

        <Button
          onClick={() => navigate({ to: "/home" })}
          variant="outline"
          className="w-full btn-xl border-2 border-primary/60 text-primary hover:bg-primary/10 text-xl font-bold py-6"
          aria-label="Voice Command — go to home and use voice commands"
          data-ocid="welcome.voice_button"
        >
          <Play className="w-6 h-6 mr-3" />
          Voice Command
        </Button>

        <p className="text-muted-foreground text-sm text-center mt-4">
          Designed for visually impaired users
        </p>
      </motion.div>
    </div>
  );
}
