import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSubmitHealthCheckin } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Mic, MicOff } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type Session = "Morning" | "Afternoon" | "Night";

const QUESTIONS: Record<Session, string[]> = {
  Morning: [
    "Good morning. How are you feeling today?",
    "Did you sleep well last night?",
    "Do you feel any pain or discomfort in your body?",
    "Do you have symptoms like cold, cough, fever, or headache today?",
    "Are you feeling dizziness, weakness, or fatigue?",
    "Did you take your morning medicines as prescribed?",
    "Did you experience any side effects after yesterday's medicines?",
    "What did you eat for breakfast today?",
    "Have you had enough water this morning?",
    "Do you feel better, worse, or the same compared to yesterday?",
  ],
  Afternoon: [
    "How are you feeling right now?",
    "Did you take your afternoon medicine on time?",
    "Are you experiencing any new symptoms today?",
    "Do you have cold, cough, throat irritation, or breathing difficulty?",
    "Are you feeling nausea, stomach pain, or digestion problems?",
    "What did you eat for lunch today?",
    "Are you feeling tired, sleepy, or weak?",
    "Have you had enough water during the day?",
    "Did you notice any unusual reaction after your medicines?",
    "How many tablets are left in your medicine strip?",
  ],
  Night: [
    "How are you feeling tonight?",
    "Did you take your night medicines as prescribed?",
    "Did you experience any pain, fever, or discomfort during the day?",
    "Are you feeling cold, cough, body ache, or throat irritation?",
    "Did you feel any side effects after taking your medicines today?",
    "What did you eat for dinner today?",
    "Are you feeling better or worse compared to the morning?",
    "Do you have any difficulty breathing, chest pain, or dizziness?",
    "Do you want to report any health issue to your doctor?",
    "Is there anything else you would like to tell about your health today?",
  ],
};

function getSession(): Session {
  const h = new Date().getHours();
  if (h >= 18) return "Night";
  if (h >= 12) return "Afternoon";
  return "Morning";
}

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function HealthCheckin() {
  const navigate = useNavigate();
  const { speak, listen, isListening } = useVoice();
  const submitCheckin = useSubmitHealthCheckin();
  const session = getSession();
  const questions = QUESTIONS[session];

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>(
    Array(questions.length).fill(""),
  );
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak question on change
  useEffect(() => {
    speak(questions[currentQ]);
  }, [currentQ]);

  const handleVoice = () => {
    speak(questions[currentQ]);
    listen((text) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQ] = text;
        return next;
      });
    });
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const qas = questions.map((q, i) => ({
        question: q,
        answer: answers[i] || "No answer",
      }));
      await submitCheckin.mutateAsync({
        session,
        date: getTodayDate(),
        questionsAndAnswers: qas,
      });
      setSubmitted(true);
      speak("Health check-in submitted. Thank you for the update.");
      toast.success("Health check-in recorded!");
      setTimeout(() => navigate({ to: "/home" }), 2500);
    } catch {
      toast.error("Failed to submit");
    }
  };

  if (submitted) {
    return (
      <Layout>
        <div className="page-container pt-16 flex flex-col items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center space-y-4"
          >
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto" />
            <h2 className="text-3xl font-black">Check-in Submitted!</h2>
            <p className="text-muted-foreground text-xl">
              Thank you for your health update.
            </p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page-container pt-8">
        <div className="flex items-center gap-4 pt-14 mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/home" })}
            aria-label="Go back"
            data-ocid="checkin.cancel_button"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div>
            <h1 className="text-2xl font-black">{session} Check-in</h1>
            <p className="text-muted-foreground text-sm">
              Question {currentQ + 1} of {questions.length}
            </p>
          </div>
        </div>

        <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-2xl bg-card border border-border">
              <p className="text-xl font-bold text-foreground leading-relaxed">
                {questions[currentQ]}
              </p>
            </div>

            <div className="flex gap-3">
              <Input
                value={answers[currentQ]}
                onChange={(e) =>
                  setAnswers((prev) => {
                    const n = [...prev];
                    n[currentQ] = e.target.value;
                    return n;
                  })
                }
                placeholder="Type your answer or use voice..."
                className="flex-1 h-16 text-lg"
                aria-label="Your answer"
                data-ocid="checkin.input"
              />
              <Button
                variant="outline"
                onClick={handleVoice}
                className="w-16 h-16 rounded-xl flex-shrink-0"
                aria-label={isListening ? "Stop" : "Speak answer"}
                data-ocid="checkin.toggle"
              >
                {isListening ? (
                  <MicOff className="w-6 h-6 text-destructive" />
                ) : (
                  <Mic className="w-6 h-6 text-primary" />
                )}
              </Button>
            </div>

            {isListening && (
              <div className="flex items-center gap-3 p-4 bg-primary/10 rounded-xl border border-primary/30">
                <div className="w-4 h-4 rounded-full bg-primary animate-pulse" />
                <p className="text-primary font-medium text-lg">
                  Listening... Speak now
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8">
          <Button
            onClick={handleNext}
            disabled={submitCheckin.isPending}
            className="w-full h-16 rounded-xl text-xl font-bold bg-primary text-primary-foreground"
            aria-label={
              currentQ === questions.length - 1
                ? "Submit check-in"
                : "Next question"
            }
            data-ocid="checkin.primary_button"
          >
            {currentQ === questions.length - 1
              ? submitCheckin.isPending
                ? "Submitting..."
                : "Submit Check-in"
              : "Next Question"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
