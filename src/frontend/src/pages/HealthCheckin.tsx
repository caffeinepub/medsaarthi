import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSubmitCheckin } from "@/hooks/useQueries";
import { useVoice } from "@/hooks/useVoice";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, Heart, Mic, MicOff } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type MoodType = "good" | "fair" | "poor" | null;

const MOODS = [
  {
    value: "good" as const,
    emoji: "😊",
    label: "Good",
    color: "bg-secondary/20 text-secondary border-secondary/50",
    activeColor: "bg-secondary text-secondary-foreground border-secondary",
    ocid: "checkin.good_button",
  },
  {
    value: "fair" as const,
    emoji: "😐",
    label: "Fair",
    color: "bg-primary/20 text-primary border-primary/50",
    activeColor: "bg-primary text-primary-foreground border-primary",
    ocid: "checkin.fair_button",
  },
  {
    value: "poor" as const,
    emoji: "😔",
    label: "Poor",
    color: "bg-destructive/20 text-destructive border-destructive/50",
    activeColor:
      "bg-destructive text-destructive-foreground border-destructive",
    ocid: "checkin.poor_button",
  },
];

export function HealthCheckin() {
  const navigate = useNavigate();
  const { speak, listen, isListening } = useVoice();
  const submitCheckin = useSubmitCheckin();
  const [mood, setMood] = useState<MoodType>(null);
  const [symptoms, setSymptoms] = useState("");
  const [sideEffects, setSideEffects] = useState("");
  const [listeningFor, setListeningFor] = useState<
    "symptoms" | "sideEffects" | null
  >(null);
  const [submitted, setSubmitted] = useState(false);

  // biome-ignore lint/correctness/useExhaustiveDependencies: speak on mount
  useEffect(() => {
    speak(
      "How are you feeling today? Say good, fair, or poor, or tap one of the buttons.",
    );
  }, []);

  const handleMoodSelect = (m: MoodType) => {
    setMood(m);
    speak(
      `You selected ${m}. Now, do you have any symptoms? Say them or tap the microphone.`,
    );
  };

  const handleVoiceListen = (field: "symptoms" | "sideEffects") => {
    setListeningFor(field);
    const prompt =
      field === "symptoms"
        ? "Please describe your symptoms."
        : "Please describe any side effects.";
    speak(prompt);
    listen(
      (text) => {
        if (field === "symptoms") setSymptoms(text);
        else setSideEffects(text);
        setListeningFor(null);
      },
      () => setListeningFor(null),
    );
  };

  const handleSubmit = async () => {
    if (!mood) {
      speak("Please select how you are feeling first.");
      toast.error("Please select your mood");
      return;
    }
    try {
      await submitCheckin.mutateAsync({ mood, symptoms, sideEffects });
      setSubmitted(true);
      speak("Health check-in submitted. Thank you for the update.");
      toast.success("Health check-in recorded!");
      setTimeout(() => navigate({ to: "/home" }), 2000);
    } catch {
      toast.error("Failed to submit check-in");
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
            <CheckCircle className="w-24 h-24 text-secondary mx-auto" />
            <h2 className="text-3xl font-black text-foreground">
              Check-in Submitted!
            </h2>
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
        <div className="flex items-center gap-4 pt-14 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/home" })}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-black">Health Check-in</h1>
        </div>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-muted-foreground">
            How are you feeling?
          </h2>
          <div className="grid grid-cols-3 gap-4">
            {MOODS.map((m) => (
              <motion.button
                key={m.value}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleMoodSelect(m.value)}
                className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-colors focus-ring ${
                  mood === m.value ? m.activeColor : m.color
                }`}
                aria-label={`Feeling ${m.label}`}
                aria-pressed={mood === m.value}
                data-ocid={m.ocid}
              >
                <span className="text-4xl">{m.emoji}</span>
                <span className="font-bold text-base">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <section className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xl font-bold">Symptoms</Label>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleVoiceListen("symptoms")}
              className="w-12 h-12 rounded-xl"
              aria-label="Record symptoms by voice"
            >
              {listeningFor === "symptoms" ? (
                <MicOff className="w-5 h-5 text-destructive" />
              ) : (
                <Mic className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
          <Textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="e.g. headache, dizziness... or tap mic to speak"
            className="min-h-[100px] text-lg"
            aria-label="Describe your symptoms"
            data-ocid="checkin.symptoms_input"
          />
        </section>

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-xl font-bold">Side Effects</Label>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleVoiceListen("sideEffects")}
              className="w-12 h-12 rounded-xl"
              aria-label="Record side effects by voice"
            >
              {listeningFor === "sideEffects" || isListening ? (
                <MicOff className="w-5 h-5 text-destructive" />
              ) : (
                <Mic className="w-5 h-5 text-primary" />
              )}
            </Button>
          </div>
          <Textarea
            value={sideEffects}
            onChange={(e) => setSideEffects(e.target.value)}
            placeholder="e.g. nausea, stomach upset... or tap mic to speak"
            className="min-h-[100px] text-lg"
            aria-label="Describe any side effects"
          />
        </section>

        <Button
          onClick={handleSubmit}
          disabled={submitCheckin.isPending}
          className="w-full btn-xl bg-primary text-primary-foreground shadow-card"
          aria-label="Submit health check-in"
          data-ocid="checkin.submit_button"
        >
          <Heart className="w-6 h-6 mr-2" />
          {submitCheckin.isPending ? "Submitting..." : "Submit Check-in"}
        </Button>
      </div>
    </Layout>
  );
}
