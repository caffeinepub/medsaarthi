import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { CheckCircle, Clock, Home, Scan, Volume2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";

const DEMO_STEPS = [
  {
    id: 1,
    name: "Voice Greeting",
    icon: Volume2,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
    borderColor: "border-blue-400/30",
    duration: 3000,
    content: (
      <div className="text-center">
        <div className="text-6xl mb-4">👋</div>
        <p className="text-3xl font-bold text-white">Welcome to MEDSAARTHI</p>
        <p className="text-xl text-blue-300 mt-2">
          Your voice healthcare assistant
        </p>
      </div>
    ),
    speech: "Welcome to MEDSAARTHI. Your voice healthcare assistant.",
  },
  {
    id: 2,
    name: "Prescription Scan",
    icon: Scan,
    color: "text-green-400",
    bgColor: "bg-green-400/10",
    borderColor: "border-green-400/30",
    duration: 4000,
    content: (
      <div className="space-y-4">
        <p className="text-xl text-green-400 font-semibold text-center">
          📋 Prescription Scanned
        </p>
        <div className="bg-white/5 rounded-2xl p-5 space-y-4">
          <div className="border-b border-white/10 pb-3">
            <p className="text-2xl font-black text-white">
              Medicine: Paracetamol
            </p>
            <p className="text-lg text-gray-300">Dosage: 500mg</p>
            <p className="text-lg text-green-300 font-semibold">
              Time: 8 AM / 8 PM
            </p>
          </div>
          <div>
            <p className="text-2xl font-black text-white">
              Medicine: Metformin
            </p>
            <p className="text-lg text-gray-300">Dosage: 500mg</p>
            <p className="text-lg text-green-300 font-semibold">
              Time: 8 AM / 8 PM
            </p>
          </div>
        </div>
      </div>
    ),
    speech:
      "Prescription scanned. Medicine Paracetamol, 500 milligrams, 8 AM and 8 PM. Medicine Metformin, 500 milligrams, 8 AM and 8 PM.",
  },
  {
    id: 3,
    name: "Reminder Alarm",
    icon: Clock,
    color: "text-yellow-400",
    bgColor: "bg-yellow-400/10",
    borderColor: "border-yellow-400/30",
    duration: 3000,
    content: (
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [-5, 5, -5, 5, 0] }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
          className="text-8xl mb-4"
        >
          ⏰
        </motion.div>
        <p className="text-3xl font-bold text-yellow-300">
          It is time to take your medicine.
        </p>
        <div className="mt-4 p-4 bg-yellow-400/10 rounded-xl">
          <p className="text-xl text-white">Paracetamol 500mg · 8 AM dose</p>
        </div>
      </div>
    ),
    speech: "It is time to take your medicine. Paracetamol, 500 milligrams.",
  },
  {
    id: 4,
    name: "Medicine Scan",
    icon: CheckCircle,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
    borderColor: "border-emerald-400/30",
    duration: 3000,
    content: (
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 12 }}
          className="w-32 h-32 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4"
        >
          <CheckCircle className="w-20 h-20 text-emerald-400" />
        </motion.div>
        <p className="text-3xl font-bold text-emerald-300">
          ✔ Correct medicine detected
        </p>
        <p className="text-xl text-white mt-2">Paracetamol 500mg</p>
        <p className="text-muted-foreground mt-1">Matches your 8:00 AM dose</p>
      </div>
    ),
    speech:
      "Correct medicine detected. Paracetamol, 500 milligrams. It is safe to take.",
  },
];

export function DemoMode() {
  const navigate = useNavigate();
  const { speak, stopSpeaking } = useVoice();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DEMO_STEPS[0].duration);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  const advanceStep = useCallback(() => {
    const next = stepRef.current + 1;
    if (next >= DEMO_STEPS.length) {
      setDone(true);
      speak("Demo complete! You have seen all the key features of MEDSAARTHI.");
      return;
    }
    stepRef.current = next;
    setCurrentStep(next);
    setTimeLeft(DEMO_STEPS[next].duration);
    speak(DEMO_STEPS[next].speech);
  }, [speak]);

  // Start first step speech
  // biome-ignore lint/correctness/useExhaustiveDependencies: run once
  useEffect(() => {
    speak(DEMO_STEPS[0].speech);
  }, []);

  // Timer tick
  // biome-ignore lint/correctness/useExhaustiveDependencies: advanceStep is stable
  useEffect(() => {
    if (done) return;
    const step = DEMO_STEPS[currentStep];
    const interval = 100;
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += interval;
      setTimeLeft(Math.max(0, step.duration - elapsed));
      if (elapsed >= step.duration) {
        if (timerRef.current) clearInterval(timerRef.current);
        advanceStep();
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentStep, done]);

  const handleSkip = () => {
    stopSpeaking();
    if (timerRef.current) clearInterval(timerRef.current);
    navigate({ to: "/home" });
  };

  if (done) {
    return (
      <div
        className="min-h-dvh flex flex-col items-center justify-center px-6"
        style={{
          background:
            "linear-gradient(160deg, oklch(0.13 0.03 264) 0%, oklch(0.18 0.05 240) 100%)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
          data-ocid="demo.step_panel"
        >
          <div className="text-8xl mb-6">🎉</div>
          <h1 className="text-4xl font-black text-white mb-4">
            Demo Complete!
          </h1>
          <p className="text-xl text-gray-300 mb-10">
            You have seen all the key features of MEDSAARTHI.
          </p>
          <button
            type="button"
            onClick={() => navigate({ to: "/home" })}
            className="w-full max-w-sm py-6 px-8 bg-primary text-primary-foreground rounded-2xl text-2xl font-bold flex items-center justify-center gap-3 mx-auto"
            aria-label="Go to home screen"
            data-ocid="demo.primary_button"
          >
            <Home className="w-7 h-7" />
            Go to Home
          </button>
        </motion.div>
      </div>
    );
  }

  const step = DEMO_STEPS[currentStep];
  const StepIcon = step.icon;
  const progressPct = ((step.duration - timeLeft) / step.duration) * 100;

  return (
    <div
      className="min-h-dvh flex flex-col px-6 py-8"
      style={{
        background:
          "linear-gradient(160deg, oklch(0.13 0.03 264) 0%, oklch(0.18 0.05 240) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">
            Demo Mode
          </p>
          <h1 className="text-2xl font-black text-white">MEDSAARTHI</h1>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/10 transition-colors text-lg font-semibold"
          aria-label="Skip demo and go to home"
          data-ocid="demo.cancel_button"
        >
          <X className="w-5 h-5" />
          Skip Demo
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex gap-2 mb-8">
        {DEMO_STEPS.map((s, idx) => (
          <div
            key={s.id}
            className={`flex-1 h-2 rounded-full transition-all ${
              idx < currentStep
                ? "bg-primary"
                : idx === currentStep
                  ? "bg-primary/60"
                  : "bg-white/10"
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          transition={{ duration: 0.35 }}
          className={`flex-1 flex flex-col rounded-3xl border p-8 ${step.bgColor} ${step.borderColor}`}
          data-ocid="demo.step_panel"
        >
          {/* Step header */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${step.bgColor} border ${step.borderColor}`}
            >
              <StepIcon className={`w-6 h-6 ${step.color}`} />
            </div>
            <div>
              <p className="text-gray-400 text-sm">
                Step {currentStep + 1} of {DEMO_STEPS.length}
              </p>
              <h2 className={`text-2xl font-black ${step.color}`}>
                {step.name}
              </h2>
            </div>
          </div>

          {/* Step visual */}
          <div className="flex-1 flex items-center justify-center">
            {step.content}
          </div>

          {/* Progress bar */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-gray-400" />
                <span className="text-gray-400 text-sm">Playing audio...</span>
              </div>
              <span className={`text-sm font-semibold ${step.color}`}>
                {Math.ceil(timeLeft / 1000)}s
              </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-current ${step.color}`}
                style={{ width: `${progressPct}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Footer hint */}
      <div className="mt-4 text-center">
        <p className="text-gray-500 text-sm">
          Auto-advancing · Tap Skip to exit
        </p>
      </div>
    </div>
  );
}
